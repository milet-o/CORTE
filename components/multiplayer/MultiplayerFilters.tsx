'use client';

import React from 'react';
import { Layers, Clock, Gauge, Sparkles } from 'lucide-react';
import { RoomState } from '@/lib/multiplayer/types';

const AVAILABLE_CATEGORIES = [
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
  'Linguística',
];

const CATEGORY_LABELS: Record<string, string> = {
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

const AVAILABLE_DIFFICULTIES = [
  { label: 'Fácil', key: 'easy' },
  { label: 'Média', key: 'medium' },
  { label: 'Difícil', key: 'hard' },
];

interface MultiplayerFiltersProps {
  room: RoomState;
  isHost: boolean;
  matchingQuestionsCount: number;
  onSetSpeed: (wpm: number) => void;
  onToggleDifficulty: (diffKey: string) => void;
  onToggleCategory: (category: string) => void;
}

export default function MultiplayerFilters({
  room,
  isHost,
  matchingQuestionsCount,
  onSetSpeed,
  onToggleDifficulty,
  onToggleCategory,
}: MultiplayerFiltersProps) {
  return (
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
              (room.wpm || 240) === 180
                ? 'w-[calc(33.333%-2px)] translate-x-0'
                : (room.wpm || 240) === 240
                  ? 'w-[calc(33.333%-2px)] translate-x-[100%]'
                  : 'w-[calc(33.333%-2px)] translate-x-[200%]'
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
              onClick={() => onSetSpeed(spd.val)}
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
            onClick={() => onToggleDifficulty('Qualquer')}
            className={`tag-salinha px-2.5 py-1 text-[11px] font-bold transition shrink-0 ${
              room.selectedDifficulties.includes('Qualquer')
                ? 'bg-mu text-ink shadow-solid-sm'
                : 'bg-paper text-suave hover:bg-[#e6dfd1]'
            } ${!isHost ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
          >
            Qualquer
          </button>
          {AVAILABLE_DIFFICULTIES.map((diff) => (
            <button
              key={diff.key}
              type="button"
              disabled={!isHost}
              onClick={() => onToggleDifficulty(diff.key)}
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
            onClick={() => onToggleCategory('Todas')}
            className={`tag-salinha px-2.5 py-1 text-[11px] font-bold transition shrink-0 ${
              room.selectedCategories.includes('Todas')
                ? 'bg-mu text-ink shadow-solid-sm'
                : 'bg-paper text-suave hover:bg-[#e6dfd1]'
            } ${!isHost ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
          >
            Todos
          </button>
          {AVAILABLE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              disabled={!isHost}
              onClick={() => onToggleCategory(cat)}
              title={cat}
              className={`tag-salinha px-2.5 py-1 text-[11px] font-bold transition shrink-0 ${
                room.selectedCategories.includes(cat)
                  ? 'bg-mu text-ink shadow-solid-sm'
                  : 'bg-paper text-suave hover:bg-[#e6dfd1]'
              } ${!isHost ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
