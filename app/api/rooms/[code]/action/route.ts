import { NextResponse } from 'next/server';
import { 
  joinRoom, 
  leaveRoom, 
  updateFilters, 
  startQuestion, 
  buzz, 
  submitAnswer, 
  nextQuestion,
  getRoom
} from '@/lib/multiplayer/roomManager';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  try {
    const body = await req.json();
    const { action, playerId } = body;

    if (!action || !playerId) {
      return NextResponse.json({ error: 'Parâmetros incompletos' }, { status: 400 });
    }

    switch (action) {
      case 'join': {
        const { playerName, playerColor } = body;
        const res = joinRoom(code, playerName, playerColor, playerId);
        if (!res.success) {
          return NextResponse.json({ error: res.error }, { status: 400 });
        }
        return NextResponse.json({ success: true, room: res.room });
      }

      case 'leave': {
        const room = leaveRoom(code, playerId);
        return NextResponse.json({ success: true, room });
      }

      case 'update_filters': {
        const { categories, difficulties, wpm } = body;
        const room = updateFilters(code, playerId, categories, difficulties, wpm);
        if (!room) {
          return NextResponse.json({ error: 'Apenas o host pode alterar filtros' }, { status: 403 });
        }
        return NextResponse.json({ success: true, room });
      }

      case 'start_question': {
        const room = startQuestion(code, playerId);
        if (!room) {
          return NextResponse.json({ error: 'Apenas o host pode iniciar a pergunta' }, { status: 403 });
        }
        return NextResponse.json({ success: true, room });
      }

      case 'next_question': {
        const room = nextQuestion(code, playerId);
        if (!room) {
          return NextResponse.json({ error: 'Apenas o host pode avançar a pergunta' }, { status: 403 });
        }
        return NextResponse.json({ success: true, room });
      }

      case 'buzz': {
        const res = buzz(code, playerId);
        if (!res.success) {
          return NextResponse.json({ error: res.error }, { status: 400 });
        }
        return NextResponse.json({ success: true, room: res.room });
      }

      case 'submit_answer': {
        const { answer, timedOut } = body;
        const room = submitAnswer(code, playerId, answer, !!timedOut);
        if (!room) {
          return NextResponse.json({ error: 'Não foi possível processar a resposta' }, { status: 400 });
        }
        return NextResponse.json({ success: true, room });
      }

      default:
        return NextResponse.json({ error: 'Ação desconhecida' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao processar ação' }, { status: 500 });
  }
}
