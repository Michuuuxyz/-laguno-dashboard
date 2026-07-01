import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  const results: Record<string, { online: boolean; latency?: number; detail?: string }> = {};

  // Bot
  try {
    const start = Date.now();
    const res = await fetch(`${process.env.BOT_API_URL}/stats`, {
      headers: { Authorization: `Bearer ${process.env.BOT_API_SECRET}` },
      signal: AbortSignal.timeout(5000),
    });
    const latency = Date.now() - start;
    if (res.ok) {
      const data = await res.json() as { ping?: number };
      results.bot = { online: true, latency: data.ping ?? latency };
    } else {
      results.bot = { online: false };
    }
  } catch {
    results.bot = { online: false };
  }

  // Dashboard (self)
  results.dashboard = { online: true, latency: 0 };

  // Database
  try {
    const start = Date.now();
    const mongoClient = await clientPromise;
    await mongoClient.db().command({ ping: 1 });
    results.database = { online: true, latency: Date.now() - start };
  } catch {
    results.database = { online: false };
  }

  return NextResponse.json(results, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
