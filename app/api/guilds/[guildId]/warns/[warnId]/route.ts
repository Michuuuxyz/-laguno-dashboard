import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MongoClient, ObjectId } from 'mongodb';

async function getDb() {
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  return { client, db: client.db('laguno') };
}

export async function DELETE(_: NextRequest, { params }: { params: { guildId: string; warnId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { client, db } = await getDb();
  try {
    await db.collection('warns').deleteOne({ _id: new ObjectId(params.warnId), guildId: params.guildId });
    return NextResponse.json({ ok: true });
  } finally {
    await client.close();
  }
}
