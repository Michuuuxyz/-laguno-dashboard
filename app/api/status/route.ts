import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  const results: Record<string, { online: boolean; latency?: number; guilds?: number; users?: number }> = {};

  let mongoClient: Awaited<typeof clientPromise> | null = null;

  // Database
  try {
    const start = Date.now();
    mongoClient = await clientPromise;
    await mongoClient.db().command({ ping: 1 });
    results.database = { online: true, latency: Date.now() - start };
  } catch {
    results.database = { online: false };
  }

  // Bot — lê o heartbeat do MongoDB (escrito pelo bot a cada 30s)
  try {
    if (!mongoClient) mongoClient = await clientPromise;
    const doc = await mongoClient.db('laguno').collection('botstatuses').findOne({ _id: 'laguno' as unknown as never });
    if (doc && doc.lastSeen) {
      const age = Date.now() - new Date(doc.lastSeen).getTime();
      const online = age < 90_000; // offline se não atualizou há mais de 90s
      results.bot = {
        online,
        latency: typeof doc.ping === 'number' ? doc.ping : undefined,
        guilds: typeof doc.guilds === 'number' ? doc.guilds : undefined,
        users: typeof doc.users === 'number' ? doc.users : undefined,
      };
    } else {
      results.bot = { online: false };
    }
  } catch {
    results.bot = { online: false };
  }

  // Dashboard (self)
  results.dashboard = { online: true, latency: 0 };

  return NextResponse.json(results, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
