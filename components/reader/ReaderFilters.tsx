'use client';

import React from 'react';
import { Layers, Clock, Gauge, Sparkles } from 'lucide-react';
import { playClickSound } from '@/lib/sfx';

export const AVAILABLE_CATEGORIES = [
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

export const CATEGORY_LABELS: Record<string, string> = {
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

export const AVAILABLE_DIFFICULTIES = [
  { label: 'Fácil', key: 'easy', match: (d: number) => d <= 1 },
  { label: 'Média', key: 'medium', match: (d: number) => d === 2 },
  { label: 'Difícil', key: 'hard', match: (d: number) => d >= 3 },
];

interface ReaderFiltersProps {
  questionsCount: number;
  wpm: number;
  setWpm: (val: number) => void;
  selectedDifficulties: string[];
  selectedCategories: string[];
  onToggleDifficulty: (diffKey: string) => void;
  onToggleCategory: (cat: string) => void;
}

export default function ReaderFilters({
  questionsCount,
  wpm,
  setWpm,
  selectedDifficulties,
  selectedCategories,
  onToggleDifficulty,
  onToggleCategory,
}: ReaderFiltersProps) {
  return (
    <div className="shrink-0 space-y-2 pb-2.5 border-b-2 border-ink/15">
      {/* Contador Dinâmico de Questões Disponíveis */}
      <div className="flex items-center justify-between text-xs font-black text-ink">
        <span className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-or" /> Filtros Ativos:
        </span>
        <span className="bg-creme border border-ink px-2 py-0.5 rounded-full text-[11px] shadow-solid-sm transition-transform active:scale-95">
          {questionsCount} questões encontradas
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
              wpm === 180
                ? 'w-[calc(33.333%-2px)] translate-x-0'
                : wpm === 240
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
            onClick={() => onToggleDifficulty('Qualquer')}
            className={`tag-salinha px-2.5 py-1 text-[11px] font-bold transition shrink-0 ${
              selectedDifficulties.includes('Qualquer')
                ? 'bg-mu text-ink shadow-solid-sm'
                : 'bg-paper text-suave hover:bg-[#e6dfd1]'
            }`}
          >
            Qualquer
          </button>
          {AVAILABLE_DIFFICULTIES.map((diff) => (
            <button
              key={diff.key}
              onClick={() => onToggleDifficulty(diff.key)}
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
            onClick={() => onToggleCategory('Todas')}
            className={`tag-salinha px-2.5 py-1 text-[11px] font-bold transition shrink-0 ${
              selectedCategories.includes('Todas')
                ? 'bg-mu text-ink shadow-solid-sm'
                : 'bg-paper text-suave hover:bg-[#e6dfd1]'
            }`}
          >
            Todos
          </button>
          {AVAILABLE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onToggleCategory(cat)}
              title={cat}
              className={`tag-salinha px-2.5 py-1 text-[11px] font-bold transition shrink-0 ${
                selectedCategories.includes(cat)
                  ? 'bg-mu text-ink shadow-solid-sm'
                  : 'bg-paper text-suave hover:bg-[#e6dfd1]'
              }`}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
