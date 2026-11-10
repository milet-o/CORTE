import { NextResponse } from 'next/server';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const CACHE_DIR = path.resolve(process.cwd(), 'data/audio_cache');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

export async function POST(req: Request) {
  try {
    const { text, rate = 1.0, voice = 'pt-BR-FranciscaNeural' } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Texto é obrigatório' }, { status: 400 });
    }

    const cleanText = text
      .replace(/\(\*\)/g, '')
      .replace(/esta entidade/gi, 'esta entidade')
      .replace(/\s+/g, ' ')
      .trim();

    // Cache local em disco pelo hash do texto + velocidade + voz
    const hash = crypto.createHash('md5').update(`${voice}_${rate}_${cleanText}`).digest('hex');
    const cacheFile = path.join(CACHE_DIR, `${hash}.mp3`);

    if (fs.existsSync(cacheFile)) {
      const audioBuffer = fs.readFileSync(cacheFile);
      return new Response(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    // Converte rate numérico (ex: 1.15) para formato de porcentagem SSML (ex: "+15%")
    let rateStr = '+0%';
    if (rate > 1) {
      rateStr = `+${Math.round((rate - 1) * 100)}%`;
    } else if (rate < 1) {
      rateStr = `-${Math.round((1 - rate) * 100)}%`;
    }

    const { audioStream } = tts.toStream(cleanText, { rate: rateStr });
    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      audioStream.on('data', (chunk: Buffer) => chunks.push(chunk));
      audioStream.on('end', () => resolve());
      audioStream.on('error', (err: any) => reject(err));
    });

    const finalBuffer = Buffer.concat(chunks);
    fs.writeFileSync(cacheFile, finalBuffer);

    return new Response(finalBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err: any) {
    console.error('Erro na rota de TTS:', err);
    return NextResponse.json({ error: err.message || 'Erro ao gerar áudio' }, { status: 500 });
  }
}
