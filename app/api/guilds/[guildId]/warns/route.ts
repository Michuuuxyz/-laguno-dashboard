import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MongoClient } from 'mongodb';

async function getDb() {
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  return { client, db: client.db('laguno') };
}

export async function GET(_: NextRequest, { params }: { params: { guildId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { client, db } = await getDb();
  try {
    const warns = await db.collection('warns')
      .find({ guildId: params.guildId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    return NextResponse.json(warns);
  } finally {
    await client.close();
  }
}
