import * as fs from 'fs';
import * as path from 'path';
import { Tossup } from '../types/quizbowl';

export function normalizeText(s: string): string {
  if (!s) return '';
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'«»]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(o|a|os|as|um|uma|uns|umas|de|do|da|dos|das|no|na|nos|nas)\s+/i, '')
    .trim();
}

export function sanitizeQuestionText(
  text: string,
  answer: string,
  aliases: string[] = []
): string {
  let cleaned = text;

  // Lista de termos a mascarar
  const cleanAnswer = answer.replace(/\s*\(.*?\)\s*/g, '').trim();
  const allTerms = [cleanAnswer, answer, ...aliases]
    .map(t => t.replace(/\s*\(.*?\)\s*/g, '').trim())
    .filter(t => t.length >= 3);

  // Ordena por comprimento decrescente para substituir frases maiores primeiro
  const sorted = Array.from(new Set(allTerms)).sort((a, b) => b.length - a.length);

  for (const term of sorted) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Unicode-aware boundary regex
    const regex = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'giu');
    cleaned = cleaned.replace(regex, 'esta entidade');
  }

  // Limpa concordâncias anômalas geradas
  cleaned = cleaned
    .replace(/\b(O|A|Os|As|Um|Uma)\s+esta entidade\b/gi, 'Esta entidade')
    .replace(/\b(o|a|os|as|um|uma)\s+esta entidade\b/gi, 'esta entidade')
    .replace(/\bdo\s+esta entidade\b/gi, 'desta entidade')
    .replace(/\bda\s+esta entidade\b/gi, 'desta entidade')
    .replace(/\bno\s+esta entidade\b/gi, 'nesta entidade')
    .replace(/\bna\s+esta entidade\b/gi, 'nesta entidade')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}

export function deduplicateAndMerge(
  existing: Tossup[],
  incoming: Tossup[]
): { merged: Tossup[]; added: number; skipped: number } {
  const merged: Tossup[] = [...existing];
  const seenIds = new Set(existing.map(q => q.id));
  const seenAnswers = new Map<string, string>(); // normAnswer -> id

  for (const q of existing) {
    const norm = normalizeText(q.answer_canonical_pt);
    if (norm) seenAnswers.set(norm, q.id);
  }

  let added = 0;
  let skipped = 0;

  for (const item of incoming) {
    const norm = normalizeText(item.answer_canonical_pt);

    if (seenIds.has(item.id) || (norm && seenAnswers.has(norm))) {
      skipped++;
      continue;
    }

    // Valida e sanitiza se for auto gerada
    let qPt = item.question_pt;
    if (item.id.startsWith('auto-')) {
      qPt = sanitizeQuestionText(qPt, item.answer_canonical_pt, item.accept_aliases);
    }

    const cleanedItem: Tossup = {
      ...item,
      question_pt: qPt
    };

    merged.push(cleanedItem);
    seenIds.add(cleanedItem.id);
    if (norm) seenAnswers.set(norm, cleanedItem.id);
    added++;
  }

  return { merged, added, skipped };
}
