import * as fs from 'fs';
import * as path from 'path';
import { Tossup } from '../types/quizbowl';
import { ALL_MEGA_TOPICS } from './mega-catalog';
import { TargetTopic } from './mass-topics-catalog';
import { deduplicateAndMerge, sanitizeQuestionText } from './dedup-validator';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface WikiPageResult {
  title: string;
  extract: string;
  fullurl: string;
  redirects: string[];
}

/**
 * Consulta até 50 títulos de uma vez só na API da Wikipédia (Batching de alta performance)
 */
async function fetchWikiExtractsBatch(titles: string[]): Promise<Map<string, WikiPageResult>> {
  const results = new Map<string, WikiPageResult>();
  if (titles.length === 0) return results;

  try {
    const encodedTitles = titles.map(t => encodeURIComponent(t.replace(/ /g, '_'))).join('|');
    const url = `https://pt.wikipedia.org/w/api.php?action=query&prop=extracts|redirects|info&exintro=1&explaintext=1&titles=${encodedTitles}&inprop=url&format=json&origin=*`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'CORTE-BulkCrawler/2.0 (contact@corte.br; educational quizbowl project)'
      }
    });

    if (!res.ok) return results;

    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return results;

    for (const pageId of Object.keys(pages)) {
      if (pageId === '-1') continue;
      const page = pages[pageId];
      if (!page || !page.title) continue;

      const redirects: string[] = [];
      if (page.redirects && Array.isArray(page.redirects)) {
        page.redirects.forEach((r: { title: string }) => {
          if (r.title && r.title !== page.title) redirects.push(r.title);
        });
      }

      results.set(page.title.toLowerCase(), {
        title: page.title,
        extract: page.extract || '',
        fullurl: page.fullurl || `https://pt.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
        redirects
      });
    }
  } catch (err) {
    console.error('Erro na requisição batch:', err);
  }

  return results;
}

function buildPyramidalTossup(
  topic: TargetTopic,
  pageData: WikiPageResult
): Tossup | null {
  const extract = pageData.extract;
  if (!extract || extract.length < 120) return null;

  const cleanTitle = topic.title.replace(/\s*\(.*?\)\s*/g, '').trim();

  // Divide o extrato em frases
  const rawSentences = extract
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 25);

  if (rawSentences.length < 2) return null;

  const giveaway = `Identifique ${topic.entityType}.`;

  const allAliases = Array.from(new Set([
    cleanTitle,
    topic.title,
    pageData.title,
    ...pageData.redirects.map(r => r.replace(/\s*\(.*?\)\s*/g, '').trim())
  ])).filter(Boolean);

  // Sanitiza menções em todas as frases para não haver spoiler antes do giveaway
  const sanitizedSentences = rawSentences.slice(0, 4).map(sentence => {
    return sanitizeQuestionText(sentence, cleanTitle, allAliases);
  });

  // Pista de Power e pistas secundárias: posiciona (*) na transição (cerca de 40% da pergunta)
  let fullQuestion = '';
  if (sanitizedSentences.length >= 3) {
    fullQuestion = `${sanitizedSentences[1]} ${sanitizedSentences[0]} (*) ${sanitizedSentences.slice(2).join(' ')} ${giveaway}`.trim();
  } else if (sanitizedSentences.length === 2) {
    fullQuestion = `${sanitizedSentences[1]} (*) ${sanitizedSentences[0]} ${giveaway}`.trim();
  } else {
    fullQuestion = `${sanitizedSentences[0]} (*) ${giveaway}`.trim();
  }

  const formattedAnswer = `<b><u>${cleanTitle}</u></b>`;
  const cleanEntityWords = topic.entityType.split(' ').filter(w => w.length > 3).slice(0, 2);

  return {
    id: `auto-${cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    origin: topic.category.includes('Brasil') ? 'wikipedia_br' : 'qbreader',
    category: topic.category,
    subcategory: topic.subcategory,
    difficulty: 2,
    question_pt: fullQuestion,
    formatted_answer_pt: formattedAnswer,
    answer_canonical_pt: cleanTitle,
    accept_aliases: allAliases,
    prompt_aliases: cleanEntityWords,
    explanation: extract.slice(0, 260) + '...',
    wiki_url: pageData.fullurl,
    wiki_extract: extract
  };
}

function exportToCsv(tossups: Tossup[], filePath: string) {
  const escapeCsv = (val: any) => {
    if (val === undefined || val === null) return '""';
    return `"${String(val).replace(/"/g, '""')}"`;
  };

  const headers = ['id', 'origin', 'category', 'subcategory', 'difficulty', 'question_pt', 'answer_canonical_pt', 'accept_aliases', 'prompt_aliases', 'explanation', 'wiki_url'];
  const rows = tossups.map(t => [
    escapeCsv(t.id),
    escapeCsv(t.origin),
    escapeCsv(t.category),
    escapeCsv(t.subcategory),
    escapeCsv(t.difficulty),
    escapeCsv(t.question_pt),
    escapeCsv(t.answer_canonical_pt),
    escapeCsv((t.accept_aliases || []).join('; ')),
    escapeCsv((t.prompt_aliases || []).join('; ')),
    escapeCsv(t.explanation),
    escapeCsv(t.wiki_url)
  ].join(','));

  fs.writeFileSync(filePath, [headers.join(','), ...rows].join('\n'), 'utf-8');
}

async function main() {
  console.log('======================================================');
  console.log('🚀 INJETOR EM MASSA (CRAWLER BATCH ACELERADO)');
  console.log('======================================================\n');

  const dataDir = path.resolve(__dirname, '../data');
  const jsonPath = path.join(dataDir, 'questions.json');
  const csvPath = path.join(dataDir, 'questions.csv');

  let currentQuestions: Tossup[] = [];
  if (fs.existsSync(jsonPath)) {
    currentQuestions = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  }
  console.log(`[STATUS] Total inicial no banco: ${currentQuestions.length} questões.`);

  const existingAnswers = new Set(currentQuestions.map(q => q.answer_canonical_pt.toLowerCase().trim()));

  // Filtra apenas tópicos que ainda não foram inseridos
  const pendingTopics = ALL_MEGA_TOPICS.filter(t => {
    const clean = t.title.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
    return !existingAnswers.has(clean);
  });

  console.log(`[CATÁLOGO] Tópicos pendentes para injeção: ${pendingTopics.length}`);

  const BATCH_SIZE = 30; // Consulta 30 páginas por requisição
  const newTossups: Tossup[] = [];

  for (let i = 0; i < pendingTopics.length; i += BATCH_SIZE) {
    const chunk = pendingTopics.slice(i, i + BATCH_SIZE);
    const titles = chunk.map(c => c.title);

    console.log(`\n[LOTE ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(pendingTopics.length / BATCH_SIZE)}] Consultando ${titles.length} artigos na Wikipédia...`);
    const pagesMap = await fetchWikiExtractsBatch(titles);

    for (const topic of chunk) {
      const cleanKey = topic.title.toLowerCase();
      // Tenta achar pelo título exato ou variações
      let pageData = pagesMap.get(cleanKey);
      if (!pageData) {
        for (const [k, v] of pagesMap.entries()) {
          if (k.includes(cleanKey) || cleanKey.includes(k)) {
            pageData = v;
            break;
          }
        }
      }

      if (pageData && pageData.extract) {
        const tossup = buildPyramidalTossup(topic, pageData);
        if (tossup) {
          newTossups.push(tossup);
          console.log(`  -> ✅ [PRONTA] "${tossup.answer_canonical_pt}" (${tossup.category} > ${tossup.subcategory})`);
        }
      }
    }

    // Pausa segura de 1s entre os blocos de 30
    await sleep(1000);
  }

  console.log(`\n[MERGE] Consolidando ${newTossups.length} novas questões no banco com deduplicação...`);
  const { merged, added, skipped } = deduplicateAndMerge(currentQuestions, newTossups);

  fs.writeFileSync(jsonPath, JSON.stringify(merged, null, 2), 'utf-8');
  exportToCsv(merged, csvPath);

  console.log('\n======================================================');
  console.log(`🎉 INJEÇÃO EM MASSA CONCLUÍDA COM SUCESSO!`);
  console.log(`➕ Adicionadas com validação piramidal e anti-spoiler: ${added}`);
  console.log(`⚠️ Puladas (já existentes ou duplicadas): ${skipped}`);
  console.log(`📊 Total consolidado em questions.json: ${merged.length}`);
  console.log('======================================================');
}

main().catch(err => {
  console.error('Erro na injeção em massa:', err);
  process.exit(1);
});
