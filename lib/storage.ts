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
 * Atualiza e retorna a ofensiva (streak) diária baseada em acessos ao site.
 * Sempre que o usuário entra no site num novo dia consecutivo, a ofensiva aumenta.
 * Se entrar no mesmo dia, mantém. Se pular um dia ou for o primeiro acesso, ajusta para 1.
 */
export function recordDailyVisit(): number {
  if (typeof window === 'undefined') return 1;

  const today = getTodayDateString();
  const lastDate = getCookie(LAST_PLAYED_DATE_KEY) || localStorage.getItem(LAST_PLAYED_DATE_KEY);
  let currentStreak = Number(getCookie(STREAK_KEY) || localStorage.getItem(STREAK_KEY) || '0');

  if (!lastDate) {
    // Primeiro acesso
    currentStreak = 1;
  } else if (lastDate === today) {
    // Já acessou hoje, garante no mínimo 1
    currentStreak = Math.max(1, currentStreak);
  } else {
    // Calcula diferença em dias no calendário (UTC/local seguro)
    const [lastY, lastM, lastD] = lastDate.split('-').map(Number);
    const [todayY, todayM, todayD] = today.split('-').map(Number);
    const lastTime = Date.UTC(lastY, lastM - 1, lastD);
    const todayTime = Date.UTC(todayY, todayM - 1, todayD);
    const diffDays = Math.round((todayTime - lastTime) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Dia consecutivo (ontem -> hoje)
      currentStreak = Math.max(1, currentStreak) + 1;
    } else if (diffDays > 1) {
      // Quebrou a sequência
      currentStreak = 1;
    } else {
      currentStreak = Math.max(1, currentStreak);
    }
  }

  setCookie(STREAK_KEY, String(currentStreak), 365);
  localStorage.setItem(STREAK_KEY, String(currentStreak));

  setCookie(LAST_PLAYED_DATE_KEY, today, 365);
  localStorage.setItem(LAST_PLAYED_DATE_KEY, today);

  return currentStreak;
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
  const currentStreak = Number(getCookie(STREAK_KEY) || localStorage.getItem(STREAK_KEY) || '1');

  const finalResult: DailyResult = {
    ...data,
    streak: currentStreak,
  };

  const serialized = JSON.stringify(finalResult);
  setCookie(`corte_daily_${today}`, serialized, 30);
  localStorage.setItem(`corte_daily_${today}`, serialized);

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
