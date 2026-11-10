'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import { playClickSound } from '@/lib/sfx';

interface MultiplayerKickedScreenProps {
  onBackToHome: () => void;
}

export default function MultiplayerKickedScreen({ onBackToHome }: MultiplayerKickedScreenProps) {
  return (
    <div className="h-full flex flex-col justify-center items-center p-4 max-w-md mx-auto">
      <div className="w-full card-salinha p-6 bg-card shadow-solid text-center space-y-4 animate-cartoon-shake">
        <div className="w-14 h-14 bg-[#ffccd5] border-2 border-ink rounded-full mx-auto flex items-center justify-center shadow-solid-sm">
          <LogOut className="w-6 h-6 text-rd" />
        </div>
        <div>
          <h2 className="font-serif font-black text-xl text-ink">Você foi removido da sala</h2>
          <p className="text-xs font-bold text-suave mt-1">O host da sala encerrou sua participação.</p>
        </div>
        <button
          onClick={() => {
            playClickSound();
            onBackToHome();
          }}
          className="btn-salinha w-full py-2.5 bg-or hover:bg-or-dark text-white text-xs uppercase font-black shadow-solid cursor-pointer"
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
}
