export type QuestionOrigin = 'qbreader' | 'wikipedia_br';

export interface Tossup {
  id: string;
  origin: QuestionOrigin;
  category: string;
  subcategory: string;
  difficulty: number; // 1 (iniciante) a 10 (nível nacional/aberto)
  
  // O texto da pergunta com (*) marcando a transição do Power
  question_pt: string;
  
  // Answerline formatada padrão QB com <b> e <u>
  formatted_answer_pt: string;
  
  // Termo canônico direto
  answer_canonical_pt: string;
  
  // Variações aceitas em português (e termos em inglês de fallback)
  accept_aliases: string[];
  
  // Variações que pedem mais detalhes ("Prompt")
  prompt_aliases: string[];
  
  // Respostas que devem ser expressamente rejeitadas
  reject_aliases?: string[];
  
  // Metadados pedagógicos e estudo
  lead_in?: string;
  giveaway?: string;
  explanation?: string;
  wiki_url?: string;
  wiki_extract?: string;
  
  // Referência original se veio do QBReader
  original_id?: string;
  tournament?: string;
  year?: number;
}

export interface BonusPart {
  part_number: 1 | 2 | 3;
  question_pt: string;
  formatted_answer_pt: string;
  answer_canonical_pt: string;
  accept_aliases: string[];
  prompt_aliases: string[];
  value: number; // normalmente 10
}

export interface Bonus {
  id: string;
  origin: QuestionOrigin;
  category: string;
  subcategory: string;
  difficulty: number;
  lead_in_pt: string; // "Para 10 pontos cada, responda sobre..."
  parts: BonusPart[];
  explanation?: string;
  wiki_url?: string;
}

export interface JudgmentResult {
  status: 'correct' | 'incorrect' | 'prompt';
  message: string;
  matchedAlias?: string | null;
  similarityScore?: number;
  isPower?: boolean;
  points: number; // 15 (power), 10 (correto), -5 (negativo por corte incorreto), 0 (erro no fim)
}

export interface PlayerStats {
  score: number;
  powers: number;
  tens: number;
  negs: number;
  totalBuzzes: number;
  correctAnswers: number;
  wrongAnswers: number;
}
