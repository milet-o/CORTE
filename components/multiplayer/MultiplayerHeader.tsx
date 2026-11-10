'use client';

import React from 'react';
import { Copy, Check, Crown, Bug, LogOut } from 'lucide-react';
import { RoomState } from '@/lib/multiplayer/types';
import CreatureAvatar from '@/components/CreatureAvatar';
import { playClickSound, playWrongSound } from '@/lib/sfx';

interface MultiplayerHeaderProps {
  room: RoomState;
  playerId: string;
  isHost: boolean;
  copiedLink: boolean;
  onCopyLink: () => void;
  onKickPlayer: (targetPlayerId: string) => void;
  onOpenBugModal: () => void;
  onLeaveRoom: () => void;
}

export default function MultiplayerHeader({
  room,
  playerId,
  isHost,
  copiedLink,
  onCopyLink,
  onKickPlayer,
  onOpenBugModal,
  onLeaveRoom,
}: MultiplayerHeaderProps) {
  return (
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
            onClick={onCopyLink}
            title="Copiar link da sala para enviar aos amigos"
            className="ml-1 p-1 hover:bg-card rounded-md transition text-ink active:scale-90"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-gr" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Jogadores Conectados (Até 6 sem barra de rolagem e sem truncar) */}
      <div className="flex flex-wrap items-center gap-1.5 overflow-visible">
        {room.players.map((p) => {
          const badge = (() => {
            if (room.players.length < 2) return null;
            const maxScore = Math.max(...room.players.map((x) => x.score));
            if (p.score > 0 && p.score === maxScore) return { emoji: '✂️', label: 'Tesoura de Ouro (Líder)' };
            const maxPowers = Math.max(...room.players.map((x) => x.powers));
            if (p.powers > 0 && p.powers === maxPowers) return { emoji: '⚡', label: 'Sniper do Power' };
            const maxNegs = Math.max(...room.players.map((x) => x.negs));
            if (p.negs > 0 && p.negs === maxNegs) return { emoji: '💣', label: 'Inimigo do Gabarito' };
            return null;
          })();

          return (
            <div
              key={p.id}
              className={`flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full border-2 border-ink text-xs font-black shadow-solid-sm transition-transform duration-200 shrink-0 ${
                p.id === playerId ? 'ring-2 ring-ink ring-offset-1 scale-105' : ''
              }`}
              style={{
                backgroundColor: p.color,
                color: '#ffffff',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              <CreatureAvatar config={p.avatar} color={p.color} size={22} className="shrink-0 -my-1" />
              {p.isHost && <Crown className="w-3.5 h-3.5 text-mu fill-mu shrink-0 animate-bounce" />}
              <span>{p.name}</span>
              {badge && (
                <span
                  className="text-[11px] px-1 py-0.2 bg-black/40 rounded border border-white/20 cursor-help"
                  title={badge.label}
                >
                  {badge.emoji}
                </span>
              )}
              <span className="bg-ink/75 text-white px-2 py-0.5 rounded-full font-mono text-[10px] ml-0.5">
                {p.score} pts
              </span>
              {isHost && p.id !== playerId && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playWrongSound();
                    onKickPlayer(p.id);
                  }}
                  title={`Expulsar ${p.name} da sala`}
                  className="w-4 h-4 rounded-full bg-ink/40 hover:bg-rd text-white flex items-center justify-center text-[11px] ml-0.5 transition-colors leading-none font-bold cursor-pointer"
                >
                  &times;
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenBugModal}
          className="btn-salinha bg-card hover:bg-[#ffccd5] text-ink px-2.5 py-1 text-xs font-bold shadow-solid-sm flex items-center gap-1 cursor-pointer"
          title="Relatar bug para o desenvolvedor"
        >
          <Bug className="w-3.5 h-3.5 text-rd" />
          <span className="hidden sm:inline">Bug</span>
        </button>

        {/* Botão Sair */}
        <button
          onClick={() => {
            playClickSound();
            onLeaveRoom();
          }}
          className="btn-salinha bg-card hover:bg-[#ffccd5] text-ink px-3 py-1 text-xs font-black shadow-solid-sm cursor-pointer"
        >
          <LogOut className="w-3 h-3 mr-1" /> Sair
        </button>
      </div>
    </header>
  );
}
