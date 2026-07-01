import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

type Params = { params: { guildId: string; giveawayId: string } };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const client = await clientPromise;
  const result = await client.db().collection('giveaways').deleteOne({
    _id: new ObjectId(params.giveawayId),
    guildId: params.guildId,
  });

  if (result.deletedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

// PATCH — agenda um reroll para uma data específica (só em giveaways terminados)
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as { scheduledRerollAt?: string };
  const client = await clientPromise;

  const doc = await client.db().collection('giveaways').findOne({
    _id: new ObjectId(params.giveawayId), guildId: params.guildId,
  });
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!doc.ended) return NextResponse.json({ error: 'Giveaway still active' }, { status: 400 });
  if (!doc.entries?.length) return NextResponse.json({ error: 'No entries' }, { status: 400 });

  const update = body.scheduledRerollAt
    ? { $set: { scheduledRerollAt: new Date(body.scheduledRerollAt) } }
    : { $unset: { scheduledRerollAt: 1 } };

  const result = await client.db().collection('giveaways').updateOne(
    { _id: new ObjectId(params.giveawayId), guildId: params.guildId },
    update,
  );

  if (result.matchedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
