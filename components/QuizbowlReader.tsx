'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tossup, JudgmentResult, PlayerStats } from '@/types/quizbowl';
import { getDailyQuestion, DailyResult, formatShareText } from '@/lib/daily';
import {
  getStoredDailyResult,
  saveStoredDailyResult,
  clearDailyResult,
  markQuestionSeen,
  getSeenQuestionIds,
  getCookie,
} from '@/lib/storage';
import MultiplayerRoom from '@/components/MultiplayerRoom';
import DopamineCelebration from '@/components/DopamineCelebration';
import BugReportModal from '@/components/BugReportModal';
import ReaderHeader from '@/components/reader/ReaderHeader';
import QuestionDisplay from '@/components/reader/QuestionDisplay';
import ReaderFilters, { AVAILABLE_DIFFICULTIES } from '@/components/reader/ReaderFilters';
import ActionPanel from '@/components/reader/ActionPanel';
import {
  playClickSound,
  playCutSound,
  playCorrectSound,
  playWrongSound,
  playTickSound,
  playPageFlipSound,
  playStampSound,
} from '@/lib/sfx';

interface QuizbowlReaderProps {
  initialQuestions: Tossup[];
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function QuizbowlReader({ initialQuestions }: QuizbowlReaderProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Modo de Jogo: 'daily' (padrão), 'unlimited' ou 'multiplayer'
  const [gameMode, setGameMode] = useState<'daily' | 'unlimited' | 'multiplayer'>('daily');
  const [roomCodeFromUrl, setRoomCodeFromUrl] = useState<string | null>(null);

  // Estado do Modo Diário
  const [dailyResult, setDailyResult] = useState<DailyResult | null>(null);
  const [dailyQuestionData, setDailyQuestionData] = useState<{
    tossup: Tossup;
    dayIndex: number;
    dateStr: string;
  } | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [timeUntilTomorrow, setTimeUntilTomorrow] = useState('');
  const [streakCount, setStreakCount] = useState<number>(0);

  // Filtros Multi-seleção (Modo Ilimitado)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Todas']);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(['Qualquer']);
  const [wpm, setWpm] = useState<number>(240);

  // Questões do Modo Ilimitado (Filtradas e Randomizadas)
  const [unlimitedQuestions, setUnlimitedQuestions] = useState<Tossup[]>([]);
  const [unlimitedIndex, setUnlimitedIndex] = useState(0);

  // Estado da leitura da pergunta ativa
  const [status, setStatus] = useState<
    'idle' | 'reading' | 'buzzed' | 'ending_countdown' | 'judged' | 'revealed'
  >('idle');
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
  const [showCelebration, setShowCelebration] = useState(false);
  const [bugModalOpen, setBugModalOpen] = useState(false);
  const [promptMessage, setPromptMessage] = useState<string | null>(null);
  const [buzzTimeRemaining, setBuzzTimeRemaining] = useState(10);
  const [endCountdownRemaining, setEndCountdownRemaining] = useState(10);

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

  // Aplica filtros e randomiza para o Modo Ilimitado (priorizando inéditas)
  const applyFiltersAndRandomize = useCallback(
    (cats: string[], diffs: string[], resetIndex = true) => {
      let pool = [...initialQuestions];

      if (!cats.includes('Todas') && cats.length > 0) {
        pool = pool.filter((q) => cats.includes(q.category));
      }

      if (!diffs.includes('Qualquer') && diffs.length > 0) {
        pool = pool.filter((q) => {
          return diffs.some((diffKey) => {
            const def = AVAILABLE_DIFFICULTIES.find((d) => d.key === diffKey);
            return def ? def.match(q.difficulty) : false;
          });
        });
      }

      // Prioriza questões ainda não vistas pelo jogador
      const seenIds = new Set(getSeenQuestionIds());
      const unseen = pool.filter((q) => !seenIds.has(q.id));
      const seen = pool.filter((q) => seenIds.has(q.id));

      const shuffledUnseen = shuffleArray(unseen);
      const shuffledSeen = shuffleArray(seen);
      const combined = [...shuffledUnseen, ...shuffledSeen];

      setUnlimitedQuestions(combined);
      if (resetIndex) {
        setUnlimitedIndex(0);
      }
    },
    [initialQuestions]
  );

  // Montagem do cliente
  useEffect(() => {
    setIsMounted(true);
    const stored = getStoredDailyResult();
    if (stored) {
      setDailyResult(stored);
    }

    const dailyData = getDailyQuestion(initialQuestions);
    setDailyQuestionData(dailyData);

    const savedStreak = Number(getCookie('corte_streak') || (stored ? stored.streak : 0));
    setStreakCount(savedStreak);

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

  // Alternadores de filtro multi-seleção
  const toggleCategory = (cat: string) => {
    playClickSound();
    let nextCats: string[];
    if (cat === 'Todas') {
      nextCats = ['Todas'];
    } else {
      const filtered = selectedCategories.filter((c) => c !== 'Todas');
      if (filtered.includes(cat)) {
        nextCats = filtered.filter((c) => c !== cat);
        if (nextCats.length === 0) nextCats = ['Todas'];
      } else {
        nextCats = [...filtered, cat];
      }
    }
    setSelectedCategories(nextCats);
    applyFiltersAndRandomize(nextCats, selectedDifficulties, true);
  };

  const toggleDifficulty = (diffKey: string) => {
    playClickSound();
    let nextDiffs: string[];
    if (diffKey === 'Qualquer') {
      nextDiffs = ['Qualquer'];
    } else {
      const filtered = selectedDifficulties.filter((d) => d !== 'Qualquer');
      if (filtered.includes(diffKey)) {
        nextDiffs = filtered.filter((d) => d !== diffKey);
        if (nextDiffs.length === 0) nextDiffs = ['Qualquer'];
      } else {
        nextDiffs = [...filtered, diffKey];
      }
    }
    setSelectedDifficulties(nextDiffs);
    applyFiltersAndRandomize(selectedCategories, nextDiffs, true);
  };

  const currentQuestion =
    gameMode === 'daily'
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

    // Marca questão como vista
    if (gameMode === 'unlimited') {
      markQuestionSeen(currentQuestion.id);
    }
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

  const handleResetDaily = () => {
    playClickSound();
    clearDailyResult();
    setDailyResult(null);
    resetQuestionState();
  };

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
    const cutPercent = Math.min(
      100,
      Math.max(1, Math.round((currentWordsRead / totalWords) * 100))
    );

    setMeasuredCutTimeMs(elapsedMs);
    setMeasuredCutPercent(cutPercent);

    setStatus('buzzed');
    setBuzzedAtWordIndex(currentWordIndex);
    setBuzzTimeRemaining(10);

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
      if (
        e.code === 'Space' &&
        (status === 'reading' || status === 'idle' || status === 'ending_countdown')
      ) {
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
        playStampSound();
        playCorrectSound();
        setShowCelebration(true);
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
    playPageFlipSound();
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
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://corte-h0ub.onrender.com';
    const text = formatShareText(dailyResult, origin);
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
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
      <ReaderHeader
        isMounted={isMounted}
        streakCount={streakCount}
        gameMode={gameMode}
        stats={stats}
        onSelectMode={(mode) => {
          setGameMode(mode);
          resetQuestionState();
        }}
        onOpenBugModal={() => setBugModalOpen(true)}
      />

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 overflow-hidden">
        <QuestionDisplay
          currentQuestion={currentQuestion}
          gameMode={gameMode}
          dailyDayIndex={dailyQuestionData?.dayIndex}
          unlimitedIndex={unlimitedIndex}
          unlimitedTotal={unlimitedQuestions.length}
          isPowerEligible={isPowerEligible}
          status={status}
          currentWordIndex={currentWordIndex}
          words={words.current}
          powerWordIndex={powerWordIndex.current}
          buzzedAtWordIndex={buzzedAtWordIndex}
          endCountdownRemaining={endCountdownRemaining}
          onResetFilters={() => {
            setSelectedCategories(['Todas']);
            setSelectedDifficulties(['Qualquer']);
            applyFiltersAndRandomize(['Todas'], ['Qualquer'], true);
          }}
        />

        <div className="lg:col-span-5 h-full flex flex-col justify-between gap-3 card-salinha p-4 sm:p-5 overflow-hidden bg-card">
          {gameMode === 'unlimited' && (
            <ReaderFilters
              questionsCount={unlimitedQuestions.length}
              wpm={wpm}
              setWpm={setWpm}
              selectedDifficulties={selectedDifficulties}
              selectedCategories={selectedCategories}
              onToggleDifficulty={toggleDifficulty}
              onToggleCategory={toggleCategory}
            />
          )}

          <ActionPanel
            gameMode={gameMode}
            status={status}
            hasBuzzedThisQuestion={hasBuzzedThisQuestion}
            measuredCutPercent={measuredCutPercent}
            measuredCutTimeMs={measuredCutTimeMs}
            buzzTimeRemaining={buzzTimeRemaining}
            promptMessage={promptMessage}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            answerInputRef={answerInputRef}
            judgment={judgment}
            currentQuestion={currentQuestion}
            dailyResult={dailyResult}
            copiedShare={copiedShare}
            streakCount={streakCount}
            timeUntilTomorrow={timeUntilTomorrow}
            onBuzz={handleBuzz}
            onSubmitAnswer={() => submitAnswer()}
            onToggleReading={toggleReading}
            onRevealAnswer={revealAnswer}
            onNextUnlimitedQuestion={nextUnlimitedQuestion}
            onCopyShare={handleCopyShare}
            onResetDaily={handleResetDaily}
            onSwitchToUnlimited={() => {
              playClickSound();
              setGameMode('unlimited');
              resetQuestionState();
            }}
          />
        </div>
      </div>

      <DopamineCelebration
        show={showCelebration}
        isMe={true}
        isPower={judgment?.points === 15}
        points={judgment?.points || 10}
        onDone={() => setShowCelebration(false)}
      />

      <BugReportModal
        isOpen={bugModalOpen}
        onClose={() => setBugModalOpen(false)}
        context={gameMode === 'daily' ? 'Modo Diário' : 'Modo Ilimitado'}
      />
    </div>
  );
}
