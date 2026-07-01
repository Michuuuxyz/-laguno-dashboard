import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

const VOTE_CHANNEL_ID = process.env.VOTE_LOG_CHANNEL_ID ?? '1520229636229959750';
const BOT_TOKEN       = (process.env.DISCORD_TOKEN ?? process.env.DISCORD_BOT_TOKEN)!;
const WEBHOOK_SECRET  = process.env.TOPGG_WEBHOOK_SECRET!;
const TOPGG_URL       = 'https://top.gg/bot/706487689519562833/vote';
const DISCORD_API     = 'https://discord.com/api/v10';

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

async function discordPost(path: string, body: unknown) {
  return fetch(`${DISCORD_API}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function sendDM(userId: string, userName: string | undefined, weight: number, isTest: boolean) {
  const dmRes = await discordPost('/users/@me/channels', { recipient_id: userId });
  if (!dmRes.ok) return;
  const dm = await dmRes.json() as { id: string };

  const weekendBonus = weight >= 2 ? '\n🔥 É fim de semana — o teu voto vale a dobrar!' : '';
  const testTag = isTest ? '\n*(isto foi um teste do top.gg)*' : '';
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
          components: [{ type: 10, content: `### 💚 Obrigado pelo voto!\n**${userName ?? 'herói'}**, ${frase}${weekendBonus}${testTag}` }],
        },
        { type: 14, divider: true, spacing: 1 },
        { type: 10, content: `⏰ Podes votar de novo <t:${nextVoteTs}:R>\n-# Votar é grátis e ajuda o Laguno a crescer.` },
        { type: 14, divider: true, spacing: 1 },
        { type: 1, components: [{ type: 2, style: 5, label: 'Votar de novo', url: TOPGG_URL }] },
      ],
    }],
  });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get('x-topgg-signature');
  const sigValid = verifySignature(rawBody, sig);
  if (!sigValid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let payload: Record<string, unknown>;
  try { payload = JSON.parse(rawBody); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }


  const data     = payload.data as Record<string, unknown> | undefined;
  const userObj  = data?.user as Record<string, unknown> | undefined;
  const userId   = userObj?.platform_id as string | undefined;
  const userName = userObj?.name        as string | undefined;
  const avatar   = userObj?.avatar_url  as string | undefined;
  const weight   = (data?.weight as number | undefined) ?? 1;
  const isTest   = payload.type === 'vote.test';

  const mention    = userId ? `<@${userId}>` : (userName ?? 'Alguém');
  const weekendMsg = weight >= 2 ? '\n🔥 Fim de semana — vale a dobrar!' : '';
  const testMsg    = isTest ? '\n*(teste do top.gg)*' : '';

  const FRASES = [
    `votou. O Laguno agradece. Eu também. O servidor também. Toda a gente agradece.`,
    `acabou de votar e instantaneamente tornou-se numa pessoa melhor.`,
    `votou no Laguno. Algures no mundo, um admin respirou de alívio.`,
    `votou. Não sei o que esperavas em troca, mas obrigado na mesma.`,
    `chegou, votou, foi embora. Lendário.`,
    `votou no Laguno. O bot promete não se esquecer disto.`,
    `votou. Se o bot algum dia tiver sentimentos, vai lembrar-se deste momento.`,
    `votou. Tecnicamente já podes dizer que apoias o Laguno... mas não financeiramente.`,
  ];
  const frase = FRASES[Math.floor(Math.random() * FRASES.length)];

  const embed = {
    color: 0xFF3366,
    author: { name: 'top.gg', icon_url: 'https://www.google.com/s2/favicons?domain=top.gg&sz=64', url: 'https://top.gg/bot/706487689519562833' },
    description: `💚 **Novo voto!**\n${mention} ${frase}${weekendMsg}${testMsg}`,
    ...(avatar ? { thumbnail: { url: avatar } } : {}),
    timestamp: new Date().toISOString(),
  };

  const res = await discordPost(`/channels/${VOTE_CHANNEL_ID}/messages`, {
    embeds: [embed],
  });

  if (!res.ok) {
    console.error('[vote] Discord error:', await res.text());
    return NextResponse.json({ error: 'Discord error' }, { status: 500 });
  }

  if (userId) {
    sendDM(userId, userName, weight, isTest).catch(err =>
      console.error('[vote] DM error:', err)
    );
  }

  return NextResponse.json({ ok: true });
}
