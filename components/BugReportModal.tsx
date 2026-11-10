'use client';

import React, { useState, useEffect } from 'react';
import { Bug, X, Send, Heart, CheckCircle2 } from 'lucide-react';
import { playClickSound, playCorrectSound } from '@/lib/sfx';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string; // ex: 'Modo Diário', 'Modo Ilimitado', 'Sala BRASA'
}

export default function BugReportModal({ isOpen, onClose, context = 'Geral' }: BugReportModalProps) {
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setErrorMessage(null);
      setDescription('');
      setReporterName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage('Por favor, descreva o que aconteceu.');
      return;
    }

    playClickSound();
    setIsSending(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          reporter: reporterName.trim() || 'Anônimo',
          context: context,
        }),
      });

      if (!res.ok) {
        throw new Error('Falha ao enviar relatório.');
      }

      playCorrectSound();
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao conectar.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-fade-in select-none">
      <div className="card-salinha bg-card p-6 sm:p-7 max-w-md w-full shadow-solid border-3 border-ink relative animate-stamp">
        
        {/* Botão Fechar no canto */}
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="absolute top-4 right-4 p-1 rounded-full text-suave hover:text-ink hover:bg-paper transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* Tela de Sucesso: Obrigado <3 */
          <div className="py-8 text-center space-y-3 animate-stamp">
            <div className="w-16 h-16 bg-[#ffd1dc] border-2 border-ink rounded-full mx-auto flex items-center justify-center shadow-solid-sm animate-bounce">
              <Heart className="w-8 h-8 text-[#e0463a] fill-[#e0463a]" />
            </div>
            <h3 className="font-serif font-black text-2xl text-ink">
              obrigado &lt;3
            </h3>
            <p className="text-xs font-bold text-suave max-w-xs mx-auto">
              Seu relato foi enviado diretamente para o desenvolvedor. Já estou investigando!
            </p>
          </div>
        ) : (
          /* Formulário de Relato de Bug */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b-2 border-ink/15">
              <span className="p-2 bg-mu border-2 border-ink rounded-full shadow-solid-sm">
                <Bug className="w-5 h-5 text-ink" />
              </span>
              <div>
                <h3 className="font-serif font-black text-xl text-ink">Relatar um Bug</h3>
                <p className="text-[11px] font-bold text-suave">Encontrou um erro ou algo esquisito?</p>
              </div>
            </div>

            {/* Seu Nome */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase text-ink">Seu Nome / Nick (Opcional):</label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                maxLength={30}
                placeholder="Ex: Anônimo, Jogador, etc."
                className="w-full bg-paper border-2 border-ink rounded-xl px-3 py-1.5 text-xs text-ink font-bold placeholder-ink/40 focus:outline-none shadow-solid-sm"
              />
            </div>

            {/* Descrição do Bug */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase text-ink">O que aconteceu?</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Explique o que aconteceu, se algum botão travou ou algo ficou estranho..."
                className="w-full bg-paper border-2 border-ink rounded-xl p-3 text-xs text-ink font-bold placeholder-ink/40 focus:outline-none shadow-solid-sm resize-none"
                autoFocus
              />
            </div>

            {errorMessage && (
              <p className="text-xs font-bold text-rd">{errorMessage}</p>
            )}

            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-[10px] font-bold text-suave font-mono">
                Contexto: {context}
              </span>

              <button
                type="submit"
                disabled={isSending}
                className="btn-salinha bg-or hover:bg-or-dark text-white px-4 py-2 text-xs font-black uppercase tracking-wider shadow-solid-sm cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {isSending ? 'Enviando...' : 'Relatar para o Dev'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
