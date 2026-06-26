import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const MONGO_URI = process.env.MONGODB_URI!;

async function getDb() {
  const { MongoClient } = await import('mongodb');
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  return { client, db: client.db('laguno') };
}

export async function GET(_: NextRequest, { params }: { params: { guildId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { client, db } = await getDb();
  try {
    const config = await db.collection('guildconfigs').findOne({ guildId: params.guildId });
    return NextResponse.json(config ?? { prefix: '!', language: 'pt', enabledModules: ['moderation', 'fun'], customCommands: [] });
  } finally {
    await client.close();
  }
}

export async function POST(req: NextRequest, { params }: { params: { guildId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, __v, createdAt, ...safeBody } = body;
  const { client, db } = await getDb();
  try {
    await db.collection('guildconfigs').updateOne(
      { guildId: params.guildId },
      { $set: { ...safeBody, guildId: params.guildId, updatedAt: new Date() } },
      { upsert: true }
    );

    // Invalida a cache do bot imediatamente
    try {
      await fetch(`${process.env.BOT_API_URL}/cache/invalidate/${params.guildId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.BOT_API_SECRET}` },
      });
    } catch { /* bot pode estar offline, não é crítico */ }

    return NextResponse.json({ ok: true });
  } finally {
    await client.close();
  }
}
