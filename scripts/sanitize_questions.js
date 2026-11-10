const fs = require('fs');
const path = require('path');

const QUESTIONS_FILE = path.resolve(__dirname, '../data/questions.json');

// Mapeamento de gentílicos e derivados diretos por país/cidade
const demonymMap = {
  'noruega': ['norueguês', 'norueguesa', 'noruegueses', 'norueguesas'],
  'frança': ['francês', 'francesa', 'franceses', 'francesas'],
  'alemanha': ['alemão', 'alemã', 'alemães', 'alemãs'],
  'rússia': ['russo', 'russa', 'russos', 'russas'],
  'itália': ['italiano', 'italiana', 'italianos', 'italianas'],
  'espanha': ['espanhol', 'espanhola', 'espanhóis', 'espanholas'],
  'portugal': ['português', 'portuguesa', 'portugueses', 'portuguesas'],
  'japão': ['japonês', 'japonesa', 'japoneses', 'japonesas'],
  'china': ['chinês', 'chinesa', 'chineses', 'chinesas'],
  'grécia': ['grego', 'grega', 'gregos', 'gregas'],
  'egito': ['egípcio', 'egípcia', 'egípcios', 'egípcias'],
  'brasil': ['brasileiro', 'brasileira', 'brasileiros', 'brasileiras'],
  'inglaterra': ['inglês', 'inglesa', 'ingleses', 'inglesas'],
  'suécia': ['sueco', 'sueca', 'suecos', 'suecas'],
  'polônia': ['polonês', 'polonesa', 'poloneses', 'polonesas', 'polaco', 'polaca'],
  'dinamarca': ['dinamarquês', 'dinamarquesa', 'dinamarqueses', 'dinamarquesas'],
  'finlândia': ['finlandês', 'finlandesa', 'finlandeses', 'finlandesas'],
  'holanda': ['holandês', 'holandesa', 'holandeses', 'holandesas', 'neerlandês', 'neerlandesa'],
  'países baixos': ['holandês', 'holandesa', 'holandeses', 'holandesas', 'neerlandês', 'neerlandesa'],
  'argentina': ['argentino', 'argentina', 'argentinos', 'argentinas'],
  'chile': ['chileno', 'chilena', 'chilenos', 'chilenas'],
  'peru': ['peruano', 'peruana', 'peruanos', 'peruanas'],
  'colômbia': ['colombiano', 'colombiana', 'colombianos', 'colombianas'],
  'méxico': ['mexicano', 'mexicana', 'mexicanos', 'mexicanas'],
  'canadá': ['canadense', 'canadenses'],
  'austrália': ['australiano', 'australiana', 'australianos', 'australianas'],
  'índia': ['indiano', 'indiana', 'indianos', 'indianas'],
  'turquia': ['turco', 'turca', 'turcos', 'turcas'],
  'irlanda': ['irlandês', 'irlandesa', 'irlandeses', 'irlandesas'],
  'escócia': ['escocês', 'escocesa', 'escoceses', 'escocesas'],
  'suíça': ['suíço', 'suíça', 'suíços', 'suíças'],
  'austria': ['austríaco', 'austríaca', 'austríacos', 'austríacas'],
  'áustria': ['austríaco', 'austríaca', 'austríacos', 'austríacas'],
  'cuba': ['cubano', 'cubana', 'cubanos', 'cubanas']
};

const genericStop = new Set([
  'rio', 'lago', 'mar', 'oceano', 'monte', 'serra', 'baía', 'ilha', 'ilhas', 'cabo', 'estreito', 'canal', 'deserto',
  'batalha', 'guerra', 'tratado', 'revolução', 'revolta', 'pacto', 'cerco', 'operação',
  'império', 'reino', 'república', 'principado', 'ducado', 'estado', 'estados', 'cidade', 'província',
  'dom', 'dona', 'são', 'santa', 'santo', 'rei', 'rainha', 'papa', 'príncipe', 'princesa', 'presidente',
  'lei', 'teorema', 'efeito', 'constante', 'equação', 'princípio', 'partícula', 'bóson', 'ácido', 'gás',
  'grande', 'novo', 'nova', 'primeiro', 'primeira', 'segundo', 'segunda', 'terceiro', 'terceira',
  'norte', 'sul', 'leste', 'oeste', 'oriental', 'ocidental', 'central', 'alto', 'baixa', 'baixo',
  'de', 'da', 'do', 'das', 'dos', 'e', 'em', 'no', 'na', 'nos', 'nas', 'um', 'uma', 'uns', 'umas'
]);

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sanitizeQuestionText(questionText, answerCanonical, category) {
  let text = questionText;

  // 1. Remove parênteses com etimologias, línguas estrangeiras ou pronúncias da Wikipédia
  text = text.replace(/\s*\((?:[^)]*(?:em [a-zçãáàéíóúâêô\s]+:|[a-z]{2,10}:\s*|AFI:|pronúncia|pronunciado|bokmål|nynorsk|romaniz\.|lit\.|do grego|do latim|do árabe|do hebraico|do russo|do alemão|do inglês|do francês|do espanhol|do italiano|do japonês|do chinês)[^)]*)\)/gi, '');

  // 2. Remove parênteses vazios ou com apenas pontuação
  text = text.replace(/\(\s*[,;.:\- ]*\)/g, '');

  // 3. Censura gentílicos se a resposta for um país mapeado
  const ansNorm = answerCanonical.toLowerCase().trim();
  if (demonymMap[ansNorm]) {
    for (const dem of demonymMap[ansNorm]) {
      const regDem = new RegExp('\\b' + escapeRegex(dem) + '\\b', 'gi');
      text = text.replace(regDem, '[deste país]');
    }
  }

  // 4. Censura o nome canônico completo primeiro
  const fullAns = answerCanonical.trim();
  if (fullAns.length >= 3) {
    const regFull = new RegExp('\\b' + escapeRegex(fullAns) + '\\b', 'gi');
    text = text.replace(regFull, 'esta entidade');
  }

  // 5. Censura palavras-chave individuais da resposta composta (ex: 'Volga' de 'Rio Volga')
  const tokens = fullAns.split(/\s+/)
    .map(t => t.replace(/[(),.]/g, '').trim())
    .filter(t => t.length >= 3 && !genericStop.has(t.toLowerCase()));

  for (const token of tokens) {
    const regToken = new RegExp('\\b' + escapeRegex(token) + '\\b', 'gi');
    text = text.replace(regToken, 'esta entidade');
  }

  // 6. Limpeza de anomalias sintáticas do scraper
  text = text.replace(/esta entidade-Brandemburgo/gi, 'esta metrópole e Brandemburgo');
  text = text.replace(/esta entidade\s*,\s*oficialmente\s*Reino\s*desta\s*entidade/gi, 'Esta nação, oficialmente uma monarquia');
  text = text.replace(/esta entidade\s*,\s*oficialmente\s*República\s*(?:Federal\s*)?desta\s*entidade/gi, 'Esta nação');
  text = text.replace(/esta entidade ou esta entidade/gi, 'esta substância');
  text = text.replace(/esta entidade\s+esta entidade/gi, 'esta entidade');
  text = text.replace(/de\s+esta entidade/gi, 'desta entidade');
  text = text.replace(/em\s+esta entidade/gi, 'nesta entidade');
  text = text.replace(/a\s+esta entidade/gi, 'a esta entidade');

  // 7. Normalização de maiúsculas no início de frase
  text = text.replace(/(^|[.!?]\s+)esta entidade/g, (match, prefix) => prefix + 'Esta entidade');

  // 8. Espaços e pontuações limpas
  text = text.replace(/\s{2,}/g, ' ');
  text = text.replace(/\s*,\s*,/g, ',');
  text = text.replace(/\s+([.,;:!?])/g, '$1');

  return text.trim();
}

function runSanitization() {
  console.log('Lendo', QUESTIONS_FILE);
  const data = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf8'));
  console.log('Total de questões carregadas:', data.length);

  let modifiedCount = 0;
  const sanitized = data.map((item) => {
    const original = item.question_pt;
    const cleaned = sanitizeQuestionText(item.question_pt, item.answer_canonical_pt, item.category);
    if (original !== cleaned) {
      modifiedCount++;
    }
    return {
      ...item,
      question_pt: cleaned
    };
  });

  console.log(`Questões higienizadas e corrigidas: ${modifiedCount}/${data.length}`);
  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(sanitized, null, 2), 'utf8');
  console.log('Arquivo salvo com sucesso em data/questions.json!');
}

if (require.main === module) {
  runSanitization();
}

module.exports = { sanitizeQuestionText, runSanitization };
