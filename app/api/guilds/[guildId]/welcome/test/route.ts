import { NextRequest, NextResponse } from 'next/server';
import { assertGuildAccess } from '@/lib/guildAuth';
import { channelBelongsToGuild } from '@/lib/channelGuard';
import type { WelcomeCardTemplate } from '@/lib/welcomeCard';

const DISCORD_API = 'https://discord.com/api/v10';

function parseMessage(text: string, userId: string, guildName: string, memberCount: number): string {
  return text
    .replace(/{user}/g,         `<@${userId}>`)
    .replace(/{username}/g,     'Michu')
    .replace(/{displayname}/g,  'Michu')
    .replace(/{server}/g,       guildName)
    .replace(/{count}/g,        String(memberCount))
    .replace(/{id}/g,           userId)
    .replace(/{created}/g,      'há 2 anos')
    // aliases estilo MEE6
    .replace(/{@user}/g,             `<@${userId}>`)
    .replace(/{user\.name}/g,        'Michu')
    .replace(/{user\.id}/g,          userId)
    .replace(/{user\.tag}/g,         'michu')
    .replace(/{user\.discriminator}/g, '0')
    .replace(/{guild\.name}/g,       guildName)
    .replace(/{guild\.size}/g,       String(memberCount))
    .replace(/{guild}/g,             guildName);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const access = await assertGuildAccess(guildId);
  if (!access) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { channelId, message, accentColor, bannerUrl, showAvatar, footer, card } = body as {
    channelId?: string; message?: string; accentColor?: string;
    bannerUrl?: string; showAvatar?: boolean; footer?: string; card?: WelcomeCardTemplate;
  };

  if (!channelId) {
    return NextResponse.json({ error: 'channelId é obrigatório' }, { status: 400 });
  }

  if (!await channelBelongsToGuild(channelId, guildId))
    return NextResponse.json({ error: 'Esse canal não pertence a este servidor.' }, { status: 403 });

  const token = process.env.DISCORD_TOKEN;
  if (!token) return NextResponse.json({ error: 'DISCORD_TOKEN não configurado' }, { status: 500 });

  // Fetch guild info for placeholders
  const guildRes = await fetch(`${DISCORD_API}/guilds/${guildId}?with_counts=true`, {
    headers: { Authorization: `Bot ${token}` },
  });
  const guild = guildRes.ok ? await guildRes.json() : null;
  const guildName = guild?.name ?? 'Servidor';
  const memberCount = guild?.approximate_member_count ?? 0;
  const userId = access.userId ?? '349527593634234370';

  // ── Modo "Cartão de imagem" — gera o PNG (com o teu avatar/dados reais) e envia ──
  if (card?.layers?.length) {
    let avatarUrl = 'https://cdn.discordapp.com/embed/avatars/0.png';
    let displayName = 'Membro', username = 'membro';
    try {
      const uRes = await fetch(`${DISCORD_API}/users/${userId}`, { headers: { Authorization: `Bot ${token}` } });
      if (uRes.ok) {
        const u = await uRes.json() as { username?: string; global_name?: string; avatar?: string };
        username = u.username ?? username;
        displayName = u.global_name ?? u.username ?? displayName;
        if (u.avatar) avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${u.avatar}.png?size=256`;
      }
    } catch { /* usa o default */ }

    let png: Buffer;
    try {
      const { renderWelcomeCard } = await import('@/lib/cardRenderer');
      png = await renderWelcomeCard(card, { avatarUrl, displayName, username, memberCount, serverName: guildName, id: userId, tag: username }, new URL(req.url).origin);
    } catch (err) {
      console.error('[welcome/test card]', err);
      return NextResponse.json({ error: 'Falha ao gerar o cartão.' }, { status: 500 });
    }

    // Só o cartão — sem texto por cima.
    const form = new FormData();
    form.append('payload_json', JSON.stringify({ allowed_mentions: { parse: [] } }));
    form.append('files[0]', new Blob([new Uint8Array(png)], { type: 'image/png' }), 'welcome.png');
    const cardRes = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
      method: 'POST', headers: { Authorization: `Bot ${token}` }, body: form,
    });
    if (!cardRes.ok) {
      const err = await cardRes.json().catch(() => ({}));
      return NextResponse.json({ error: 'Discord recusou o cartão', detail: err }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  }

  if (!message) return NextResponse.json({ error: 'message é obrigatório' }, { status: 400 });
  const parsedMessage = `🧪 **[TESTE]** ${parseMessage(message, userId, guildName, memberCount)}`;

  // Build accent color as integer
  const accentInt = accentColor ? parseInt(accentColor.replace('#', ''), 16) : 0x6db83e;

  // Componentes internos do container (banner → texto+avatar → rodapé)
  const inner: unknown[] = [];
  if (bannerUrl?.trim()) {
    inner.push({ type: 12, items: [{ media: { url: bannerUrl.trim() } }] }); // MediaGallery
  }
  const textComp = { type: 10, content: parsedMessage };
  if (showAvatar) {
    // Avatar do utilizador que testa, como thumbnail
    let avatarUrl = 'https://cdn.discordapp.com/embed/avatars/0.png';
    try {
      const uRes = await fetch(`${DISCORD_API}/users/${userId}`, { headers: { Authorization: `Bot ${token}` } });
      if (uRes.ok) {
        const u = await uRes.json() as { avatar?: string };
        if (u.avatar) avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${u.avatar}.png?size=256`;
      }
    } catch { /* usa o default */ }
    inner.push({ type: 9, components: [textComp], accessory: { type: 11, media: { url: avatarUrl } } }); // Section + Thumbnail
  } else {
    inner.push(textComp);
  }
  if (footer?.trim()) {
    inner.push({ type: 14, divider: true, spacing: 1 }); // Separator
    inner.push({ type: 10, content: `-# ${parseMessage(footer, userId, guildName, memberCount)}` });
  }

  // Send via Discord REST API using Components V2
  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      flags: 1 << 15, // IS_COMPONENTS_V2
      components: [{
        type: 17, // Container
        accent_color: isNaN(accentInt) ? 0x6db83e : accentInt,
        components: inner,
      }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json({ error: 'Discord recusou a mensagem', detail: err }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
