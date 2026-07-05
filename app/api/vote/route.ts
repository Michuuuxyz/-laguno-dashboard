import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import clientPromise from '@/lib/mongodb';

/**
 * Webhook de votos do top.gg — blindado: valida a assinatura e grava o voto
 * na coleção `votequeue` (resposta 200 instantânea). O BOT consome a fila
 * (voteQueueManager) e trata do embed no canal, da DM e do lembrete — com o
 * rate-limit handling do discord.js. Nunca se perde um voto por 429.
 */

const WEBHOOK_SECRET = process.env.TOPGG_WEBHOOK_SECRET!;

function verifySignature(rawBody: string, header: string | null): boolean {
  if (!header || !WEBHOOK_SECRET) return false;
  const parts: Record<string, string> = {};
  for (const part of header.split(',')) {
    const [k, v] = part.split('=');
    parts[k] = v;
  }
  const { t, v1 } = parts;
  if (!t || !v1) return false;
  const expected = createHmac('sha256', WEBHOOK_SECRET)
    .update(`${t}.${rawBody}`)
    .digest('hex');
  try {
    return timingSafeEqual(Buffer.from(v1, 'hex'), Buffer.from(expected, 'hex'));
  } catch { return false; }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get('x-topgg-signature');
  if (!verifySignature(rawBody, sig)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try { payload = JSON.parse(rawBody); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const data     = payload.data as Record<string, unknown> | undefined;
  const userObj  = data?.user as Record<string, unknown> | undefined;
  const userId   = (userObj?.platform_id as string | undefined) ?? '';
  const userName = (userObj?.name as string | undefined) ?? '';
  const weight   = (data?.weight as number | undefined) ?? 1;
  const isTest   = payload.type === 'vote.test';

  try {
    const client = await clientPromise;
    await client.db().collection('votequeue').insertOne({
      source: 'topgg', userId, userName, weight, isTest,
      attempts: 0, createdAt: new Date(),
    });
  } catch (err) {
    console.error('[vote] Falha ao enfileirar:', err);
    // 500 → o top.gg volta a tentar
    return NextResponse.json({ error: 'Queue error' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
