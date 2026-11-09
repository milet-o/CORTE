const fs = require('fs');
const path = require('path');

const jsonPath = path.resolve('d:/programas/CORTE/data/questions.json');
const csvPath = path.resolve('d:/programas/CORTE/data/questions.csv');

const questions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Adiciona Argônio explicitamente
const argonTossup = {
  id: 'auto-argonio',
  origin: 'qbreader',
  category: 'Ciência',
  subcategory: 'Química',
  difficulty: 3, // Difícil conforme solicitado pelo usuário
  question_pt: 'Foi descoberto em 1894 pelo físico Lord Rayleigh e pelo químico William Ramsay ao removerem oxigênio, nitrogênio e gás carbônico do ar limpo. Apresenta uma linha espectral azul e vermelha característica e é largamente utilizado como gás inerte de proteção em soldas elétricas TIG e lâmpadas incandescentes. (*) Identifique este gás nobre de número atômico 18 e símbolo Ar, o terceiro gás mais abundante na atmosfera terrestre.',
  formatted_answer_pt: '<b><u>Argônio</u></b> [aceite <i>Árgon</i> ou <i>Argon</i>]',
  answer_canonical_pt: 'Argônio',
  accept_aliases: ['Argonio', 'Árgon', 'Argon', 'Ar', 'Argônio (elemento químico)'],
  prompt_aliases: ['gás nobre', 'terceiro gás'],
  explanation: 'O argônio (Ar, Z=18) é um gás nobre inerte, incolor e inodoro, compondo cerca de 0,93% da atmosfera da Terra.',
  wiki_url: 'https://pt.wikipedia.org/wiki/Arg%C3%B4nio'
};

// Verifica se já existe
const existingIdx = questions.findIndex(x => x.answer_canonical_pt.toLowerCase() === 'argônio' || x.answer_canonical_pt.toLowerCase() === 'argonio');
if (existingIdx !== -1) {
  questions[existingIdx] = argonTossup;
} else {
  questions.unshift(argonTossup);
}

fs.writeFileSync(jsonPath, JSON.stringify(questions, null, 2), 'utf8');

function escapeCsv(val) {
  if (val === undefined || val === null) return '""';
  return `"${String(val).replace(/"/g, '""')}"`;
}

const headers = ['id', 'origin', 'category', 'subcategory', 'difficulty', 'question_pt', 'answer_canonical_pt', 'accept_aliases', 'prompt_aliases', 'explanation', 'wiki_url'];
const rows = questions.map(t => [
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

fs.writeFileSync(csvPath, [headers.join(','), ...rows].join('\n'), 'utf8');
console.log('Argônio inserido com sucesso (Dificuldade 3 - Difícil). Total:', questions.length);
