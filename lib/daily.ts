import { Tossup } from '@/types/quizbowl';

/**
 * Gera um hash numérico simples a partir de uma string (ex: '2026-11-09')
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Converte para inteiro de 32 bits
  }
  return Math.abs(hash);
}

/**
 * Retorna a data atual no fuso horário do Brasil (America/Sao_Paulo) no formato YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  const parts = new Intl.DateTimeFormat('pt-BR', options).formatToParts(now);
  const year = parts.find(p => p.type === 'year')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const day = parts.find(p => p.type === 'day')?.value || '';
  return `${year}-${month}-${day}`;
}

/**
 * Seleciona a pergunta determinística do dia com base na data
 */
export function getDailyQuestion(questions: Tossup[], dateStr?: string): { tossup: Tossup; dayIndex: number; dateStr: string } {
  const date = dateStr || getTodayDateString();
  const hash = hashString(`corte-daily-seed-${date}`);
  const total = questions.length;
  const index = total > 0 ? hash % total : 0;
  
  // Número ordinal do dia (ex: dia 1, dia 2... a partir de uma data base)
  const baseEpoch = new Date('2026-11-01').getTime();
  const currentEpoch = new Date(date).getTime();
  const dayNumber = Math.max(1, Math.floor((currentEpoch - baseEpoch) / (1000 * 60 * 60 * 24)) + 1);

  return {
    tossup: questions[index],
    dayIndex: dayNumber,
    dateStr: date
  };
}

export interface DailyResult {
  dateStr: string;
  dayIndex: number;
  questionId: string;
  answerCanonical: string;
  isCorrect: boolean;
  isPower: boolean;
  points: number;
  cutPercentage: number; // Porcentagem do texto lido quando cortou (ex: 28%)
  cutTimeMs: number; // Tempo em milissegundos desde o início da leitura até o corte
  streak: number; // Dias seguidos jogados
}

/**
 * Gera o texto formatado para compartilhar no WhatsApp / Discord / Redes
 */
export function formatShareText(result: DailyResult): string {
  const statusEmoji = result.isPower ? '⚡' : result.isCorrect ? '🟢' : '❌';
  const pointsStr = result.points > 0 ? `+${result.points}` : `${result.points}`;
  const secondsStr = (result.cutTimeMs / 1000).toFixed(1);

  // Barra visual de progresso (10 blocos)
  const totalBlocks = 10;
  const filledBlocks = Math.max(1, Math.min(totalBlocks, Math.round((result.cutPercentage / 100) * totalBlocks)));
  const bar = '▓'.repeat(filledBlocks) + '░'.repeat(totalBlocks - filledBlocks);

  return [
    `✂️ corte. #${result.dayIndex} — ${pointsStr} pts`,
    `${statusEmoji} [${bar}] ${result.cutPercentage}% da pergunta`,
    `⏱️ Corte em ${result.cutTimeMs} ms (${secondsStr}s)`,
    `🔥 Ofensiva: ${result.streak} ${result.streak === 1 ? 'dia' : 'dias'} seguidos`,
    ``,
    `Acerte o corte de hoje em: https://corte-quizbowl.onrender.com`
  ].join('\n');
}
