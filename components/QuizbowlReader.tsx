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
import MultiplayerRoom from '@/components/MultiplayerRoom';
import { 
  playClickSound, 
  playCutSound, 
  playCorrectSound, 
  playWrongSound, 
  playTickSound 
} from '@/lib/sfx';
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
  Eye,
  Users
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

  // Modo de Jogo: 'daily' (padrão), 'unlimited' ou 'multiplayer'
  const [gameMode, setGameMode] = useState<'daily' | 'unlimited' | 'multiplayer'>('daily');
  const [roomCodeFromUrl, setRoomCodeFromUrl] = useState<string | null>(null);

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
  const [wpm, setWpm] = useState<number>(240); // 240 WPM = ~4 palavras por segundo

  // Questões do Modo Ilimitado (Filtradas e Randomizadas)
  const [unlimitedQuestions, setUnlimitedQuestions] = useState<Tossup[]>([]);
  const [unlimitedIndex, setUnlimitedIndex] = useState(0);

  // Estado da leitura da pergunta ativa
  const [status, setStatus] = useState<'idle' | 'reading' | 'buzzed' | 'ending_countdown' | 'judged' | 'revealed'>('idle');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPowerEligible, setIsPowerEligible] = useState(true);
  const [buzzedAtWordIndex, setBuzzedAtWordIndex] = useState<number | null>(null);
  const [hasBuzzedThisQuestion, setHasBuzzedThisQuestion] = useState(false);

  // Marcações de tempo (em milissegundos de precisão)
  const readingStartTimeRef = useRef<number | null>(null);
  const [measuredCutTimeMs, setMeasuredCutTimeMs] = useState<number>(0);
  const [measuredCutPercent, setMeasuredCutPercent] = useState<number>(0);

  // Resposta e julgamento
  const [userAnswer, setUserAnswer] = useState('');
  const [judgment, setJudgment] = useState<JudgmentResult | null>(null);
  const [promptMessage, setPromptMessage] = useState<string | null>(null);
  const [buzzTimeRemaining, setBuzzTimeRemaining] = useState(10); // 10 segundos
  const [endCountdownRemaining, setEndCountdownRemaining] = useState(10); // 10s finais

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

  // Detecta parâmetro de sala na URL (?sala=BRASA)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sala = params.get('sala');
      if (sala) {
        setRoomCodeFromUrl(sala.toUpperCase());
        setGameMode('multiplayer');
      }
    }
  }, []);

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
    playClickSound();
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
    playClickSound();
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
    setHasBuzzedThisQuestion(false);
    setUserAnswer('');
    setJudgment(null);
    setPromptMessage(null);
    setBuzzTimeRemaining(10);
    setEndCountdownRemaining(10);
    readingStartTimeRef.current = null;
    setMeasuredCutTimeMs(0);
    setMeasuredCutPercent(0);
  };

  // Permite ao usuário reiniciar e treinar o Diário sem cache bloqueante
  const handleResetDaily = () => {
    playClickSound();
    clearDailyResult();
    setDailyResult(null);
    resetQuestionState();
  };

  // Iniciar / pausar leitura
  const toggleReading = () => {
    playClickSound();
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
    if (status !== 'reading' && status !== 'idle' && status !== 'ending_countdown') return;
    if (hasBuzzedThisQuestion) return;

    playCutSound();
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
    setBuzzTimeRemaining(10); // 10 segundos para responder

    setTimeout(() => {
      answerInputRef.current?.focus();
    }, 50);
  }, [status, currentWordIndex, hasBuzzedThisQuestion]);

  // Timer de 10 segundos para responder após o corte
  useEffect(() => {
    if (status === 'buzzed') {
      timerIntervalRef.current = setInterval(() => {
        setBuzzTimeRemaining((prev) => {
          if (prev <= 4 && prev > 1) {
            playTickSound();
          }
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

  // Contagem regressiva de 10s finais após fim da leitura
  useEffect(() => {
    if (status === 'ending_countdown') {
      const timer = setInterval(() => {
        setEndCountdownRemaining((prev) => {
          if (prev <= 4 && prev > 1) {
            playTickSound();
          }
          if (prev <= 1) {
            clearInterval(timer);
            playWrongSound();
            setStatus('revealed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status]);

  // Intervalo de leitura palavra por palavra (lastreado no WPM)
  useEffect(() => {
    if (status === 'reading') {
      const intervalMs = Math.round(60000 / wpm);

      readerIntervalRef.current = setInterval(() => {
        setCurrentWordIndex((prev) => {
          const next = prev + 1;

          if (powerWordIndex.current !== -1 && next > powerWordIndex.current) {
            setIsPowerEligible(false);
          }

          if (next >= words.current.length) {
            clearInterval(readerIntervalRef.current!);
            // Entra nos 10 segundos finais para corte antes de revelar!
            setStatus('ending_countdown');
            setEndCountdownRemaining(10);
            return words.current.length;
          }

          return next;
        });
      }, intervalMs);
    }

    return () => {
      if (readerIntervalRef.current) clearInterval(readerIntervalRef.current);
    };
  }, [status, wpm]);

  // Teclado: Barra de Espaço para CORTAR
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (status === 'reading' || status === 'idle' || status === 'ending_countdown')) {
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
        playClickSound();
        setPromptMessage(res.message);
        setBuzzTimeRemaining(5);
        setUserAnswer('');
        setTimeout(() => answerInputRef.current?.focus(), 50);
        return;
      }

      setJudgment(res);
      const isCorrect = res.status === 'correct';

      if (isCorrect) {
        // ACERTOU: toca som alegre, pontua e encerra a pergunta
        playCorrectSound();
        setStatus('judged');

        if (gameMode === 'daily' && dailyQuestionData) {
          const saved = saveStoredDailyResult({
            dateStr: dailyQuestionData.dateStr,
            dayIndex: dailyQuestionData.dayIndex,
            questionId: currentQuestion.id,
            answerCanonical: currentQuestion.answer_canonical_pt,
            isCorrect: true,
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
          setStats((prev) => ({
            ...prev,
            score: prev.score + res.points,
            powers: prev.powers + (res.points === 15 ? 1 : 0),
            tens: prev.tens + (res.points === 10 ? 1 : 0),
            totalBuzzes: prev.totalBuzzes + 1,
            correctAnswers: prev.correctAnswers + 1,
          }));
        }
      } else {
        // ERROU: toca som de erro, computa perda (-5 pts), bloqueia e retoma leitura automaticamente!
        playWrongSound();
        setHasBuzzedThisQuestion(true);

        if (gameMode === 'daily' && dailyQuestionData) {
          const saved = saveStoredDailyResult({
            dateStr: dailyQuestionData.dateStr,
            dayIndex: dailyQuestionData.dayIndex,
            questionId: currentQuestion.id,
            answerCanonical: currentQuestion.answer_canonical_pt,
            isCorrect: false,
            isPower: false,
            points: res.points,
            cutPercentage: measuredCutPercent,
            cutTimeMs: measuredCutTimeMs,
          });
          setDailyResult(saved);
        }

        if (gameMode === 'unlimited') {
          const isNeg = res.points < 0;
          setStats((prev) => ({
            ...prev,
            score: prev.score + res.points,
            negs: prev.negs + (isNeg ? 1 : 0),
            totalBuzzes: prev.totalBuzzes + 1,
            wrongAnswers: prev.wrongAnswers + 1,
          }));
        }

        // Continua logo depois sem precisar clicar em nada!
        setTimeout(() => {
          setJudgment(null);
          if (currentWordIndex < words.current.length) {
            setStatus('reading');
          } else {
            setStatus('ending_countdown');
          }
        }, 1300);
      }
    } catch (err) {
      console.error('Erro ao conectar ao juiz:', err);
    }
  };

  const nextUnlimitedQuestion = () => {
    playClickSound();
    if (unlimitedIndex < unlimitedQuestions.length - 1) {
      setUnlimitedIndex((prev) => prev + 1);
    } else {
      setUnlimitedQuestions(shuffleArray(unlimitedQuestions));
      setUnlimitedIndex(0);
    }
  };

  const revealAnswer = () => {
    playClickSound();
    if (readerIntervalRef.current) clearInterval(readerIntervalRef.current);
    setCurrentWordIndex(words.current.length);
    setStatus('revealed');
  };

  const handleCopyShare = () => {
    if (!dailyResult) return;
    playClickSound();
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

  // Se o modo selecionado for Multiplayer, renderiza a tela dedicada de Sala
  if (gameMode === 'multiplayer') {
    return (
      <MultiplayerRoom
        initialCode={roomCodeFromUrl}
        initialQuestions={initialQuestions}
        onExit={() => {
          setGameMode('daily');
          setRoomCodeFromUrl(null);
        }}
      />
    );
  }

  return (
    <div className="h-full flex flex-col justify-between p-3 sm:p-5 max-w-[1650px] mx-auto select-none">
      {/* ======================================================== */}
      {/* 1. HEADER FIXO COM SLIDER DESLIZANTE DE MOLA             */}
      {/* ======================================================== */}
      <header className="flex items-center justify-between border-b-2 border-ink/15 pb-2.5 mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="font-serif font-black text-3xl sm:text-4xl tracking-tight text-ink flex items-center">
            corte<span className="text-or">.</span>
          </h1>
          <span className="bg-creme border-2 border-ink px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider text-ink shadow-solid-sm flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-or fill-or animate-pulse" />
            {isMounted ? streakCount : 0} {streakCount === 1 ? 'dia' : 'dias'}
          </span>
        </div>

        {/* Chave Seletora de Modo (Diário vs Ilimitado vs Amigos) com SLIDER DESLIZANTE */}
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

          <div className="relative flex items-center bg-card border-[2.5px] border-ink rounded-full p-0.5 shadow-solid-sm select-none w-[310px] sm:w-[340px]">
            {/* Pílula deslizante com física elástica de mola */}
            <div 
              className={`absolute top-0.5 bottom-0.5 w-[calc(33.333%-2px)] rounded-full border-2 border-ink shadow-solid-sm transition-transform duration-250 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                gameMode === 'daily'
                  ? 'translate-x-0 bg-or'
                  : gameMode === 'unlimited'
                    ? 'translate-x-[100%] bg-mu'
                    : 'translate-x-[200%] bg-bl'
              }`}
            />
            <button
              onClick={() => {
                playClickSound();
                setGameMode('daily');
                resetQuestionState();
              }}
              className={`relative z-10 flex-1 btn-salinha py-1 px-1 text-xs font-black transition-colors duration-200 border-none shadow-none hover:bg-transparent text-center justify-center ${
                gameMode === 'daily' ? 'text-white' : 'text-ink'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 mr-1 shrink-0" />
              Diário
            </button>
            <button
              onClick={() => {
                playClickSound();
                setGameMode('unlimited');
                resetQuestionState();
              }}
              className={`relative z-10 flex-1 btn-salinha py-1 px-1 text-xs font-black transition-colors duration-200 border-none shadow-none hover:bg-transparent text-center justify-center ${
                gameMode === 'unlimited' ? 'text-ink' : 'text-ink'
              }`}
            >
              <InfinityIcon className="w-3.5 h-3.5 mr-1 shrink-0" />
              Ilimitado
            </button>
            <button
              onClick={() => {
                playClickSound();
                setGameMode('multiplayer');
                resetQuestionState();
              }}
              className="relative z-10 flex-1 btn-salinha py-1 px-1 text-xs font-black transition-colors duration-200 border-none shadow-none hover:bg-transparent text-center justify-center text-ink"
            >
              <Users className="w-3.5 h-3.5 mr-1 shrink-0" />
              Amigos
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

              {/* Corpo da Pergunta com Leitura Dinâmica e Efeito Fade-In Suave */}
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
                          className={`inline-block mr-1.5 transition-colors animate-word ${
                            isWordPower
                              ? 'text-ink font-semibold'
                              : 'text-ink'
                          } ${
                            isBuzzedHere
                              ? 'bg-rd text-white px-1.5 py-0.5 rounded-md border-2 border-ink font-bold shadow-solid-sm animate-stamp'
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

              {/* Base do Card: Barra de Progresso e 10s Finais */}
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

                {status === 'ending_countdown' ? (
                  <div className="flex items-center gap-2 text-rd font-black animate-pulse">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{endCountdownRemaining}s FINAIS PARA CORTAR!</span>
                    <div className="w-20 h-2 bg-paper border border-ink rounded-full overflow-hidden p-0.5">
                      <div 
                        className="h-full bg-rd rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${(endCountdownRemaining / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <span>
                    {currentWordIndex}/{words.current.length} palavras
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-suave font-bold">Nenhuma pergunta encontrada com os filtros selecionados.</p>
              <button
                onClick={() => {
                  playClickSound();
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
        {/* COLUNA DA DIREITA: FILTROS → CONTROLES → GABARITOS                     */}
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
                <span className="bg-creme border border-ink px-2 py-0.5 rounded-full text-[11px] shadow-solid-sm transition-transform active:scale-95">
                  {unlimitedQuestions.length} questões encontradas
                </span>
              </div>

              {/* Velocidade de Leitura WPM com Liquid Pill */}
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-black uppercase text-suave flex items-center gap-1">
                  <Clock className="w-3 h-3 text-or" /> Velocidade:
                </div>
                <div className="relative flex bg-paper border border-ink/40 rounded-full p-0.5 select-none">
                  <div
                    className={`absolute top-0.5 bottom-0.5 rounded-full border border-ink bg-or shadow-solid-sm transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                      wpm === 180 ? 'w-[calc(33.333%-2px)] translate-x-0' :
                      wpm === 240 ? 'w-[calc(33.333%-2px)] translate-x-[100%]' :
                      'w-[calc(33.333%-2px)] translate-x-[200%]'
                    }`}
                  />
                  {[
                    { label: '180 (3/s)', val: 180 },
                    { label: '240 (4/s)', val: 240 },
                    { label: '300 (5/s)', val: 300 },
                  ].map((spd) => (
                    <button
                      key={spd.val}
                      onClick={() => {
                        playClickSound();
                        setWpm(spd.val);
                      }}
                      className={`relative z-10 px-2.5 py-0.5 text-[10px] font-bold transition-colors ${
                        wpm === spd.val ? 'text-white' : 'text-suave hover:text-ink'
                      }`}
                    >
                      {spd.label}
                    </button>
                  ))}
                </div>
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
          {/* OS CONTROLES COM TESOURA ANIMADA E RESPOSTA                        */}
          {/* =================================================================== */}
          <div className="shrink-0 space-y-2.5 pb-2.5 border-b-2 border-ink/15">
            {status === 'buzzed' ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-rd font-black text-xs uppercase tracking-wider animate-pulse">
                    <Scissors className="w-4 h-4 text-rd animate-snip" />
                    CORTADO AOS {measuredCutPercent}% ({measuredCutTimeMs} ms)!
                  </div>
                  <div className="flex items-center gap-1 font-mono text-sm font-black text-ink bg-mu border-2 border-ink px-2.5 py-0.5 rounded-full shadow-solid-sm">
                    <Clock className="w-3.5 h-3.5" /> {buzzTimeRemaining}s
                  </div>
                </div>

                {/* BARRINHA DE TEMPO DE 10s DESCENDO SUAVEMENTE */}
                <div className="w-full h-2.5 bg-paper border-2 border-ink rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-rd rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${(buzzTimeRemaining / 10) * 100}%` }}
                  />
                </div>

                {promptMessage && (
                  <div className="bg-creme border-2 border-ink text-ink p-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-solid-sm animate-cartoon-shake">
                    <AlertTriangle className="w-4 h-4 text-or shrink-0" />
                    <span>{promptMessage}</span>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    playClickSound();
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
                    className="flex-1 bg-paper border-2 border-ink rounded-xl px-3 py-2 text-ink text-base font-bold placeholder-ink/40 focus:outline-none shadow-solid-sm transition-shadow focus:shadow-solid"
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
                {/* Botão de CORTAR com Animação de Tesoura */}
                <button
                  onClick={handleBuzz}
                  disabled={status === 'judged' || status === 'revealed' || hasBuzzedThisQuestion}
                  className={`btn-salinha group w-full py-3.5 text-xl tracking-wide uppercase transition ${
                    hasBuzzedThisQuestion
                      ? 'bg-paper text-ink/30 border-ink/30 shadow-none cursor-not-allowed'
                      : status === 'judged' || status === 'revealed'
                        ? 'bg-paper text-ink/30 border-ink/30 shadow-none cursor-not-allowed'
                        : 'bg-or hover:bg-or-dark text-white shadow-solid cursor-pointer'
                  }`}
                >
                  <Scissors className="w-5 h-5 mr-1.5 transition-transform duration-200 group-hover:rotate-[-20deg] group-active:scale-125" />
                  {hasBuzzedThisQuestion ? 'VOCÊ JÁ CORTOU NESTA QUESTÃO' : 'CORTAR!'}
                  {!hasBuzzedThisQuestion && (
                    <span className="text-[11px] bg-ink text-white px-2 py-0.5 rounded-full ml-2 font-mono">Espaço</span>
                  )}
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
          {/* SEÇÃO DO GABARITO / RESPOSTA CERTA COM STAMP E SHAKE                */}
          {/* =================================================================== */}
          <div className={`flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col ${gameMode === 'daily' ? 'justify-end pb-1' : 'justify-center'}`}>
            
            {/* Flash do Juiz (Acerto com Stamp ou Erro com Cartoon Shake) */}
            {judgment && (
              <div
                className={`p-3 rounded-2xl border-2 border-ink shadow-solid-sm flex items-start gap-2.5 mb-2.5 ${
                  judgment.status === 'correct'
                    ? judgment.points === 15
                      ? 'bg-mu animate-stamp'
                      : 'bg-[#d8f3dc] animate-stamp'
                    : 'bg-[#ffccd5] animate-cartoon-shake'
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

            {/* Caso 1: Pergunta foi finalizada ou gabarito revelado */}
            {status === 'judged' || status === 'revealed' ? (
              <div className="space-y-2.5 animate-stamp">
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
                          playClickSound();
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
              /* Caso 2: Modo Diário já jogado hoje, aguardando clique explícito do usuário */
              <div className="bg-creme border-2 border-ink rounded-2xl p-4 shadow-solid-sm space-y-3 text-center animate-stamp">
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
                      playClickSound();
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
              /* Caso 3: Pergunta ainda não respondida */
              <div className="text-center py-4 text-suave text-xs font-medium space-y-1">
                <Sparkles className="w-5 h-5 text-or mx-auto animate-pulse" />
                <p className="font-bold text-ink">A resposta aparecerá aqui assim que você cortar!</p>
                <p className="text-[11px]">Você tem 10s para digitar. Se errar, a leitura continuará automaticamente.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
