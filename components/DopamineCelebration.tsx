'use client';

import React, { useEffect, useState, useRef } from 'react';
import CreatureAvatar, { CreatureConfig } from '@/components/CreatureAvatar';
import { Sparkles, Zap, Award } from 'lucide-react';

interface DopamineCelebrationProps {
  show: boolean;
  playerName?: string;
  isMe?: boolean;
  isPower?: boolean;
  points?: number;
  avatarConfig?: CreatureConfig | null;
  playerColor?: string;
  onDone?: () => void;
}

export default function DopamineCelebration({
  show,
  playerName,
  isMe = true,
  isPower = false,
  points = 10,
  avatarConfig,
  playerColor = '#e8673a',
  onDone,
}: DopamineCelebrationProps) {
  const [visible, setVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!show) {
      setVisible(false);
      setIsFadingOut(false);
      return;
    }

    setVisible(true);
    setIsFadingOut(false);

    // Inicia fade-out aos 1.5s
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1500);

    // Encerra completamente aos 2.0s
    const closeTimer = setTimeout(() => {
      setVisible(false);
      setIsFadingOut(false);
      onDoneRef.current?.();
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(closeTimer);
    };
  }, [show]);

  if (!visible) return null;

  return (
    <div
      onClick={() => {
        setVisible(false);
        setIsFadingOut(false);
        onDoneRef.current?.();
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden bg-black/30 backdrop-blur-[2px] transition-all duration-500 cursor-pointer ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 animate-fade-in scale-100'
      }`}
    >
      {/* 1. Confetes Geométricos de Papel Picado (Estilo Kenney / Paper craft) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 28 }).map((_, i) => {
          const colors = ['#e8673a', '#f2b84b', '#3e9b6f', '#4f7fd0', '#ec4899', '#8b5cf6'];
          const color = colors[i % colors.length];
          const left = 10 + (i * 3.1) % 80;
          const animDelay = (i * 0.05).toFixed(2);
          const size = 10 + (i % 4) * 4;
          const isCircle = i % 3 === 0;

          return (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 pointer-events-none border-2 border-ink"
              style={{
                width: `${size}px`,
                height: isCircle ? `${size}px` : `${size * 1.4}px`,
                backgroundColor: color,
                borderRadius: isCircle ? '50%' : '4px',
                transform: `translate(-50%, -50%) rotate(${i * 37}deg)`,
                animation: `confetti-pop 1.6s cubic-bezier(0.25, 1, 0.5, 1) ${animDelay}s forwards`,
                left: `${left}%`,
                top: `${40 + (i % 5) * 6}%`,
              }}
            />
          );
        })}
      </div>

      {/* 2. Placa Central de Dopamina (Carimbo Gigante com Fade Out) */}
      <div
        className={`relative card-salinha bg-card p-6 sm:p-8 max-w-sm sm:max-w-md w-full text-center shadow-solid border-4 border-ink space-y-4 transition-all duration-400 ${
          isFadingOut ? 'scale-90 opacity-0 translate-y-3' : 'animate-stamp scale-100 opacity-100'
        }`}
      >
        {/* Monstrinho com animação ou Ícone com raio */}
        <div className="flex justify-center items-center">
          {avatarConfig ? (
            <div className="p-3 bg-paper border-3 border-ink rounded-3xl shadow-solid inline-block animate-bounce">
              <CreatureAvatar config={avatarConfig} color={playerColor} size={96} />
            </div>
          ) : (
            <div className="w-20 h-20 bg-mu border-3 border-ink rounded-3xl shadow-solid flex items-center justify-center animate-bounce">
              <Award className="w-10 h-10 text-ink fill-ink" />
            </div>
          )}
        </div>

        {/* Título Explosivo */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-mu border-2 border-ink rounded-full text-xs font-black uppercase text-ink shadow-solid-sm animate-pulse">
            {isPower ? (
              <>
                <Zap className="w-4 h-4 fill-ink" /> CORTE NO POWER!
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-or" /> CORTE PERFEITO!
              </>
            )}
          </div>

          <h2 className="font-serif font-black text-3xl sm:text-4xl text-ink uppercase tracking-tight">
            {isMe ? 'VOCÊ ACERTOU!' : `${playerName} ACERTOU!`}
          </h2>

          <div className="text-xl sm:text-2xl font-black font-mono text-or pt-1">
            +{points} PONTOS
          </div>
        </div>

        <p className="text-xs font-bold text-suave">
          {isMe ? 'Precisão impecável no corte!' : 'Ponto garantido na rodada!'}
        </p>
      </div>

      {/* CSS inline para o efeito explosivo de confetes */}
      <style jsx>{`
        @keyframes confetti-pop {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.2) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: translate(calc(-50% + ${(Math.random() - 0.5) * 200}px), calc(-50% - 140px)) scale(1.1) rotate(180deg);
          }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + ${(Math.random() - 0.5) * 350}px), calc(-50% + 180px)) scale(0.9) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
