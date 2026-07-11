import { NextRequest, NextResponse } from 'next/server';
import { assertGuildAccess } from '@/lib/guildAuth';
import { rateLimit, tooMany } from '@/lib/rateLimit';
import { channelBelongsToGuild } from '@/lib/channelGuard';
import clientPromise from '@/lib/mongodb';
import type { V2Block } from '@/lib/v2blocks';

interface TempMsg {
  configId: string;
  channelId: string;
  mode: 'timer' | 'sticky';
  intervalSeconds: number;
  enabled: boolean;
  blocks: V2Block[];
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  if (!await assertGuildAccess(guildId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const db = (await clientPromise).db();
  const docs = await db.collection('tempmessages').find({ guildId }).sort({ createdAt: 1 }).toArray();
  return NextResponse.json(docs.map(d => ({
    configId:        d.configId,
    channelId:       d.channelId,
    mode:            d.mode,
    intervalSeconds: d.intervalSeconds,
    enabled:         d.enabled,
    blocks:          d.blocks ?? [],
  })));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  if (!await assertGuildAccess(guildId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (!rateLimit('tmpmsg:' + guildId, 20, 60_000)) return NextResponse.json(tooMany, { status: 429 });

  let body: { messages?: TempMsg[] };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON inválido' }, { status: 400 }); }

  // Cap de tamanho — as mensagens não devem engolir payloads gigantes
  if (JSON.stringify(body).length > 200_000) return NextResponse.json({ error: 'Configuração demasiado grande.' }, { status: 413 });

  const incoming = Array.isArray(body.messages) ? body.messages.slice(0, 25) : [];
  const db = (await clientPromise).db();
  const col = db.collection('tempmessages');

  const cleaned: Record<string, unknown>[] = [];
  for (const m of incoming) {
    const configId = String(m.configId || '').slice(0, 40);
    const channelId = String(m.channelId || '');
    if (!configId || !channelId) continue;
    if (!await channelBelongsToGuild(channelId, guildId)) {
      return NextResponse.json({ error: 'Um dos canais não pertence a este servidor.' }, { status: 403 });
    }
    cleaned.push({
      configId,
      channelId,
      mode:            m.mode === 'sticky' ? 'sticky' : 'timer',
      // Mínimo 30s (limites do Discord), máximo 24h
      intervalSeconds: Math.min(86_400, Math.max(30, Math.round(Number(m.intervalSeconds) || 300))),
      enabled:         m.enabled !== false,
      blocks:          Array.isArray(m.blocks) ? m.blocks.slice(0, 15) : [],
    });
  }

  // Substitui o conjunto: remove os que sumiram, faz upsert dos restantes
  // (o upsert NÃO toca em lastMessageId/lastSentAt, geridos pelo bot).
  const ids = cleaned.map(c => c.configId as string);
  await col.deleteMany({ guildId, configId: { $nin: ids } });
  for (const c of cleaned) {
    await col.updateOne(
      { guildId, configId: c.configId },
      { $set: { ...c, guildId }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
  }

  return NextResponse.json({ ok: true });
}
