'use client';

import React from 'react';
import { Calendar, Zap, Play, Clock } from 'lucide-react';
import { Tossup } from '@/types/quizbowl';
import { playClickSound } from '@/lib/sfx';

interface QuestionDisplayProps {
  currentQuestion: Tossup | null;
  gameMode: 'daily' | 'unlimited' | 'multiplayer';
  dailyDayIndex?: number;
  unlimitedIndex: number;
  unlimitedTotal: number;
  isPowerEligible: boolean;
  status: 'idle' | 'reading' | 'buzzed' | 'ending_countdown' | 'judged' | 'revealed';
  currentWordIndex: number;
  words: string[];
  powerWordIndex: number;
  buzzedAtWordIndex: number | null;
  endCountdownRemaining: number;
  onResetFilters: () => void;
}

function getDifficultyBadge(diff: number) {
  if (diff <= 1) return { label: 'Fácil', bg: 'bg-[#d8f3dc] text-[#1b4332]' };
  if (diff === 2) return { label: 'Média', bg: 'bg-[#fff4dc] text-[#b45309]' };
  return { label: 'Difícil', bg: 'bg-[#ffccd5] text-[#9f1239]' };
}

export default function QuestionDisplay({
  currentQuestion,
  gameMode,
  dailyDayIndex,
  unlimitedIndex,
  unlimitedTotal,
  isPowerEligible,
  status,
  currentWordIndex,
  words,
  powerWordIndex,
  buzzedAtWordIndex,
  endCountdownRemaining,
  onResetFilters,
}: QuestionDisplayProps) {
  return (
    <div className="lg:col-span-7 h-full flex flex-col justify-between card-salinha p-5 sm:p-7 relative overflow-hidden bg-card">
      {currentQuestion ? (
        <>
          {/* Topo do Card com Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b-2 border-ink/15 shrink-0">
            <div className="flex items-center gap-2">
              {gameMode === 'daily' ? (
                <span className="bg-or text-white border-2 border-ink text-[11px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-solid-sm flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  CORTE DO DIA #{dailyDayIndex}
                </span>
              ) : (
                <span className="bg-creme border-2 border-ink text-ink text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow-solid-sm">
                  #{unlimitedIndex + 1} de {unlimitedTotal}
                </span>
              )}

              <span className="bg-paper border-2 border-ink text-[11px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-solid-sm">
                {currentQuestion.category}
              </span>

              {(() => {
                const badge = getDifficultyBadge(currentQuestion.difficulty);
                return (
                  <span
                    className={`border-2 border-ink text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow-solid-sm ${badge.bg}`}
                  >
                    {badge.label}
                  </span>
                );
              })()}
            </div>

            {/* Badge de Power */}
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

          {/* Corpo da Pergunta com Leitura Dinâmica e Efeito Fade-In Suave */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 text-xl sm:text-2xl lg:text-[1.65rem] leading-relaxed sm:leading-loose text-ink font-normal flex flex-col justify-center">
            {status === 'idle' && currentWordIndex === 0 ? (
              <div className="text-suave font-serif italic flex items-center gap-2.5 text-lg sm:text-xl py-4">
                <Play className="w-5 h-5 text-or fill-or animate-bounce shrink-0" />
                Pressione <strong>&quot;Iniciar&quot;</strong> na lateral ou use a tecla{' '}
                <strong>Espaço</strong> para cortar...
              </div>
            ) : (
              <div>
                {words.map((word, idx) => {
                  const isRevealed =
                    idx < currentWordIndex || status === 'revealed' || status === 'judged';
                  const isWordPower = idx <= powerWordIndex;
                  const isBuzzedHere = idx === buzzedAtWordIndex;
                  const isReadingHead = idx === currentWordIndex - 1 && status === 'reading';

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
                        isWordPower ? 'text-ink font-semibold' : 'text-ink'
                      } ${
                        isBuzzedHere
                          ? 'bg-rd text-white px-1.5 py-0.5 rounded-md border-2 border-ink font-bold shadow-solid-sm animate-stamp'
                          : ''
                      }`}
                    >
                      {word}
                      {isReadingHead && (
                        <span className="inline-block w-2 h-6 bg-or ml-1 rounded-full align-middle cursor-leitura" />
                      )}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Base do Card: Barra de Progresso e 10s Finais */}
          <div className="pt-3 mt-2 border-t-2 border-ink/15 flex items-center justify-between text-xs font-bold text-suave shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <span>Leitura:</span>
              <div className="w-32 sm:w-48 h-2.5 bg-paper border-2 border-ink rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-150 ${
                    isPowerEligible ? 'bg-mu' : 'bg-gr'
                  }`}
                  style={{
                    width: `${Math.min(100, (currentWordIndex / (words.length || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {status === 'ending_countdown' ? (
              <div className="flex items-center gap-2 text-rd font-black animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                <span>{endCountdownRemaining}s FINAIS PARA CORTAR!</span>
                <div className="w-20 h-2 bg-paper border border-ink rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-rd rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${(endCountdownRemaining / 10) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <span>
                {currentWordIndex}/{words.length} palavras
              </span>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-suave font-bold">
            Nenhuma pergunta encontrada com os filtros selecionados.
          </p>
          <button
            onClick={() => {
              playClickSound();
              onResetFilters();
            }}
            className="btn-salinha mt-3 bg-mu text-ink px-4 py-2 text-xs font-bold cursor-pointer shadow-solid-sm"
          >
            Resetar Filtros
          </button>
        </div>
      )}
    </div>
  );
}
