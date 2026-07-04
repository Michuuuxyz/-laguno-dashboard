import { NextRequest, NextResponse } from 'next/server';
import { assertGuildAccess } from '@/lib/guildAuth';
import clientPromise from '@/lib/mongodb';

export async function GET(_: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  if (!await assertGuildAccess(guildId))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // client.db() usa a BD do connection string — a mesma que o bot (mongoose).
  const client = await clientPromise;
  const warns = await client.db().collection('warns')
    .find({ guildId })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
  return NextResponse.json(warns);
}
