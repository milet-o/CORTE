'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bug, ArrowLeft, RefreshCw, Trash2, Clock, User, Layers } from 'lucide-react';
import { BugReport } from '@/app/api/bugs/route';

export default function BugsAdminPage() {
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchBugs = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/bugs');
      const data = await res.json();
      if (data.bugs) {
        setBugs(data.bugs);
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Erro ao carregar bugs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBugs();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/bugs?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBugs(prev => prev.filter(b => b.id !== id));
      }
    } catch (e) {}
  };

  return (
    <main className="min-h-screen bg-bg p-4 sm:p-8 flex flex-col max-w-4xl mx-auto select-none">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b-2 border-ink/20">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 bg-paper border-2 border-ink rounded-full shadow-solid-sm hover:scale-105 transition-transform"
            title="Voltar ao jogo"
          >
            <ArrowLeft className="w-5 h-5 text-ink" />
          </Link>
          <div>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-ink flex items-center gap-2">
              <Bug className="w-7 h-7 text-or" /> Central de Bugs
            </h1>
            <p className="text-xs font-bold text-suave">
              Relatórios enviados diretamente pelos jogadores ({bugs.length} {bugs.length === 1 ? 'relato' : 'relatos'})
            </p>
          </div>
        </div>

        <button
          onClick={fetchBugs}
          disabled={isLoading}
          className="btn-salinha bg-card hover:bg-paper text-ink px-3 py-1.5 text-xs font-bold shadow-solid-sm flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </header>

      {/* Conteúdo */}
      <div className="flex-1 space-y-4">
        {isLoading && bugs.length === 0 ? (
          <div className="text-center py-20 text-suave font-bold">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-or" />
            Carregando relatos...
          </div>
        ) : bugs.length === 0 ? (
          <div className="card-salinha bg-card p-12 text-center shadow-solid space-y-3">
            <div className="w-16 h-16 bg-[#d8f3dc] border-2 border-ink rounded-full mx-auto flex items-center justify-center shadow-solid-sm">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="font-serif font-black text-xl text-ink">Nenhum bug relatado!</h3>
            <p className="text-xs font-bold text-suave max-w-sm mx-auto">
              Tudo parece estar funcionando nos trilhos. Novos relatos de jogadores aparecerão nesta tela.
            </p>
          </div>
        ) : (
          bugs.map((b) => {
            const dateStr = new Date(b.createdAt).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={b.id}
                className="card-salinha bg-card p-4 sm:p-5 shadow-solid border-2 border-ink space-y-3 animate-fade-in relative group"
              >
                {/* Topo do Card de Bug */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink/10 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-mu border-2 border-ink rounded-full px-2.5 py-0.5 text-[11px] font-black text-ink shadow-solid-sm flex items-center gap-1">
                      <User className="w-3 h-3" /> {b.reporter}
                    </span>
                    <span className="bg-paper border border-ink/40 rounded-full px-2 py-0.5 text-[10px] font-bold text-suave flex items-center gap-1">
                      <Layers className="w-2.5 h-2.5 text-or" /> {b.context}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-suave font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {dateStr}
                    </span>

                    <button
                      onClick={() => handleDelete(b.id)}
                      title="Deletar este bug após resolver"
                      className="p-1 hover:bg-[#ffccd5] rounded-md text-suave hover:text-rd transition active:scale-90"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Descrição do que aconteceu */}
                <p className="text-sm font-bold text-ink leading-relaxed whitespace-pre-wrap bg-paper p-3 rounded-xl border border-ink/20">
                  {b.description}
                </p>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
