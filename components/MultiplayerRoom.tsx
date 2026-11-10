'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { RoomState, MULTIPLAYER_COLORS } from '@/lib/multiplayer/types';
import { Tossup } from '@/types/quizbowl';
import { CreatureConfig, DEFAULT_CREATURE, getRandomCreature } from '@/components/CreatureAvatar';
import DopamineCelebration from '@/components/DopamineCelebration';
import BugReportModal from '@/components/BugReportModal';
import { markQuestionSeen } from '@/lib/storage';
import MultiplayerLobby from '@/components/multiplayer/MultiplayerLobby';
import MultiplayerHeader from '@/components/multiplayer/MultiplayerHeader';
import MultiplayerQuestionBox from '@/components/multiplayer/MultiplayerQuestionBox';
import MultiplayerFilters from '@/components/multiplayer/MultiplayerFilters';
import MultiplayerControls from '@/components/multiplayer/MultiplayerControls';
import MultiplayerKickedScreen from '@/components/multiplayer/MultiplayerKickedScreen';
import {
  playClickSound,
  playCutSound,
  playCorrectSound,
  playWrongSound,
  playTickSound,
  playPlayerJoinSound,
  playGameStartSound,
  playStampSound,
} from '@/lib/sfx';

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
      const myPlayer = room.players.find((p) => p.id === playerId);
      const canIBuzz = myPlayer && !myPlayer.hasBuzzed;

      const update = () => {
        const now = Date.now();
        const elapsedMs = now - startTime;
        const remainingMs = Math.max(0, totalMs - elapsedMs);
        const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
        const percent = Math.min(100, Math.max(0, (remainingMs / totalMs) * 100));

        setEndCountdownRemaining(remainingSec);
        setEndCountdownPercentRemaining(percent);

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

      // Marca a questão atual como vista no perfil local do jogador
      if (room.currentQuestion?.id) {
        markQuestionSeen(room.currentQuestion.id);
      }
    }
  }, [room?.players.length, room?.currentQuestion?.id]);

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
            const me = room.players.find((p) => p.id === playerId);
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
  const currentPlayer = room?.players.find((p) => p.id === playerId);
  const isHost = Boolean(currentPlayer?.isHost || room?.hostId === playerId);
  const currentBuzzedPlayer = room?.players.find((p) => p.id === room?.buzzedPlayerId);

  // Alternar filtros (apenas Host)
  const toggleCategory = (cat: string) => {
    if (!isHost || !room) return;
    playClickSound();
    let nextCats: string[];
    if (cat === 'Todas') {
      nextCats = ['Todas'];
    } else {
      const filtered = room.selectedCategories.filter((c) => c !== 'Todas');
      if (filtered.includes(cat)) {
        nextCats = filtered.filter((c) => c !== cat);
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
      const filtered = room.selectedDifficulties.filter((d) => d !== 'Qualquer');
      if (filtered.includes(diffKey)) {
        nextDiffs = filtered.filter((d) => d !== diffKey);
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
    return initialQuestions.filter((q) => {
      const matchCat =
        room.selectedCategories.includes('Todas') || room.selectedCategories.includes(q.category);
      const matchDiff =
        room.selectedDifficulties.includes('Qualquer') ||
        room.selectedDifficulties.some((diffKey) => {
          if (diffKey === 'easy') return q.difficulty <= 1;
          if (diffKey === 'medium') return q.difficulty === 2;
          if (diffKey === 'hard') return q.difficulty >= 3;
          return false;
        });
      return matchCat && matchDiff;
    }).length;
  }, [initialQuestions, room?.selectedCategories, room?.selectedDifficulties]);

  // 1. TELA DE EXPULSO DA SALA (Caso o host tenha removido)
  if (isInRoom && room && !room.players.some((p) => p.id === playerId)) {
    return (
      <MultiplayerKickedScreen
        onBackToHome={() => {
          setIsInRoom(false);
          setRoom(null);
          onExit();
        }}
      />
    );
  }

  // 2. TELA DE LOBBY (Criação / Entrada na Sala)
  if (!isInRoom || !room) {
    return (
      <div className="h-full flex flex-col justify-center items-center p-4 max-w-lg mx-auto">
        <MultiplayerLobby
          lobbyMode={lobbyMode}
          setLobbyMode={setLobbyMode}
          playerName={playerName}
          setPlayerName={setPlayerName}
          playerColor={playerColor}
          setPlayerColor={setPlayerColor}
          playerAvatar={playerAvatar}
          setPlayerAvatar={setPlayerAvatar}
          roomCodeInput={roomCodeInput}
          setRoomCodeInput={setRoomCodeInput}
          errorMessage={errorMessage}
          isSubmitting={isSubmitting}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onOpenBugModal={() => setBugModalOpen(true)}
          onExit={onExit}
        />

        <BugReportModal
          isOpen={bugModalOpen}
          onClose={() => setBugModalOpen(false)}
          context="Multiplayer Lobby"
        />
      </div>
    );
  }

  // 3. TELA DE SALA MULTIPLAYER ATIVA (Layout 2 Colunas)
  const words = room.currentQuestion
    ? room.currentQuestion.question_pt.split(/\s+/).filter(Boolean)
    : [];
  const myPlayer = room.players.find((p) => p.id === playerId);
  const isPower = room.powerWordIndex !== -1 && room.currentWordIndex <= room.powerWordIndex;

  return (
    <div className="h-full flex flex-col justify-between p-3 sm:p-5 max-w-[1650px] mx-auto select-none">
      <MultiplayerHeader
        room={room}
        playerId={playerId}
        isHost={isHost}
        copiedLink={copiedLink}
        onCopyLink={handleCopyLink}
        onKickPlayer={(targetPlayerId) => sendRoomAction('kick_player', { targetPlayerId })}
        onOpenBugModal={() => setBugModalOpen(true)}
        onLeaveRoom={() => {
          sendRoomAction('leave');
          setIsInRoom(false);
          setRoom(null);
          onExit();
        }}
      />

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 overflow-hidden">
        <MultiplayerQuestionBox
          room={room}
          isHost={isHost}
          isPower={isPower}
          words={words}
          endCountdownRemaining={endCountdownRemaining}
          endCountdownPercentRemaining={endCountdownPercentRemaining}
        />

        <div className="lg:col-span-5 h-full flex flex-col justify-between gap-3 card-salinha p-4 sm:p-5 overflow-hidden bg-card">
          <MultiplayerFilters
            room={room}
            isHost={isHost}
            matchingQuestionsCount={matchingQuestionsCount}
            onSetSpeed={setSpeed}
            onToggleDifficulty={toggleDifficulty}
            onToggleCategory={toggleCategory}
          />

          <MultiplayerControls
            room={room}
            isHost={isHost}
            isMyBuzz={isMyBuzz}
            myPlayer={myPlayer}
            currentBuzzedPlayer={currentBuzzedPlayer}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            buzzTimeRemaining={buzzTimeRemaining}
            buzzPercentRemaining={buzzPercentRemaining}
            answerInputRef={answerInputRef}
            onBuzz={handleBuzz}
            onSubmitAnswer={handleSubmitAnswer}
            onStartOrPauseQuestion={() => sendRoomAction('start_question')}
            onNextQuestion={() => sendRoomAction('next_question')}
          />
        </div>
      </div>

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

      <BugReportModal
        isOpen={bugModalOpen}
        onClose={() => setBugModalOpen(false)}
        context={room ? `Sala ${room.code} (${playerName || playerId})` : 'Multiplayer Sala'}
      />
    </div>
  );
}
