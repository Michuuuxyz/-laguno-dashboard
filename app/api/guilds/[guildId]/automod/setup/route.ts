import { NextRequest, NextResponse } from 'next/server';
import { assertGuildAccess } from '@/lib/guildAuth';
import { syncAutoModRules } from '@/lib/discordAutoMod';
import { ALL_TEMPLATE_WORDS } from '@/lib/wordTemplates';
import clientPromise from '@/lib/mongodb';

// "Ativar tudo" = máxima AutoMod: todas as palavras de todas as templates
const DEFAULT_WORDS = ALL_TEMPLATE_WORDS;

export async function POST(_: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  if (!await assertGuildAccess(guildId))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const autoMod = {
    antiSpam:      { enabled: true, maxMessages: 5, interval: 5, action: 'timeout' },
    wordFilter:    { enabled: true, words: DEFAULT_WORDS },
    antiLink:      { enabled: true, whitelist: [] },
    capsFilter:    { enabled: true, maxPercent: 70, minLength: 10 },
    mentionSpam:   { enabled: true, maxMentions: 5, action: 'timeout' },
    floodControl:  { enabled: true, maxMessages: 8, interval: 5, slowmode: 10, duration: 60 },
    keywordPreset: { enabled: true },
    memberProfile: { enabled: true, words: [...DEFAULT_WORDS] },
    ignoredRoles: [],
    ignoredChannels: [],
  };

  // Guarda no MongoDB — client.db() usa a BD do connection string (a mesma que
  // o bot e a rota /config). Hardcodear 'laguno' podia apontar para outra BD.
  try {
    const client = await clientPromise;
    const db = client.db();

    // Trava anti-spam: a sincronização bate em ~7 endpoints do Discord com rate
    // limits agressivos — 1 ativação por minuto por servidor chega e sobra.
    const existing = await db.collection('guildconfigs').findOne(
      { guildId }, { projection: { autoModSyncAt: 1 } }
    );
    const last = existing?.autoModSyncAt ? new Date(existing.autoModSyncAt as Date).getTime() : 0;
    const waitMs = 60_000 - (Date.now() - last);
    if (waitMs > 0) {
      return NextResponse.json({
        ok: false, error: 'rate_limited',
        reason: `Calma 🐸 — o AutoMod acabou de ser sincronizado. Espera ${Math.ceil(waitMs / 1000)}s antes de ativar de novo.`,
      }, { status: 429 });
    }

    await db.collection('guildconfigs').updateOne(
      { guildId },
      { $set: { autoMod, guildId, autoModSyncAt: new Date(), updatedAt: new Date() } },
      { upsert: true }
    );

    // Ler logChannelId para passar ao syncAutoMod
    const cfg = await db.collection('guildconfigs').findOne({ guildId });
    const alertChannelId =
      (cfg?.logs as { moderation?: { channelId?: string } })?.moderation?.channelId
      ?? (cfg?.logChannelId as string | null)
      ?? null;

    // Invalida cache do bot — insere um pedido que o managerBridge consome em ≤10s
    db.collection('cacheinvalidations').insertOne({ guildId, createdAt: new Date() }).catch(() => null);

    // Sincroniza com Discord AutoMod nativo
    const sync = await syncAutoModRules(guildId, autoMod, alertChannelId);

    if (sync.error === 'no_token') {
      return NextResponse.json({ ok: false, saved: true, reason: 'O bot não está configurado para AutoMod nativo (DISCORD_TOKEN em falta). As regras do bot ficam ativas, mas as nativas do Discord não foram criadas.' }, { status: 502 });
    }
    if (sync.error === 'list_failed') {
      return NextResponse.json({ ok: false, saved: true, reason: 'O Laguno não conseguiu criar as regras no Discord. Confirma que o bot está no servidor e tem a permissão "Gerir Servidor".' }, { status: 502 });
    }
    if (!sync.ok) {
      return NextResponse.json({ ok: false, saved: true, reason: `Algumas regras não foram criadas no Discord: ${sync.failures.join('; ')}` }, { status: 502 });
    }

    return NextResponse.json({ ok: true, words: DEFAULT_WORDS.length });
  } catch (err) {
    console.error('[automod/setup]', guildId, err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
