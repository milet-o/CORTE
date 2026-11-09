'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tossup, JudgmentResult, PlayerStats } from '@/types/quizbowl';
import { 
  Zap, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  BookOpen, 
  ExternalLink, 
  Award, 
  Clock, 
  Settings2,
  Volume2,
  HelpCircle,
  Flame,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface QuizbowlReaderProps {
  initialQuestions: Tossup[];
}

export default function QuizbowlReader({ initialQuestions }: QuizbowlReaderProps) {
  // Configurações do jogo
  const [questions, setQuestions] = useState<Tossup[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wpm, setWpm] = useState(250); // Palavras por minuto
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('Todas');

  // Estado da leitura da pergunta atual
  const [status, setStatus] = useState<'idle' | 'reading' | 'buzzed' | 'judged' | 'revealed'>('idle');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPowerEligible, setIsPowerEligible] = useState(true);
  const [buzzedAtWordIndex, setBuzzedAtWordIndex] = useState<number | null>(null);

  // Resposta e julgamento
  const [userAnswer, setUserAnswer] = useState('');
  const [judgment, setJudgment] = useState<JudgmentResult | null>(null);
  const [promptMessage, setPromptMessage] = useState<string | null>(null);
  const [buzzTimeRemaining, setBuzzTimeRemaining] = useState(7); // 7 segundos para responder após cortar

  // Estatísticas da sessão
  const [stats, setStats] = useState<PlayerStats>({
    score: 0,
    powers: 0,
    tens: 0,
    negs: 0,
    totalBuzzes: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
  });

  const currentQuestion = questions[currentIndex] || null;
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
  }, [currentIndex, currentQuestion]);

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
  };

  // Iniciar / pausar leitura
  const toggleReading = () => {
    if (status === 'reading') {
      if (readerIntervalRef.current) clearInterval(readerIntervalRef.current);
      setStatus('idle');
    } else if (status === 'idle') {
      setStatus('reading');
    }
  };

  // O "CORTE" (Buzz in)
  const handleBuzz = useCallback(() => {
    if (status !== 'reading' && status !== 'idle') return;

    if (readerIntervalRef.current) clearInterval(readerIntervalRef.current);

    const isPower = currentWordIndex <= powerWordIndex.current;
    setBuzzedAtWordIndex(currentWordIndex);
    setIsPowerEligible(isPower);
    setStatus('buzzed');
    setBuzzTimeRemaining(7);

    // Foca o input de resposta
    setTimeout(() => {
      answerInputRef.current?.focus();
    }, 50);
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
          submitAnswer(true); // tempo esgotado
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status]);

  // Atalhos de teclado globais
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tecla Espaço para CORTAR se não estiver focado em um campo de texto
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

  // Submeter a resposta ao Juiz Nativo CORTE
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

      // Caso especial: PROMPT ("Seja mais específico")
      if (res.status === 'prompt') {
        setPromptMessage(res.message);
        setBuzzTimeRemaining(5); // Dá mais 5 segundos para especificar
        setUserAnswer('');
        setTimeout(() => answerInputRef.current?.focus(), 50);
        return;
      }

      setJudgment(res);
      setStatus('judged');

      // Atualiza placar do jogador
      setStats((prev) => {
        const isCorrect = res.status === 'correct';
        const isNeg = res.points < 0;
        return {
          score: prev.score + res.points,
          powers: prev.powers + (res.points === 15 ? 1 : 0),
          tens: prev.tens + (res.points === 10 ? 1 : 0),
          negs: prev.negs + (isNeg ? 1 : 0),
          totalBuzzes: prev.totalBuzzes + 1,
          correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
          wrongAnswers: prev.wrongAnswers + (!isCorrect ? 1 : 0),
        };
      });
    } catch (err) {
      console.error('Erro ao conectar ao juiz:', err);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Volta ao início ou busca mais
      setCurrentIndex(0);
    }
  };

  const revealAnswer = () => {
    if (readerIntervalRef.current) clearInterval(readerIntervalRef.current);
    setCurrentWordIndex(words.current.length);
    setStatus('revealed');
  };

  // Filtragem de perguntas
  const filterQuestions = async (category: string, origin: string) => {
    setSelectedCategory(category);
    setSelectedOrigin(origin);
    try {
      const params = new URLSearchParams();
      if (category !== 'Todas') params.append('category', category);
      if (origin !== 'Todas') params.append('origin', origin);
      params.append('random', 'true');

      const res = await fetch(`/api/questions?${params.toString()}`);
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('Erro ao filtrar questões:', err);
    }
  };

  const accuracy = stats.totalBuzzes > 0 
    ? Math.round((stats.correctAnswers / stats.totalBuzzes) * 100) 
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Barra de Título Superior */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-slate-950 text-xs font-black tracking-widest uppercase px-2 py-0.5 rounded">
              v1.0 Nativo
            </span>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span className="text-emerald-400">CORTE</span>
              <span className="text-slate-400 font-light text-xl">| Quizbowl Brasileiro</span>
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Motor de leitura piramidal com acervo da Wikipédia PT-BR e QBReader. Aperte <kbd className="bg-slate-800 border border-slate-700 text-slate-200 px-1.5 py-0.5 rounded text-xs">Espaço</kbd> para cortar!
          </p>
        </div>

        {/* Placar do Jogador */}
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 px-4 shadow-lg">
          <div className="text-center px-2 border-r border-slate-800">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Pontos</div>
            <div className="text-2xl font-black text-emerald-400">{stats.score}</div>
          </div>
          <div className="text-center px-2 border-r border-slate-800">
            <div className="text-xs uppercase tracking-wider text-amber-400 font-medium flex items-center gap-1 justify-center">
              <Zap className="w-3 h-3 fill-amber-400" /> 15s
            </div>
            <div className="text-xl font-bold text-amber-300">{stats.powers}</div>
          </div>
          <div className="text-center px-2 border-r border-slate-800">
            <div className="text-xs uppercase tracking-wider text-blue-400 font-medium">10s</div>
            <div className="text-xl font-bold text-blue-300">{stats.tens}</div>
          </div>
          <div className="text-center px-2 border-r border-slate-800">
            <div className="text-xs uppercase tracking-wider text-rose-400 font-medium">-5s</div>
            <div className="text-xl font-bold text-rose-300">{stats.negs}</div>
          </div>
          <div className="text-center px-2">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Precisão</div>
            <div className="text-xl font-bold text-slate-200">{accuracy}%</div>
          </div>
        </div>
      </header>

      {/* Barra de Filtros e Velocidade */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-4 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase text-slate-400 mr-1 flex items-center gap-1">
            <Settings2 className="w-3.5 h-3.5" /> Repertório:
          </span>
          {['Todas', 'História', 'Literatura', 'Ciência', 'Artes', 'Geografia'].map((cat) => (
            <button
              key={cat}
              onClick={() => filterQuestions(cat, selectedOrigin)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Origem:</span>
            <select
              value={selectedOrigin}
              onChange={(e) => filterQuestions(selectedCategory, e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-500"
            >
              <option value="Todas">Brasil + Mundial</option>
              <option value="wikipedia_br">🇧🇷 Wikipédia Brasil</option>
              <option value="qbreader">🌐 QBReader Internacional</option>
            </select>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">{wpm} WPM</span>
            <input
              type="range"
              min="160"
              max="400"
              step="20"
              value={wpm}
              onChange={(e) => setWpm(Number(e.target.value))}
              className="w-24 accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Arena de Pergunta */}
      {currentQuestion ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Card Principal da Pergunta */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur">
              {/* Indicadores do Topo do Card */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-semibold">
                    Questão {currentIndex + 1} de {questions.length}
                  </span>
                  <span className={`px-2.5 py-1 rounded-md font-semibold ${
                    currentQuestion.origin === 'wikipedia_br' 
                      ? 'bg-amber-950/40 text-amber-300 border border-amber-800/50' 
                      : 'bg-blue-950/40 text-blue-300 border border-blue-800/50'
                  }`}>
                    {currentQuestion.origin === 'wikipedia_br' ? '🇧🇷 Wikipédia BR' : '🌐 QBReader'}
                  </span>
                  <span className="text-slate-400 font-medium">
                    {currentQuestion.category} &bull; {currentQuestion.subcategory}
                  </span>
                </div>

                {/* Status do Power */}
                <div>
                  {isPowerEligible ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 power-glow">
                      <Zap className="w-3.5 h-3.5 fill-amber-400" />
                      POWER ATIVO (+15 PTS)
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400">
                      Normal (+10 pts)
                    </span>
                  )}
                </div>
              </div>

              {/* Área do Texto Piramidal com Leitura Dinâmica */}
              <div className="min-h-[180px] text-lg sm:text-xl leading-relaxed text-slate-200 font-normal">
                {status === 'idle' && currentWordIndex === 0 ? (
                  <div className="text-slate-400 italic flex items-center gap-2 pt-6">
                    <Play className="w-5 h-5 text-emerald-400 animate-pulse" />
                    Pressione "Iniciar Leitura" ou clique em "CORTAR" para responder a qualquer momento...
                  </div>
                ) : (
                  <div>
                    {words.current.map((word, idx) => {
                      const isRevealed = idx < currentWordIndex || status === 'revealed' || status === 'judged';
                      const isWordPower = idx <= powerWordIndex.current;
                      const isBuzzedHere = idx === buzzedAtWordIndex;
                      const isReadingHead = idx === currentWordIndex - 1 && status === 'reading';

                      if (!isRevealed) {
                        // Palavra futura: totalmente oculta com tarja preta censurada (sem o texto)
                        return (
                          <span
                            key={idx}
                            aria-hidden="true"
                            className="inline-block mr-1.5 h-4 bg-slate-800/70 rounded select-none align-middle"
                            style={{ width: `${Math.max(24, Math.min(70, word.length * 9))}px` }}
                          />
                        );
                      }

                      return (
                        <span
                          key={idx}
                          className={`transition-all duration-75 inline-block mr-1.5 ${
                            isWordPower
                              ? 'text-amber-100 font-medium'
                              : 'text-slate-200'
                          } ${
                            isBuzzedHere
                              ? 'bg-rose-500/30 text-rose-200 px-1.5 py-0.5 rounded ring-2 ring-rose-500 font-bold'
                              : ''
                          }`}
                        >
                          {word}
                          {isReadingHead && (
                            <span className="inline-block w-1.5 h-5 bg-emerald-400 ml-1 animate-pulse align-middle" />
                          )}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Barra de Progresso da Pergunta */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span>Progresso da Leitura:</span>
                  <div className="w-36 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-150 ${
                        isPowerEligible ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (currentWordIndex / (words.current.length || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <span>
                  {currentWordIndex} / {words.current.length} palavras
                </span>
              </div>
            </div>

            {/* Painel de Buzzer / Digitação de Resposta */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
              {status === 'buzzed' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
                      <Flame className="w-4 h-4 fill-rose-400" />
                      CORTADO! DIGITE SUA RESPOSTA:
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-base font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                      <Clock className="w-4 h-4" /> {buzzTimeRemaining}s
                    </div>
                  </div>

                  {/* Barra regressiva de 7s */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 transition-all duration-1000 ease-linear"
                      style={{ width: `${(buzzTimeRemaining / 7) * 100}%` }}
                    />
                  </div>

                  {promptMessage && (
                    <div className="bg-amber-500/15 border border-amber-500/40 text-amber-300 p-3 rounded-xl text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
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
                      placeholder="Ex: Getúlio Vargas, Inconfidência Mineira, Einstein..."
                      className="flex-1 bg-slate-950 border-2 border-rose-500/80 rounded-xl px-4 py-3 text-white text-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-inner"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-xl text-sm uppercase tracking-wider transition shadow-lg flex items-center gap-1.5"
                    >
                      Enviar
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Botão de Corte Principal */}
                  <button
                    onClick={handleBuzz}
                    disabled={status === 'judged' || status === 'revealed'}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-black text-lg uppercase tracking-wider shadow-2xl transition-all duration-150 ${
                      status === 'judged' || status === 'revealed'
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-rose-600 hover:bg-rose-500 active:scale-95 text-white shadow-rose-900/50 hover:shadow-rose-600/30'
                    }`}
                  >
                    <Flame className="w-6 h-6 fill-white" />
                    CORTAR! <span className="text-xs bg-rose-800 px-2 py-0.5 rounded font-mono">Espaço</span>
                  </button>

                  {/* Controles de Navegação */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleReading}
                      disabled={status === 'judged' || status === 'revealed'}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-3 rounded-xl text-sm transition"
                    >
                      {status === 'reading' ? (
                        <>
                          <Pause className="w-4 h-4" /> Pausar
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-slate-200" /> Iniciar Leitura
                        </>
                      )}
                    </button>

                    <button
                      onClick={revealAnswer}
                      className="bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-medium px-4 py-3 rounded-xl text-sm transition border border-slate-700/60"
                    >
                      Gabarito
                    </button>

                    <button
                      onClick={nextQuestion}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl text-sm transition flex items-center gap-1 shadow-lg"
                    >
                      Próxima <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Veredito do Juiz Nativo */}
            {judgment && (
              <div
                className={`p-5 rounded-2xl border text-sm shadow-xl flex items-start gap-4 transition-all ${
                  judgment.status === 'correct'
                    ? judgment.points === 15
                      ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                      : 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                }`}
              >
                {judgment.status === 'correct' ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-7 h-7 text-rose-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-1">
                  <div className="font-black text-base flex items-center justify-between">
                    <span>{judgment.message}</span>
                    <span className="font-mono text-lg font-black px-2.5 py-0.5 rounded bg-black/40">
                      {judgment.points > 0 ? `+${judgment.points}` : judgment.points} pts
                    </span>
                  </div>
                  {judgment.matchedAlias && (
                    <p className="text-xs opacity-90">
                      Reconhecido pelo Juiz Nativo via alias: <strong>"{judgment.matchedAlias}"</strong>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Gabarito e Explicação Oficial */}
            {(status === 'judged' || status === 'revealed') && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    Linha de Resposta Oficial (Answerline):
                  </span>
                  <div
                    className="text-xl font-bold text-emerald-400 mt-1"
                    dangerouslySetInnerHTML={{ __html: currentQuestion.formatted_answer_pt }}
                  />
                </div>

                {currentQuestion.explanation && (
                  <div className="pt-3 border-t border-slate-800 text-sm text-slate-300 leading-relaxed">
                    <span className="font-semibold text-slate-200">Contexto Histórico: </span>
                    {currentQuestion.explanation}
                  </div>
                )}

                {currentQuestion.wiki_url && (
                  <div className="pt-2">
                    <a
                      href={currentQuestion.wiki_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Ler artigo completo na Wikipédia{' '}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Coluna Lateral: Metadados da Pergunta e Guia Rápido */}
          <div className="space-y-4">
            {/* Card de Regras do CORTE */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 text-xs text-slate-300 space-y-3">
              <h3 className="font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5 text-xs">
                <Award className="w-4 h-4 text-emerald-400" /> Como Funciona o CORTE:
              </h3>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">15 pts:</span> Se cortar antes do asterisco (*), você ganha o <strong>Power</strong>!
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-400 font-bold">10 pts:</span> Se cortar após o asterisco (*), resposta normal correta.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold">-5 pts:</span> Se você cortar a leitura e errar a resposta (negativo).
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-slate-400 font-bold">0 pts:</span> Se esperar a leitura terminar por completo e errar.
                </li>
              </ul>
            </div>

            {/* Dica da Pergunta Atual (Wiki-Extract) */}
            {currentQuestion.wiki_extract && (
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 text-xs text-slate-300 space-y-2">
                <h3 className="font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-400" /> Resumo Canônico:
                </h3>
                <p className="text-slate-400 leading-relaxed line-clamp-6">
                  {currentQuestion.wiki_extract}
                </p>
              </div>
            )}

            {/* Aliases Aceitos */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 text-xs text-slate-300 space-y-2">
              <h3 className="font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-400" /> Variações Aceitas pelo Juiz:
              </h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentQuestion.accept_aliases.map((alias, i) => (
                  <span
                    key={i}
                    className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]"
                  >
                    {alias}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
          <p className="text-slate-400">Nenhuma pergunta encontrada com os filtros selecionados.</p>
          <button
            onClick={() => filterQuestions('Todas', 'Todas')}
            className="mt-4 bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm"
          >
            Resetar Filtros
          </button>
        </div>
      )}
    </div>
  );
}
