import { Tossup, JudgmentResult } from '@/types/quizbowl';

/**
 * Normaliza uma string para comparação de respostas em português:
 * - Remove acentuação e diacríticos
 * - Converte para minúsculas
 * - Remove pontuações desnecessárias
 * - Remove artigos iniciais (o, a, os, as, um, uma...)
 * - Normaliza espaços múltiplos
 */
export function normalizeAnswer(text: string): string {
  if (!text) return '';

  return text
    .trim()
    .toLowerCase()
    // Separa os acentos das letras e remove
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Substitui pontuações por espaço
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'«»]/g, ' ')
    // Remove múltiplos espaços
    .replace(/\s+/g, ' ')
    .trim()
    // Remove artigos no início da frase
    .replace(/^(o|a|os|as|um|uma|uns|umas|de|do|da|dos|das|no|na|nos|nas)\s+/i, '')
    .trim();
}

/**
 * Calcula a distância de Levenshtein entre duas strings já normalizadas.
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // remoção
        dp[i][j - 1] + 1, // inserção
        dp[i - 1][j - 1] + cost // substituição
      );
    }
  }

  return dp[m][n];
}

/**
 * Verifica se a resposta dada é aceitável considerando pequenas falhas de digitação (typos).
 */
export function isFuzzyMatch(given: string, target: string): boolean {
  if (given === target) return true;

  const maxLen = Math.max(given.length, target.length);
  const dist = levenshteinDistance(given, target);

  if (maxLen <= 4) {
    return dist === 0;
  } else if (maxLen <= 8) {
    return dist <= 1;
  } else {
    return dist <= 2;
  }
}

/**
 * Avalia tokens/palavras individuais para reconhecer sobrenomes e partes fundamentais
 */
function matchTokens(given: string, target: string): boolean {
  const givenTokens = given.split(' ').filter(Boolean);
  const targetTokens = target.split(' ').filter(Boolean);

  if (givenTokens.length === 1 && targetTokens.length > 1) {
    const singleToken = givenTokens[0];
    // Se o token for o último sobrenome ou uma palavra-chave com mais de 4 caracteres
    const lastTargetToken = targetTokens[targetTokens.length - 1];
    if (singleToken.length >= 4 && isFuzzyMatch(singleToken, lastTargetToken)) {
      return true;
    }
  }
  return false;
}

/**
 * O Juiz Nativo CORTE: avalia a resposta fornecida pelo jogador contra a pergunta do Quizbowl.
 */
export function judgeAnswer(
  givenAnswer: string,
  tossup: Tossup,
  options: {
    isPower: boolean;
    interrupted: boolean; // se o jogador cortou a leitura antes de terminar o texto
  }
): JudgmentResult {
  const rawGiven = givenAnswer.trim();
  const normalizedGiven = normalizeAnswer(rawGiven);

  if (!normalizedGiven) {
    return {
      status: 'incorrect',
      message: 'Nenhuma resposta foi enviada.',
      points: options.interrupted ? -5 : 0,
      isPower: options.isPower,
    };
  }

  // 1. Verificar rejeições explícitas
  if (tossup.reject_aliases && tossup.reject_aliases.length > 0) {
    for (const reject of tossup.reject_aliases) {
      const normReject = normalizeAnswer(reject);
      if (normalizedGiven === normReject || isFuzzyMatch(normalizedGiven, normReject)) {
        return {
          status: 'incorrect',
          message: `Incorreto. A resposta "${rawGiven}" não é aceita.`,
          points: options.interrupted ? -5 : 0,
          isPower: options.isPower,
        };
      }
    }
  }

  // 2. Verificar se pede "Prompt" (seja mais específico)
  if (tossup.prompt_aliases && tossup.prompt_aliases.length > 0) {
    for (const prompt of tossup.prompt_aliases) {
      const normPrompt = normalizeAnswer(prompt);
      if (
        normalizedGiven === normPrompt ||
        isFuzzyMatch(normalizedGiven, normPrompt) ||
        (normPrompt.length >= 4 && normalizedGiven.includes(normPrompt))
      ) {
        return {
          status: 'prompt',
          message: `Seja mais específico(a)! Forneça mais detalhes sobre "${rawGiven}".`,
          matchedAlias: prompt,
          points: 0,
          isPower: options.isPower,
        };
      }
    }
  }

  // 3. Montar todas as variações aceitas
  const allAccepts = [
    tossup.answer_canonical_pt,
    ...(tossup.accept_aliases || []),
  ];

  // 4. Testar correspondência exata, fuzzy e tokens
  for (const accept of allAccepts) {
    const normAccept = normalizeAnswer(accept);

    // Comparação direta ou fuzzy
    if (normalizedGiven === normAccept || isFuzzyMatch(normalizedGiven, normAccept)) {
      return {
        status: 'correct',
        message: options.isPower ? '💥 CORTE PERFEITO! Resposta correta no POWER (+15 pts)!' : '✅ Resposta correta (+10 pts)!',
        matchedAlias: accept,
        points: options.isPower ? 15 : 10,
        isPower: options.isPower,
      };
    }

    // Comparação de sobrenome/token principal
    if (matchTokens(normalizedGiven, normAccept)) {
      return {
        status: 'correct',
        message: options.isPower ? '💥 CORTE PERFEITO! Resposta correta no POWER (+15 pts)!' : '✅ Resposta correta (+10 pts)!',
        matchedAlias: accept,
        points: options.isPower ? 15 : 10,
        isPower: options.isPower,
      };
    }
  }

  // 5. Se não bateu com nada aceito
  return {
    status: 'incorrect',
    message: options.interrupted
      ? `Incorreto (-5 pts por interromper a leitura). A resposta correta era: ${tossup.answer_canonical_pt}`
      : `Incorreto (0 pts). A resposta correta era: ${tossup.answer_canonical_pt}`,
    points: options.interrupted ? -5 : 0,
    isPower: options.isPower,
  };
}
