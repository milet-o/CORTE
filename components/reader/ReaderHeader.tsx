'use client';

import React from 'react';
import { Flame, Bug, Calendar, Infinity as InfinityIcon, Users } from 'lucide-react';
import { PlayerStats } from '@/types/quizbowl';
import { playClickSound } from '@/lib/sfx';

interface ReaderHeaderProps {
  isMounted: boolean;
  streakCount: number;
  gameMode: 'daily' | 'unlimited' | 'multiplayer';
  stats: PlayerStats;
  onSelectMode: (mode: 'daily' | 'unlimited' | 'multiplayer') => void;
  onOpenBugModal: () => void;
}

export default function ReaderHeader({
  isMounted,
  streakCount,
  gameMode,
  stats,
  onSelectMode,
  onOpenBugModal,
}: ReaderHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b-2 border-ink/15 pb-2.5 mb-3 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="font-serif font-black text-3xl sm:text-4xl tracking-tight text-ink flex items-center">
          corte<span className="text-or">.</span>
        </h1>
        <span className="bg-creme border-2 border-ink px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider text-ink shadow-solid-sm flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-or fill-or animate-pulse" />
          {isMounted ? streakCount : 0} {streakCount === 1 ? 'dia' : 'dias'}
        </span>
        <button
          type="button"
          onClick={onOpenBugModal}
          className="btn-salinha bg-card hover:bg-[#ffccd5] text-ink px-2 py-0.5 rounded-full text-[10px] font-bold shadow-solid-sm flex items-center gap-1 cursor-pointer"
          title="Relatar um bug para o desenvolvedor"
        >
          <Bug className="w-3 h-3 text-rd" />
          <span className="hidden sm:inline">Relatar Bug</span>
        </button>
      </div>

      {/* Chave Seletora de Modo (Diário vs Ilimitado vs Amigos) com SLIDER DESLIZANTE */}
      <div className="flex items-center gap-3">
        {gameMode === 'unlimited' && (
          <div className="hidden md:flex items-center gap-2 bg-card border-2 border-ink rounded-full px-3 py-1 shadow-solid-sm text-xs font-bold text-ink">
            <span>
              Pts: <strong className="text-gr-dark">{stats.score}</strong>
            </span>
            <span className="text-ink/30">&bull;</span>
            <span>
              15s: <strong className="text-mu-dark">{stats.powers}</strong>
            </span>
            <span className="text-ink/30">&bull;</span>
            <span>
              10s: <strong>{stats.tens}</strong>
            </span>
            <span className="text-ink/30">&bull;</span>
            <span>
              -5s: <strong className="text-rd">{stats.negs}</strong>
            </span>
          </div>
        )}

        <div className="relative flex items-center bg-card border-[2.5px] border-ink rounded-full p-0.5 shadow-solid-sm select-none w-[310px] sm:w-[340px]">
          <div
            className={`absolute top-0.5 bottom-0.5 w-[calc(33.333%-2px)] rounded-full border-2 border-ink shadow-solid-sm transition-transform duration-250 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              gameMode === 'daily'
                ? 'translate-x-0 bg-or'
                : gameMode === 'unlimited'
                  ? 'translate-x-[100%] bg-mu'
                  : 'translate-x-[200%] bg-bl'
            }`}
          />
          <button
            onClick={() => {
              playClickSound();
              onSelectMode('daily');
            }}
            className={`relative z-10 flex-1 btn-salinha py-1 px-1 text-xs font-black transition-colors duration-200 border-none shadow-none hover:bg-transparent text-center justify-center ${
              gameMode === 'daily' ? 'text-white' : 'text-ink'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 mr-1 shrink-0" />
            Diário
          </button>
          <button
            onClick={() => {
              playClickSound();
              onSelectMode('unlimited');
            }}
            className="relative z-10 flex-1 btn-salinha py-1 px-1 text-xs font-black transition-colors duration-200 border-none shadow-none hover:bg-transparent text-center justify-center text-ink"
          >
            <InfinityIcon className="w-3.5 h-3.5 mr-1 shrink-0" />
            Ilimitado
          </button>
          <button
            onClick={() => {
              playClickSound();
              onSelectMode('multiplayer');
            }}
            className="relative z-10 flex-1 btn-salinha py-1 px-1 text-xs font-black transition-colors duration-200 border-none shadow-none hover:bg-transparent text-center justify-center text-ink"
          >
            <Users className="w-3.5 h-3.5 mr-1 shrink-0" />
            Amigos
          </button>
        </div>
      </div>
    </header>
  );
}
