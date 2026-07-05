import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// O bot publica um heartbeat com stats em `botstatus` a cada 30s (managerBridge).
// Online = documento fresco; sem heartbeat recente = bot offline.
const FRESHNESS_MS = 90_000;

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const doc = await client.db()
      .collection<{ _id: string; guildCount?: number; userCount?: number; uptime?: number; ping?: number; updatedAt?: Date }>('botstatus')
      .findOne({ _id: 'laguno' });

    if (!doc?.updatedAt || Date.now() - new Date(doc.updatedAt).getTime() > FRESHNESS_MS) {
      return NextResponse.json({ error: 'Bot offline' }, { status: 503 });
    }

    return NextResponse.json({
      guildCount: doc.guildCount ?? 0,
      userCount:  doc.userCount ?? 0,
      uptime:     doc.uptime ?? 0,
      ping:       doc.ping ?? 0,
    });
  } catch {
    return NextResponse.json({ error: 'Bot offline' }, { status: 503 });
  }
}
