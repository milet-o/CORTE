import { Tossup } from '@/types/quizbowl';
import { RoomPlayer, RoomState, MULTIPLAYER_COLORS } from './types';
import { judgeAnswer } from '@/lib/judge';
import fs from 'fs';
import path from 'path';

// Carrega o banco de perguntas para uso no multiplayer no servidor
let cachedQuestions: Tossup[] = [];
function getQuestionsPool(): Tossup[] {
  if (cachedQuestions.length > 0) return cachedQuestions;
  const filePath = path.resolve(process.cwd(), 'data/questions.json');
  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      cachedQuestions = JSON.parse(data);
    } catch (e) {
      console.error('Erro ao ler perguntas:', e);
    }
  }
  return cachedQuestions;
}

// Gera código de 5 letras memorável e único
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
  }
  return code;
}

// Global store para persistir em memória no Node.js
type RoomStore = Map<string, RoomState>;
type ListenerMap = Map<string, Set<(room: RoomState) => void>>;

declare global {
  // eslint-disable-next-line no-var
  var __corte_rooms: RoomStore | undefined;
  // eslint-disable-next-line no-var
  var __corte_room_listeners: ListenerMap | undefined;
  // eslint-disable-next-line no-var
  var __corte_tick_interval: NodeJS.Timeout | undefined;
}

if (!globalThis.__corte_rooms) {
  globalThis.__corte_rooms = new Map();
}
if (!globalThis.__corte_room_listeners) {
  globalThis.__corte_room_listeners = new Map();
}

const rooms = globalThis.__corte_rooms;
const listeners = globalThis.__corte_room_listeners;

function broadcastRoom(room: RoomState) {
  const set = listeners.get(room.code);
  if (set) {
    set.forEach((fn) => {
      try {
        fn(room);
      } catch (e) {}
    });
  }
}

function pickRandomQuestion(categories: string[], difficulties: string[]): Tossup | null {
  const pool = getQuestionsPool();
  if (pool.length === 0) return null;

  let filtered = [...pool];

  // Filtro de temas
  if (!categories.includes('Todas') && categories.length > 0) {
    filtered = filtered.filter(q => categories.includes(q.category));
  }

  // Filtro de dificuldades
  if (!difficulties.includes('Qualquer') && difficulties.length > 0) {
    filtered = filtered.filter(q => {
      return difficulties.some(diffKey => {
        if (diffKey === 'easy') return q.difficulty <= 1;
        if (diffKey === 'medium') return q.difficulty === 2;
        if (diffKey === 'hard') return q.difficulty >= 3;
        return false;
      });
    });
  }

  if (filtered.length === 0) filtered = pool;
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}

function computePowerWordIndex(question: Tossup | null): number {
  if (!question) return -1;
  const rawWords = question.question_pt.split(/\s+/).filter(Boolean);
  let starIdx = -1;
  let count = 0;
  for (let i = 0; i < rawWords.length; i++) {
    if (rawWords[i].includes('(*)')) {
      starIdx = count;
      break;
    }
    count++;
  }
  return starIdx !== -1 ? starIdx : Math.floor(rawWords.length * 0.45);
}

export function createRoom(
  hostName: string, 
  hostColor: string, 
  hostId: string, 
  avatar?: { body: number; eyes: number; mouth: number }
): RoomState {
  let code = generateRoomCode();
  while (rooms.has(code)) {
    code = generateRoomCode();
  }

  const initialQuestion = pickRandomQuestion(['Todas'], ['Qualquer']);
  const powerIndex = computePowerWordIndex(initialQuestion);

  const hostPlayer: RoomPlayer = {
    id: hostId,
    name: hostName.trim().slice(0, 14) || 'Host',
    color: hostColor || MULTIPLAYER_COLORS[0].hex,
    avatar: avatar || { body: 0, eyes: 0, mouth: 0 },
    isHost: true,
    score: 0,
    powers: 0,
    tens: 0,
    negs: 0,
    hasBuzzed: false,
    lastActive: Date.now(),
  };

  const room: RoomState = {
    code,
    createdAt: Date.now(),
    hostId,
    players: [hostPlayer],
    maxPlayers: 6,
    selectedCategories: ['Todas'],
    selectedDifficulties: ['Qualquer'],
    wpm: 240,
    currentQuestion: initialQuestion,
    questionNumber: 1,
    roundState: 'idle',
    currentWordIndex: 0,
    powerWordIndex: powerIndex,
    buzzedPlayerId: null,
    buzzStartTime: null,
    buzzDurationSeconds: 10,
    endCountdownStartTime: null,
    endCountdownDurationSeconds: 10,
    lastJudgment: null,
  };

  rooms.set(code, room);
  return room;
}

export function getRoom(code: string): RoomState | null {
  const normalized = code.trim().toUpperCase();
  return rooms.get(normalized) || null;
}

export function joinRoom(
  code: string, 
  playerName: string, 
  playerColor: string, 
  playerId: string,
  avatar?: { body: number; eyes: number; mouth: number }
): { success: boolean; room?: RoomState; error?: string } {
  const room = getRoom(code);
  if (!room) return { success: false, error: 'Sala não encontrada.' };

  const existing = room.players.find(p => p.id === playerId);
  if (existing) {
    existing.name = playerName.trim().slice(0, 14) || existing.name;
    existing.color = playerColor || existing.color;
    if (avatar) existing.avatar = avatar;
    existing.lastActive = Date.now();
    broadcastRoom(room);
    return { success: true, room };
  }

  if (room.players.length >= room.maxPlayers) {
    return { success: false, error: 'A sala já atingiu a capacidade máxima de 6 jogadores.' };
  }

  const newPlayer: RoomPlayer = {
    id: playerId,
    name: playerName.trim().slice(0, 14) || `Jogador ${room.players.length + 1}`,
    color: playerColor || MULTIPLAYER_COLORS[room.players.length % MULTIPLAYER_COLORS.length].hex,
    avatar: avatar || { body: Math.floor(Math.random() * 5), eyes: Math.floor(Math.random() * 5), mouth: Math.floor(Math.random() * 5) },
    isHost: room.players.length === 0,
    score: 0,
    powers: 0,
    tens: 0,
    negs: 0,
    hasBuzzed: false,
    lastActive: Date.now(),
  };

  room.players.push(newPlayer);
  broadcastRoom(room);
  return { success: true, room };
}

export function updatePlayerAvatar(
  code: string,
  playerId: string,
  avatar: { body: number; eyes: number; mouth: number }
): RoomState | null {
  const room = getRoom(code);
  if (!room) return null;
  const player = room.players.find(p => p.id === playerId);
  if (player) {
    player.avatar = avatar;
    broadcastRoom(room);
  }
  return room;
}

export function leaveRoom(code: string, playerId: string): RoomState | null {
  const room = getRoom(code);
  if (!room) return null;

  room.players = room.players.filter(p => p.id !== playerId);

  if (room.players.length === 0) {
    rooms.delete(room.code);
    listeners.delete(room.code);
    return null;
  }

  // Se o host saiu, passa a liderança para o próximo jogador
  if (room.hostId === playerId) {
    room.players[0].isHost = true;
    room.hostId = room.players[0].id;
  }

  broadcastRoom(room);
  return room;
}

export function kickPlayer(code: string, hostId: string, targetPlayerId: string): { success: boolean; room?: RoomState; error?: string } {
  const room = getRoom(code);
  if (!room) return { success: false, error: 'Sala não encontrada.' };
  if (room.hostId !== hostId) return { success: false, error: 'Apenas o host pode expulsar jogadores.' };
  if (targetPlayerId === hostId) return { success: false, error: 'O host não pode expulsar a si mesmo.' };

  const targetIndex = room.players.findIndex(p => p.id === targetPlayerId);
  if (targetIndex === -1) return { success: false, error: 'Jogador não encontrado na sala.' };

  room.players.splice(targetIndex, 1);

  // Se o jogador expulso era quem estava cortando no momento, cancela o buzz e retoma a leitura
  if (room.buzzedPlayerId === targetPlayerId) {
    room.buzzedPlayerId = null;
    room.buzzStartTime = null;
    const words = room.currentQuestion ? room.currentQuestion.question_pt.split(/\s+/).filter(Boolean) : [];
    if (room.currentWordIndex < words.length) {
      room.roundState = 'reading';
    } else {
      room.roundState = 'ending_countdown';
      room.endCountdownStartTime = Date.now();
    }
  }

  broadcastRoom(room);
  return { success: true, room };
}

export function updateFilters(code: string, hostId: string, categories: string[], difficulties: string[], wpm?: number): RoomState | null {
  const room = getRoom(code);
  if (!room || room.hostId !== hostId) return null;

  room.selectedCategories = categories;
  room.selectedDifficulties = difficulties;
  if (wpm) room.wpm = wpm;

  broadcastRoom(room);
  return room;
}

export function startQuestion(code: string, hostId: string): RoomState | null {
  const room = getRoom(code);
  if (!room || room.hostId !== hostId) return null;

  if (room.roundState === 'idle') {
    room.roundState = 'reading';
    room.lastJudgment = null;
    broadcastRoom(room);
  } else if (room.roundState === 'reading') {
    // Pausar
    room.roundState = 'idle';
    broadcastRoom(room);
  }

  return room;
}

export function nextQuestion(code: string, hostId: string): RoomState | null {
  const room = getRoom(code);
  if (!room || room.hostId !== hostId) return null;

  const nextQ = pickRandomQuestion(room.selectedCategories, room.selectedDifficulties);
  room.currentQuestion = nextQ;
  room.powerWordIndex = computePowerWordIndex(nextQ);
  room.currentWordIndex = 0;
  room.questionNumber += 1;
  room.roundState = 'idle';
  room.buzzedPlayerId = null;
  room.buzzStartTime = null;
  room.endCountdownStartTime = null;
  room.lastJudgment = null;

  // Libera todos os jogadores para cortar na nova pergunta
  room.players.forEach(p => {
    p.hasBuzzed = false;
  });

  broadcastRoom(room);
  return room;
}

export function buzz(code: string, playerId: string): { success: boolean; room?: RoomState; error?: string } {
  const room = getRoom(code);
  if (!room) return { success: false, error: 'Sala não encontrada.' };

  // Só pode cortar se estiver lendo ou nos 10s finais da pergunta
  if (room.roundState !== 'reading' && room.roundState !== 'ending_countdown') {
    return { success: false, error: 'Não é possível cortar agora.' };
  }

  const player = room.players.find(p => p.id === playerId);
  if (!player) return { success: false, error: 'Jogador não encontrado.' };

  // Jogador já errou nesta pergunta?
  if (player.hasBuzzed) {
    return { success: false, error: 'Você já cortou e errou nesta pergunta.' };
  }

  // Registra corte
  room.roundState = 'buzzed';
  room.buzzedPlayerId = playerId;
  room.buzzStartTime = Date.now();
  player.hasBuzzed = true;

  broadcastRoom(room);
  return { success: true, room };
}

export function submitAnswer(code: string, playerId: string, answer: string, timedOut = false): RoomState | null {
  const room = getRoom(code);
  if (!room || room.roundState !== 'buzzed' || room.buzzedPlayerId !== playerId) return null;

  const player = room.players.find(p => p.id === playerId);
  if (!player || !room.currentQuestion) return null;

  const isPower = room.powerWordIndex !== -1 && room.currentWordIndex <= room.powerWordIndex;
  const isInterrupted = room.currentWordIndex < (room.currentQuestion.question_pt.split(/\s+/).length);

  const answerToEval = timedOut ? '' : answer;
  const result = judgeAnswer(answerToEval, room.currentQuestion, {
    isPower,
    interrupted: isInterrupted,
  });

  const isCorrect = result.status === 'correct';

  if (isCorrect) {
    // Acertou: ganha os pontos (+15 ou +10) e a rodada se encerra com o gabarito
    player.score += result.points;
    if (result.points === 15) player.powers += 1;
    else player.tens += 1;

    room.lastJudgment = {
      playerId: player.id,
      playerName: player.name,
      status: 'correct',
      message: `${player.name} acertou! (+${result.points} pts)`,
      points: result.points,
      answerGiven: answerToEval,
      timestamp: Date.now(),
    };

    room.roundState = 'revealed';
    room.buzzedPlayerId = null;
    room.buzzStartTime = null;
  } else {
    // Errou: perde -5 pts (se interrompeu) ou 0 pts (se no fim)
    player.score += result.points;
    if (result.points < 0) player.negs += 1;

    room.lastJudgment = {
      playerId: player.id,
      playerName: player.name,
      status: 'incorrect',
      message: `${player.name} errou! (${result.points} pts)`,
      points: result.points,
      answerGiven: answerToEval || 'Sem resposta',
      timestamp: Date.now(),
    };

    room.buzzedPlayerId = null;
    room.buzzStartTime = null;

    // Retoma a leitura da pergunta para os outros jogadores que ainda não cortaram
    const words = room.currentQuestion.question_pt.split(/\s+/).filter(Boolean);
    if (room.currentWordIndex < words.length) {
      room.roundState = 'reading';
    } else {
      // Se já estava no fim das palavras, volta aos 10s finais
      room.roundState = 'ending_countdown';
      room.endCountdownStartTime = Date.now();
    }
  }

  broadcastRoom(room);
  return room;
}

export function subscribeToRoom(code: string, listener: (room: RoomState) => void): () => void {
  const normalized = code.trim().toUpperCase();
  if (!listeners.has(normalized)) {
    listeners.set(normalized, new Set());
  }
  const set = listeners.get(normalized)!;
  set.add(listener);

  return () => {
    set.delete(listener);
    if (set.size === 0) {
      listeners.delete(normalized);
    }
  };
}

// Global Room Tick Timer: avança leitura de perguntas ativas e expira cortes de 10s
if (!globalThis.__corte_tick_interval) {
  globalThis.__corte_tick_interval = setInterval(() => {
    const now = Date.now();

    rooms.forEach((room) => {
      // 1. Corte expirado (10 segundos)
      if (room.roundState === 'buzzed' && room.buzzStartTime) {
        const elapsedSeconds = (now - room.buzzStartTime) / 1000;
        if (elapsedSeconds >= (room.buzzDurationSeconds || 10)) {
          if (room.buzzedPlayerId) {
            submitAnswer(room.code, room.buzzedPlayerId, '', true);
          }
        }
        return;
      }

      // 2. Leitura palavra por palavra respeitando o WPM da sala
      if (room.roundState === 'reading' && room.currentQuestion) {
        const wordIntervalMs = Math.round((60 / (room.wpm || 240)) * 1000);
        if (!room.lastWordTimestamp || (now - room.lastWordTimestamp) >= wordIntervalMs) {
          room.lastWordTimestamp = now;
          const words = room.currentQuestion.question_pt.split(/\s+/).filter(Boolean);
          room.currentWordIndex += 1;

          if (room.currentWordIndex >= words.length) {
            // Fim do texto da pergunta: entra nos 10 segundos finais para corte
            room.roundState = 'ending_countdown';
            room.endCountdownStartTime = now;
          }

          broadcastRoom(room);
          return;
        }
      }

      // 3. Contagem final de 10 segundos após leitura completa
      if (room.roundState === 'ending_countdown' && room.endCountdownStartTime) {
        const elapsed = (now - room.endCountdownStartTime) / 1000;
        if (elapsed >= (room.endCountdownDurationSeconds || 10)) {
          // Ninguém cortou nos 10s finais: revela gabarito automaticamente
          room.roundState = 'revealed';
          room.endCountdownStartTime = null;
          broadcastRoom(room);
        }
      }
    });
  }, 50); // Tick a cada 50ms para precisão de timing
}
