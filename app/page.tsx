import fs from 'fs';
import path from 'path';
import QuizbowlReader from '@/components/QuizbowlReader';
import { Tossup } from '@/types/quizbowl';

export default function Home() {
  const filePath = path.resolve(process.cwd(), 'data/questions.json');
  let initialQuestions: Tossup[] = [];

  if (fs.existsSync(filePath)) {
    try {
      const rawData = fs.readFileSync(filePath, 'utf-8');
      initialQuestions = JSON.parse(rawData);
    } catch (err) {
      console.error('Erro ao ler data/questions.json:', err);
    }
  }

  return (
    <main className="min-h-screen bg-[#090d16] text-slate-100">
      <QuizbowlReader initialQuestions={initialQuestions} />
    </main>
  );
}
