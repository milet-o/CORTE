import * as fs from 'fs';
import * as path from 'path';
import { Tossup } from '../types/quizbowl';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Super lista de tópicos curados para extração e expansão massiva contínua
 * Cobrindo: Química, Física, Cidades Brasileiras, Personalidades, Políticos,
 * Curiosidades, Geografia, Invenções, Medicina e História Geral.
 */
export const TARGET_CRAWLER_TOPICS: { title: string; category: string; subcategory: string; entityType: string }[] = [
  // --- QUÍMICA, FÍSICA E ELEMENTOS ---
  { title: 'Trítio', category: 'Ciência', subcategory: 'Física Nuclear', entityType: 'este isótopo radioativo do hidrogênio' },
  { title: 'Ozônio', category: 'Ciência', subcategory: 'Química Atmosférica', entityType: 'este gás de fórmula O3 que protege a Terra' },
  { title: 'Urânio', category: 'Ciência', subcategory: 'Química Nuclear', entityType: 'este elemento actinídeo de número atômico 92' },
  { title: 'Plutônio', category: 'Ciência', subcategory: 'Física Nuclear', entityType: 'este elemento transurânico usado em armas nucleares' },
  { title: 'Diamante', category: 'Ciência', subcategory: 'Mineralogia', entityType: 'este alótropo do carbono com dureza 10 na escala de Mohs' },
  { title: 'Supercondutividade', category: 'Ciência', subcategory: 'Física da Matéria Condensada', entityType: 'este fenômeno de resistência elétrica exatamente nula' },
  { title: 'Bóson de Higgs', category: 'Ciência', subcategory: 'Física de Partículas', entityType: 'esta partícula fundamental apelidada de partícula de Deus' },
  { title: 'Fusão nuclear', category: 'Ciência', subcategory: 'Física Nuclear', entityType: 'este processo energético que alimenta o núcleo das estrelas' },
  { title: 'Fissão nuclear', category: 'Ciência', subcategory: 'Física Nuclear', entityType: 'este processo de divisão do núcleo atômico pesado' },
  { title: 'Tubo de raios catódicos', category: 'Ciência', subcategory: 'Física Experimental', entityType: 'este dispositivo experimental que levou à descoberta do elétron' },
  { title: 'Efeito Doppler', category: 'Ciência', subcategory: 'Física Clássica', entityType: 'este desvio aparente na frequência de ondas em movimento' },
  { title: 'Entropia', category: 'Ciência', subcategory: 'Termodinâmica', entityType: 'esta grandeza que mede o grau de desordem de um sistema' },
  { title: 'Eletromagnetismo', category: 'Ciência', subcategory: 'Física', entityType: 'esta força fundamental unificada por James Clerk Maxwell' },

  // --- CIDADES DO BRASIL ---
  { title: 'Curitiba', category: 'Cidades do Brasil', subcategory: 'Paraná', entityType: 'esta capital paranaense famosa pelo Jardim Botânico e urbanismo pioneiro' },
  { title: 'Belo Horizonte', category: 'Cidades do Brasil', subcategory: 'Minas Gerais', entityType: 'esta capital mineira planejada por Aarão Reis nos pés da Serra do Curral' },
  { title: 'Florianópolis', category: 'Cidades do Brasil', subcategory: 'Santa Catarina', entityType: 'esta capital catarinense apelidada de Ilha da Magia' },
  { title: 'Porto Alegre', category: 'Cidades do Brasil', subcategory: 'Rio Grande do Sul', entityType: 'esta capital gaúcha banhada pelo lago Guaíba' },
  { title: 'Recife', category: 'Cidades do Brasil', subcategory: 'Pernambuco', entityType: 'esta capital pernambucana cortada pelos rios Capibaribe e Beberibe' },
  { title: 'Fortaleza', category: 'Cidades do Brasil', subcategory: 'Ceará', entityType: 'esta capital cearense famosa pelas praias de Iracema e do Futuro' },
  { title: 'Belém (Pará)', category: 'Cidades do Brasil', subcategory: 'Pará', entityType: 'esta capital paraense banhada pela baía do Guajará e casa do Círio de Nazaré' },
  { title: 'São Luís (Maranhão)', category: 'Cidades do Brasil', subcategory: 'Maranhão', entityType: 'esta capital maranhense fundada por franceses e famosa pelos azulejos coloniais' },
  { title: 'Olinda', category: 'Cidades do Brasil', subcategory: 'Pernambuco', entityType: 'esta histórica cidade pernambucana famosa pelos bonecos gigantes e Alto da Sé' },
  { title: 'Gramado', category: 'Cidades do Brasil', subcategory: 'Rio Grande do Sul', entityType: 'este famoso município da Serra Gaúcha sede do Festival de Cinema' },
  { title: 'Tiradentes (Minas Gerais)', category: 'Cidades do Brasil', subcategory: 'Minas Gerais', entityType: 'este histórico município mineiro aos pés da Serra de São José' },
  { title: 'Fernando de Noronha', category: 'Cidades do Brasil', subcategory: 'Pernambuco', entityType: 'este arquipélago vulcânico brasileiro famoso pela Baía do Sancho' },
  { title: 'Foz do Iguaçu', category: 'Cidades do Brasil', subcategory: 'Paraná', entityType: 'este município paranaense na tríplice fronteira que abriga as monumentais Cataratas' },

  // --- PERSONALIDADES BRASILEIRAS ---
  { title: 'Heitor Villa-Lobos', category: 'Personalidades do Brasil', subcategory: 'Música Erudita', entityType: 'este monumental compositor modernista autor das Bachianas Brasileiras' },
  { title: 'Tom Jobim', category: 'Personalidades do Brasil', subcategory: 'Música Popular Brasileira', entityType: 'este compositor e maestro coautor de Garota de Ipanema e Águas de Março' },
  { title: 'Chico Buarque', category: 'Personalidades do Brasil', subcategory: 'Música e Literatura', entityType: 'este compositor e escritor autor de Construção e vencedor do Prêmio Camões' },
  { title: 'Caetano Veloso', category: 'Personalidades do Brasil', subcategory: 'Música', entityType: 'este cantor e compositor baiano um dos líderes do movimento Tropicalista' },
  { title: 'Gilberto Gil', category: 'Personalidades do Brasil', subcategory: 'Música', entityType: 'este músico baiano ex-Ministro da Cultura e membro da Academia Brasileira de Letras' },
  { title: 'Paulo Freire', category: 'Personalidades do Brasil', subcategory: 'Educação e Filosofia', entityType: 'este patrono da educação brasileira autor de Pedagogia do Oprimido' },
  { title: 'Darcy Ribeiro', category: 'Personalidades do Brasil', subcategory: 'Antropologia', entityType: 'este antropólogo e educador fundador da UnB e autor de O Povo Brasileiro' },
  { title: 'Carlos Chagas', category: 'Personalidades do Brasil', subcategory: 'Medicina', entityType: 'este cientista que descreveu integralmente o ciclo infeccioso da tripanossomíase' },
  { title: 'Oswaldo Cruz', category: 'Personalidades do Brasil', subcategory: 'Medicina e Sanitarismo', entityType: 'este sanitarista pioneiro na erradicação da febre amarela e peste bubônica' },
  { title: 'Aleijadinho', category: 'Personalidades do Brasil', subcategory: 'Escultura Barroca', entityType: 'este maior mestre do barroco mineiro autor dos profetas de Congonhas' },
  { title: 'Tarsila do Amaral', category: 'Personalidades do Brasil', subcategory: 'Pintura Modernista', entityType: 'esta pintora modernista paulista criadora do célebre quadro Abaporu' },
  { title: 'Candido Portinari', category: 'Personalidades do Brasil', subcategory: 'Artes Visuais', entityType: 'este pintor paulista autor dos painéis Guerra e Paz na sede da ONU' },
  { title: 'Marta (futebolista)', category: 'Personalidades do Brasil', subcategory: 'Esportes', entityType: 'esta lendária futebolista alagoana eleita seis vezes a melhor do mundo pela FIFA' },
  { title: 'Guga Kuerten', category: 'Personalidades do Brasil', subcategory: 'Esportes', entityType: 'este tenista catarinense tricampeão de Roland Garros e número 1 do ranking da ATP' },

  // --- POLÍTICOS & GOVERNANTES ---
  { title: 'Marechal Deodoro da Fonseca', category: 'Políticos do Brasil', subcategory: 'República da Espada', entityType: 'este militar alagoano que proclamou a República e foi o 1º presidente' },
  { title: 'Prudente de Morais', category: 'Políticos do Brasil', subcategory: 'República Velha', entityType: 'este político paulista que foi o primeiro presidente civil do Brasil' },
  { title: 'João Goulart', category: 'Políticos do Brasil', subcategory: 'República Populista', entityType: 'este presidente gaúcho apelidado de Jango deposto pelo golpe militar de 1964' },
  { title: 'Leonel Brizola', category: 'Políticos do Brasil', subcategory: 'Trabalhismo', entityType: 'este líder político gaúcho e fluminense da Campanha da Legalidade e dos CIEPs' },
  { title: 'Enéas Carneiro', category: 'Políticos do Brasil', subcategory: 'Nova República', entityType: 'este cardiologista e político nacionalista famoso pelo bordão Meu nome é Enéas' },
  { title: 'Bento Gonçalves da Silva', category: 'Políticos do Brasil', subcategory: 'Guerra dos Farrapos', entityType: 'este líder militar e presidente da efêmera República Rio-Grandense' },
  { title: 'Princesa Isabel', category: 'Políticos do Brasil', subcategory: 'Império do Brasil', entityType: 'esta regente imperial brasileira que assinou a Lei Áurea em 13 de maio de 1888' },

  // --- CURIOSIDADES, FENÔMENOS E MUNDO ---
  { title: 'Canal do Panamá', category: 'Curiosidades do Mundo', subcategory: 'Engenharia e Geografia', entityType: 'este canal hidroviário artificial que conecta os oceanos Atlântico e Pacífico' },
  { title: 'Monte Everest', category: 'Curiosidades do Mundo', subcategory: 'Geografia', entityType: 'esta montanha na cordilheira do Himalaia com o ponto culminante da crosta terrestre' },
  { title: 'Grande Barreira de Coral', category: 'Curiosidades do Mundo', subcategory: 'Oceanografia', entityType: 'esta colossal estrutura viva marinha na costa nordeste da Austrália' },
  { title: 'Canal de Suez', category: 'Curiosidades do Mundo', subcategory: 'Engenharia', entityType: 'este canal artificial no Egito que conecta o mar Mediterrâneo ao mar Vermelho' },
  { title: 'Muralha da China', category: 'Curiosidades do Mundo', subcategory: 'Maravilhas do Mundo', entityType: 'esta gigantesca fortificação militar construída por dinastias imperiais chinesas' },
  { title: 'Coliseu', category: 'Curiosidades do Mundo', subcategory: 'História e Arquitetura', entityType: 'este monumental anfiteatro flaviano erguido em Roma para lutas de gladiadores' },
  { title: 'Chichén Itzá', category: 'Curiosidades do Mundo', subcategory: 'Arqueologia Pré-Colombiana', entityType: 'esta cidade-estado maia na península de Iucatã famosa pela pirâmide de Kukulcán' },
  { title: 'Machu Picchu', category: 'Curiosidades do Mundo', subcategory: 'Civilização Inca', entityType: 'esta cidadela inca do século XV encravada no alto da Cordilheira dos Andes' },
  { title: 'Petra', category: 'Curiosidades do Mundo', subcategory: 'Arqueologia', entityType: 'esta histórica cidade dos nabateus esculpida em rochas de arenito rosado na Jordânia' },
  { title: 'Penicilina', category: 'Ciência', subcategory: 'Farmacologia', entityType: 'este primeiro antibiótico natural descoberto por acaso por Alexander Fleming em 1928' },
  { title: 'Insulina', category: 'Ciência', subcategory: 'Bioquímica e Medicina', entityType: 'este hormônio pancreático essencial descoberto por Banting e Best em 1921' },
  { title: 'Neurônio', category: 'Ciência', subcategory: 'Neurociência', entityType: 'esta célula altamente especializada do sistema nervoso com dendritos e axônio' },
  { title: 'Hemoglobina', category: 'Ciência', subcategory: 'Fisiologia e Bioquímica', entityType: 'esta proteína transportadora de oxigênio rica em ferro presente nos glóbulos vermelhos' },
  { title: 'Fotossíntese', category: 'Ciência', subcategory: 'Botânica e Bioquímica', entityType: 'este processo biológico que converte luz solar, água e CO2 em glicose e oxigênio' },
];

/**
 * Busca extrato limpo do artigo na Wikipédia em português
 */
async function fetchWikiExtract(title: string): Promise<{ extract: string; url: string; aliases: string[] }> {
  try {
    const encoded = encodeURIComponent(title.replace(/ /g, '_'));
    const url = `https://pt.wikipedia.org/w/api.php?action=query&prop=extracts|redirects|info&exintro=1&explaintext=1&titles=${encoded}&inprop=url&format=json&origin=*`;
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'CORTE-Continuous-Crawler/1.0 (contact@corte.br; educational quizbowl project)'
      }
    });

    if (!res.ok) {
      return { extract: '', url: `https://pt.wikipedia.org/wiki/${encoded}`, aliases: [] };
    }

    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return { extract: '', url: `https://pt.wikipedia.org/wiki/${encoded}`, aliases: [] };

    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];
    if (pageId === '-1' || !page) {
      return { extract: '', url: `https://pt.wikipedia.org/wiki/${encoded}`, aliases: [] };
    }

    const aliases: string[] = [];
    if (page.redirects && Array.isArray(page.redirects)) {
      page.redirects.forEach((r: { title: string }) => {
        if (r.title && r.title !== title) aliases.push(r.title);
      });
    }

    return {
      extract: page.extract || '',
      url: page.fullurl || `https://pt.wikipedia.org/wiki/${encoded}`,
      aliases
    };
  } catch (err) {
    return { extract: '', url: '', aliases: [] };
  }
}

/**
 * Converte um artigo real da Wikipédia em uma questão piramidal sem clichês de pontuação
 */
function buildPyramidalQuestion(
  title: string,
  category: string,
  subcategory: string,
  entityType: string,
  extract: string,
  wikiUrl: string,
  extraAliases: string[]
): Tossup | null {
  if (!extract || extract.length < 140) return null;

  // Limpa o título para gerar aliases e máscara
  const cleanTitle = title.replace(/\s*\(.*?\)\s*/g, '').trim();
  
  // Divide o extrato em frases
  const rawSentences = extract
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 25);

  if (rawSentences.length < 2) return null;

  // Frase final (gatilho): "Identifique [entityType]..."
  const giveaway = `Identifique ${entityType}.`;

  // Pista de Power e pistas secundárias
  const firstSentence = rawSentences[0];
  const middleSentences = rawSentences.slice(1, 4);

  // Mascara menções ao título na primeira frase para criar a pista de Power
  const escapedNameRegex = new RegExp(`\\b${cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
  const maskedFirst = firstSentence.replace(escapedNameRegex, 'esta entidade');

  const powerSentence = maskedFirst.includes('(*)') 
    ? maskedFirst 
    : `${maskedFirst} (*)`;

  const standardText = middleSentences.join(' ');
  const fullQuestion = `${standardText} ${powerSentence} ${giveaway}`.trim();

  const formattedAnswer = `<b><u>${cleanTitle}</u></b>`;
  const acceptAliases = Array.from(new Set([
    cleanTitle,
    title,
    ...extraAliases.map(a => a.replace(/\s*\(.*?\)\s*/g, '').trim())
  ])).filter(Boolean);

  return {
    id: `auto-${cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    origin: category.includes('Brasil') ? 'wikipedia_br' : 'qbreader',
    category,
    subcategory,
    difficulty: 2,
    question_pt: fullQuestion,
    formatted_answer_pt: formattedAnswer,
    answer_canonical_pt: cleanTitle,
    accept_aliases: acceptAliases,
    prompt_aliases: [entityType.split(' ').slice(0, 3).join(' ')],
    explanation: extract.slice(0, 240) + '...',
    wiki_url: wikiUrl,
    wiki_extract: extract
  };
}

/**
 * Salva incrementalmente no JSON e CSV
 */
function saveDatabase(tossups: Tossup[]) {
  const dataDir = path.resolve(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const jsonPath = path.join(dataDir, 'questions.json');
  fs.writeFileSync(jsonPath, JSON.stringify(tossups, null, 2), 'utf-8');

  // Exporta CSV
  const csvPath = path.join(dataDir, 'questions.csv');
  const headers = ['id', 'origin', 'category', 'subcategory', 'difficulty', 'question_pt', 'answer_canonical_pt', 'accept_aliases', 'prompt_aliases', 'explanation', 'wiki_url'];
  const rows = tossups.map(t => [
    `"${t.id}"`,
    `"${t.origin}"`,
    `"${t.category}"`,
    `"${t.subcategory}"`,
    `"${t.difficulty}"`,
    `"${(t.question_pt || '').replace(/"/g, '""')}"`,
    `"${(t.answer_canonical_pt || '').replace(/"/g, '""')}"`,
    `"${(t.accept_aliases || []).join('; ').replace(/"/g, '""')}"`,
    `"${(t.prompt_aliases || []).join('; ').replace(/"/g, '""')}"`,
    `"${(t.explanation || '').replace(/"/g, '""')}"`,
    `"${(t.wiki_url || '').replace(/"/g, '""')}"`
  ].join(','));
  fs.writeFileSync(csvPath, [headers.join(','), ...rows].join('\n'), 'utf-8');
}

/**
 * Loop principal do Crawler
 */
async function main() {
  console.log('======================================================');
  console.log('🕷️ INICIANDO CRAWLER CONTÍNUO DE EXPANSÃO MASSIVA');
  console.log('   Pausa segura de 1s entre requisições (zero risco de ban)');
  console.log('======================================================\n');

  const jsonPath = path.resolve(__dirname, '../data/questions.json');
  let currentQuestions: Tossup[] = [];
  if (fs.existsSync(jsonPath)) {
    currentQuestions = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  }
  console.log(`[STATUS] Banco inicial possui: ${currentQuestions.length} questões.`);

  const existingIds = new Set(currentQuestions.map(q => q.id));
  const existingAnswers = new Set(currentQuestions.map(q => q.answer_canonical_pt.toLowerCase()));

  let addedCount = 0;

  for (const topic of TARGET_CRAWLER_TOPICS) {
    const cleanName = topic.title.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
    if (existingAnswers.has(cleanName)) {
      continue;
    }

    console.log(`[CRAWL] Consultando Wikipédia: "${topic.title}"...`);
    const wikiData = await fetchWikiExtract(topic.title);

    if (wikiData.extract) {
      const tossup = buildPyramidalQuestion(
        topic.title,
        topic.category,
        topic.subcategory,
        topic.entityType,
        wikiData.extract,
        wikiData.url,
        wikiData.aliases
      );

      if (tossup && !existingIds.has(tossup.id)) {
        currentQuestions.push(tossup);
        existingIds.add(tossup.id);
        existingAnswers.add(tossup.answer_canonical_pt.toLowerCase());
        addedCount++;

        // Salva incrementalmente
        saveDatabase(currentQuestions);
        console.log(`  -> ✅ [+1] Questão #${currentQuestions.length} adicionada: "${tossup.answer_canonical_pt}"! Salvo em disco.`);
      }
    }

    // Delay respeitoso de 1000ms
    await sleep(1000);
  }

  console.log('\n======================================================');
  console.log(`🎉 RODADA DO CRAWLER FINALIZADA!`);
  console.log(`Novas questões adicionadas: ${addedCount}`);
  console.log(`Total geral atual no banco: ${currentQuestions.length}`);
  console.log('======================================================');
}

main().catch(err => {
  console.error('Erro no crawler:', err);
  process.exit(1);
});
