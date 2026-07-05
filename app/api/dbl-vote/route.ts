import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import clientPromise from '@/lib/mongodb';

/**
 * Webhook de votos do discordbotlist.com — blindado: valida o segredo e grava
 * o voto na coleção `votequeue` (resposta 200 instantânea). O BOT consome a
 * fila (voteQueueManager) e trata do embed, DM e lembrete.
 */

const DBL_SECRET = process.env.DBL_WEBHOOK_SECRET!;

// Comparação em tempo constante — evita adivinhar o segredo por timing.
function secretMatches(provided: string | null, expected: string | undefined): boolean {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

const CORS = {
  'Access-Control-Allow-Origin': 'https://discordbotlist.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!secretMatches(authHeader, DBL_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });
  }

  const rawBody = await req.text();

  let payload: Record<string, unknown>;
  try { payload = JSON.parse(rawBody); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: CORS }); }

  const userId   = (payload.id as string | undefined) ?? '';
  const userName = (payload.username as string | undefined) ?? '';
  const isTest   = payload.test === true;

  if (!userId) return NextResponse.json({ error: 'Missing id' }, { status: 400, headers: CORS });

  try {
    const client = await clientPromise;
    await client.db().collection('votequeue').insertOne({
      source: 'dbl', userId, userName, weight: 1, isTest,
      attempts: 0, createdAt: new Date(),
    });
  } catch (err) {
    console.error('[dbl-vote] Falha ao enfileirar:', err);
    return NextResponse.json({ error: 'Queue error' }, { status: 500, headers: CORS });
  }

  return NextResponse.json({ ok: true }, { headers: CORS });
}
