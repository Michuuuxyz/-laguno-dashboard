import { NextRequest, NextResponse } from 'next/server';
import { fetchAvatarUrl, scheduleVoteReminder } from '@/lib/voteReminder';

const CORS = {
  'Access-Control-Allow-Origin': 'https://discordbotlist.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

const VOTE_CHANNEL_ID = process.env.VOTE_LOG_CHANNEL_ID ?? '1520229636229959750';
const BOT_TOKEN       = (process.env.DISCORD_TOKEN ?? process.env.DISCORD_BOT_TOKEN)!;
const DBL_SECRET      = process.env.DBL_WEBHOOK_SECRET!;
const DBL_URL         = 'https://discordbotlist.com/bots/706487689519562833/upvote';
const DISCORD_API     = 'https://discord.com/api/v10';

async function discordPost(path: string, body: unknown) {
  return fetch(`${DISCORD_API}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function sendDM(userId: string, userName: string | undefined) {
  const dmRes = await discordPost('/users/@me/channels', { recipient_id: userId });
  if (!dmRes.ok) return;
  const dm = await dmRes.json() as { id: string };

  const nextVoteTs = Math.floor((Date.now() + 12 * 60 * 60 * 1000) / 1000);
  const DM_FRASES = [
    `Literalmente ninguém te pediu para fazer isto e fizeste na mesma. Isso diz tudo.`,
    `O Laguno anotou. O Laguno não esquece.`,
    `O teu voto foi processado, aprovado e arquivado com carinho.`,
    `Algures no universo, uma estrela brilhou um pouco mais. Provavelmente coincidência, mas quem sabe.`,
    `Não tenho como retribuir mas posso prometer não te banir. Por ora.`,
    `A moderação agradece. Os membros agradecem. O bot agradece. Toda a gente agradece.`,
  ];
  const frase = DM_FRASES[Math.floor(Math.random() * DM_FRASES.length)];

  await discordPost(`/channels/${dm.id}/messages`, {
    flags: 1 << 15,
    components: [{
      type: 17,
      accent_color: 0x6db83e,
      components: [
        {
          type: 9,
          components: [{ type: 10, content: `### 💚 Obrigado pelo voto!\n**${userName ?? 'herói'}**, ${frase}` }],
        },
        { type: 14, divider: true, spacing: 1 },
        { type: 10, content: `⏰ Podes votar de novo <t:${nextVoteTs}:R>\n-# Votar é grátis e ajuda o Laguno a crescer.` },
        { type: 14, divider: true, spacing: 1 },
        { type: 1, components: [{ type: 2, style: 5, label: 'Votar de novo', url: DBL_URL }] },
      ],
    }],
  });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!DBL_SECRET || authHeader !== DBL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });
  }

  const rawBody = await req.text();

  let payload: Record<string, unknown>;
  try { payload = JSON.parse(rawBody); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: CORS }); }

  const userId   = payload.id       as string | undefined;
  const userName = payload.username as string | undefined;
  const avatar   = payload.avatar   as string | undefined;

  if (!userId) return NextResponse.json({ error: 'Missing id' }, { status: 400, headers: CORS });

  // Avatar fiável — busca ao Discord por ID; fallback ao avatar do payload
  const avatarUrl = await fetchAvatarUrl(userId)
    ?? (avatar ? `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png?size=256` : undefined);

  const mention = `<@${userId}>`;
  const FRASES = [
    `votou no Laguno no discordbotlist. O bot agradece. Eu também.`,
    `acabou de votar e instantaneamente tornou-se numa pessoa melhor.`,
    `votou. Não sei o que esperavas em troca, mas obrigado na mesma.`,
    `chegou, votou, foi embora. Lendário.`,
    `votou no Laguno. O bot promete não se esquecer disto.`,
    `votou. Se o bot algum dia tiver sentimentos, vai lembrar-se deste momento.`,
  ];
  const frase = FRASES[Math.floor(Math.random() * FRASES.length)];

  const embed = {
    color: 0x5865F2,
    author: { name: 'discordbotlist.com', icon_url: 'https://www.google.com/s2/favicons?domain=discordbotlist.com&sz=64', url: 'https://discordbotlist.com/bots/706487689519562833' },
    description: `💚 **Novo voto!**\n${mention} ${frase}`,
    ...(avatarUrl ? { thumbnail: { url: avatarUrl } } : {}),
    timestamp: new Date().toISOString(),
  };

  const res = await discordPost(`/channels/${VOTE_CHANNEL_ID}/messages`, {
    embeds: [embed],
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[dbl-vote] Discord error:', err);
    return NextResponse.json({ error: 'Discord error' }, { status: 500, headers: CORS });
  }

  sendDM(userId, userName).catch(err => console.error('[dbl-vote] DM error:', err));
  scheduleVoteReminder(userId).catch(err => console.error('[dbl-vote] reminder schedule error:', err));

  return NextResponse.json({ ok: true }, { headers: CORS });
}
