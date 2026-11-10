'use client';

import React from 'react';
import { Users, Sparkles, Dices, AlertTriangle, Bug } from 'lucide-react';
import { MULTIPLAYER_COLORS } from '@/lib/multiplayer/types';
import CreatureAvatar, { CreatureConfig, getRandomCreature, HAT_NAMES } from '@/components/CreatureAvatar';
import { playClickSound } from '@/lib/sfx';

interface MultiplayerLobbyProps {
  lobbyMode: 'create' | 'join';
  setLobbyMode: (mode: 'create' | 'join') => void;
  playerName: string;
  setPlayerName: (name: string) => void;
  playerColor: string;
  setPlayerColor: (color: string) => void;
  playerAvatar: CreatureConfig;
  setPlayerAvatar: React.Dispatch<React.SetStateAction<CreatureConfig>>;
  roomCodeInput: string;
  setRoomCodeInput: (code: string) => void;
  errorMessage: string | null;
  isSubmitting: boolean;
  onCreateRoom: (e: React.FormEvent) => void;
  onJoinRoom: (e: React.FormEvent) => void;
  onOpenBugModal: () => void;
  onExit: () => void;
}

export default function MultiplayerLobby({
  lobbyMode,
  setLobbyMode,
  playerName,
  setPlayerName,
  playerColor,
  setPlayerColor,
  playerAvatar,
  setPlayerAvatar,
  roomCodeInput,
  setRoomCodeInput,
  errorMessage,
  isSubmitting,
  onCreateRoom,
  onJoinRoom,
  onOpenBugModal,
  onExit,
}: MultiplayerLobbyProps) {
  const randomizeAvatar = () => {
    playClickSound();
    const next = getRandomCreature();
    setPlayerAvatar(next);
    localStorage.setItem('corte_player_avatar', JSON.stringify(next));
  };

  return (
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
            onClick={onOpenBugModal}
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
          className="relative z-10 flex-1 py-1.5 text-xs font-black transition-colors duration-200 text-center text-ink"
        >
          Entrar com Código
        </button>
      </div>

      <form onSubmit={lobbyMode === 'create' ? onCreateRoom : onJoinRoom} className="space-y-4">
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
              onClick={randomizeAvatar}
              className="btn-salinha bg-card hover:bg-[#e6dfd1] text-ink px-2.5 py-1 text-[11px] font-bold shadow-solid-sm cursor-pointer flex items-center gap-1 active:scale-95 transition-transform"
            >
              <Dices className="w-3.5 h-3.5 text-or" /> Sortear Monstrinho
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 pt-0.5">
            {/* Visualizador do Monstrinho */}
            <div
              className="p-2 bg-card border-2 border-ink rounded-2xl shadow-solid-sm flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform shrink-0"
              onClick={randomizeAvatar}
              title="Clique para sortear outra combinação!"
            >
              <CreatureAvatar config={playerAvatar} color={playerColor} size={68} />
            </div>

            {/* Seletores rápidos de partes (Corpo, Olhos, Boca, Chapéu) */}
            <div className="flex-1 flex flex-col gap-1 text-[11px] font-black">
              <div className="flex items-center justify-between gap-1">
                <span className="text-suave">Corpo:</span>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setPlayerAvatar((prev) => {
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
                    setPlayerAvatar((prev) => {
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
                    setPlayerAvatar((prev) => {
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
                    setPlayerAvatar((prev) => {
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
  );
}
