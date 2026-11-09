'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Tossup, JudgmentResult, PlayerStats } from '@/types/quizbowl';
import { 
  getDailyQuestion, 
  DailyResult, 
  formatShareText 
} from '@/lib/daily';
import { 
  getStoredDailyResult, 
  saveStoredDailyResult, 
  clearDailyResult,
  markQuestionSeen,
  getCookie
} from '@/lib/storage';
import { 
  Zap, 
  Play, 
  Pause, 
  ChevronRight, 
  BookOpen, 
  ExternalLink, 
  Clock, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Scissors, 
  Sparkles, 
  Share2, 
  Calendar, 
  Infinity as InfinityIcon,
  Timer,
  Check,
  Layers,
  Gauge,
  RotateCcw,
  Eye
} from 'lucide-react';

interface QuizbowlReaderProps {
  initialQuestions: Tossup[];
}

/**
 * Função para embaralhar array aleatoriamente (Fisher-Yates)
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function QuizbowlReader({ initialQuestions }: QuizbowlReaderProps) {
  // Evita hydration mismatch no SSR
  const [isMounted, setIsMounted] = useState(false);

  // Modo de Jogo: 'daily' (padrão) ou 'unlimited'
  const [gameMode, setGameMode] = useState<'daily' | 'unlimited'>('daily');

  // Estado do Modo Diário (sempre questão fácil)
  const [dailyResult, setDailyResult] = useState<DailyResult | null>(null);
  const [dailyQuestionData, setDailyQuestionData] = useState<{ tossup: Tossup; dayIndex: number; dateStr: string } | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [timeUntilTomorrow, setTimeUntilTomorrow] = useState('');
  const [streakCount, setStreakCount] = useState<number>(0);

  // Lista de todas as categorias e dificuldades disponíveis no banco
  const availableCategories = useMemo(() => [
    'Ciência',
    'História',
    'Geografia',
    'Literatura',
    'Cidades do Brasil',
    'Personalidades do Brasil',
    'Políticos do Brasil',
    'Curiosidades do Mundo',
    'Artes',
    'Mitologia',
    'Linguística'
  ], []);

  const categoryLabels: Record<string, string> = useMemo(() => ({
    'Ciência': 'Ciência',
    'História': 'História',
    'Geografia': 'Geografia',
    'Literatura': 'Literatura',
    'Cidades do Brasil': 'Cidades BR',
    'Personalidades do Brasil': 'Personalidades',
    'Políticos do Brasil': 'Políticos BR',
    'Curiosidades do Mundo': 'Mundo',
    'Artes': 'Artes',
    'Mitologia': 'Mitologia',
    'Linguística': 'Linguística',
  }), []);

  const availableDifficulties = useMemo(() => [
    { label: 'Fácil', key: 'easy', match: (d: number) => d <= 1 },
    { label: 'Média', key: 'medium', match: (d: number) => d === 2 },
    { label: 'Difícil', key: 'hard', match: (d: number) => d >= 3 },
  ], []);

  // Filtros Multi-seleção (Modo Ilimitado)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Todas']);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(['Qualquer']);

  // Questões do Modo Ilimitado (Filtradas e Randomizadas)
  const [unlimitedQuestions, setUnlimitedQuestions] = useState<Tossup[]>([]);
  const [unlimitedIndex, setUnlimitedIndex] = useState(0);

  // Estado da leitura da pergunta ativa
  const [status, setStatus] = useState<'idle' | 'reading' | 'buzzed' | 'judged' | 'revealed'>('idle');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPowerEligible, setIsPowerEligible] = useState(true);
  const [buzzedAtWordIndex, setBuzzedAtWordIndex] = useState<number | null>(null);

  // Marcações de tempo (em milissegundos de precisão)
  const readingStartTimeRef = useRef<number | null>(null);
  const [measuredCutTimeMs, setMeasuredCutTimeMs] = useState<number>(0);
  const [measuredCutPercent, setMeasuredCutPercent] = useState<number>(0);

  // Resposta e julgamento
  const [userAnswer, setUserAnswer] = useState('');
  const [judgment, setJudgment] = useState<JudgmentResult | null>(null);
  const [promptMessage, setPromptMessage] = useState<string | null>(null);
  const [buzzTimeRemaining, setBuzzTimeRemaining] = useState(7);

  // Placar do Modo Ilimitado
  const [stats, setStats] = useState<PlayerStats>({
    score: 0,
    powers: 0,
    tens: 0,
    negs: 0,
    totalBuzzes: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
  });

  // Aplica filtros e randomiza para o Modo Ilimitado
  const applyFiltersAndRandomize = useCallback((cats: string[], diffs: string[], resetIndex = true) => {
    let pool = [...initialQuestions];

    // Filtro multiclicável de Categorias
    if (!cats.includes('Todas') && cats.length > 0) {
      pool = pool.filter(q => cats.includes(q.category));
    }

    // Filtro multiclicável de Dificuldades
    if (!diffs.includes('Qualquer') && diffs.length > 0) {
      pool = pool.filter(q => {
        return diffs.some(diffKey => {
          const def = availableDifficulties.find(d => d.key === diffKey);
          return def ? def.match(q.difficulty) : false;
        });
      });
    }

    // Randomiza a ordem para que NUNCA venha na ordem do banco
    const shuffled = shuffleArray(pool);
    setUnlimitedQuestions(shuffled);
    if (resetIndex) {
      setUnlimitedIndex(0);
    }
  }, [initialQuestions, availableDifficulties]);

  // Montagem do cliente
  useEffect(() => {
    setIsMounted(true);
    const stored = getStoredDailyResult();
    if (stored) {
      setDailyResult(stored);
    }

    // Pergunta diária sempre FÁCIL
    const dailyData = getDailyQuestion(initialQuestions);
    setDailyQuestionData(dailyData);

    const savedStreak = Number(getCookie('corte_streak') || (stored ? stored.streak : 0));
    setStreakCount(savedStreak);

    // Inicializa o modo ilimitado com randomização
    applyFiltersAndRandomize(['Todas'], ['Qualquer'], true);

    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      const diff = Math.max(0, tomorrow.getTime() - now.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeUntilTomorrow(
        `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [initialQuestions, applyFiltersAndRandomize]);

  // Alternadores de filtro multi-seleção de categorias
  const toggleCategory = (cat: string) => {
    let nextCats: string[];
    if (cat === 'Todas') {
      nextCats = ['Todas'];
    } else {
      const filtered = selectedCategories.filter(c => c !== 'Todas');
      if (filtered.includes(cat)) {
        nextCats = filtered.filter(c => c !== cat);
        if (nextCats.length === 0) nextCats = ['Todas'];
      } else {
        nextCats = [...filtered, cat];
      }
    }
    setSelectedCategories(nextCats);
    applyFiltersAndRandomize(nextCats, selectedDifficulties, true);
  };

  // Alternadores de filtro multi-seleção de dificuldades
  const toggleDifficulty = (diffKey: string) => {
    let nextDiffs: string[];
    if (diffKey === 'Qualquer') {
      nextDiffs = ['Qualquer'];
    } else {
      const filtered = selectedDifficulties.filter(d => d !== 'Qualquer');
      if (filtered.includes(diffKey)) {
        nextDiffs = filtered.filter(d => d !== diffKey);
        if (nextDiffs.length === 0) nextDiffs = ['Qualquer'];
      } else {
        nextDiffs = [...filtered, diffKey];
      }
    }
    setSelectedDifficulties(nextDiffs);
    applyFiltersAndRandomize(selectedCategories, nextDiffs, true);
  };

  // Pergunta atualmente em exibição
  const currentQuestion = gameMode === 'daily' 
    ? dailyQuestionData?.tossup || null 
    : unlimitedQuestions[unlimitedIndex] || null;

  const words = useRef<string[]>([]);
  const powerWordIndex = useRef<number>(-1);
  const readerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const answerInputRef = useRef<HTMLInputElement | null>(null);

  // Prepara as palavras e localiza a fronteira do Power (*)
  useEffect(() => {
    if (!currentQuestion) return;

    const rawWords = currentQuestion.question_pt.split(/\s+/).filter(Boolean);
    let starIdx = -1;
    const cleanWords: string[] = [];

    for (let i = 0; i < rawWords.length; i++) {
      if (rawWords[i].includes('(*)')) {
        starIdx = cleanWords.length;
        const cleaned = rawWords[i].replace('(*)', '').trim();
        if (cleaned) cleanWords.push(cleaned);
      } else {
        cleanWords.push(rawWords[i]);
      }
    }

    words.current = cleanWords;
    powerWordIndex.current = starIdx !== -1 ? starIdx : Math.floor(cleanWords.length * 0.45);
    resetQuestionState();
  }, [currentQuestion, gameMode]);

  const resetQuestionState = () => {
    if (readerIntervalRef.current) clearInterval(readerIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    setStatus('idle');
    setCurrentWordIndex(0);
    setIsPowerEligible(true);
    setBuzzedAtWordIndex(null);
    setUserAnswer('');
    setJudgment(null);
    setPromptMessage(null);
    setBuzzTimeRemaining(7);
    readingStartTimeRef.current = null;
    setMeasuredCutTimeMs(0);
    setMeasuredCutPercent(0);
  };

  // Permite ao usuário reiniciar e treinar o Diário sem cache bloqueante
  const handleResetDaily = () => {
    clearDailyResult();
    setDailyResult(null);
    resetQuestionState();
  };

  // Iniciar / pausar leitura
  const toggleReading = () => {
    if (status === 'reading') {
      if (readerIntervalRef.current) clearInterval(readerIntervalRef.current);
      setStatus('idle');
    } else if (status === 'idle') {
      if (!readingStartTimeRef.current) {
        readingStartTimeRef.current = performance.now();
      }
      setStatus('reading');
    }
  };

  // O "CORTE" (Buzzer)
  const handleBuzz = useCallback(() => {
    if (status !== 'reading' && status !== 'idle') return;

    if (readerIntervalRef.current) clearInterval(readerIntervalRef.current);

    const now = performance.now();
    const startTime = readingStartTimeRef.current || now;
    const elapsedMs = Math.max(120, Math.round(now - startTime));
    const totalWords = words.current.length || 1;
    const currentWordsRead = Math.max(1, currentWordIndex);
    const cutPercent = Math.min(100, Math.max(1, Math.round((currentWordsRead / totalWords) * 100)));

    setMeasuredCutTimeMs(elapsedMs);
    setMeasuredCutPercent(cutPercent);

    setStatus('buzzed');
    setBuzzedAtWordIndex(currentWordIndex);
    setBuzzTimeRemaining(7);

    setTimeout(() => {
      answerInputRef.current?.focus();
    }, 50);
  }, [status, currentWordIndex]);

  // Timer de 7 segundos para responder após o corte
  useEffect(() => {
    if (status === 'buzzed') {
      timerIntervalRef.current = setInterval(() => {
        setBuzzTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            submitAnswer(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status]);

  // Intervalo de leitura palavra por palavra
  useEffect(() => {
    if (status === 'reading') {
      const intervalMs = Math.round(60000 / 240); // 240 WPM

      readerIntervalRef.current = setInterval(() => {
        setCurrentWordIndex((prev) => {
          const next = prev + 1;

          if (powerWordIndex.current !== -1 && next > powerWordIndex.current) {
            setIsPowerEligible(false);
          }

          if (next >= words.current.length) {
            clearInterval(readerIntervalRef.current!);
            setStatus('idle');
            return words.current.length;
          }

          return next;
        });
      }, intervalMs);
    }

    return () => {
      if (readerIntervalRef.current) clearInterval(readerIntervalRef.current);
    };
  }, [status]);

  // Teclado: Barra de Espaço para CORTAR
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (status === 'reading' || status === 'idle')) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleBuzz();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBuzz, status]);

  // Submeter ao Juiz Nativo
  const submitAnswer = async (timedOut = false) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (!currentQuestion) return;

    const answerToEval = timedOut ? '' : userAnswer;
    const isInterrupted = (buzzedAtWordIndex ?? 0) < words.current.length;

    try {
      const response = await fetch('/api/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          givenAnswer: answerToEval,
          tossup: currentQuestion,
          isPower: isPowerEligible,
          interrupted: isInterrupted,
        }),
      });

      const res: JudgmentResult = await response.json();

      if (res.status === 'prompt') {
        setPromptMessage(res.message);
        setBuzzTimeRemaining(5);
        setUserAnswer('');
        setTimeout(() => answerInputRef.current?.focus(), 50);
        return;
      }

      setJudgment(res);
      setStatus('judged');

      const isCorrect = res.status === 'correct';

      if (gameMode === 'daily' && dailyQuestionData) {
        const saved = saveStoredDailyResult({
          dateStr: dailyQuestionData.dateStr,
          dayIndex: dailyQuestionData.dayIndex,
          questionId: currentQuestion.id,
          answerCanonical: currentQuestion.answer_canonical_pt,
          isCorrect,
          isPower: res.points === 15,
          points: res.points,
          cutPercentage: measuredCutPercent,
          cutTimeMs: measuredCutTimeMs,
        });
        setDailyResult(saved);
        setStreakCount(saved.streak);
      }

      if (gameMode === 'unlimited') {
        markQuestionSeen(currentQuestion.id);
        const isNeg = res.points < 0;
        setStats((prev) => ({
          score: prev.score + res.points,
          powers: prev.powers + (res.points === 15 ? 1 : 0),
          tens: prev.tens + (res.points === 10 ? 1 : 0),
          negs: prev.negs + (isNeg ? 1 : 0),
          totalBuzzes: prev.totalBuzzes + 1,
          correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
          wrongAnswers: prev.wrongAnswers + (!isCorrect ? 1 : 0),
        }));
      }
    } catch (err) {
      console.error('Erro ao conectar ao juiz:', err);
    }
  };

  const nextUnlimitedQuestion = () => {
    if (unlimitedIndex < unlimitedQuestions.length - 1) {
      setUnlimitedIndex((prev) => prev + 1);
    } else {
      // Re-embaralha ao chegar ao fim do pool
      setUnlimitedQuestions(shuffleArray(unlimitedQuestions));
      setUnlimitedIndex(0);
    }
  };

  const revealAnswer = () => {
    if (readerIntervalRef.current) clearInterval(readerIntervalRef.current);
    setCurrentWordIndex(words.current.length);
    setStatus('revealed');
  };

  const handleCopyShare = () => {
    if (!dailyResult) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://corte-h0ub.onrender.com';
    const text = formatShareText(dailyResult, origin);
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  // Helper para rotular dificuldade na pergunta
  const getDifficultyBadge = (diff: number) => {
    if (diff <= 1) return { label: 'Fácil', bg: 'bg-[#d8f3dc] text-[#1b4332]' };
    if (diff === 2) return { label: 'Média', bg: 'bg-[#fff4dc] text-[#b45309]' };
    return { label: 'Difícil', bg: 'bg-[#ffccd5] text-[#9f1239]' };
  };

  return (
    <div className="h-full flex flex-col justify-between p-3 sm:p-5 max-w-[1650px] mx-auto select-none">
      {/* ======================================================== */}
      {/* 1. HEADER FIXO COMPACTO (SEM ROLAGEM)                    */}
      {/* ======================================================== */}
      <header className="flex items-center justify-between border-b-2 border-ink/15 pb-2.5 mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="font-serif font-black text-3xl sm:text-4xl tracking-tight text-ink flex items-center">
            corte<span className="text-or">.</span>
          </h1>
          <span className="bg-creme border-2 border-ink px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider text-ink shadow-solid-sm flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-or fill-or" />
            {isMounted ? streakCount : 0} {streakCount === 1 ? 'dia' : 'dias'}
          </span>
        </div>

        {/* Chave Seletora de Modo (Diário vs Ilimitado) e Placar */}
        <div className="flex items-center gap-3">
          {gameMode === 'unlimited' && (
            <div className="hidden md:flex items-center gap-2 bg-card border-2 border-ink rounded-full px-3 py-1 shadow-solid-sm text-xs font-bold text-ink">
              <span>Pts: <strong className="text-gr-dark">{stats.score}</strong></span>
              <span className="text-ink/30">&bull;</span>
              <span>15s: <strong className="text-mu-dark">{stats.powers}</strong></span>
              <span className="text-ink/30">&bull;</span>
              <span>10s: <strong>{stats.tens}</strong></span>
              <span className="text-ink/30">&bull;</span>
              <span>-5s: <strong className="text-rd">{stats.negs}</strong></span>
            </div>
          )}

          <div className="flex items-center bg-card border-[2.5px] border-ink rounded-full p-0.5 shadow-solid-sm">
            <button
              onClick={() => {
                setGameMode('daily');
                resetQuestionState();
              }}
              className={`btn-salinha px-3.5 py-1 text-xs font-black transition ${
                gameMode === 'daily'
                  ? 'bg-or text-white border-2 border-ink shadow-solid-sm'
                  : 'bg-transparent text-ink border-transparent shadow-none hover:bg-paper'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 mr-1" />
              Diário
            </button>
            <button
              onClick={() => {
                setGameMode('unlimited');
                resetQuestionState();
              }}
              className={`btn-salinha px-3.5 py-1 text-xs font-black transition ${
                gameMode === 'unlimited'
                  ? 'bg-mu text-ink border-2 border-ink shadow-solid-sm'
                  : 'bg-transparent text-ink border-transparent shadow-none hover:bg-paper'
              }`}
            >
              <InfinityIcon className="w-3.5 h-3.5 mr-1" />
              Ilimitado
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. ÁREA PRINCIPAL: GRID DE 2 COLUNAS (NO SCROLL)         */}
      {/* ======================================================== */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 overflow-hidden">
        
        {/* ---------------------------------------------------- */}
        {/* COLUNA DA ESQUERDA: A PERGUNTA (7/12 = ~58% LARGURA) */}
        {/* ---------------------------------------------------- */}
        <div className="lg:col-span-7 h-full flex flex-col justify-between card-salinha p-5 sm:p-7 relative overflow-hidden bg-card">
          {currentQuestion ? (
            <>
              {/* Topo do Card com Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b-2 border-ink/15 shrink-0">
                <div className="flex items-center gap-2">
                  {gameMode === 'daily' ? (
                    <span className="bg-or text-white border-2 border-ink text-[11px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-solid-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      CORTE DO DIA #{dailyQuestionData?.dayIndex}
                    </span>
                  ) : (
                    <span className="bg-creme border-2 border-ink text-ink text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow-solid-sm">
                      #{unlimitedIndex + 1} de {unlimitedQuestions.length}
                    </span>
                  )}

                  <span className="bg-paper border-2 border-ink text-[11px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-solid-sm">
                    {currentQuestion.category}
                  </span>

                  {/* Badge de Dificuldade */}
                  {(() => {
                    const badge = getDifficultyBadge(currentQuestion.difficulty);
                    return (
                      <span className={`border-2 border-ink text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow-solid-sm ${badge.bg}`}>
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Badge de Power */}
                <div>
                  {isPowerEligible ? (
                    <span className="inline-flex items-center gap-1 bg-mu border-2 border-ink text-ink text-[11px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-solid-sm animate-pulse">
                      <Zap className="w-3 h-3 fill-ink" />
                      POWER (+15)
                    </span>
                  ) : (
                    <span className="bg-paper border-2 border-ink/40 text-suave text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                      Normal (+10)
                    </span>
                  )}
                </div>
              </div>

              {/* Corpo da Pergunta com Leitura Dinâmica */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 text-xl sm:text-2xl lg:text-[1.65rem] leading-relaxed sm:leading-loose text-ink font-normal flex flex-col justify-center">
                {status === 'idle' && currentWordIndex === 0 ? (
                  <div className="text-suave font-serif italic flex items-center gap-2.5 text-lg sm:text-xl py-4">
                    <Play className="w-5 h-5 text-or fill-or animate-bounce shrink-0" />
                    Pressione <strong>"Iniciar"</strong> na lateral ou use a tecla <strong>Espaço</strong> para cortar...
                  </div>
                ) : (
                  <div>
                    {words.current.map((word, idx) => {
                      const isRevealed = idx < currentWordIndex || status === 'revealed' || status === 'judged';
                      const isWordPower = idx <= powerWordIndex.current;
                      const isBuzzedHere = idx === buzzedAtWordIndex;
                      const isReadingHead = idx === currentWordIndex - 1 && status === 'reading';

                      if (!isRevealed) {
                        return (
                          <span
                            key={idx}
                            aria-hidden="true"
                            className="inline-block mr-1.5 h-3.5 sm:h-4 bg-[#e2dbce] rounded select-none align-middle"
                            style={{ width: `${Math.max(22, Math.min(80, word.length * 9.5))}px` }}
                          />
                        );
                      }

                      return (
                        <span
                          key={idx}
                          className={`inline-block mr-1.5 transition-colors ${
                            isWordPower && status === 'reading'
                              ? 'text-ink font-semibold'
                              : 'text-ink'
                          } ${
                            isBuzzedHere
                              ? 'bg-rd text-white px-1.5 py-0.5 rounded-md border-2 border-ink font-bold shadow-solid-sm'
                              : ''
                          }`}
                        >
                          {word}
                          {isReadingHead && (
                            <span className="inline-block w-2 h-6 bg-or ml-1 rounded-full align-middle cursor-leitura" />
                          )}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Base do Card: Barra de Progresso */}
              <div className="pt-3 mt-2 border-t-2 border-ink/15 flex items-center justify-between text-xs font-bold text-suave shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span>Leitura:</span>
                  <div className="w-32 sm:w-48 h-2.5 bg-paper border-2 border-ink rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-150 ${
                        isPowerEligible ? 'bg-mu' : 'bg-gr'
                      }`}
                      style={{
                        width: `${Math.min(100, (currentWordIndex / (words.current.length || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <span>
                  {currentWordIndex}/{words.current.length} palavras
                </span>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-suave font-bold">Nenhuma pergunta encontrada com os filtros selecionados.</p>
              <button
                onClick={() => {
                  setSelectedCategories(['Todas']);
                  setSelectedDifficulties(['Qualquer']);
                  applyFiltersAndRandomize(['Todas'], ['Qualquer'], true);
                }}
                className="btn-salinha mt-3 bg-mu text-ink px-4 py-2 text-xs font-bold cursor-pointer shadow-solid-sm"
              >
                Resetar Filtros
              </button>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------------------- */}
        {/* COLUNA DA DIREITA: A ORDEM SOLICITADA PELO USUÁRIO                     */}
        {/* NO MODO ILIMITADO: 1. FILTROS -> 2. CONTROLES -> 3. GABARITOS          */}
        {/* NO MODO DIÁRIO:    1. CONTROLES -> 2. GABARITO/RESULTADO               */}
        {/* ---------------------------------------------------------------------- */}
        <div className="lg:col-span-5 h-full flex flex-col justify-between gap-3 card-salinha p-4 sm:p-5 overflow-hidden bg-card">
          
          {/* =================================================================== */}
          {/* SE O MODO FOR ILIMITADO: EXIBIR FILTROS NO TOPO (1º LUGAR!)         */}
          {/* =================================================================== */}
          {gameMode === 'unlimited' && (
            <div className="shrink-0 space-y-2 pb-2.5 border-b-2 border-ink/15">
              {/* Contador Dinâmico de Questões Disponíveis */}
              <div className="flex items-center justify-between text-xs font-black text-ink">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-or" /> Filtros Ativos:
                </span>
                <span className="bg-creme border border-ink px-2 py-0.5 rounded-full text-[11px] shadow-solid-sm">
                  {unlimitedQuestions.length} questões encontradas
                </span>
              </div>

              {/* Filtro Multi-seleção: Dificuldades */}
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase text-suave flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-bl" /> Dificuldade (Multi-seleção):
                </div>
                <div className="flex flex-wrap gap-1.5 p-1 pb-2">
                  <button
                    onClick={() => toggleDifficulty('Qualquer')}
                    className={`tag-salinha px-2.5 py-1 text-[11px] font-bold transition shrink-0 ${
                      selectedDifficulties.includes('Qualquer')
                        ? 'bg-mu text-ink shadow-solid-sm'
                        : 'bg-paper text-suave hover:bg-[#e6dfd1]'
                    }`}
                  >
                    Qualquer
                  </button>
                  {availableDifficulties.map(diff => (
                    <button
                      key={diff.key}
                      onClick={() => toggleDifficulty(diff.key)}
                      className={`tag-salinha px-2.5 py-1 text-[11px] font-bold transition shrink-0 ${
                        selectedDifficulties.includes(diff.key)
                          ? 'bg-mu text-ink shadow-solid-sm'
                          : 'bg-paper text-suave hover:bg-[#e6dfd1]'
                      }`}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro Multi-seleção: Temas */}
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase text-suave flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-or" /> Temas (Multi-seleção):
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 pb-3 scrollbar-thin">
                  <button
                    onClick={() => toggleCategory('Todas')}
                    className={`tag-salinha px-2.5 py-1 text-[11px] font-bold transition shrink-0 ${
                      selectedCategories.includes('Todas')
                        ? 'bg-mu text-ink shadow-solid-sm'
                        : 'bg-paper text-suave hover:bg-[#e6dfd1]'
                    }`}
                  >
                    Todos
                  </button>
                  {availableCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      title={cat}
                      className={`tag-salinha px-2.5 py-1 text-[11px] font-bold transition shrink-0 ${
                        selectedCategories.includes(cat)
                          ? 'bg-mu text-ink shadow-solid-sm'
                          : 'bg-paper text-suave hover:bg-[#e6dfd1]'
                      }`}
                    >
                      {categoryLabels[cat] || cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* OS CONTROLES (BUZZER, INICIAR, GABARITO, PRÓXIMA)                   */}
          {/* NO ILIMITADO FICA NO MEIO (2º); NO DIÁRIO FICA NO TOPO (1º)         */}
          {/* =================================================================== */}
          <div className="shrink-0 space-y-2.5 pb-2.5 border-b-2 border-ink/15">
            {status === 'buzzed' ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-rd font-black text-xs uppercase tracking-wider">
                    <Scissors className="w-4 h-4 text-rd" />
                    CORTADO AOS {measuredCutPercent}% ({measuredCutTimeMs} ms)!
                  </div>
                  <div className="flex items-center gap-1 font-mono text-sm font-black text-ink bg-mu border-2 border-ink px-2.5 py-0.5 rounded-full shadow-solid-sm">
                    <Clock className="w-3.5 h-3.5" /> {buzzTimeRemaining}s
                  </div>
                </div>

                <div className="w-full h-2 bg-paper border-2 border-ink rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-rd rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${(buzzTimeRemaining / 7) * 100}%` }}
                  />
                </div>

                {promptMessage && (
                  <div className="bg-creme border-2 border-ink text-ink p-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-solid-sm">
                    <AlertTriangle className="w-4 h-4 text-or shrink-0" />
                    <span>{promptMessage}</span>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitAnswer();
                  }}
                  className="flex gap-2"
                >
                  <input
                    ref={answerInputRef}
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Digite sua resposta..."
                    className="flex-1 bg-paper border-2 border-ink rounded-xl px-3 py-2 text-ink text-base font-bold placeholder-ink/40 focus:outline-none shadow-solid-sm"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="btn-salinha bg-gr hover:bg-gr-dark text-white px-5 py-2 text-xs uppercase tracking-wider cursor-pointer shadow-solid-sm"
                  >
                    Confirmar
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Botão de CORTAR Principal */}
                <button
                  onClick={handleBuzz}
                  disabled={status === 'judged' || status === 'revealed'}
                  className={`btn-salinha w-full py-3.5 text-xl tracking-wide uppercase transition ${
                    status === 'judged' || status === 'revealed'
                      ? 'bg-paper text-ink/30 border-ink/30 shadow-none cursor-not-allowed'
                      : 'bg-or hover:bg-or-dark text-white shadow-solid cursor-pointer'
                  }`}
                >
                  <Scissors className="w-5 h-5 mr-1.5" />
                  CORTAR! <span className="text-[11px] bg-ink text-white px-2 py-0.5 rounded-full ml-2 font-mono">Espaço</span>
                </button>

                {/* Linha com Iniciar, Gabarito e Próxima */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleReading}
                    disabled={status === 'judged' || status === 'revealed'}
                    className="btn-salinha flex-1 bg-card hover:bg-paper text-ink py-2 text-xs cursor-pointer shadow-solid-sm"
                  >
                    {status === 'reading' ? (
                      <>
                        <Pause className="w-3.5 h-3.5 mr-1" /> Pausar
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 mr-1 fill-ink" /> Iniciar
                      </>
                    )}
                  </button>

                  <button
                    onClick={revealAnswer}
                    className="btn-salinha px-3.5 bg-paper hover:bg-[#e4ddce] text-ink py-2 text-xs cursor-pointer shadow-solid-sm"
                  >
                    Gabarito
                  </button>

                  {gameMode === 'unlimited' && (
                    <button
                      onClick={nextUnlimitedQuestion}
                      className="btn-salinha flex-1 bg-mu hover:bg-mu-dark text-ink py-2 text-xs cursor-pointer shadow-solid-sm"
                    >
                      Próxima <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* =================================================================== */}
          {/* SEÇÃO DO GABARITO / RESPOSTA CERTA                                  */}
          {/* NUNCA MOSTRA A RESPOSTA EM CACHE SE O USUÁRIO NÃO CORTOU/PEDIU!     */}
          {/* =================================================================== */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col justify-center">
            {/* Caso 1: Pergunta foi respondida ou gabarito revelado ativamente */}
            {status === 'judged' || status === 'revealed' ? (
              <div className="space-y-2.5">
                {/* Veredito do Juiz com Pontuação e Reação (se cortado) */}
                {judgment && (
                  <div
                    className={`p-3 rounded-2xl border-2 border-ink shadow-solid-sm flex items-start gap-2.5 ${
                      judgment.status === 'correct'
                        ? judgment.points === 15
                          ? 'bg-mu'
                          : 'bg-[#d8f3dc]'
                        : 'bg-[#ffccd5]'
                    }`}
                  >
                    {judgment.status === 'correct' ? (
                      <CheckCircle2 className="w-5 h-5 text-ink shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rd shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 text-xs">
                      <div className="font-black text-sm flex items-center justify-between text-ink">
                        <span>{judgment.message}</span>
                        <span className="font-mono text-sm font-black px-2 py-0.5 rounded-full bg-card border border-ink">
                          {judgment.points > 0 ? `+${judgment.points}` : judgment.points} pts
                        </span>
                      </div>
                      {measuredCutTimeMs > 0 && (
                        <p className="text-[11px] font-bold text-ink/80 mt-0.5">
                          ⏱️ Reação: <strong>{measuredCutTimeMs} ms</strong> &bull; Cortou aos <strong>{measuredCutPercent}%</strong>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Resposta Correta Oficial */}
                <div className="bg-paper border-2 border-ink rounded-2xl p-3 shadow-solid-sm">
                  <div className="text-[10px] uppercase font-black text-suave">
                    Resposta Correta:
                  </div>
                  <div
                    className="text-lg sm:text-xl font-black text-or mt-0.5"
                    dangerouslySetInnerHTML={{ __html: currentQuestion?.formatted_answer_pt || '' }}
                  />

                  {currentQuestion?.explanation && (
                    <p className="text-xs text-ink leading-relaxed mt-1.5 line-clamp-3">
                      {currentQuestion.explanation}
                    </p>
                  )}

                  {currentQuestion?.wiki_url && (
                    <div className="mt-2 flex items-center justify-between">
                      <a
                        href={currentQuestion.wiki_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-bl hover:underline"
                      >
                        <BookOpen className="w-3 h-3" /> Ver na Wikipédia <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Ações Específicas do Modo Diário concluído */}
                {gameMode === 'daily' && (
                  <div className="space-y-2 pt-1">
                    {dailyResult && (
                      <button
                        onClick={handleCopyShare}
                        className="btn-salinha w-full bg-gr hover:bg-gr-dark text-white py-2 text-xs uppercase shadow-solid-sm cursor-pointer"
                      >
                        {copiedShare ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1" /> Copiado para o WhatsApp!
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5 mr-1" /> Compartilhar Meu Corte
                          </>
                        )}
                      </button>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setGameMode('unlimited');
                          resetQuestionState();
                        }}
                        className="btn-salinha flex-1 bg-mu hover:bg-mu-dark text-ink py-2 text-xs uppercase shadow-solid-sm cursor-pointer"
                      >
                        Modo Ilimitado →
                      </button>
                      <button
                        onClick={handleResetDaily}
                        title="Limpar e tentar novamente (Treino)"
                        className="btn-salinha px-3 bg-paper hover:bg-[#e4ddce] text-ink py-2 text-xs uppercase shadow-solid-sm cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Treinar
                      </button>
                    </div>

                    <div className="text-[11px] font-bold text-suave text-center flex items-center justify-center gap-1">
                      <Timer className="w-3 h-3 text-or" />
                      Próximo Corte Diário em: <span className="font-mono text-ink font-black">{timeUntilTomorrow}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : gameMode === 'daily' && dailyResult ? (
              /* Caso 2: Modo Diário já jogado hoje, mas usuário não pediu o gabarito nesta sessão (NÃO ESTRAGA O SPOILER!) */
              <div className="bg-creme border-2 border-ink rounded-2xl p-4 shadow-solid-sm space-y-3 text-center">
                <div className="inline-flex items-center gap-1.5 text-xs font-black text-gr-dark uppercase">
                  <CheckCircle2 className="w-4 h-4 text-gr" /> Você já concluiu o corte de hoje!
                </div>
                <p className="text-xs text-ink font-medium">
                  🔥 Ofensiva mantida: <strong>{streakCount} {streakCount === 1 ? 'dia' : 'dias'}</strong>
                </p>
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={revealAnswer}
                    className="btn-salinha bg-card hover:bg-paper text-ink py-2 text-xs uppercase shadow-solid-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-or" /> Ver Meu Gabarito
                  </button>
                  <button
                    onClick={handleResetDaily}
                    className="btn-salinha bg-paper hover:bg-[#e4ddce] text-ink py-2 text-xs uppercase shadow-solid-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Jogar Novamente (Treino)
                  </button>
                  <button
                    onClick={() => {
                      setGameMode('unlimited');
                      resetQuestionState();
                    }}
                    className="btn-salinha bg-mu hover:bg-mu-dark text-ink py-2 text-xs uppercase shadow-solid-sm cursor-pointer"
                  >
                    Jogar Modo Ilimitado →
                  </button>
                </div>
                <div className="text-[10px] font-bold text-suave flex items-center justify-center gap-1 pt-1">
                  <Timer className="w-3 h-3 text-or" />
                  Próximo em: <span className="font-mono text-ink font-black">{timeUntilTomorrow}</span>
                </div>
              </div>
            ) : (
              /* Caso 3: Pergunta ainda não respondida - mensagem de incentivo (SEM SPOILER!) */
              <div className="text-center py-4 text-suave text-xs font-medium space-y-1">
                <Sparkles className="w-5 h-5 text-or mx-auto animate-pulse" />
                <p className="font-bold text-ink">A resposta aparecerá aqui assim que você cortar!</p>
                <p className="text-[11px]">Quanto mais cedo você cortar antes do (*), maior a sua pontuação.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
