import * as fs from 'fs';
import * as path from 'path';
import { generateMassDatabase } from './mass-generator';
import { Tossup } from '../types/quizbowl';

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
    escapeCsvField(t.accept_aliases.join('; ')),
    escapeCsvField(t.prompt_aliases.join('; ')),
    escapeCsvField(t.explanation),
    escapeCsvField(t.wiki_url)
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  fs.writeFileSync(filePath, csvContent, 'utf-8');
  console.log(`[CSV] Exportado com sucesso: ${filePath} (${tossups.length} linhas)`);
}

async function main() {
  console.log('==============================================');
  console.log('🚀 EXECUTANDO PIPELINE DE EXPANSÃO MASSIVA');
  console.log('==============================================\n');

  const dataDir = path.resolve(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const allTossups = await generateMassDatabase();

  const jsonPath = path.join(dataDir, 'questions.json');
  fs.writeFileSync(jsonPath, JSON.stringify(allTossups, null, 2), 'utf-8');
  console.log(`[JSON] Banco consolidado salvo em: ${jsonPath}`);

  const csvPath = path.join(dataDir, 'questions.csv');
  exportToCsv(allTossups, csvPath);

  console.log('\n==============================================');
  console.log('🎉 BANCO COMPILADO E EXPANDIDO COM SUCESSO!');
  console.log(`📊 Total de Questões: ${allTossups.length}`);
  console.log('==============================================');
}

main().catch(err => {
  console.error('Erro no pipeline:', err);
  process.exit(1);
});
