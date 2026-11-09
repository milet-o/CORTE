import { NextResponse } from 'next/server';
import { createRoom } from '@/lib/multiplayer/roomManager';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { hostName, hostColor, hostId } = body;

    if (!hostId) {
      return NextResponse.json({ error: 'hostId é obrigatório' }, { status: 400 });
    }

    const room = createRoom(
      hostName || 'Host',
      hostColor || '#e8673a',
      hostId
    );

    return NextResponse.json({ success: true, room });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao criar sala' }, { status: 500 });
  }
}
