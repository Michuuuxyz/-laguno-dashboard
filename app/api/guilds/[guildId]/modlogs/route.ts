import { NextRequest, NextResponse } from 'next/server';
import { assertGuildAccess } from '@/lib/guildAuth';
import clientPromise from '@/lib/mongodb';

const PAGE_SIZE = 25;
const VALID_ACTIONS = ['BAN', 'KICK', 'WARN', 'TIMEOUT', 'UNBAN', 'MUTE', 'UNMUTE'];

export async function GET(req: NextRequest, { params }: { params: { guildId: string } }) {
  if (!await assertGuildAccess(params.guildId))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const sp = req.nextUrl.searchParams;
  const page   = Math.max(0, parseInt(sp.get('page') ?? '0') || 0);
  const action = sp.get('action');
  const user   = sp.get('user')?.trim();       // targetId
  const mod    = sp.get('moderator')?.trim();  // moderatorId

  const query: Record<string, unknown> = { guildId: params.guildId };
  if (action && VALID_ACTIONS.includes(action)) query.action = action;
  if (user) query.targetId = user;
  if (mod)  query.moderatorId = mod;

  const client = await clientPromise;
  const col = client.db('laguno').collection('modlogs');

  const [items, total] = await Promise.all([
    col.find(query).sort({ createdAt: -1 }).skip(page * PAGE_SIZE).limit(PAGE_SIZE).toArray(),
    col.countDocuments(query),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  });
}
