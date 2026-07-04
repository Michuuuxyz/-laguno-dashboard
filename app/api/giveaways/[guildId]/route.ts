import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { assertGuildAccess } from '@/lib/guildAuth';
import { channelBelongsToGuild } from '@/lib/channelGuard';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest, { params }: { params: { guildId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!await assertGuildAccess(params.guildId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json() as {
    prize: string; description?: string; bannerUrl?: string;
    accentColor?: string; channelId: string; duration: number; winnersCount: number;
    requiredRoleId?: string; joinMessage?: string; winnerMessage?: string;
  };

  if (!body.prize || !body.channelId || !body.duration) {
    return NextResponse.json({ error: 'Campos obrigatórios em falta' }, { status: 400 });
  }
  if (!body.winnersCount || body.winnersCount < 1 || body.winnersCount > 20) {
    return NextResponse.json({ error: 'winnersCount deve estar entre 1 e 20' }, { status: 400 });
  }
  // Duração: mínimo 1 minuto, máximo 60 dias
  if (body.duration < 60 || body.duration > 60 * 86400) {
    return NextResponse.json({ error: 'Duração inválida (1 minuto a 60 dias)' }, { status: 400 });
  }

  // O canal de destino tem de pertencer MESMO a esta guild — sem isto, um
  // gestor podia fazer o bot publicar o sorteio num canal de outro servidor.
  if (!await channelBelongsToGuild(body.channelId, params.guildId)) {
    return NextResponse.json({ error: 'Esse canal não pertence a este servidor.' }, { status: 403 });
  }

  const endAt       = new Date(Date.now() + body.duration * 1000);
  const accentColor = body.accentColor
    ? parseInt(body.accentColor.replace('#', ''), 16)
    : 0x6db83e;

  const client = await clientPromise;
  const result = await client.db().collection('giveaways').insertOne({
    guildId:        params.guildId,
    channelId:      body.channelId,
    messageId:      null,
    prize:          String(body.prize).slice(0, 200),
    description:    String(body.description ?? '').slice(0, 1000),
    bannerUrl:      body.bannerUrl ?? null,
    accentColor,
    hostId:         session.user?.id ?? session.user?.name ?? 'unknown',
    winnersCount:   body.winnersCount ?? 1,
    requiredRoleId: body.requiredRoleId ?? null,
    joinMessage:    body.joinMessage || '🎉 {mention} entrou no sorteio de **{prize}**. Que a sorte esteja contigo.',
    winnerMessage:  body.winnerMessage || '🎉 {winners} ganhou **{prize}**! Parabéns — a sorte escolheu bem.',
    entries:        [],
    winners:        [],
    endAt,
    ended:          false,
    status:         'pending',
    createdAt:      new Date(),
    updatedAt:      new Date(),
  });

  return NextResponse.json({ ok: true, id: result.insertedId });
}

export async function GET(_req: NextRequest, { params }: { params: { guildId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!await assertGuildAccess(params.guildId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const client = await clientPromise;
  const docs = await client.db().collection('giveaways')
    .find({ guildId: params.guildId })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();

  return NextResponse.json(docs);
}
