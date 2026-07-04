import { NextRequest, NextResponse } from 'next/server';
import { assertGuildAccess } from '@/lib/guildAuth';
import { syncAutoModRules } from '@/lib/discordAutoMod';
import clientPromise from '@/lib/mongodb';

const ALLOWED_KEYS = new Set([
  'prefix', 'language', 'enabledModules', 'customCommands',
  'moderation', 'autoMod', 'logs', 'logChannelId',
  'welcome', 'goodbye', 'autoroles', 'giveaways',
  'warns', 'rolePanels',
]);

export async function GET(_: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  if (!await assertGuildAccess(guildId))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const client = await clientPromise;
  const config = await client.db().collection('guildconfigs').findOne({ guildId });
  return NextResponse.json(config ?? { prefix: '!', language: 'pt', enabledModules: ['moderation', 'fun', 'utility', 'config'], customCommands: [] });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  if (!await assertGuildAccess(guildId))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const safeBody = Object.fromEntries(
    Object.entries(body).filter(([k]) => ALLOWED_KEYS.has(k))
  );

  const client = await clientPromise;
  const db = client.db();
  try {
    await db.collection('guildconfigs').updateOne(
      { guildId },
      { $set: { ...safeBody, guildId, updatedAt: new Date() } },
      { upsert: true }
    );

    // Invalida a cache do bot imediatamente
    try {
      await fetch(`${process.env.BOT_API_URL}/cache/invalidate/${guildId}`, {
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
        const cfg = await db.collection('guildconfigs').findOne({ guildId });
        alertChannelId =
          (cfg?.logs as { moderation?: { channelId?: string } })?.moderation?.channelId
          ?? (cfg?.logChannelId as string | null)
          ?? null;
      }
      try {
        const sync = await syncAutoModRules(guildId, safeBody.autoMod as Parameters<typeof syncAutoModRules>[1], alertChannelId);
        if (sync.error === 'no_token') autoModWarning = 'As regras do bot ficaram guardadas, mas as regras nativas do Discord nao foram criadas (DISCORD_TOKEN em falta).';
        else if (sync.error === 'list_failed') autoModWarning = 'As regras nativas do Discord nao foram criadas. Confirma que o bot esta no servidor e tem a permissao "Gerir Servidor".';
        else if (!sync.ok) autoModWarning = `Algumas regras nao foram criadas no Discord: ${sync.failures.join('; ')}`;
      } catch (err) {
        console.error('[syncAutoMod]', guildId, err);
        autoModWarning = 'Erro ao sincronizar com o Discord.';
      }
    }

    return NextResponse.json({ ok: true, autoModWarning });
  } catch (err) {
    console.error('[config POST]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
