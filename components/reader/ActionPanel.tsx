'use client';

import React from 'react';
import {
  Scissors,
  Clock,
  AlertTriangle,
  Pause,
  Play,
  ChevronRight,
  CheckCircle2,
  XCircle,
  BookOpen,
  ExternalLink,
  Check,
  Share2,
  RotateCcw,
  Timer,
  Eye,
  Sparkles,
} from 'lucide-react';
import { Tossup, JudgmentResult } from '@/types/quizbowl';
import { DailyResult } from '@/lib/daily';
import { playClickSound } from '@/lib/sfx';

interface ActionPanelProps {
  gameMode: 'daily' | 'unlimited' | 'multiplayer';
  status: 'idle' | 'reading' | 'buzzed' | 'ending_countdown' | 'judged' | 'revealed';
  hasBuzzedThisQuestion: boolean;
  measuredCutPercent: number;
  measuredCutTimeMs: number;
  buzzTimeRemaining: number;
  promptMessage: string | null;
  userAnswer: string;
  setUserAnswer: (val: string) => void;
  answerInputRef: React.RefObject<HTMLInputElement | null>;
  judgment: JudgmentResult | null;
  currentQuestion: Tossup | null;
  dailyResult: DailyResult | null;
  copiedShare: boolean;
  streakCount: number;
  timeUntilTomorrow: string;
  onBuzz: () => void;
  onSubmitAnswer: () => void;
  onToggleReading: () => void;
  onRevealAnswer: () => void;
  onNextUnlimitedQuestion: () => void;
  onCopyShare: () => void;
  onResetDaily: () => void;
  onSwitchToUnlimited: () => void;
}

export default function ActionPanel({
  gameMode,
  status,
  hasBuzzedThisQuestion,
  measuredCutPercent,
  measuredCutTimeMs,
  buzzTimeRemaining,
  promptMessage,
  userAnswer,
  setUserAnswer,
  answerInputRef,
  judgment,
  currentQuestion,
  dailyResult,
  copiedShare,
  streakCount,
  timeUntilTomorrow,
  onBuzz,
  onSubmitAnswer,
  onToggleReading,
  onRevealAnswer,
  onNextUnlimitedQuestion,
  onCopyShare,
  onResetDaily,
  onSwitchToUnlimited,
}: ActionPanelProps) {
  return (
    <>
      {/* OS CONTROLES COM TESOURA ANIMADA E RESPOSTA */}
      <div className="shrink-0 space-y-2.5 pb-2.5 border-b-2 border-ink/15">
        {status === 'buzzed' ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-rd font-black text-xs uppercase tracking-wider animate-pulse">
                <Scissors className="w-4 h-4 text-rd animate-snip" />
                CORTADO AOS {measuredCutPercent}% ({measuredCutTimeMs} ms)!
              </div>
              <div className="flex items-center gap-1 font-mono text-sm font-black text-ink bg-mu border-2 border-ink px-2.5 py-0.5 rounded-full shadow-solid-sm">
                <Clock className="w-3.5 h-3.5" /> {buzzTimeRemaining}s
              </div>
            </div>

            {/* BARRINHA DE TEMPO DE 10s DESCENDO SUAVEMENTE */}
            <div className="w-full h-2.5 bg-paper border-2 border-ink rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-rd rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(buzzTimeRemaining / 10) * 100}%` }}
              />
            </div>

            {promptMessage && (
              <div className="bg-creme border-2 border-ink text-ink p-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-solid-sm animate-cartoon-shake">
                <AlertTriangle className="w-4 h-4 text-or shrink-0" />
                <span>{promptMessage}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                playClickSound();
                onSubmitAnswer();
              }}
              className="flex gap-2"
            >
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
                Confirmar
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Botão de CORTAR com Animação de Tesoura */}
            <button
              onClick={onBuzz}
              disabled={status === 'judged' || status === 'revealed' || hasBuzzedThisQuestion}
              className={`btn-salinha group w-full py-3.5 text-xl tracking-wide uppercase transition ${
                hasBuzzedThisQuestion
                  ? 'bg-paper text-ink/30 border-ink/30 shadow-none cursor-not-allowed'
                  : status === 'judged' || status === 'revealed'
                    ? 'bg-paper text-ink/30 border-ink/30 shadow-none cursor-not-allowed'
                    : 'bg-or hover:bg-or-dark text-white shadow-solid cursor-pointer'
              }`}
            >
              <Scissors className="w-5 h-5 mr-1.5 transition-transform duration-200 group-hover:rotate-[-20deg] group-active:scale-125" />
              {hasBuzzedThisQuestion ? 'VOCÊ JÁ CORTOU NESTA QUESTÃO' : 'CORTAR!'}
              {!hasBuzzedThisQuestion && (
                <span className="text-[11px] bg-ink text-white px-2 py-0.5 rounded-full ml-2 font-mono">
                  Espaço
                </span>
              )}
            </button>

            {/* Linha com Iniciar, Gabarito e Próxima */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleReading}
                disabled={status === 'judged' || status === 'revealed'}
                className="btn-salinha flex-1 bg-card hover:bg-paper text-ink py-2 text-xs cursor-pointer shadow-solid-sm"
              >
                {status === 'reading' ? (
                  <>
                    <Pause className="w-3.5 h-3.5 mr-1" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-1 fill-ink" /> Iniciar
                  </>
                )}
              </button>

              <button
                onClick={onRevealAnswer}
                className="btn-salinha px-3.5 bg-paper hover:bg-[#e4ddce] text-ink py-2 text-xs cursor-pointer shadow-solid-sm"
              >
                Gabarito
              </button>

              {gameMode === 'unlimited' && (
                <button
                  onClick={onNextUnlimitedQuestion}
                  className="btn-salinha flex-1 bg-mu hover:bg-mu-dark text-ink py-2 text-xs cursor-pointer shadow-solid-sm"
                >
                  Próxima <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SEÇÃO DO GABARITO / RESPOSTA CERTA COM STAMP E SHAKE */}
      <div
        className={`flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col ${
          gameMode === 'daily' ? 'justify-end pb-1' : 'justify-center'
        }`}
      >
        {/* Flash do Juiz (Acerto com Stamp ou Erro com Cartoon Shake) */}
        {judgment && (
          <div
            className={`p-3 rounded-2xl border-2 border-ink shadow-solid-sm flex items-start gap-2.5 mb-2.5 ${
              judgment.status === 'correct'
                ? judgment.points === 15
                  ? 'bg-mu animate-stamp'
                  : 'bg-[#d8f3dc] animate-stamp'
                : 'bg-[#ffccd5] animate-cartoon-shake'
            }`}
          >
            {judgment.status === 'correct' ? (
              <CheckCircle2 className="w-5 h-5 text-ink shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rd shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <div className="font-black text-sm flex items-center justify-between text-ink">
                <span>{judgment.message}</span>
                <span className="font-mono text-sm font-black px-2 py-0.5 rounded-full bg-card border border-ink">
                  {judgment.points > 0 ? `+${judgment.points}` : judgment.points} pts
                </span>
              </div>
              {measuredCutTimeMs > 0 && (
                <p className="text-[11px] font-bold text-ink/80 mt-0.5">
                  ⏱️ Reação: <strong>{measuredCutTimeMs} ms</strong> &bull; Cortou aos{' '}
                  <strong>{measuredCutPercent}%</strong>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Caso 1: Pergunta foi finalizada ou gabarito revelado */}
        {status === 'judged' || status === 'revealed' ? (
          <div className="space-y-2.5 animate-stamp">
            {/* Resposta Correta Oficial */}
            <div className="bg-paper border-2 border-ink rounded-2xl p-3 shadow-solid-sm">
              <div className="text-[10px] uppercase font-black text-suave">Resposta Correta:</div>
              <div
                className="text-lg sm:text-xl font-black text-or mt-0.5"
                dangerouslySetInnerHTML={{ __html: currentQuestion?.formatted_answer_pt || '' }}
              />

              {currentQuestion?.explanation && (
                <p className="text-xs text-ink leading-relaxed mt-1.5 line-clamp-3">
                  {currentQuestion.explanation}
                </p>
              )}

              {currentQuestion?.wiki_url && (
                <div className="mt-2 flex items-center justify-between">
                  <a
                    href={currentQuestion.wiki_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-bl hover:underline"
                  >
                    <BookOpen className="w-3 h-3" /> Ver na Wikipédia <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Ações Específicas do Modo Diário concluído */}
            {gameMode === 'daily' && (
              <div className="space-y-2 pt-1">
                {dailyResult && (
                  <button
                    onClick={onCopyShare}
                    className="btn-salinha w-full bg-gr hover:bg-gr-dark text-white py-2 text-xs uppercase shadow-solid-sm cursor-pointer"
                  >
                    {copiedShare ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1" /> Copiado para o WhatsApp!
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 mr-1" /> Compartilhar Meu Corte
                      </>
                    )}
                  </button>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={onSwitchToUnlimited}
                    className="btn-salinha flex-1 bg-mu hover:bg-mu-dark text-ink py-2 text-xs uppercase shadow-solid-sm cursor-pointer"
                  >
                    Modo Ilimitado →
                  </button>
                  <button
                    onClick={onResetDaily}
                    title="Limpar e tentar novamente (Treino)"
                    className="btn-salinha px-3 bg-paper hover:bg-[#e4ddce] text-ink py-2 text-xs uppercase shadow-solid-sm cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Treinar
                  </button>
                </div>

                <div className="text-[11px] font-bold text-suave text-center flex items-center justify-center gap-1">
                  <Timer className="w-3 h-3 text-or" />
                  Próximo Corte Diário em:{' '}
                  <span className="font-mono text-ink font-black">{timeUntilTomorrow}</span>
                </div>
              </div>
            )}
          </div>
        ) : gameMode === 'daily' && dailyResult ? (
          /* Caso 2: Modo Diário já jogado hoje, aguardando clique explícito do usuário */
          <div className="bg-creme border-2 border-ink rounded-2xl p-4 shadow-solid-sm space-y-3 text-center animate-stamp">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-gr-dark uppercase">
              <CheckCircle2 className="w-4 h-4 text-gr" /> Você já concluiu o corte de hoje!
            </div>
            <p className="text-xs text-ink font-medium">
              🔥 Ofensiva mantida:{' '}
              <strong>
                {streakCount} {streakCount === 1 ? 'dia' : 'dias'}
              </strong>
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={onRevealAnswer}
                className="btn-salinha bg-card hover:bg-paper text-ink py-2 text-xs uppercase shadow-solid-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-or" /> Ver Meu Gabarito
              </button>
              <button
                onClick={onResetDaily}
                className="btn-salinha bg-paper hover:bg-[#e4ddce] text-ink py-2 text-xs uppercase shadow-solid-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Jogar Novamente (Treino)
              </button>
              <button
                onClick={onSwitchToUnlimited}
                className="btn-salinha bg-mu hover:bg-mu-dark text-ink py-2 text-xs uppercase shadow-solid-sm cursor-pointer"
              >
                Jogar Modo Ilimitado →
              </button>
            </div>
            <div className="text-[10px] font-bold text-suave flex items-center justify-center gap-1 pt-1">
              <Timer className="w-3 h-3 text-or" />
              Próximo em: <span className="font-mono text-ink font-black">{timeUntilTomorrow}</span>
            </div>
          </div>
        ) : (
          /* Caso 3: Pergunta ainda não respondida */
          <div className="text-center py-4 text-suave text-xs font-medium space-y-1">
            <Sparkles className="w-5 h-5 text-or mx-auto animate-pulse" />
            <p className="font-bold text-ink">
              A resposta aparecerá aqui assim que você cortar!
            </p>
            <p className="text-[11px]">
              Você tem 10s para digitar. Se errar, a leitura continuará automaticamente.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
