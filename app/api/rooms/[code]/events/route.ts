import { getRoom, subscribeToRoom } from '@/lib/multiplayer/roomManager';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const room = getRoom(code);

  if (!room) {
    return new Response('Sala não encontrada', { status: 404 });
  }

  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Envia o estado inicial de imediato
      const initialData = `data: ${JSON.stringify(room)}\n\n`;
      controller.enqueue(encoder.encode(initialData));

      // Inscreve no broadcast do RoomManager
      unsubscribe = subscribeToRoom(code, (updatedRoom) => {
        try {
          const message = `data: ${JSON.stringify(updatedRoom)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (e) {
          // Erro ao enviar, cliente provavelmente desconectou
        }
      });
    },
    cancel() {
      if (unsubscribe) {
        unsubscribe();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
