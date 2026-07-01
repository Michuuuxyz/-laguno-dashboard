import { NextRequest, NextResponse } from 'next/server';
import { assertGuildAccess } from '@/lib/guildAuth';

const DISCORD_API = 'https://discord.com/api/v10';

function parseMessage(text: string, userId: string, guildName: string, memberCount: number): string {
  return text
    .replace(/{user}/g,         `<@${userId}>`)
    .replace(/{username}/g,     'Michu')
    .replace(/{displayname}/g,  'Michu')
    .replace(/{server}/g,       guildName)
    .replace(/{count}/g,        String(memberCount))
    .replace(/{id}/g,           userId)
    .replace(/{created}/g,      'há 2 anos');
}

export async function POST(req: NextRequest, { params }: { params: { guildId: string } }) {
  const access = await assertGuildAccess(params.guildId);
  if (!access) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { channelId, message, accentColor } = body;

  if (!channelId || !message) {
    return NextResponse.json({ error: 'channelId e message são obrigatórios' }, { status: 400 });
  }

  const token = process.env.DISCORD_TOKEN;
  if (!token) return NextResponse.json({ error: 'DISCORD_TOKEN não configurado' }, { status: 500 });

  // Fetch guild info for placeholders
  const guildRes = await fetch(`${DISCORD_API}/guilds/${params.guildId}?with_counts=true`, {
    headers: { Authorization: `Bot ${token}` },
  });
  const guild = guildRes.ok ? await guildRes.json() : null;
  const guildName = guild?.name ?? 'Servidor';
  const memberCount = guild?.approximate_member_count ?? 0;
  const userId = access.userId ?? '349527593634234370';

  const parsedMessage = `🧪 **[TESTE]** ${parseMessage(message, userId, guildName, memberCount)}`;

  // Build accent color as integer
  const accentInt = accentColor ? parseInt(accentColor.replace('#', ''), 16) : 0x6db83e;

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
        components: [{
          type: 10, // TextDisplay
          content: parsedMessage,
        }],
      }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json({ error: 'Discord recusou a mensagem', detail: err }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
