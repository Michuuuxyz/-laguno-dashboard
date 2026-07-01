import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
  _req: NextRequest,
  { params }: { params: { guildId: string; giveawayId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const client = await clientPromise;
  const doc = await client.db().collection('giveaways').findOne({
    _id: new ObjectId(params.giveawayId),
    guildId: params.guildId,
  });

  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!doc.ended) return NextResponse.json({ error: 'Giveaway still active' }, { status: 400 });
  if (!doc.entries?.length) return NextResponse.json({ error: 'No entries' }, { status: 400 });

  // Apenas sinaliza o bot — é ele que escolhe os vencedores e anuncia no Discord
  // (evita o bug onde a dashboard escolhia uns vencedores e o bot sobrescrevia com outros)
  await client.db().collection('giveaways').updateOne(
    { _id: new ObjectId(params.giveawayId) },
    { $set: { pendingReroll: true } }
  );

  return NextResponse.json({ ok: true });
}
