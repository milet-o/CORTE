import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Tossup } from '@/types/quizbowl';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const origin = searchParams.get('origin');
    const random = searchParams.get('random') === 'true';

    const filePath = path.resolve(process.cwd(), 'data/questions.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Banco de dados offline não encontrado. Execute o pipeline.' }, { status: 404 });
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    let questions: Tossup[] = JSON.parse(rawData);

    if (category && category !== 'Todas') {
      questions = questions.filter(q => q.category === category || q.subcategory === category);
    }

    if (origin && origin !== 'Todas') {
      questions = questions.filter(q => q.origin === origin);
    }

    if (random) {
      questions = [...questions].sort(() => Math.random() - 0.5);
    }

    return NextResponse.json({
      total: questions.length,
      questions
    });
  } catch (error) {
    console.error('Erro na API de questões:', error);
    return NextResponse.json({ error: 'Erro interno ao consultar questões.' }, { status: 500 });
  }
}
