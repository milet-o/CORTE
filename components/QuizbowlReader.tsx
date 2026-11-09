'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tossup, JudgmentResult, PlayerStats } from '@/types/quizbowl';
import { 
  getDailyQuestion, 
  getTodayDateString, 
  DailyResult, 
  formatShareText 
} from '@/lib/daily';
import { 
  getStoredDailyResult, 
  saveStoredDailyResult, 
  getSeenQuestionIds, 
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
  Check
} from 'lucide-react';

interface QuizbowlReaderProps {
  initialQuestions: Tossup[];
}

export default function QuizbowlReader({ initialQuestions }: QuizbowlReaderProps) {
  // Evita hydration mismatch no SSR
  const [isMounted, setIsMounted] = useState(false);

  // Modo de Jogo: 'daily' (padrão) ou 'unlimited'
  const [gameMode, setGameMode] = useState<'daily' | 'unlimited'>('daily');

  // Estado do Modo Diário
  const [dailyResult, setDailyResult] = useState<DailyResult | null>(null);
  const [dailyQuestionData, setDailyQuestionData] = useState<{ tossup: Tossup; dayIndex: number; dateStr: string } | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [timeUntilTomorrow, setTimeUntilTomorrow] = useState('');
  const [streakCount, setStreakCount] = useState<number>(0);

  // Configurações do jogo ilimitado
  const [unlimitedQuestions, setUnlimitedQuestions] = useState<Tossup[]>(initialQuestions);
  const [unlimitedIndex, setUnlimitedIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [wpm, setWpm] = useState(240);

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

  // Pergunta atualmente em exibição
  const currentQuestion = gameMode === 'daily' 
    ? dailyQuestionData?.tossup || null 
    : unlimitedQuestions[unlimitedIndex] || null;

  const words = useRef<string[]>([]);
  const powerWordIndex = useRef<number>(-1);
  const readerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const answerInputRef = useRef<HTMLInputElement | null>(null);

  // Montagem do cliente: carrega cookies sem causar hydration mismatch
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
  }, [initialQuestions]);

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
    const totalWords = Math.max(1, words.current.length);
    const cutPercent = Math.min(100, Math.max(1, Math.round((currentWordIndex / totalWords) * 100)));

    setMeasuredCutTimeMs(elapsedMs);
    setMeasuredCutPercent(cutPercent);

    const isPower = currentWordIndex <= powerWordIndex.current;
    setBuzzedAtWordIndex(currentWordIndex);
    setIsPowerEligible(isPower);
    setStatus('buzzed');
    setBuzzTimeRemaining(7);

    setTimeout(() => {
      answerInputRef.current?.focus();
    }, 60);
  }, [status, currentWordIndex]);

  // Loop de leitura palavra por palavra
  useEffect(() => {
    if (status !== 'reading') return;

    const intervalMs = Math.round(60000 / wpm);

    readerIntervalRef.current = setInterval(() => {
      setCurrentWordIndex((prev) => {
        const next = prev + 1;

        if (next > powerWordIndex.current) {
          setIsPowerEligible(false);
        }

        if (next >= words.current.length) {
          if (readerIntervalRef.current) clearInterval(readerIntervalRef.current);
          setStatus('idle');
          return words.current.length;
        }

        return next;
      });
    }, intervalMs);

    return () => {
      if (readerIntervalRef.current) clearInterval(readerIntervalRef.current);
    };
  }, [status, wpm]);

  // Timer do buzzer (7 segundos regressivos)
  useEffect(() => {
    if (status !== 'buzzed') return;

    timerIntervalRef.current = setInterval(() => {
      setBuzzTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          submitAnswer(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          handleBuzz();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBuzz]);

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
      setUnlimitedIndex(0);
    }
  };

  const revealAnswer = () => {
    if (readerIntervalRef.current) clearInterval(readerIntervalRef.current);
    setCurrentWordIndex(words.current.length);
    setStatus('revealed');
  };

  const filterUnlimited = async (cat: string) => {
    setSelectedCategory(cat);
    try {
      const params = new URLSearchParams();
      if (cat !== 'Todas') params.append('category', cat);
      params.append('random', 'true');

      const res = await fetch(`/api/questions?${params.toString()}`);
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        const seenIds = getSeenQuestionIds();
        const unseens = data.questions.filter((q: Tossup) => !seenIds.includes(q.id));
        setUnlimitedQuestions(unseens.length > 0 ? unseens : data.questions);
        setUnlimitedIndex(0);
      }
    } catch (err) {
      console.error('Erro ao filtrar questões:', err);
    }
  };

  const handleCopyShare = () => {
    if (!dailyResult) return;
    const text = formatShareText(dailyResult);
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8 space-y-5 sm:space-y-6">
      {/* Topo / Barra de Navegação Estilo Salinha com Ergonomia Mobile */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b-2 border-ink/15 pb-4 sm:pb-5">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-black text-3xl sm:text-5xl tracking-tight text-ink flex items-center">
              corte<span className="text-or">.</span>
            </h1>
            <span className="bg-creme border-2 border-ink px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider text-ink shadow-solid-sm flex items-center gap-1">
              <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-or fill-or" />
              {isMounted ? streakCount : 0} {streakCount === 1 ? 'dia' : 'dias'}
            </span>
          </div>
        </div>

        {/* Chave Seletora de Modo (Diário vs Ilimitado) Compacta no Celular */}
        <div className="flex items-center bg-card border-[3px] border-ink rounded-full p-1 shadow-solid w-full sm:w-auto justify-center">
          <button
            onClick={() => setGameMode('daily')}
            className={`btn-salinha flex-1 sm:flex-initial px-4 py-1.5 text-xs sm:text-sm font-black transition ${
              gameMode === 'daily'
                ? 'bg-or text-white border-2 border-ink shadow-solid-sm'
                : 'bg-transparent text-ink border-transparent shadow-none hover:bg-paper'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 mr-1" />
            Diário
          </button>
          <button
            onClick={() => setGameMode('unlimited')}
            className={`btn-salinha flex-1 sm:flex-initial px-4 py-1.5 text-xs sm:text-sm font-black transition ${
              gameMode === 'unlimited'
                ? 'bg-mu text-ink border-2 border-ink shadow-solid-sm'
                : 'bg-transparent text-ink border-transparent shadow-none hover:bg-paper'
            }`}
          >
            <InfinityIcon className="w-3.5 h-3.5 mr-1" />
            Ilimitado
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 📅 CASO 1: MODO DIÁRIO JÁ CONCLUÍDO HOJE                */}
      {/* ======================================================== */}
      {isMounted && gameMode === 'daily' && dailyResult ? (
        <div className="card-salinha p-5 sm:p-9 space-y-5 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full border-[3px] border-ink bg-creme shadow-solid mb-1">
            {dailyResult.isPower ? (
              <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-mu-dark fill-mu-dark animate-bounce" />
            ) : dailyResult.isCorrect ? (
              <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-gr-dark" />
            ) : (
              <XCircle className="w-7 h-7 sm:w-8 sm:h-8 text-rd" />
            )}
          </div>

          <div>
            <span className="bg-mu border-2 border-ink px-3 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider text-ink shadow-solid-sm">
              Corte do Dia #{dailyResult.dayIndex} Concluído!
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-4xl text-ink mt-2.5">
              {dailyResult.isPower
                ? '💥 Corte Perfeito no POWER!'
                : dailyResult.isCorrect
                ? '✅ Você Acertou o Corte!'
                : '❌ Quase! Resposta Incorreta'}
            </h2>
            <p className="text-suave text-sm sm:text-base font-medium mt-1">
              Gabarito de hoje: <strong className="text-ink">{dailyResult.answerCanonical}</strong>
            </p>
          </div>

          {/* Cards de Métricas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto pt-1">
            <div className="bg-card border-2 border-ink rounded-2xl p-2.5 sm:p-3 shadow-solid-sm">
              <div className="text-[10px] sm:text-[11px] font-bold uppercase text-suave">Pontos</div>
              <div className="text-xl sm:text-2xl font-black text-or">
                {dailyResult.points > 0 ? `+${dailyResult.points}` : dailyResult.points}
              </div>
            </div>

            <div className="bg-card border-2 border-ink rounded-2xl p-2.5 sm:p-3 shadow-solid-sm">
              <div className="text-[10px] sm:text-[11px] font-bold uppercase text-suave">Corte</div>
              <div className="text-xl sm:text-2xl font-black text-bl-dark">{dailyResult.cutPercentage}%</div>
              <div className="text-[9px] sm:text-[10px] text-suave font-semibold">do texto lido</div>
            </div>

            <div className="bg-card border-2 border-ink rounded-2xl p-2.5 sm:p-3 shadow-solid-sm">
              <div className="text-[10px] sm:text-[11px] font-bold uppercase text-suave">Reação</div>
              <div className="text-xl sm:text-2xl font-black text-gr-dark">{dailyResult.cutTimeMs} ms</div>
              <div className="text-[9px] sm:text-[10px] text-suave font-semibold">({(dailyResult.cutTimeMs / 1000).toFixed(1)}s)</div>
            </div>

            <div className="bg-card border-2 border-ink rounded-2xl p-2.5 sm:p-3 shadow-solid-sm">
              <div className="text-[10px] sm:text-[11px] font-bold uppercase text-suave">Ofensiva</div>
              <div className="text-xl sm:text-2xl font-black text-ink flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-or fill-or" />
                {dailyResult.streak}d
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-3">
            <button
              onClick={handleCopyShare}
              className="btn-salinha w-full sm:w-auto bg-gr hover:bg-gr-dark text-white px-7 py-3.5 text-sm sm:text-base tracking-wide uppercase shadow-solid cursor-pointer"
            >
              {copiedShare ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" /> Copiado com Sucesso!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-1.5" /> Compartilhar Meu Corte
                </>
              )}
            </button>

            <button
              onClick={() => setGameMode('unlimited')}
              className="btn-salinha w-full sm:w-auto bg-mu hover:bg-mu-dark text-ink px-7 py-3.5 text-sm sm:text-base tracking-wide uppercase shadow-solid cursor-pointer"
            >
              Jogar Modo Ilimitado <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="pt-2 text-[11px] sm:text-xs font-bold text-suave flex items-center justify-center gap-1">
            <Timer className="w-3.5 h-3.5 text-or" />
            Próximo Corte Diário em: <span className="font-mono text-ink text-xs sm:text-sm font-black">{timeUntilTomorrow}</span>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* 🕹️ CASO 2: JOGO ATIVO (MODO DIÁRIO OU ILIMITADO)         */
        /* ======================================================== */
        <div className="space-y-4 sm:space-y-6">
          {/* Se for Modo Ilimitado: Filtros e Placar */}
          {gameMode === 'unlimited' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-card border-[3px] border-ink rounded-2xl p-2.5 px-3.5 shadow-solid">
                <span className="text-xs font-black uppercase text-ink flex items-center gap-1">
                  <InfinityIcon className="w-3.5 h-3.5 text-mu-dark" /> Ilimitado:
                </span>

                <div className="flex items-center gap-2.5 text-xs font-bold">
                  <div>Pts: <strong className="text-gr-dark text-sm">{stats.score}</strong></div>
                  <div>15s: <strong className="text-mu-dark text-sm">{stats.powers}</strong></div>
                  <div>10s: <strong className="text-ink text-sm">{stats.tens}</strong></div>
                  <div>-5s: <strong className="text-rd text-sm">{stats.negs}</strong></div>
                </div>
              </div>

              {/* Categorias no Ilimitado com rolagem horizontal suave no mobile */}
              <div className="bg-card border-[3px] border-ink rounded-2xl p-2.5 shadow-solid flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-xs font-black uppercase text-ink mr-1 flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3 h-3 text-or" /> Temas:
                </span>
                {[
                  'Todas',
                  'Ciência',
                  'Cidades do Brasil',
                  'Personalidades do Brasil',
                  'Políticos do Brasil',
                  'Curiosidades do Mundo',
                  'História',
                  'Literatura',
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => filterUnlimited(cat)}
                    className={`tag-salinha px-2.5 py-1 text-xs font-bold transition shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-mu text-ink shadow-solid-sm'
                        : 'bg-paper/70 text-suave hover:bg-paper hover:text-ink'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cartão Central da Pergunta */}
          {currentQuestion ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="card-salinha p-4 sm:p-8 relative overflow-hidden">
                {/* Topo do Card com Selos */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b-2 border-ink/15">
                  <div className="flex items-center gap-1.5 sm:gap-2">
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

                    <span className="bg-paper border-2 border-ink text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow-solid-sm">
                      {currentQuestion.category}
                    </span>
                  </div>

                  {/* Indicador de Power */}
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

                {/* Texto da Pergunta com Leitura Progressiva */}
                <div className="min-h-[140px] sm:min-h-[170px] text-lg sm:text-2xl leading-relaxed sm:leading-loose text-ink font-normal">
                  {status === 'idle' && currentWordIndex === 0 ? (
                    <div className="text-suave font-serif italic flex items-center gap-2.5 pt-4 text-base sm:text-xl">
                      <Play className="w-5 h-5 text-or fill-or animate-bounce shrink-0" />
                      Clique em <strong>"Iniciar"</strong> ou aperte <strong>CORTAR</strong> a qualquer momento...
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
                              style={{ width: `${Math.max(22, Math.min(75, word.length * 9))}px` }}
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
                              <span className="inline-block w-1.5 h-5 bg-or ml-1 rounded-full align-middle cursor-leitura" />
                            )}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Barra de Progresso da Pergunta */}
                <div className="mt-6 pt-3.5 border-t-2 border-ink/15 flex items-center justify-between text-[11px] sm:text-xs font-bold text-suave">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span>Leitura:</span>
                    <div className="w-28 sm:w-48 h-2.5 sm:h-3 bg-paper border-2 border-ink rounded-full overflow-hidden p-0.5">
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
                    {currentWordIndex}/{words.current.length}
                  </span>
                </div>
              </div>

              {/* Área de Ação e Buzzer Móvel Amigável */}
              <div className="card-salinha p-4 sm:p-6">
                {status === 'buzzed' ? (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-rd font-black text-xs sm:text-sm uppercase tracking-wider">
                        <Scissors className="w-4 h-4 text-rd" />
                        CORTADO AOS {measuredCutPercent}% ({measuredCutTimeMs} ms)!
                      </div>
                      <div className="flex items-center gap-1 font-mono text-sm sm:text-base font-black text-ink bg-mu border-2 border-ink px-2.5 py-0.5 rounded-full shadow-solid-sm">
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
                      <div className="bg-creme border-2 border-ink text-ink p-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-solid-sm">
                        <AlertTriangle className="w-4 h-4 text-or shrink-0" />
                        <span>{promptMessage}</span>
                      </div>
                    )}

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        submitAnswer();
                      }}
                      className="flex flex-col sm:flex-row gap-2 pt-1"
                    >
                      <input
                        ref={answerInputRef}
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Digite sua resposta..."
                        className="flex-1 bg-card border-3 border-ink rounded-2xl px-4 py-3 text-ink text-base sm:text-lg font-bold placeholder-ink/40 focus:outline-none shadow-solid"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="btn-salinha bg-gr hover:bg-gr-dark text-white px-6 py-3 text-sm sm:text-base uppercase tracking-wider cursor-pointer shadow-solid"
                      >
                        Confirmar
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Botão de Cortar Grande e Chamativo em Laranja Salinha */}
                    <button
                      onClick={handleBuzz}
                      disabled={status === 'judged' || status === 'revealed'}
                      className={`btn-salinha w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 text-lg sm:text-xl tracking-wide uppercase transition ${
                        status === 'judged' || status === 'revealed'
                          ? 'bg-paper text-ink/30 border-ink/30 shadow-none cursor-not-allowed'
                          : 'bg-or hover:bg-or-dark text-white shadow-solid cursor-pointer'
                      }`}
                    >
                      <Scissors className="w-5 h-5 mr-1.5" />
                      CORTAR! <span className="text-[11px] bg-ink text-white px-2 py-0.5 rounded-full ml-1.5 font-mono hidden sm:inline">Espaço</span>
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={toggleReading}
                        disabled={status === 'judged' || status === 'revealed'}
                        className="btn-salinha flex-1 sm:flex-initial bg-card hover:bg-paper text-ink px-4 py-2.5 sm:py-3 text-xs sm:text-sm cursor-pointer shadow-solid-sm"
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
                        className="btn-salinha bg-paper hover:bg-[#e4ddce] text-ink px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm cursor-pointer shadow-solid-sm"
                      >
                        Gabarito
                      </button>

                      {gameMode === 'unlimited' && (
                        <button
                          onClick={nextUnlimitedQuestion}
                          className="btn-salinha bg-mu hover:bg-mu-dark text-ink px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm cursor-pointer shadow-solid-sm"
                        >
                          Próxima <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Veredito do Juiz Nativo */}
              {judgment && (
                <div
                  className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-[3px] border-ink shadow-solid flex items-start gap-3 transition-all ${
                    judgment.status === 'correct'
                      ? judgment.points === 15
                        ? 'bg-mu'
                        : 'bg-[#d8f3dc]'
                      : 'bg-[#ffccd5]'
                  }`}
                >
                  {judgment.status === 'correct' ? (
                    <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-ink shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 sm:w-7 sm:h-7 text-rd shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="font-black text-base sm:text-lg flex items-center justify-between text-ink">
                      <span>{judgment.message}</span>
                      <span className="font-mono text-lg font-black px-2.5 py-0.5 rounded-full bg-card border-2 border-ink shadow-solid-sm">
                        {judgment.points > 0 ? `+${judgment.points}` : judgment.points} pts
                      </span>
                    </div>
                    {measuredCutTimeMs > 0 && (
                      <p className="text-xs font-bold text-ink/80">
                        ⏱️ Reação: <strong>{measuredCutTimeMs} ms</strong> &bull; Cortou aos <strong>{measuredCutPercent}%</strong> da pergunta
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Gabarito e Bloco de Resumo da Wikipédia */}
              {(status === 'judged' || status === 'revealed') && (
                <div className="card-salinha p-4 sm:p-7 space-y-3.5">
                  <div>
                    <span className="text-[11px] uppercase font-black tracking-wider text-suave">
                      Resposta Oficial:
                    </span>
                    <div
                      className="text-xl sm:text-2xl font-black text-or mt-0.5"
                      dangerouslySetInnerHTML={{ __html: currentQuestion.formatted_answer_pt }}
                    />
                  </div>

                  {currentQuestion.explanation && (
                    <div className="pt-2.5 border-t-2 border-ink/15 text-xs sm:text-base text-ink leading-relaxed">
                      <span className="font-bold">Contexto: </span>
                      {currentQuestion.explanation}
                    </div>
                  )}

                  {currentQuestion.wiki_url && (
                    <div className="pt-1 flex flex-wrap items-center justify-between gap-2.5">
                      <a
                        href={currentQuestion.wiki_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tag-salinha inline-flex items-center gap-1 bg-bl text-white text-[11px] sm:text-xs px-3 py-1 hover:bg-bl-dark shadow-solid-sm"
                      >
                        <BookOpen className="w-3 h-3" /> Wikipédia <ExternalLink className="w-3 h-3" />
                      </a>

                      <div className="flex flex-wrap items-center gap-1 text-[11px]">
                        <span className="font-bold text-suave mr-1">Aceitos:</span>
                        {currentQuestion.accept_aliases.slice(0, 3).map((alias, i) => (
                          <span key={i} className="bg-paper border border-ink/30 px-1.5 py-0.5 rounded font-semibold text-ink">
                            {alias}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {gameMode === 'daily' && dailyResult && (
                    <div className="pt-3 border-t-2 border-ink/15 flex flex-col sm:flex-row gap-2.5">
                      <button
                        onClick={handleCopyShare}
                        className="btn-salinha w-full sm:w-auto bg-gr hover:bg-gr-dark text-white px-5 py-2.5 text-xs sm:text-sm cursor-pointer shadow-solid-sm"
                      >
                        {copiedShare ? '✅ Copiado!' : '📋 Compartilhar Meu Corte'}
                      </button>
                      <button
                        onClick={() => setGameMode('unlimited')}
                        className="btn-salinha w-full sm:w-auto bg-mu hover:bg-mu-dark text-ink px-5 py-2.5 text-xs sm:text-sm cursor-pointer shadow-solid-sm"
                      >
                        Jogar Modo Ilimitado →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="card-salinha text-center py-16">
              <p className="text-suave font-bold">Nenhuma pergunta encontrada com esses filtros.</p>
              <button
                onClick={() => filterUnlimited('Todas')}
                className="btn-salinha mt-3 bg-mu text-ink px-4 py-2 text-xs font-bold cursor-pointer shadow-solid-sm"
              >
                Resetar Filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
