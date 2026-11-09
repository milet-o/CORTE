import * as fs from 'fs';
import * as path from 'path';
import { Tossup } from '../types/quizbowl';
import { deduplicateAndMerge } from './dedup-validator';
import { getBatchQuestions as getBatch1 } from './batches/batch-01-chemistry-physics';
import { getBatchQuestions as getBatch2 } from './batches/batch-02-ancient-empires-wars';

function escapeCsvField(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function exportToCsv(tossups: Tossup[], filePath: string) {
  const headers = [
    'id',
    'origin',
    'category',
    'subcategory',
    'difficulty',
    'question_pt',
    'answer_canonical_pt',
    'accept_aliases',
    'prompt_aliases',
    'explanation',
    'wiki_url'
  ];

  const rows = tossups.map(t => [
    escapeCsvField(t.id),
    escapeCsvField(t.origin),
    escapeCsvField(t.category),
    escapeCsvField(t.subcategory),
    escapeCsvField(t.difficulty),
    escapeCsvField(t.question_pt),
    escapeCsvField(t.answer_canonical_pt),
    escapeCsvField((t.accept_aliases || []).join('; ')),
    escapeCsvField((t.prompt_aliases || []).join('; ')),
    escapeCsvField(t.explanation),
    escapeCsvField(t.wiki_url)
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  fs.writeFileSync(filePath, csvContent, 'utf-8');
}

async function runInjector() {
  console.log('==============================================');
  console.log('💉 INJETOR DE QUESTÕES CORTE — LOTES 1 & 2');
  console.log('==============================================\n');

  const dataDir = path.resolve(__dirname, '../data');
  const jsonPath = path.join(dataDir, 'questions.json');
  const csvPath = path.join(dataDir, 'questions.csv');

  let currentQuestions: Tossup[] = [];
  if (fs.existsSync(jsonPath)) {
    currentQuestions = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  }
  console.log(`[STATUS] Banco antes da injeção: ${currentQuestions.length} questões.`);

  const b1 = getBatch1();
  const b2 = getBatch2();
  const incoming = [...b1, ...b2];
  console.log(`[BATCH] Preparando ${incoming.length} novas questões piramidais...`);

  const { merged, added, skipped } = deduplicateAndMerge(currentQuestions, incoming);

  fs.writeFileSync(jsonPath, JSON.stringify(merged, null, 2), 'utf-8');
  exportToCsv(merged, csvPath);

  console.log(`\n✅ Injeção concluída com sucesso!`);
  console.log(`➕ Adicionadas com validação estrita: ${added}`);
  console.log(`⚠️ Puladas (já existentes ou duplicadas): ${skipped}`);
  console.log(`📊 Novo total no banco questions.json: ${merged.length}`);
}

runInjector().catch(err => {
  console.error('Erro na injeção:', err);
  process.exit(1);
});
