import { NextResponse } from 'next/server';
import { judgeAnswer } from '@/lib/judge';
import { Tossup } from '@/types/quizbowl';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { givenAnswer, tossup, isPower, interrupted } = body;

    if (!tossup) {
      return NextResponse.json({ error: 'Objeto de pergunta ausente.' }, { status: 400 });
    }

    const result = judgeAnswer(givenAnswer || '', tossup as Tossup, {
      isPower: !!isPower,
      interrupted: !!interrupted,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro na API do Juiz:', error);
    return NextResponse.json({ error: 'Erro ao avaliar resposta.' }, { status: 500 });
  }
}
