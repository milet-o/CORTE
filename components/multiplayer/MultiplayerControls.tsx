'use client';

import React from 'react';
import {
  Scissors,
  Play,
  Pause,
  ChevronRight,
  Clock,
  BookOpen,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { RoomState, RoomPlayer } from '@/lib/multiplayer/types';
import CreatureAvatar from '@/components/CreatureAvatar';
import { playClickSound, playPageFlipSound } from '@/lib/sfx';

interface MultiplayerControlsProps {
  room: RoomState;
  isHost: boolean;
  isMyBuzz: boolean;
  myPlayer?: RoomPlayer;
  currentBuzzedPlayer?: RoomPlayer;
  userAnswer: string;
  setUserAnswer: (val: string) => void;
  buzzTimeRemaining: number;
  buzzPercentRemaining: number;
  answerInputRef: React.RefObject<HTMLInputElement | null>;
  onBuzz: () => void;
  onSubmitAnswer: (e?: React.FormEvent) => void;
  onStartOrPauseQuestion: () => void;
  onNextQuestion: () => void;
}

export default function MultiplayerControls({
  room,
  isHost,
  isMyBuzz,
  myPlayer,
  currentBuzzedPlayer,
  userAnswer,
  setUserAnswer,
  buzzTimeRemaining,
  buzzPercentRemaining,
  answerInputRef,
  onBuzz,
  onSubmitAnswer,
  onStartOrPauseQuestion,
  onNextQuestion,
}: MultiplayerControlsProps) {
  return (
    <>
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

                <form onSubmit={onSubmitAnswer} className="flex gap-2">
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
                    <CreatureAvatar
                      config={currentBuzzedPlayer?.avatar}
                      color={currentBuzzedPlayer?.color || '#e8673a'}
                      size={28}
                    />
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
              onClick={onBuzz}
              disabled={
                (room.roundState !== 'reading' && room.roundState !== 'ending_countdown') ||
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
                <span className="text-[11px] bg-ink text-white px-2 py-0.5 rounded-full ml-2 font-mono">
                  Espaço
                </span>
              )}
            </button>

            {/* Controles do Host */}
            {isHost && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    onStartOrPauseQuestion();
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
                      <Play
                        className={`w-3.5 h-3.5 mr-1 ${
                          room.roundState === 'idle' ? 'fill-white' : 'fill-ink'
                        }`}
                      />{' '}
                      Iniciar Leitura
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playPageFlipSound();
                    onNextQuestion();
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
              <span>
                {room.roundJudgments.length}{' '}
                {room.roundJudgments.length === 1 ? 'corte' : 'cortes'}
              </span>
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
              <div className="text-[10px] uppercase font-black text-suave">Resposta Oficial:</div>
              <div
                className="text-lg sm:text-xl font-black text-or mt-0.5"
                dangerouslySetInnerHTML={{
                  __html: room.currentQuestion?.formatted_answer_pt || '',
                }}
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
                  onNextQuestion();
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
            <p className="text-[11px]">
              Você tem 10s para digitar. Se errar, os amigos podem tentar de rebote.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
