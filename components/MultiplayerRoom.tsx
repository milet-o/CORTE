'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { RoomState, RoomPlayer, MULTIPLAYER_COLORS } from '@/lib/multiplayer/types';
import { Tossup } from '@/types/quizbowl';
import CreatureAvatar, { CreatureConfig, DEFAULT_CREATURE, getRandomCreature, HAT_NAMES } from '@/components/CreatureAvatar';
import DopamineCelebration from '@/components/DopamineCelebration';
import BugReportModal from '@/components/BugReportModal';
import { 
  playClickSound, 
  playCutSound, 
  playCorrectSound, 
  playWrongSound, 
  playTickSound,
  playPlayerJoinSound,
  playGameStartSound,
  playPageFlipSound,
  playStampSound
} from '@/lib/sfx';
import { 
  Users, 
  Copy, 
  Check, 
  Play, 
  Pause, 
  ChevronRight, 
  Scissors, 
  Clock, 
  Crown, 
  Sparkles, 
  LogOut, 
  BookOpen, 
  ExternalLink,
  Layers,
  Gauge,
  Zap,
  AlertTriangle,
  RotateCcw,
  Dices,
  Bug
} from 'lucide-react';

interface MultiplayerRoomProps {
  initialCode?: string | null;
  initialQuestions?: Tossup[];
  onExit: () => void;
}

export default function MultiplayerRoom({ initialCode, initialQuestions, onExit }: MultiplayerRoomProps) {
  // Identidade local do jogador
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [playerColor, setPlayerColor] = useState<string>(MULTIPLAYER_COLORS[0].hex);
  const [playerAvatar, setPlayerAvatar] = useState<CreatureConfig>(DEFAULT_CREATURE);

  // Telas: 'lobby' (escolher nick/sala) ou 'in_room'
  const [isInRoom, setIsInRoom] = useState<boolean>(false);
  const [roomCodeInput, setRoomCodeInput] = useState<string>(initialCode || '');
  const [lobbyMode, setLobbyMode] = useState<'create' | 'join'>(initialCode ? 'join' : 'create');

  // Estado da sala sincronizada
  const [room, setRoom] = useState<RoomState | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [hasSubmittedBuzz, setHasSubmittedBuzz] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [bugModalOpen, setBugModalOpen] = useState<boolean>(false);

  // Contagens regressivas suaves e dinâmicas (10s do Buzzer e 10s Finais)
  const [buzzTimeRemaining, setBuzzTimeRemaining] = useState<number>(10);
  const [buzzPercentRemaining, setBuzzPercentRemaining] = useState<number>(100);
  const [endCountdownRemaining, setEndCountdownRemaining] = useState<number>(10);
  const [endCountdownPercentRemaining, setEndCountdownPercentRemaining] = useState<number>(100);

  // Refs e timers
  const answerInputRef = useRef<HTMLInputElement | null>(null);
  const sseRef = useRef<EventSource | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickTimeRef = useRef<number>(0);

  // Inicializa id persistente do jogador no navegador
  useEffect(() => {
    let id = localStorage.getItem('corte_player_id');
    if (!id) {
      id = 'p_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('corte_player_id', id);
    }
    setPlayerId(id);

    const savedName = localStorage.getItem('corte_player_name');
    if (savedName) setPlayerName(savedName);

    const savedColor = localStorage.getItem('corte_player_color');
    if (savedColor) setPlayerColor(savedColor);

    const savedAvatar = localStorage.getItem('corte_player_avatar');
    if (savedAvatar) {
      try {
        setPlayerAvatar(JSON.parse(savedAvatar));
      } catch (e) {
        setPlayerAvatar(getRandomCreature());
      }
    } else {
      const initialRnd = getRandomCreature();
      setPlayerAvatar(initialRnd);
      localStorage.setItem('corte_player_avatar', JSON.stringify(initialRnd));
    }

    if (initialCode) {
      setRoomCodeInput(initialCode.toUpperCase());
      setLobbyMode('join');
    }
  }, [initialCode]);

  // Reseta ticks e status de envio quando muda a rodada
  useEffect(() => {
    lastTickTimeRef.current = 0;
    if (room?.roundState !== 'buzzed') {
      setHasSubmittedBuzz(false);
    }
  }, [room?.roundState]);

  // Timer de 10s para responder ao Cortar (Atualização a 50ms)
  useEffect(() => {
    if (!room) return;

    if (room.roundState === 'buzzed' && room.buzzStartTime) {
      const startTime = room.buzzStartTime;
      const totalMs = (room.buzzDurationSeconds || 10) * 1000;
      const amIBuzzed = room.buzzedPlayerId === playerId;

      const update = () => {
        const now = Date.now();
        const elapsedMs = now - startTime;
        const remainingMs = Math.max(0, totalMs - elapsedMs);
        const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
        const percent = Math.min(100, Math.max(0, (remainingMs / totalMs) * 100));

        setBuzzTimeRemaining(remainingSec);
        setBuzzPercentRemaining(percent);

        // SILÊNCIO: Só toca o tick urgente para quem cortou E ainda não enviou resposta!
        if (amIBuzzed && !hasSubmittedBuzz && remainingSec <= 3 && remainingSec > 0) {
          const nowSec = Math.floor(now / 1000);
          if (nowSec !== lastTickTimeRef.current) {
            lastTickTimeRef.current = nowSec;
            playTickSound();
          }
        }
      };

      update();
      const interval = setInterval(update, 50);
      return () => clearInterval(interval);
    } else {
      setBuzzTimeRemaining(10);
      setBuzzPercentRemaining(100);
    }
  }, [room?.roundState, room?.buzzStartTime, room?.buzzDurationSeconds, room?.buzzedPlayerId, playerId, hasSubmittedBuzz]);

  // Timer de 10s finais após leitura completa (Atualização a 50ms)
  useEffect(() => {
    if (!room) return;

    if (room.roundState === 'ending_countdown' && room.endCountdownStartTime) {
      const startTime = room.endCountdownStartTime;
      const totalMs = (room.endCountdownDurationSeconds || 10) * 1000;
      const myPlayer = room.players.find(p => p.id === playerId);
      const canIBuzz = myPlayer && !myPlayer.hasBuzzed;

      const update = () => {
        const now = Date.now();
        const elapsedMs = now - startTime;
        const remainingMs = Math.max(0, totalMs - elapsedMs);
        const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
        const percent = Math.min(100, Math.max(0, (remainingMs / totalMs) * 100));

        setEndCountdownRemaining(remainingSec);
        setEndCountdownPercentRemaining(percent);

        // Só toca o tick se o jogador ainda tiver direito a cortar
        if (canIBuzz && remainingSec <= 3 && remainingSec > 0) {
          const nowSec = Math.floor(now / 1000);
          if (nowSec !== lastTickTimeRef.current) {
            lastTickTimeRef.current = nowSec;
            playTickSound();
          }
        }
      };

      update();
      const interval = setInterval(update, 50);
      return () => clearInterval(interval);
    } else {
      setEndCountdownRemaining(10);
      setEndCountdownPercentRemaining(100);
    }
  }, [room?.roundState, room?.endCountdownStartTime, room?.endCountdownDurationSeconds, room?.players, playerId]);

  // Conecta ao stream SSE e polling de sincronização
  const connectToRoom = useCallback((code: string) => {
    const normalized = code.trim().toUpperCase();

    if (sseRef.current) sseRef.current.close();
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    // 1. SSE Stream
    try {
      const sse = new EventSource(`/api/rooms/${normalized}/events`);
      sse.onmessage = (e) => {
        try {
          const data: RoomState = JSON.parse(e.data);
          setRoom(data);
        } catch (err) {}
      };
      sseRef.current = sse;
    } catch (e) {}

    // 2. Polling de redundância a cada 1.5s
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${normalized}`);
        if (res.ok) {
          const json = await res.json();
          if (json.room) {
            setRoom(json.room);
          }
        }
      } catch (e) {}
    }, 1500);
  }, []);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (sseRef.current) sseRef.current.close();
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Efeitos sonoros acionados pelo estado da sala
  useEffect(() => {
    if (!room) return;

    if (room.lastJudgment) {
      if (room.lastJudgment.status === 'correct') {
        playStampSound();
        playCorrectSound();
        setShowCelebration(true);
      } else {
        playWrongSound();
      }
    }
  }, [room?.lastJudgment?.timestamp]);

  // Notificação com som "Tlup" quando novos amigos entram na sala
  const prevPlayerCountRef = useRef<number>(0);
  useEffect(() => {
    if (room) {
      if (prevPlayerCountRef.current > 0 && room.players.length > prevPlayerCountRef.current) {
        playPlayerJoinSound();
      }
      prevPlayerCountRef.current = room.players.length;
    }
  }, [room?.players.length]);

  // Alerta sonoro de início de partida e piscar título da aba
  const prevRoundStateRef = useRef<string>('idle');
  useEffect(() => {
    if (room) {
      if (prevRoundStateRef.current !== 'reading' && room.roundState === 'reading') {
        playGameStartSound();
        if (typeof document !== 'undefined' && document.hidden) {
          let count = 0;
          const originalTitle = document.title;
          const interval = setInterval(() => {
            document.title = count % 2 === 0 ? '🚨 CORTE COMEÇOU!' : '✂️ CORTE.';
            count++;
            if (count > 8 || !document.hidden) {
              clearInterval(interval);
              document.title = originalTitle;
            }
          }, 600);
        }
      }
      prevRoundStateRef.current = room.roundState;
    }
  }, [room?.roundState]);

  // Criação de Sala
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setErrorMessage('Digite seu nome/apelido para entrar.');
      return;
    }

    playClickSound();
    setErrorMessage(null);
    setIsSubmitting(true);
    localStorage.setItem('corte_player_name', playerName.trim());
    localStorage.setItem('corte_player_color', playerColor);

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: playerName.trim(),
          hostColor: playerColor,
          hostId: playerId,
          avatar: playerAvatar,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.room) {
        throw new Error(data.error || 'Erro ao criar sala');
      }

      setRoom(data.room);
      setIsInRoom(true);
      connectToRoom(data.room.code);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Entrada em Sala Existente
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setErrorMessage('Digite seu nome/apelido para entrar.');
      return;
    }
    if (!roomCodeInput.trim()) {
      setErrorMessage('Digite o código da sala de 5 letras.');
      return;
    }

    playClickSound();
    setErrorMessage(null);
    setIsSubmitting(true);
    const code = roomCodeInput.trim().toUpperCase();
    localStorage.setItem('corte_player_name', playerName.trim());
    localStorage.setItem('corte_player_color', playerColor);

    try {
      const res = await fetch(`/api/rooms/${code}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          playerId,
          playerName: playerName.trim(),
          playerColor,
          avatar: playerAvatar,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.room) {
        throw new Error(data.error || 'Erro ao entrar na sala');
      }

      setRoom(data.room);
      setIsInRoom(true);
      connectToRoom(code);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enviar Ação genérica ao backend da Sala
  const sendRoomAction = async (action: string, extraData: any = {}) => {
    if (!room) return;
    try {
      const res = await fetch(`/api/rooms/${room.code}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          playerId,
          ...extraData,
        }),
      });
      const data = await res.json();
      if (data.room) {
        setRoom(data.room);
      }
    } catch (err) {}
  };

  // Cortar (Buzzer)
  const handleBuzz = () => {
    if (!room) return;
    setHasSubmittedBuzz(false);
    lastTickTimeRef.current = 0;
    playCutSound();
    sendRoomAction('buzz');
  };

  // Submeter resposta
  const handleSubmitAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!room) return;
    setHasSubmittedBuzz(true);
    lastTickTimeRef.current = 0;
    playClickSound();
    sendRoomAction('submit_answer', { answer: userAnswer.trim() });
    setUserAnswer('');
  };

  // Foco no input quando for a minha vez de responder
  const isMyBuzz = room?.roundState === 'buzzed' && room?.buzzedPlayerId === playerId;
  useEffect(() => {
    if (isMyBuzz) {
      setTimeout(() => answerInputRef.current?.focus(), 50);
    }
  }, [isMyBuzz]);

  // Teclado: Espaço para cortar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!room || !isInRoom) return;
      if (e.code === 'Space') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          if (room.roundState === 'reading' || room.roundState === 'ending_countdown') {
            const me = room.players.find(p => p.id === playerId);
            if (me && !me.hasBuzzed) {
              handleBuzz();
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [room, isInRoom, playerId]);

  // Copiar link de convite
  const handleCopyLink = () => {
    if (!room) return;
    playClickSound();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://corte-h0ub.onrender.com';
    const link = `${origin}/?sala=${room.code}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Jogador atual e permissão de Host
  const currentPlayer = room?.players.find(p => p.id === playerId);
  const isHost = currentPlayer?.isHost || room?.hostId === playerId;
  const currentBuzzedPlayer = room?.players.find(p => p.id === room?.buzzedPlayerId);

  // Categorias disponíveis
  const availableCategories = [
    'Ciência', 'História', 'Geografia', 'Literatura', 
    'Cidades do Brasil', 'Personalidades do Brasil', 'Políticos do Brasil', 
    'Curiosidades do Mundo', 'Artes', 'Mitologia', 'Linguística'
  ];

  const categoryLabels: Record<string, string> = {
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
  };

  const availableDifficulties = [
    { label: 'Fácil', key: 'easy' },
    { label: 'Média', key: 'medium' },
    { label: 'Difícil', key: 'hard' },
  ];

  // Alternar filtro (apenas Host)
  const toggleCategory = (cat: string) => {
    if (!isHost || !room) return;
    playClickSound();
    let nextCats: string[];
    if (cat === 'Todas') {
      nextCats = ['Todas'];
    } else {
      const filtered = room.selectedCategories.filter(c => c !== 'Todas');
      if (filtered.includes(cat)) {
        nextCats = filtered.filter(c => c !== cat);
        if (nextCats.length === 0) nextCats = ['Todas'];
      } else {
        nextCats = [...filtered, cat];
      }
    }
    sendRoomAction('update_filters', {
      categories: nextCats,
      difficulties: room.selectedDifficulties,
    });
  };

  const toggleDifficulty = (diffKey: string) => {
    if (!isHost || !room) return;
    playClickSound();
    let nextDiffs: string[];
    if (diffKey === 'Qualquer') {
      nextDiffs = ['Qualquer'];
    } else {
      const filtered = room.selectedDifficulties.filter(d => d !== 'Qualquer');
      if (filtered.includes(diffKey)) {
        nextDiffs = filtered.filter(d => d !== diffKey);
        if (nextDiffs.length === 0) nextDiffs = ['Qualquer'];
      } else {
        nextDiffs = [...filtered, diffKey];
      }
    }
    sendRoomAction('update_filters', {
      categories: room.selectedCategories,
      difficulties: nextDiffs,
    });
  };

  const setSpeed = (spd: number) => {
    if (!isHost || !room) return;
    playClickSound();
    sendRoomAction('update_filters', {
      categories: room.selectedCategories,
      difficulties: room.selectedDifficulties,
      wpm: spd,
    });
  };

  // Contagem dinâmica de perguntas encontradas pelos filtros
  const matchingQuestionsCount = useMemo(() => {
    if (!initialQuestions || !room) return 0;
    return initialQuestions.filter(q => {
      const matchCat = room.selectedCategories.includes('Todas') || 
        room.selectedCategories.includes(q.category);
      const matchDiff = room.selectedDifficulties.includes('Qualquer') || 
        room.selectedDifficulties.some(diffKey => {
          if (diffKey === 'easy') return q.difficulty <= 1;
          if (diffKey === 'medium') return q.difficulty === 2;
          if (diffKey === 'hard') return q.difficulty >= 3;
          return false;
        });
      return matchCat && matchDiff;
    }).length;
  }, [initialQuestions, room?.selectedCategories, room?.selectedDifficulties]);

  // ========================================================
  // TELA DE EXPULSO DA SALA (Caso o host tenha removido)
  // ========================================================
  if (isInRoom && room && !room.players.some(p => p.id === playerId)) {
    return (
      <div className="h-full flex flex-col justify-center items-center p-4 max-w-md mx-auto">
        <div className="w-full card-salinha p-6 bg-card shadow-solid text-center space-y-4 animate-cartoon-shake">
          <div className="w-14 h-14 bg-[#ffccd5] border-2 border-ink rounded-full mx-auto flex items-center justify-center shadow-solid-sm">
            <LogOut className="w-6 h-6 text-rd" />
          </div>
          <div>
            <h2 className="font-serif font-black text-xl text-ink">Você foi removido da sala</h2>
            <p className="text-xs font-bold text-suave mt-1">O host da sala encerrou sua participação.</p>
          </div>
          <button
            onClick={() => {
              playClickSound();
              setIsInRoom(false);
              setRoom(null);
              onExit();
            }}
            className="btn-salinha w-full py-2.5 bg-or hover:bg-or-dark text-white text-xs uppercase font-black shadow-solid cursor-pointer"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  // ========================================================
  // TELA 1: LOBBY DE CRIAÇÃO / ENTRADA NA SALA COM STRETCH
  // ========================================================
  if (!isInRoom || !room) {
    return (
      <div className="h-full flex flex-col justify-center items-center p-4 max-w-lg mx-auto">
        <div className="w-full card-salinha p-6 sm:p-8 bg-card shadow-solid relative transition-all duration-300">
          
          <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-ink/15">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-mu border-2 border-ink rounded-full shadow-solid-sm">
                <Users className="w-5 h-5 text-ink" />
              </span>
              <div>
                <h2 className="font-serif font-black text-2xl text-ink">Salinha de Amigos</h2>
                <p className="text-xs font-bold text-suave">Multiplayer sincronizado (até 6 pessoas)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setBugModalOpen(true)}
                className="text-xs font-bold text-suave hover:text-rd flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
                title="Relatar bug para o desenvolvedor"
              >
                <Bug className="w-3.5 h-3.5" />
                <span>Bug</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onExit();
                }}
                className="text-xs font-bold text-suave hover:text-ink underline transition-transform active:scale-95 cursor-pointer"
              >
                Voltar
              </button>
            </div>
          </div>

          {/* Abas Criar vs Entrar com SLIDER DESLIZANTE DE MOLA */}
          <div className="relative flex bg-paper border-2 border-ink rounded-full p-1 mb-5 shadow-solid-sm select-none">
            {/* Pílula deslizante com física elástica */}
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full border-2 border-ink shadow-solid-sm transition-transform duration-250 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                lobbyMode === 'create' ? 'translate-x-0 bg-or' : 'translate-x-full bg-mu'
              }`}
            />
            <button
              type="button"
              onClick={() => {
                setLobbyMode('create');
                playClickSound();
              }}
              className={`relative z-10 flex-1 py-1.5 text-xs font-black transition-colors duration-200 text-center ${
                lobbyMode === 'create' ? 'text-white' : 'text-ink'
              }`}
            >
              Criar Nova Sala
            </button>
            <button
              type="button"
              onClick={() => {
                setLobbyMode('join');
                playClickSound();
              }}
              className={`relative z-10 flex-1 py-1.5 text-xs font-black transition-colors duration-200 text-center ${
                lobbyMode === 'join' ? 'text-ink' : 'text-ink'
              }`}
            >
              Entrar com Código
            </button>
          </div>

          <form onSubmit={lobbyMode === 'create' ? handleCreateRoom : handleJoinRoom} className="space-y-4">
            {/* Campo de Nick */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-ink">Seu Apelido / Nick:</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={14}
                placeholder="Ex: Felipe, Campeão, etc."
                className="w-full bg-paper border-2 border-ink rounded-xl px-3.5 py-2 text-ink font-bold placeholder-ink/40 focus:outline-none shadow-solid-sm transition-shadow focus:shadow-solid"
                autoFocus
              />
            </div>

            {/* Mixer de Criaturas (Kenney Creature Mixer) */}
            <div className="bg-paper border-2 border-ink rounded-2xl p-3 shadow-solid-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-ink flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-or" /> Seu Monstrinho:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    const next = getRandomCreature();
                    setPlayerAvatar(next);
                    localStorage.setItem('corte_player_avatar', JSON.stringify(next));
                  }}
                  className="btn-salinha bg-card hover:bg-[#e6dfd1] text-ink px-2.5 py-1 text-[11px] font-bold shadow-solid-sm cursor-pointer flex items-center gap-1 active:scale-95 transition-transform"
                >
                  <Dices className="w-3.5 h-3.5 text-or" /> Sortear Monstrinho
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 pt-0.5">
                {/* Visualizador do Monstrinho */}
                <div 
                  className="p-2 bg-card border-2 border-ink rounded-2xl shadow-solid-sm flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform shrink-0"
                  onClick={() => {
                    playClickSound();
                    const next = getRandomCreature();
                    setPlayerAvatar(next);
                    localStorage.setItem('corte_player_avatar', JSON.stringify(next));
                  }}
                  title="Clique para sortear outra combinação!"
                >
                  <CreatureAvatar config={playerAvatar} color={playerColor} size={68} />
                </div>

                {/* Seletores rápidos de partes (Corpo, Olhos, Boca) */}
                <div className="flex-1 flex flex-col gap-1 text-[11px] font-black">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-suave">Corpo:</span>
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setPlayerAvatar(prev => {
                          const next = { ...prev, body: (prev.body + 1) % 5 };
                          localStorage.setItem('corte_player_avatar', JSON.stringify(next));
                          return next;
                        });
                      }}
                      className="px-2 py-0.5 bg-card border border-ink rounded-lg hover:bg-creme cursor-pointer text-[10px]"
                    >
                      Forma {(playerAvatar.body % 5) + 1}/5 →
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-suave">Olhos:</span>
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setPlayerAvatar(prev => {
                          const next = { ...prev, eyes: (prev.eyes + 1) % 5 };
                          localStorage.setItem('corte_player_avatar', JSON.stringify(next));
                          return next;
                        });
                      }}
                      className="px-2 py-0.5 bg-card border border-ink rounded-lg hover:bg-creme cursor-pointer text-[10px]"
                    >
                      Olhos {(playerAvatar.eyes % 5) + 1}/5 →
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-suave">Boca:</span>
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setPlayerAvatar(prev => {
                          const next = { ...prev, mouth: (prev.mouth + 1) % 5 };
                          localStorage.setItem('corte_player_avatar', JSON.stringify(next));
                          return next;
                        });
                      }}
                      className="px-2 py-0.5 bg-card border border-ink rounded-lg hover:bg-creme cursor-pointer text-[10px]"
                    >
                      Boca {(playerAvatar.mouth % 5) + 1}/5 →
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-suave">Chapéu:</span>
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setPlayerAvatar(prev => {
                          const next = { ...prev, hat: ((prev.hat ?? 0) + 1) % 6 };
                          localStorage.setItem('corte_player_avatar', JSON.stringify(next));
                          return next;
                        });
                      }}
                      className="px-2 py-0.5 bg-card border border-ink rounded-lg hover:bg-creme cursor-pointer text-[10px]"
                    >
                      {HAT_NAMES[(playerAvatar.hat ?? 0) % 6]} →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Seletor de Cor do Sticker com JELLY POP */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-ink">Sua Cor de Adesivo:</label>
              <div className="flex gap-2 justify-between">
                {MULTIPLAYER_COLORS.map((col) => {
                  const isSelected = playerColor === col.hex;
                  return (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => {
                        setPlayerColor(col.hex);
                        playClickSound();
                      }}
                      style={{ backgroundColor: col.hex }}
                      className={`w-9 h-9 rounded-full border-2 border-ink transition-transform duration-200 ${
                        isSelected 
                          ? 'scale-115 ring-2 ring-ink ring-offset-2 animate-jelly shadow-solid-sm' 
                          : 'hover:-translate-y-1 hover:scale-105'
                      }`}
                      title={col.name}
                    />
                  );
                })}
              </div>
            </div>

            {/* Código da Sala com EFEITO STRETCH / SANFONA SUAVE */}
            <div className={`accordion-stretch ${lobbyMode === 'join' ? 'accordion-stretch-open' : 'accordion-stretch-closed'}`}>
              <div className="overflow-hidden">
                <div className="space-y-1.5 pt-2 pb-1">
                  <label className="text-xs font-black uppercase text-ink">Código da Sala (5 letras):</label>
                  <input
                    type="text"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    maxLength={5}
                    placeholder="Ex: BRASA"
                    className="w-full bg-paper border-2 border-ink rounded-xl px-3.5 py-2 font-mono text-center tracking-widest text-lg font-black uppercase text-ink focus:outline-none shadow-solid-sm"
                  />
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-[#ffccd5] border-2 border-ink rounded-xl p-2.5 text-xs font-bold text-rd flex items-center gap-2 animate-cartoon-shake">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn-salinha w-full py-3 text-sm font-black uppercase tracking-wider text-white shadow-solid cursor-pointer mt-2 transition-all ${
                lobbyMode === 'create' ? 'bg-or hover:bg-or-dark' : 'bg-gr hover:bg-gr-dark'
              }`}
            >
              {isSubmitting 
                ? 'Conectando...' 
                : lobbyMode === 'create' 
                  ? 'Criar Sala e Gerar Link' 
                  : 'Entrar na Sala'}
            </button>
          </form>
        </div>

        {/* Modal de Relato de Bug */}
        <BugReportModal
          isOpen={bugModalOpen}
          onClose={() => setBugModalOpen(false)}
          context="Multiplayer Lobby"
        />
      </div>
    );
  }

  // ========================================================
  // TELA 2: SALA MULTIPLAYER ATIVA (LAYOUT 2 COLUNAS)
  // ========================================================
  const words = room.currentQuestion ? room.currentQuestion.question_pt.split(/\s+/).filter(Boolean) : [];
  const myPlayer = room.players.find(p => p.id === playerId);
  const isPower = room.powerWordIndex !== -1 && room.currentWordIndex <= room.powerWordIndex;

  return (
    <div className="h-full flex flex-col justify-between p-3 sm:p-5 max-w-[1650px] mx-auto select-none">
      
      {/* 1. HEADER DA SALA MULTIPLAYER */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink/15 pb-2.5 mb-3 shrink-0">
        
        {/* Info da Sala e Código */}
        <div className="flex items-center gap-2.5">
          <h1 className="font-serif font-black text-2xl sm:text-3xl tracking-tight text-ink flex items-center">
            corte<span className="text-or">.</span>
          </h1>
          <div className="flex items-center gap-1.5 bg-paper border-2 border-ink px-2.5 py-1 rounded-full text-xs font-black shadow-solid-sm">
            <span>SALA:</span>
            <span className="font-mono text-or text-sm font-black tracking-wider">{room.code}</span>
            <button
              onClick={handleCopyLink}
              title="Copiar link da sala para enviar aos amigos"
              className="ml-1 p-1 hover:bg-card rounded-md transition text-ink active:scale-90"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-gr" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Jogadores Conectados (Até 6 sem barra de rolagem e sem truncar) */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-visible">
          {room.players.map((p) => {
            const badge = (() => {
              if (room.players.length < 2) return null;
              const maxScore = Math.max(...room.players.map(x => x.score));
              if (p.score > 0 && p.score === maxScore) return { emoji: '✂️', label: 'Tesoura de Ouro (Líder)' };
              const maxPowers = Math.max(...room.players.map(x => x.powers));
              if (p.powers > 0 && p.powers === maxPowers) return { emoji: '⚡', label: 'Sniper do Power' };
              const maxNegs = Math.max(...room.players.map(x => x.negs));
              if (p.negs > 0 && p.negs === maxNegs) return { emoji: '💣', label: 'Inimigo do Gabarito' };
              return null;
            })();

            return (
              <div
                key={p.id}
                className={`flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full border-2 border-ink text-xs font-black shadow-solid-sm transition-transform duration-200 shrink-0 ${
                  p.id === playerId ? 'ring-2 ring-ink ring-offset-1 scale-105' : ''
                }`}
                style={{
                  backgroundColor: p.color,
                  color: '#ffffff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                <CreatureAvatar config={p.avatar} color={p.color} size={22} className="shrink-0 -my-1" />
                {p.isHost && <Crown className="w-3.5 h-3.5 text-mu fill-mu shrink-0 animate-bounce" />}
                <span>{p.name}</span>
                {badge && (
                  <span className="text-[11px] px-1 py-0.2 bg-black/40 rounded border border-white/20 cursor-help" title={badge.label}>
                    {badge.emoji}
                  </span>
                )}
                <span className="bg-ink/75 text-white px-2 py-0.5 rounded-full font-mono text-[10px] ml-0.5">
                  {p.score} pts
                </span>
                {isHost && p.id !== playerId && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playWrongSound();
                      sendRoomAction('kick_player', { targetPlayerId: p.id });
                    }}
                    title={`Expulsar ${p.name} da sala`}
                    className="w-4 h-4 rounded-full bg-ink/40 hover:bg-rd text-white flex items-center justify-center text-[11px] ml-0.5 transition-colors leading-none font-bold cursor-pointer"
                  >
                    &times;
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBugModalOpen(true)}
            className="btn-salinha bg-card hover:bg-[#ffccd5] text-ink px-2.5 py-1 text-xs font-bold shadow-solid-sm flex items-center gap-1 cursor-pointer"
            title="Relatar bug para o desenvolvedor"
          >
            <Bug className="w-3.5 h-3.5 text-rd" />
            <span className="hidden sm:inline">Bug</span>
          </button>

          {/* Botão Sair */}
          <button
            onClick={() => {
              playClickSound();
              sendRoomAction('leave');
              setIsInRoom(false);
              setRoom(null);
              onExit();
            }}
            className="btn-salinha bg-card hover:bg-[#ffccd5] text-ink px-3 py-1 text-xs font-black shadow-solid-sm cursor-pointer"
          >
            <LogOut className="w-3 h-3 mr-1" /> Sair
          </button>
        </div>
      </header>

      {/* 2. ÁREA PRINCIPAL: GRID DE 2 COLUNAS (NO SCROLL) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 overflow-hidden">
        
        {/* ---------------------------------------------------- */}
        {/* COLUNA DA ESQUERDA: A PERGUNTA (7/12)                */}
        {/* ---------------------------------------------------- */}
        <div className="lg:col-span-7 h-full flex flex-col justify-between card-salinha p-5 sm:p-7 relative overflow-hidden bg-card">
          {room.currentQuestion ? (
            <>
              {/* Topo do Card com Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b-2 border-ink/15 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="bg-or text-white border-2 border-ink text-[11px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-solid-sm">
                    RODADA #{room.questionNumber}
                  </span>
                  <span className="bg-paper border-2 border-ink text-[11px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-solid-sm">
                    {room.currentQuestion.category}
                  </span>
                </div>

                <div>
                  {isPower ? (
                    <span className="inline-flex items-center gap-1 bg-mu border-2 border-ink text-ink text-[11px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-solid-sm animate-pulse">
                      <Zap className="w-3 h-3 fill-ink" /> POWER (+15)
                    </span>
                  ) : (
                    <span className="bg-paper border-2 border-ink/40 text-suave text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                      Normal (+10)
                    </span>
                  )}
                </div>
              </div>

              {/* Corpo da Pergunta com Leitura Sincronizada e Efeito Máquina de Escrever */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 text-xl sm:text-2xl lg:text-[1.65rem] leading-relaxed sm:leading-loose text-ink font-normal flex flex-col justify-center">
                {room.roundState === 'idle' && room.currentWordIndex === 0 ? (
                  <div className="text-suave font-serif italic flex items-center gap-2.5 text-lg sm:text-xl py-4">
                    <Play className="w-5 h-5 text-or fill-or animate-bounce shrink-0" />
                    {isHost 
                      ? 'Você é o Host! Clique em "Iniciar" na lateral para começar a leitura...' 
                      : 'Aguardando o Host iniciar a pergunta...'}
                  </div>
                ) : (
                  <div>
                    {words.map((word, idx) => {
                      const isRevealed = idx < room.currentWordIndex || room.roundState === 'revealed';
                      const isWordPower = idx <= room.powerWordIndex;

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
                          }`}
                        >
                          {word.replace('(*)', '')}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Base do Card: Leitura e Contagem Regressiva dos 10s Finais */}
              <div className="pt-3 mt-2 border-t-2 border-ink/15 flex items-center justify-between text-xs font-bold text-suave shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span>Progresso:</span>
                  <div className="w-32 sm:w-48 h-2.5 bg-paper border-2 border-ink rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-150 ${
                        isPower ? 'bg-mu' : 'bg-gr'
                      }`}
                      style={{
                        width: `${Math.min(100, (room.currentWordIndex / (words.length || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {room.roundState === 'ending_countdown' ? (
                  <div className="flex items-center gap-2 text-rd font-black animate-pulse">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{endCountdownRemaining}s FINAIS PARA CORTAR!</span>
                    <div className="w-20 sm:w-28 h-2 bg-paper border border-ink rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-rd rounded-full transition-all duration-75 ease-linear"
                        style={{ width: `${endCountdownPercentRemaining}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <span>
                    {room.currentWordIndex}/{words.length} palavras
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-suave font-bold">Nenhuma pergunta carregada na sala.</p>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------- */}
        {/* COLUNA DA DIREITA: FILTROS → CONTROLES → GABARITO    */}
        {/* ---------------------------------------------------- */}
        <div className="lg:col-span-5 h-full flex flex-col justify-between gap-3 card-salinha p-4 sm:p-5 overflow-hidden bg-card">
          
          {/* 1. FILTROS (No topo) */}
          <div className="shrink-0 space-y-2 pb-2.5 border-b-2 border-ink/15">
            <div className="flex items-center justify-between text-xs font-black text-ink">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-or" /> Filtros da Sala:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-suave bg-paper border border-ink/40 px-2 py-0.5 rounded-full shadow-solid-sm">
                  {matchingQuestionsCount} questões
                </span>
                {!isHost && (
                  <span className="text-[10px] font-bold text-suave bg-paper border border-ink px-2 py-0.5 rounded-full">
                    🔒 Host
                  </span>
                )}
              </div>
            </div>

            {/* Velocidade de Leitura WPM com Liquid Pill */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="text-[10px] font-black uppercase text-suave flex items-center gap-1">
                <Clock className="w-3 h-3 text-or" /> Velocidade:
              </div>
              <div className="relative flex bg-paper border border-ink/40 rounded-full p-0.5 select-none w-56">
                <div
                  className={`absolute top-0.5 bottom-0.5 rounded-full border border-ink bg-or shadow-solid-sm transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    (room.wpm || 240) === 180 ? 'w-[calc(33.333%-2px)] translate-x-0' :
                    (room.wpm || 240) === 240 ? 'w-[calc(33.333%-2px)] translate-x-[100%]' :
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
                    type="button"
                    disabled={!isHost}
                    onClick={() => setSpeed(spd.val)}
                    className={`relative z-10 flex-1 text-center py-0.5 text-[10px] font-bold transition-colors ${
                      !isHost ? 'cursor-default' : 'cursor-pointer'
                    } ${
                      (room.wpm || 240) === spd.val ? 'text-white' : 'text-suave hover:text-ink'
                    }`}
                  >
                    {spd.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dificuldades */}
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase text-suave flex items-center gap-1">
                <Gauge className="w-3 h-3 text-bl" /> Dificuldade:
              </div>
              <div className="flex flex-wrap gap-1.5 p-1 pb-2">
                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => toggleDifficulty('Qualquer')}
                  className={`tag-salinha px-2.5 py-1 text-[11px] font-bold transition shrink-0 ${
                    room.selectedDifficulties.includes('Qualquer')
                      ? 'bg-mu text-ink shadow-solid-sm'
                      : 'bg-paper text-suave hover:bg-[#e6dfd1]'
                  } ${!isHost ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                >
                  Qualquer
                </button>
                {availableDifficulties.map(diff => (
                  <button
                    key={diff.key}
                    type="button"
                    disabled={!isHost}
                    onClick={() => toggleDifficulty(diff.key)}
                    className={`tag-salinha px-2.5 py-1 text-[11px] font-bold transition shrink-0 ${
                      room.selectedDifficulties.includes(diff.key)
                        ? 'bg-mu text-ink shadow-solid-sm'
                        : 'bg-paper text-suave hover:bg-[#e6dfd1]'
                    } ${!isHost ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Temas */}
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase text-suave flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-or" /> Temas:
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 pb-2.5 scrollbar-thin">
                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => toggleCategory('Todas')}
                  className={`tag-salinha px-2.5 py-1 text-[11px] font-bold transition shrink-0 ${
                    room.selectedCategories.includes('Todas')
                      ? 'bg-mu text-ink shadow-solid-sm'
                      : 'bg-paper text-suave hover:bg-[#e6dfd1]'
                  } ${!isHost ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                >
                  Todos
                </button>
                {availableCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    disabled={!isHost}
                    onClick={() => toggleCategory(cat)}
                    title={cat}
                    className={`tag-salinha px-2.5 py-1 text-[11px] font-bold transition shrink-0 ${
                      room.selectedCategories.includes(cat)
                        ? 'bg-mu text-ink shadow-solid-sm'
                        : 'bg-paper text-suave hover:bg-[#e6dfd1]'
                    } ${!isHost ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                  >
                    {categoryLabels[cat] || cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. CONTROLES E INPUT DO BUZZER (No meio com Tesoura Animada) */}
          <div className="shrink-0 space-y-2.5 pb-2.5 border-b-2 border-ink/15">
            {room.roundState === 'buzzed' ? (
              <div className="space-y-2.5">
                {isMyBuzz ? (
                  /* SOU EU QUEM CORTOU! MOSTRA INPUT COM 10s */
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-rd font-black text-xs uppercase tracking-wider animate-pulse">
                        <Scissors className="w-4 h-4 text-rd animate-snip" /> VOCÊ CORTOU! DIGITE EM:
                      </div>
                      <span className="bg-rd text-white font-mono text-xs font-black px-2.5 py-0.5 rounded-full border border-ink shadow-solid-sm animate-pulse">
                        {buzzTimeRemaining}s
                      </span>
                    </div>

                    {/* Barrinha de 10s descendo suavemente */}
                    <div className="w-full h-2.5 bg-paper border-2 border-ink rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-rd rounded-full transition-all duration-75 ease-linear"
                        style={{ width: `${buzzPercentRemaining}%` }}
                      />
                    </div>

                    <form onSubmit={handleSubmitAnswer} className="flex gap-2">
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
                        Enviar
                      </button>
                    </form>
                  </>
                ) : (
                  /* UM AMIGO CORTOU! TRAVA A TELA E MOSTRA QUEM ESTÁ RESPONDENDO */
                  <div 
                    style={{ backgroundColor: currentBuzzedPlayer?.color || '#e8673a' }}
                    className="p-3.5 rounded-2xl border-2 border-ink shadow-solid-sm text-white space-y-2 animate-stamp"
                  >
                    <div className="flex items-center justify-between text-xs font-black uppercase">
                      <span className="flex items-center gap-2">
                        <CreatureAvatar config={currentBuzzedPlayer?.avatar} color={currentBuzzedPlayer?.color || '#e8673a'} size={28} />
                        <span className="flex items-center gap-1">
                          <Scissors className="w-4 h-4" /> {currentBuzzedPlayer?.name} CORTOU!
                        </span>
                      </span>
                      <span className="bg-ink text-white px-2 py-0.5 rounded-full text-[10px] font-mono">
                        {buzzTimeRemaining}s restantes
                      </span>
                    </div>
                    <div className="w-full h-2 bg-ink/30 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-75 ease-linear"
                        style={{ width: `${buzzPercentRemaining}%` }}
                      />
                    </div>
                    <p className="text-[11px] font-bold text-white/90">
                      Aguardando a resposta de {currentBuzzedPlayer?.name}... Se ele errar, a pergunta continuará!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* ESTADO NORMAL: BOTÃO CORTAR COM SNIP + INICIAR/PRÓXIMA DO HOST */
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleBuzz}
                  disabled={
                    room.roundState !== 'reading' && room.roundState !== 'ending_countdown' ||
                    myPlayer?.hasBuzzed
                  }
                  className={`btn-salinha group w-full py-3.5 text-xl tracking-wide uppercase transition ${
                    myPlayer?.hasBuzzed
                      ? 'bg-paper text-ink/30 border-ink/30 shadow-none cursor-not-allowed'
                      : room.roundState === 'reading' || room.roundState === 'ending_countdown'
                        ? 'bg-or hover:bg-or-dark text-white shadow-solid cursor-pointer'
                        : 'bg-paper text-ink/30 border-ink/30 shadow-none cursor-not-allowed'
                  }`}
                >
                  <Scissors className="w-5 h-5 mr-1.5 transition-transform duration-200 group-hover:rotate-[-20deg] group-active:scale-125" />
                  {myPlayer?.hasBuzzed ? 'VOCÊ JÁ CORTOU NESTA QUESTÃO' : 'CORTAR!'}
                  {!myPlayer?.hasBuzzed && (
                    <span className="text-[11px] bg-ink text-white px-2 py-0.5 rounded-full ml-2 font-mono">Espaço</span>
                  )}
                </button>

                {/* Controles do Host */}
                {isHost && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        sendRoomAction('start_question');
                      }}
                      disabled={room.roundState === 'revealed'}
                      className={`btn-salinha flex-1 py-2 text-xs cursor-pointer shadow-solid-sm transition-all duration-200 ${
                        room.roundState === 'idle'
                          ? 'animate-pulse-dark text-white font-black ring-2 ring-[#be4318] ring-offset-2'
                          : 'bg-card hover:bg-paper text-ink'
                      }`}
                    >
                      {room.roundState === 'reading' ? (
                        <>
                          <Pause className="w-3.5 h-3.5 mr-1" /> Pausar
                        </>
                      ) : (
                        <>
                          <Play className={`w-3.5 h-3.5 mr-1 ${room.roundState === 'idle' ? 'fill-white' : 'fill-ink'}`} /> Iniciar Leitura
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playPageFlipSound();
                        sendRoomAction('next_question');
                      }}
                      className="btn-salinha flex-1 bg-mu hover:bg-mu-dark text-ink py-2 text-xs cursor-pointer shadow-solid-sm"
                    >
                      Próxima Pergunta <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. GABARITO / LOG DE TENTATIVAS DA RODADA (Com Stamp & Shake) */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col justify-center">
            
            {/* Histórico acumulado de tentativas da rodada (Log de Cortes e Respostas) */}
            {room.roundJudgments && room.roundJudgments.length > 0 && (
              <div className="space-y-1.5 mb-2.5 max-h-40 overflow-y-auto scrollbar-thin pr-1">
                <div className="text-[10px] font-black uppercase text-suave flex items-center justify-between px-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-or" /> Tentativas da Rodada:
                  </span>
                  <span>{room.roundJudgments.length} {room.roundJudgments.length === 1 ? 'corte' : 'cortes'}</span>
                </div>
                {room.roundJudgments.map((j) => (
                  <div
                    key={j.id}
                    className={`p-2 rounded-xl border-2 border-ink shadow-solid-sm flex items-center justify-between text-xs font-black ${
                      j.status === 'correct'
                        ? 'bg-[#d8f3dc] text-[#1b4332] animate-stamp'
                        : 'bg-[#ffccd5] text-[#9f1239] animate-cartoon-shake'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CreatureAvatar config={j.avatar} color={j.playerColor} size={22} className="shrink-0" />
                      <div className="truncate">
                        <span>{j.message}</span>
                        {j.answerGiven && j.answerGiven !== 'Sem resposta' && (
                          <span className="text-[10px] opacity-80 ml-1 font-mono italic">
                            (&quot;{j.answerGiven}&quot;)
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-mono bg-card px-2 py-0.5 rounded-full border border-ink text-ink text-[11px] shrink-0 ml-1.5">
                      {j.points > 0 ? `+${j.points}` : j.points} pts
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Gabarito quando a questão for finalizada */}
            {room.roundState === 'revealed' ? (
              <div className="space-y-2.5 animate-stamp">
                <div className="bg-paper border-2 border-ink rounded-2xl p-3.5 shadow-solid-sm">
                  <div className="text-[10px] uppercase font-black text-suave">
                    Resposta Oficial:
                  </div>
                  <div
                    className="text-lg sm:text-xl font-black text-or mt-0.5"
                    dangerouslySetInnerHTML={{ __html: room.currentQuestion?.formatted_answer_pt || '' }}
                  />

                  {room.currentQuestion?.explanation && (
                    <p className="text-xs text-ink leading-relaxed mt-1.5 line-clamp-3">
                      {room.currentQuestion.explanation}
                    </p>
                  )}

                  {room.currentQuestion?.wiki_url && (
                    <div className="mt-2 flex items-center justify-between">
                      <a
                        href={room.currentQuestion.wiki_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-bl hover:underline"
                      >
                        <BookOpen className="w-3 h-3" /> Ver na Wikipédia <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}
                </div>

                {isHost && (
                  <button
                    onClick={() => {
                      playPageFlipSound();
                      sendRoomAction('next_question');
                    }}
                    className="btn-salinha w-full bg-mu hover:bg-mu-dark text-ink py-2 text-xs uppercase shadow-solid-sm cursor-pointer"
                  >
                    Iniciar Próxima Pergunta →
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-suave text-xs font-medium space-y-1">
                <Sparkles className="w-5 h-5 text-or mx-auto animate-pulse" />
                <p className="font-bold text-ink">Aperte ESPAÇO para cortar a qualquer momento!</p>
                <p className="text-[11px]">Você tem 10s para digitar. Se errar, os amigos podem tentar de rebote.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Pop-up de Dopamina com Confetes e Monstrinho ao Acertar */}
      <DopamineCelebration
        show={showCelebration}
        playerName={room?.lastJudgment?.playerName}
        isMe={room?.lastJudgment?.playerId === playerId}
        isPower={room?.lastJudgment?.points === 15}
        points={room?.lastJudgment?.points || 10}
        avatarConfig={room?.lastJudgment?.avatar}
        playerColor={room?.lastJudgment?.playerColor}
        onDone={() => setShowCelebration(false)}
      />

      {/* Modal para Relatar Bug ao Desenvolvedor */}
      <BugReportModal
        isOpen={bugModalOpen}
        onClose={() => setBugModalOpen(false)}
        context={room ? `Sala ${room.code} (${playerName || playerId})` : 'Multiplayer Sala'}
      />
    </div>
  );
}
