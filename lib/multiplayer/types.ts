import { Tossup, JudgmentResult } from '@/types/quizbowl';

export interface RoomPlayer {
  id: string;
  name: string;
  color: string; // hex
  isHost: boolean;
  score: number;
  powers: number;
  tens: number;
  negs: number;
  hasBuzzed: boolean;
  lastActive: number;
}

export type RoundState = 
  | 'idle' 
  | 'reading' 
  | 'buzzed' 
  | 'ending_countdown' 
  | 'revealed';

export interface RoomState {
  code: string;
  createdAt: number;
  hostId: string;
  players: RoomPlayer[];
  maxPlayers: number;
  
  // Filtros geridos pelo Host
  selectedCategories: string[];
  selectedDifficulties: string[];
  wpm: number;
  
  // Questão atual
  currentQuestion: Tossup | null;
  questionNumber: number;
  
  // Estado da rodada
  roundState: RoundState;
  currentWordIndex: number;
  powerWordIndex: number;
  
  // Corte ativo
  buzzedPlayerId: string | null;
  buzzStartTime: number | null; // ms
  buzzDurationSeconds: number; // 10s
  
  // Contagem final de 10s após fim da leitura
  endCountdownStartTime: number | null; // ms
  endCountdownDurationSeconds: number; // 10s
  
  // Último veredito para flash de acerto/erro
  lastJudgment: {
    playerId: string;
    playerName: string;
    status: 'correct' | 'incorrect';
    message: string;
    points: number;
    answerGiven: string;
    timestamp: number;
  } | null;
}

export const MULTIPLAYER_COLORS = [
  { name: 'Laranja', hex: '#e8673a', textHex: '#ffffff' },
  { name: 'Mostarda', hex: '#f2b84b', textHex: '#1d1714' },
  { name: 'Verde', hex: '#3e9b6f', textHex: '#ffffff' },
  { name: 'Azul', hex: '#4f7fd0', textHex: '#ffffff' },
  { name: 'Vermelho', hex: '#e0463a', textHex: '#ffffff' },
  { name: 'Roxo', hex: '#8b5cf6', textHex: '#ffffff' },
];
