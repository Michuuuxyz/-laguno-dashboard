import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { assertGuildAccess } from '@/lib/guildAuth';
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
  if (!body.winnersCount || body.winnersCount < 1) {
    return NextResponse.json({ error: 'winnersCount deve ser >= 1' }, { status: 400 });
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
    prize:          body.prize,
    description:    body.description ?? '',
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
