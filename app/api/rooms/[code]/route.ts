import { NextResponse } from 'next/server';
import { getRoom } from '@/lib/multiplayer/roomManager';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const room = getRoom(code);

  if (!room) {
    return NextResponse.json({ error: 'Sala não encontrada' }, { status: 404 });
  }

  return NextResponse.json({ success: true, room });
}
