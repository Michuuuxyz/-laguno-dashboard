import { NextRequest, NextResponse } from 'next/server';
import { assertGuildAccess } from '@/lib/guildAuth';
import clientPromise from '@/lib/mongodb';

export async function GET(_: NextRequest, { params }: { params: { guildId: string } }) {
  if (!await assertGuildAccess(params.guildId))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // client.db() usa a BD do connection string — a mesma que o bot (mongoose).
  const client = await clientPromise;
  const warns = await client.db().collection('warns')
    .find({ guildId: params.guildId })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
  return NextResponse.json(warns);
}
