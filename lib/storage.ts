import { DailyResult, getTodayDateString } from './daily';

const STREAK_KEY = 'corte_streak';
const LAST_PLAYED_DATE_KEY = 'corte_last_date';
const SEEN_QUESTIONS_KEY = 'corte_seen_ids';

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Retorna o resultado do dia de hoje, se já foi jogado
 */
export function getStoredDailyResult(): DailyResult | null {
  if (typeof window === 'undefined') return null;

  const today = getTodayDateString();
  // Tenta pelo cookie primeiro
  const cookieVal = getCookie(`corte_daily_${today}`);
  if (cookieVal) {
    try {
      return JSON.parse(cookieVal);
    } catch (e) {}
  }

  // Fallback para localStorage
  const localVal = localStorage.getItem(`corte_daily_${today}`);
  if (localVal) {
    try {
      return JSON.parse(localVal);
    } catch (e) {}
  }

  return null;
}

/**
 * Limpa o resultado do dia de hoje para permitir rejogar/testar
 */
export function clearDailyResult(dateStr?: string) {
  if (typeof window === 'undefined') return;
  const today = dateStr || getTodayDateString();
  document.cookie = `corte_daily_${today}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  localStorage.removeItem(`corte_daily_${today}`);
}

/**
 * Salva o resultado do jogo diário e recalcula a ofensiva (streak)
 */
export function saveStoredDailyResult(
  data: Omit<DailyResult, 'streak'>
): DailyResult {
  const today = data.dateStr;
  const lastDate = getCookie(LAST_PLAYED_DATE_KEY) || localStorage.getItem(LAST_PLAYED_DATE_KEY);
  let currentStreak = Number(getCookie(STREAK_KEY) || localStorage.getItem(STREAK_KEY) || '0');

  // Verifica se o último dia jogado foi ontem (mantém streak) ou antes (reseta)
  if (lastDate) {
    const lastTime = new Date(lastDate).getTime();
    const todayTime = new Date(today).getTime();
    const diffDays = Math.round((todayTime - lastTime) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak += 1;
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
  } else {
    currentStreak = 1;
  }

  const finalResult: DailyResult = {
    ...data,
    streak: currentStreak,
  };

  const serialized = JSON.stringify(finalResult);
  setCookie(`corte_daily_${today}`, serialized, 30);
  localStorage.setItem(`corte_daily_${today}`, serialized);

  setCookie(STREAK_KEY, String(currentStreak), 365);
  localStorage.setItem(STREAK_KEY, String(currentStreak));

  setCookie(LAST_PLAYED_DATE_KEY, today, 365);
  localStorage.setItem(LAST_PLAYED_DATE_KEY, today);

  return finalResult;
}

/**
 * Histórico de perguntas já vistas no Modo Ilimitado
 */
export function getSeenQuestionIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SEEN_QUESTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function markQuestionSeen(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const current = getSeenQuestionIds();
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem(SEEN_QUESTIONS_KEY, JSON.stringify(current));
    }
  } catch (e) {}
}

export function resetSeenQuestions() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SEEN_QUESTIONS_KEY);
}
