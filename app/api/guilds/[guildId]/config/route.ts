import { NextRequest, NextResponse } from 'next/server';
import { assertGuildAccess } from '@/lib/guildAuth';
import { syncAutoModRules } from '@/lib/discordAutoMod';

const MONGO_URI = process.env.MONGODB_URI!;

async function getDb() {
  const { MongoClient } = await import('mongodb');
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  return { client, db: client.db('laguno') };
}

export async function GET(_: NextRequest, { params }: { params: { guildId: string } }) {
  if (!await assertGuildAccess(params.guildId))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { client, db } = await getDb();
  try {
    const config = await db.collection('guildconfigs').findOne({ guildId: params.guildId });
    return NextResponse.json(config ?? { prefix: '!', language: 'pt', enabledModules: ['moderation', 'fun'], customCommands: [] });
  } finally {
    await client.close();
  }
}

export async function POST(req: NextRequest, { params }: { params: { guildId: string } }) {
  if (!await assertGuildAccess(params.guildId))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, __v, createdAt, ...safeBody } = body;
  const { client, db } = await getDb();
  try {
    await db.collection('guildconfigs').updateOne(
      { guildId: params.guildId },
      { $set: { ...safeBody, guildId: params.guildId, updatedAt: new Date() } },
      { upsert: true }
    );

    // Invalida a cache do bot imediatamente
    try {
      await fetch(`${process.env.BOT_API_URL}/cache/invalidate/${params.guildId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.BOT_API_SECRET}` },
      });
    } catch { /* bot pode estar offline, não é crítico */ }

    // Sincroniza regras de AutoMod nativas do Discord (só quando a secção AutoMod é guardada)
    let autoModWarning: string | null = null;
    if (safeBody.autoMod) {
      // alertChannelId pode vir no mesmo payload ou já estar guardado na BD
      let alertChannelId =
        (safeBody.logs as { moderation?: { channelId?: string } })?.moderation?.channelId
        ?? (safeBody.logChannelId as string | null)
        ?? null;
      if (!alertChannelId) {
        const cfg = await db.collection('guildconfigs').findOne({ guildId: params.guildId });
        alertChannelId =
          (cfg?.logs as { moderation?: { channelId?: string } })?.moderation?.channelId
          ?? (cfg?.logChannelId as string | null)
          ?? null;
      }
      try {
        const sync = await syncAutoModRules(params.guildId, safeBody.autoMod as Parameters<typeof syncAutoModRules>[1], alertChannelId);
        if (sync.error === 'no_token') autoModWarning = 'As regras do bot ficaram guardadas, mas as regras nativas do Discord nao foram criadas (DISCORD_TOKEN em falta).';
        else if (sync.error === 'list_failed') autoModWarning = 'As regras nativas do Discord nao foram criadas. Confirma que o bot esta no servidor e tem a permissao "Gerir Servidor".';
        else if (!sync.ok) autoModWarning = `Algumas regras nao foram criadas no Discord: ${sync.failures.join('; ')}`;
      } catch (err) {
        console.error('[syncAutoMod]', params.guildId, err);
        autoModWarning = 'Erro ao sincronizar com o Discord.';
      }
    }

    return NextResponse.json({ ok: true, autoModWarning });
  } finally {
    await client.close();
  }
}
