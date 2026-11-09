const fs = require('fs');
const path = require('path');

const jsonPath = path.resolve('d:/programas/CORTE/data/questions.json');
const csvPath = path.resolve('d:/programas/CORTE/data/questions.csv');

const questions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Listas curadas de alta notoriedade (Fácil: 1)
const POPULAR_EASY = new Set([
  'guerra fria', 'segunda guerra mundial', 'primeira guerra mundial', 'revolucao francesa',
  'albert einstein', 'isaac newton', 'dna', 'tabela periodica', 'ludwig van beethoven',
  'wolfgang amadeus mozart', 'imperio romano', 'roma antiga', 'brasilia', 'rio de janeiro',
  'sao paulo', 'salvador', 'oxigenio', 'ouro', 'prata', 'ferro', 'cobre', 'chumbo', 'carbono',
  'hidrogenio', 'helio', 'planeta terra', 'marte', 'jupiter', 'saturno', 'sol', 'lua',
  'ayrton senna', 'pele', 'getulio vargas', 'dom pedro i', 'dom pedro ii', 'tiradentes',
  'cleopatra', 'napoleao bonaparte', 'abraham lincoln', 'mahatma gandhi', 'alexandre o grande',
  'muralha da china', 'coliseu', 'torre eiffel', 'estatua da liberdade', 'cristo redentor',
  'piramides de gize', 'taj mahal', 'machu picchu', 'zeus', 'poseidon', 'atena', 'thor',
  'william shakespeare', 'romeu e julieta', 'dom quixote', 'mona lisa', 'coracao', 'cerebro',
  'olho', 'pele', 'agua', 'gravidade', 'velocidade da luz', 'bomba atomica', 'internet',
  'telefone', 'lampada incandescente', 'aviao', 'bussola', 'polvora', 'rio amazonas', 'rio nilo',
  'monte everest', 'deserto do saara', 'oceano pacifico', 'oceano atlantico', 'ouro preto',
  'franca', 'italia', 'alemanha', 'estados unidos', 'japao', 'china', 'russia', 'espanha',
  'portugal', 'reino unido', 'argentina', 'canada', 'australia', 'mexico'
]);

// Termos muito específicos, técnicos ou acadêmicos (Difícil: 3)
const HARD_TERMS = new Set([
  'argonio', 'escandio', 'vanadio', 'rutenio', 'rodio', 'paladio', 'cadmio', 'indio',
  'antimonio', 'telurio', 'cesio', 'lantanio', 'cerio', 'praseodimio', 'neodimio',
  'samario', 'europio', 'gadolinio', 'terbio', 'disprosio', 'holmio', 'erbio', 'tulio',
  'iterbio', 'lutecio', 'hafnio', 'tantalo', 'renio', 'osmio', 'iridio', 'talio',
  'bismuto', 'polonio', 'astato', 'radonio', 'francio', 'radio', 'actinio', 'torio',
  'protactinio', 'netunio', 'americio', 'curio', 'berquelio', 'californio', 'einstenio',
  'fermio', 'mendelevio', 'nobelio', 'laurencio', 'rutherfordio', 'dubnio', 'seaborgio',
  'bohrio', 'hassio', 'meitnerio', 'darmstadio', 'roentgenio', 'copernicio', 'nionio',
  'flerovio', 'moscovio', 'livermorio', 'tenessino', 'oganessonio', 'tritio', 'deuterio',
  'agua pesada', 'supercondutividade', 'boson de higgs', 'efeito doppler', 'entropia',
  'tubo de raios catodicos', 'pendulo de foucault', 'radiacao cosmica de fundo em micro ondas',
  'diagrama de hertzsprung russell', 'estrela de neutrons', 'pulsar', 'quasar', 'gluon',
  'boson w e z', 'quark', 'neutrino', 'positron', 'antimateria', 'emaranhamento quantico',
  'gato de schrodinger', 'constante de planck', 'efeito meissner', 'camara de wilson',
  'gaiola de faraday', 'efeito mpemba', 'paradoxo de fermi', 'esfera de dyson',
  'escala de kardashev', 'ponto nemo', 'linear b', 'escrita cuneiforme', 'disco de festo',
  'manuscrito voynich', 'lingua copta', 'lingua sumeria', 'lingua aramaica', 'batalha de filipos',
  'batalha de carras', 'batalha de alesia', 'batalha de wagram', 'batalha de berezina',
  'batalha de sommerostro', 'batalha de canas', 'batalha de plateias', 'batalha do hidaspes',
  'batalha da floresta de teutoburgo', 'batalha de poitiers 732', 'batalha de poitiers 1356',
  'batalha de crecy', 'batalha de agincourt', 'batalha de lepanto', 'batalha de austerlitz',
  'batalha de borodino', 'batalha de leipzig', 'batalha da jutlandia', 'batalha de kursk',
  'batalha de midway', 'batalha do riachuelo', 'batalha de tuiuti', 'reino do ponto',
  'mitridates vi do ponto', 'reino da numidia', 'jugurta', 'guerra social', 'lucio cornelio sula',
  'caio mario', 'marco licinio crasso', 'imperio parta', 'imperio sassanida', 'imperio seleucida',
  'imperio kushano', 'imperio chola', 'imperio songhai', 'imperio de axum', 'imperio acadio',
  'cultura moche', 'cultura nazca', 'cultura chavin', 'tiwanaku', 'teotihuacan', 'zapotecas',
  'assurbanipal', 'efialtes de traquis', 'leonhard euler', 'bernhard riemann', 'kurt godel',
  'claude shannon', 'norbert wiener', 'subrahmanyan chandrasekhar', 'svante arrhenius',
  'baruch espinoza', 'arthur schopenhauer', 'friedrich nietzsche'
]);

function norm(s) {
  return (s || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'«»]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function classifyDifficulty(q) {
  const n = norm(q.answer_canonical_pt);

  // 1. Dificuldade 3 (Difícil) se está explicitamente na lista ou se é elemento químico raro/transurânico
  if (HARD_TERMS.has(n)) return 3;

  // 2. Dificuldade 1 (Fácil) se é conceito universalmente conhecido da cultura geral
  if (POPULAR_EASY.has(n)) return 1;

  // 3. Regras semânticas adicionais:
  // Se for elemento químico da tabela periódica com número atômico > 20 e não for ouro/prata/ferro/cobre/chumbo -> Dificil (3)
  if (q.category === 'Ciência' && q.subcategory === 'Química') {
    if (['ouro', 'prata', 'ferro', 'cobre', 'chumbo', 'aluminio', 'sodio', 'cloro', 'enxofre', 'nitrogenio', 'carbono', 'oxigenio', 'hidrogenio', 'helio', 'calcio', 'potassio'].includes(n)) {
      return 1;
    }
    return 3; // Elementos como Argônio, Criptônio, Gálio, Tântalo, Molibdênio, etc.
  }

  // Batalhas muito específicas ou dinastias antigas
  if (q.subcategory && (q.subcategory.includes('Antiguidade') || q.subcategory.includes('Mesopotâmia') || q.subcategory.includes('Guerras Medievais'))) {
    return 3;
  }

  // Cidades do Brasil menores ou históricas menos famosas
  if (q.category === 'Cidades do Brasil') {
    if (['sao paulo', 'rio de janeiro', 'salvador', 'brasilia', 'curitiba', 'porto alegre', 'belo horizonte', 'recife', 'fortaleza', 'manaus', 'ouro preto'].includes(n)) {
      return 1;
    }
    if (['cananeia', 'alcantara', 'parnaiba', 'sobral', 'crato', 'juazeiro do norte', 'chapeco', 'lages', 'criciuma', 'mariana', 'congonhas'].includes(n)) {
      return 3;
    }
    return 2;
  }

  // Se tiver pista muito técnica de física quântica ou matemática
  if (q.subcategory === 'Física Quântica' || q.subcategory === 'Matemática' || q.subcategory === 'Lógica Matemática') {
    return 3;
  }

  // Padrão Médio (2) para o restante
  return 2;
}

const stats = { '1': 0, '2': 0, '3': 0 };

for (const q of questions) {
  const d = classifyDifficulty(q);
  q.difficulty = d;
  stats[d]++;
}

console.log('Classificação concluída:', stats);

// Salva JSON
fs.writeFileSync(jsonPath, JSON.stringify(questions, null, 2), 'utf8');
console.log('questions.json atualizado com sucesso.');

// Salva CSV com aspas e campos corretos
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
console.log(`questions.csv atualizado com sucesso (${questions.length} linhas).`);
