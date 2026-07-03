import { NextRequest, NextResponse } from 'next/server';
import { assertGuildAccess } from '@/lib/guildAuth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(_: NextRequest, { params }: { params: { guildId: string; warnId: string } }) {
  if (!await assertGuildAccess(params.guildId))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (!ObjectId.isValid(params.warnId))
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

  // client.db() usa a BD do connection string — a mesma que o bot (mongoose).
  const client = await clientPromise;
  await client.db().collection('warns').deleteOne({ _id: new ObjectId(params.warnId), guildId: params.guildId });
  return NextResponse.json({ ok: true });
}
