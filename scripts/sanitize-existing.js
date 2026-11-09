const fs = require('fs');
const path = require('path');

function sanitizeText(text, answer, aliases = []) {
  let cleaned = text;
  const cleanAnswer = answer.replace(/\s*\(.*?\)\s*/g, '').trim();
  const allTerms = [cleanAnswer, answer, ...aliases]
    .map(t => t.replace(/\s*\(.*?\)\s*/g, '').trim())
    .filter(t => t && t.length >= 3);

  const sorted = Array.from(new Set(allTerms)).sort((a, b) => b.length - a.length);

  for (const term of sorted) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'giu');
    cleaned = cleaned.replace(regex, 'esta entidade');
  }

  return cleaned
    .replace(/\b(O|A|Os|As|Um|Uma)\s+esta entidade\b/gi, 'Esta entidade')
    .replace(/\b(o|a|os|as|um|uma)\s+esta entidade\b/gi, 'esta entidade')
    .replace(/\bdo\s+esta entidade\b/gi, 'desta entidade')
    .replace(/\bda\s+esta entidade\b/gi, 'desta entidade')
    .replace(/\bno\s+esta entidade\b/gi, 'nesta entidade')
    .replace(/\bna\s+esta entidade\b/gi, 'nesta entidade')
    .replace(/\s+/g, ' ')
    .trim();
}

const jsonPath = path.resolve('d:/programas/CORTE/data/questions.json');
const questions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let sanitizedCount = 0;
for (const q of questions) {
  if (q.id.startsWith('auto-')) {
    // Separa giveaway
    const lastPeriod = q.question_pt.lastIndexOf('Identifique');
    if (lastPeriod !== -1) {
      const body = q.question_pt.slice(0, lastPeriod);
      const giveaway = q.question_pt.slice(lastPeriod);
      const cleanedBody = sanitizeText(body, q.answer_canonical_pt, q.accept_aliases);
      if (cleanedBody !== body) {
        q.question_pt = `${cleanedBody} ${giveaway}`.replace(/\s+/g, ' ').trim();
        sanitizedCount++;
      }
    }
  }
}

fs.writeFileSync(jsonPath, JSON.stringify(questions, null, 2), 'utf8');
console.log(`Sanitizadas ${sanitizedCount} questões auto-* com vazamento de gabarito.`);
