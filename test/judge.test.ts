import { judgeAnswer, normalizeAnswer } from '../lib/judge';
import { Tossup } from '../types/quizbowl';

const mockTossup: Tossup = {
  id: 'test-vargas',
  origin: 'wikipedia_br',
  category: 'História',
  subcategory: 'História do Brasil',
  difficulty: 3,
  question_pt: 'Este líder gaúcho assumiu o poder na Revolução de 1930... (*) Por 10 pontos, nomeie este presidente do Estado Novo.',
  formatted_answer_pt: '<b><u>Getúlio Vargas</u></b> [ou <b><u>Getúlio Dornelles Vargas</u></b>; peça mais detalhes em "Vargas" se necessário]',
  answer_canonical_pt: 'Getúlio Vargas',
  accept_aliases: [
    'Getúlio Dornelles Vargas',
    'Getulio Vargas',
    'Vargas',
    'Getulio',
    'Getúlio'
  ],
  prompt_aliases: ['ditador', 'presidente']
};

console.log('--- TESTANDO JUIZ NATIVO CORTE ---');

// Teste 1: Resposta exata com acento
let res = judgeAnswer('Getúlio Vargas', mockTossup, { isPower: true, interrupted: true });
console.log('1. "Getúlio Vargas" (Power):', res.status === 'correct' && res.points === 15 ? 'PASSOU' : 'FALHOU', res);

// Teste 2: Resposta sem acento e com artigo
res = judgeAnswer('o getulio vargas', mockTossup, { isPower: false, interrupted: true });
console.log('2. "o getulio vargas":', res.status === 'correct' && res.points === 10 ? 'PASSOU' : 'FALHOU');

// Teste 3: Apenas sobrenome
res = judgeAnswer('vargas', mockTossup, { isPower: false, interrupted: false });
console.log('3. "vargas":', res.status === 'correct' ? 'PASSOU' : 'FALHOU');

// Teste 4: Typo leve (vargaz)
res = judgeAnswer('vargaz', mockTossup, { isPower: false, interrupted: false });
console.log('4. "vargaz" (typo):', res.status === 'correct' ? 'PASSOU' : 'FALHOU');

// Teste 5: Prompt (disparo de "presidente")
res = judgeAnswer('presidente', mockTossup, { isPower: false, interrupted: true });
console.log('5. "presidente" (prompt):', res.status === 'prompt' ? 'PASSOU' : 'FALHOU', res.message);

// Teste 6: Erro com interrupção (negativo -5)
res = judgeAnswer('Juscelino Kubitschek', mockTossup, { isPower: false, interrupted: true });
console.log('6. "Juscelino" (erro interrompido -5):', res.status === 'incorrect' && res.points === -5 ? 'PASSOU' : 'FALHOU');

console.log('--- TESTES CONCLUÍDOS ---');
