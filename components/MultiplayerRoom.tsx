'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RoomState, RoomPlayer, MULTIPLAYER_COLORS } from '@/lib/multiplayer/types';
import { Tossup } from '@/types/quizbowl';
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
  RotateCcw
} from 'lucide-react';

interface MultiplayerRoomProps {
  initialCode?: string | null;
  onExit: () => void;
}

export default function MultiplayerRoom({ initialCode, onExit }: MultiplayerRoomProps) {
  // Identidade local do jogador
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [playerColor, setPlayerColor] = useState<string>(MULTIPLAYER_COLORS[0].hex);

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

  // Refs e timers
  const answerInputRef = useRef<HTMLInputElement | null>(null);
  const sseRef = useRef<EventSource | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

    if (initialCode) {
      setRoomCodeInput(initialCode.toUpperCase());
      setLobbyMode('join');
    }
  }, [initialCode]);

  // Conecta ao stream SSE e polling de sincronização
  const connectToRoom = useCallback((code: string) => {
    const normalized = code.trim().toUpperCase();

    // Fecha conexão anterior se houver
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
      sse.onerror = () => {
        // Fallback para polling se SSE falhar
      };
      sseRef.current = sse;
    } catch (e) {}

    // 2. Polling de redundância a cada 1.5s para nunca dessincronizar
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

  // Criação de Sala
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setErrorMessage('Digite seu nome/apelido para entrar.');
      return;
    }

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
    sendRoomAction('buzz');
  };

  // Submeter resposta
  const handleSubmitAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!room) return;
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

  // ========================================================
  // TELA 1: LOBBY DE CRIAÇÃO / ENTRADA NA SALA
  // ========================================================
  if (!isInRoom || !room) {
    return (
      <div className="h-full flex flex-col justify-center items-center p-4 max-w-lg mx-auto">
        <div className="w-full card-salinha p-6 sm:p-8 bg-card shadow-solid relative">
          
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
            <button
              onClick={onExit}
              className="text-xs font-bold text-suave hover:text-ink underline"
            >
              Voltar
            </button>
          </div>

          {/* Abas Criar vs Entrar */}
          <div className="flex bg-paper border-2 border-ink rounded-full p-1 mb-5 shadow-solid-sm">
            <button
              type="button"
              onClick={() => setLobbyMode('create')}
              className={`flex-1 py-1.5 text-xs font-black rounded-full transition ${
                lobbyMode === 'create'
                  ? 'bg-or text-white border-2 border-ink shadow-solid-sm'
                  : 'text-suave hover:text-ink'
              }`}
            >
              Criar Nova Sala
            </button>
            <button
              type="button"
              onClick={() => setLobbyMode('join')}
              className={`flex-1 py-1.5 text-xs font-black rounded-full transition ${
                lobbyMode === 'join'
                  ? 'bg-mu text-ink border-2 border-ink shadow-solid-sm'
                  : 'text-suave hover:text-ink'
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
                className="w-full bg-paper border-2 border-ink rounded-xl px-3.5 py-2 text-ink font-bold placeholder-ink/40 focus:outline-none shadow-solid-sm"
                autoFocus
              />
            </div>

            {/* Seletor de Cor do Sticker */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-ink">Sua Cor de Adesivo:</label>
              <div className="flex gap-2 justify-between">
                {MULTIPLAYER_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setPlayerColor(col.hex)}
                    style={{ backgroundColor: col.hex }}
                    className={`w-9 h-9 rounded-full border-2 border-ink transition transform ${
                      playerColor === col.hex ? 'scale-110 shadow-solid-sm ring-2 ring-ink ring-offset-2' : 'hover:scale-105'
                    }`}
                    title={col.name}
                  />
                ))}
              </div>
            </div>

            {/* Código da Sala (apenas no modo entrar) */}
            {lobbyMode === 'join' && (
              <div className="space-y-1.5 pt-1">
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
            )}

            {errorMessage && (
              <div className="bg-[#ffccd5] border-2 border-ink rounded-xl p-2.5 text-xs font-bold text-rd flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn-salinha w-full py-3 text-sm font-black uppercase tracking-wider text-white shadow-solid cursor-pointer mt-2 ${
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
              className="ml-1 p-1 hover:bg-card rounded-md transition text-ink"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-gr" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Jogadores Conectados (Até 6) */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          {room.players.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 border-ink text-xs font-black shadow-solid-sm transition shrink-0 ${
                p.id === playerId ? 'ring-2 ring-ink ring-offset-1' : ''
              }`}
              style={{
                backgroundColor: p.color,
                color: '#ffffff',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
              }}
            >
              {p.isHost && <Crown className="w-3 h-3 text-mu fill-mu shrink-0" />}
              <span className="truncate max-w-[85px]">{p.name}</span>
              <span className="bg-ink/80 text-white px-1.5 py-0.2 rounded-full font-mono text-[10px]">
                {p.score} pts
              </span>
            </div>
          ))}
        </div>

        {/* Botão Sair */}
        <button
          onClick={() => {
            sendRoomAction('leave');
            setIsInRoom(false);
            setRoom(null);
            onExit();
          }}
          className="btn-salinha bg-card hover:bg-[#ffccd5] text-ink px-3 py-1 text-xs font-black shadow-solid-sm cursor-pointer"
        >
          <LogOut className="w-3 h-3 mr-1" /> Sair
        </button>
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

              {/* Corpo da Pergunta com Leitura Sincronizada */}
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
                          className={`inline-block mr-1.5 transition-colors ${
                            isWordPower && room.roundState === 'reading'
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
                  <span className="text-rd font-black animate-pulse flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> 10s FINAIS PARA CORTAR!
                  </span>
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
              {!isHost && (
                <span className="text-[10px] font-bold text-suave bg-paper border border-ink px-2 py-0.5 rounded-full">
                  🔒 Gerenciado pelo Host
                </span>
              )}
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

          {/* 2. CONTROLES E INPUT DO BUZZER (No meio) */}
          <div className="shrink-0 space-y-2.5 pb-2.5 border-b-2 border-ink/15">
            {room.roundState === 'buzzed' ? (
              <div className="space-y-2.5">
                {isMyBuzz ? (
                  /* SOU EU QUEM CORTOU! MOSTRA INPUT COM 10s */
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-rd font-black text-xs uppercase tracking-wider animate-pulse">
                        <Scissors className="w-4 h-4 text-rd" /> VOCÊ CORTOU! DIGITE EM 10s:
                      </div>
                    </div>

                    {/* Barrinha de 10s descendo suavemente */}
                    <div className="w-full h-2.5 bg-paper border-2 border-ink rounded-full overflow-hidden p-0.5">
                      <div className="h-full bg-rd rounded-full transition-all duration-1000 ease-linear animate-[pulse_1s_infinite]" style={{ width: '100%' }} />
                    </div>

                    <form onSubmit={handleSubmitAnswer} className="flex gap-2">
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
                        Enviar
                      </button>
                    </form>
                  </>
                ) : (
                  /* UM AMIGO CORTOU! TRAVA A TELA E MOSTRA QUEM ESTÁ RESPONDENDO */
                  <div 
                    style={{ backgroundColor: currentBuzzedPlayer?.color || '#e8673a' }}
                    className="p-3.5 rounded-2xl border-2 border-ink shadow-solid-sm text-white space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-black uppercase">
                      <span className="flex items-center gap-1.5">
                        <Scissors className="w-4 h-4" /> {currentBuzzedPlayer?.name} CORTOU!
                      </span>
                      <span className="bg-ink text-white px-2 py-0.5 rounded-full text-[10px] font-mono">
                        10 segundos
                      </span>
                    </div>
                    <div className="w-full h-2 bg-ink/30 rounded-full overflow-hidden p-0.5">
                      <div className="h-full bg-white rounded-full animate-pulse" style={{ width: '100%' }} />
                    </div>
                    <p className="text-[11px] font-bold text-white/90">
                      Aguardando a resposta de {currentBuzzedPlayer?.name}... Se ele errar, a pergunta continuará!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* ESTADO NORMAL: BOTÃO CORTAR + INICIAR/PRÓXIMA DO HOST */
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleBuzz}
                  disabled={
                    room.roundState !== 'reading' && room.roundState !== 'ending_countdown' ||
                    myPlayer?.hasBuzzed
                  }
                  className={`btn-salinha w-full py-3.5 text-xl tracking-wide uppercase transition ${
                    myPlayer?.hasBuzzed
                      ? 'bg-paper text-ink/30 border-ink/30 shadow-none cursor-not-allowed'
                      : room.roundState === 'reading' || room.roundState === 'ending_countdown'
                        ? 'bg-or hover:bg-or-dark text-white shadow-solid cursor-pointer'
                        : 'bg-paper text-ink/30 border-ink/30 shadow-none cursor-not-allowed'
                  }`}
                >
                  <Scissors className="w-5 h-5 mr-1.5" />
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
                      onClick={() => sendRoomAction('start_question')}
                      disabled={room.roundState === 'revealed'}
                      className="btn-salinha flex-1 bg-card hover:bg-paper text-ink py-2 text-xs cursor-pointer shadow-solid-sm"
                    >
                      {room.roundState === 'reading' ? (
                        <>
                          <Pause className="w-3.5 h-3.5 mr-1" /> Pausar
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 mr-1 fill-ink" /> Iniciar Leitura
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => sendRoomAction('next_question')}
                      className="btn-salinha flex-1 bg-mu hover:bg-mu-dark text-ink py-2 text-xs cursor-pointer shadow-solid-sm"
                    >
                      Próxima Pergunta <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. GABARITO / FEEDBACK DE ACERTO E ERRO (Na base) */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col justify-center">
            
            {/* Flash do Último Julgamento (Erro ou Acerto) */}
            {room.lastJudgment && (
              <div
                className={`p-3 rounded-2xl border-2 border-ink shadow-solid-sm mb-2 flex items-center justify-between text-xs font-black ${
                  room.lastJudgment.status === 'correct'
                    ? 'bg-[#d8f3dc] text-[#1b4332]'
                    : 'bg-[#ffccd5] text-[#9f1239]'
                }`}
              >
                <span>{room.lastJudgment.message}</span>
                <span className="font-mono bg-card px-2 py-0.5 rounded-full border border-ink text-ink">
                  {room.lastJudgment.points > 0 ? `+${room.lastJudgment.points}` : room.lastJudgment.points} pts
                </span>
              </div>
            )}

            {/* Gabarito quando a questão for finalizada */}
            {room.roundState === 'revealed' ? (
              <div className="space-y-2.5">
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
                    onClick={() => sendRoomAction('next_question')}
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
    </div>
  );
}
