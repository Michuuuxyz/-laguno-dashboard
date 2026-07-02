import { NextRequest, NextResponse } from 'next/server';
import { assertGuildAccess } from '@/lib/guildAuth';
import clientPromise from '@/lib/mongodb';

const PAGE_SIZE = 30;
const VALID_CATEGORIES = ['moderation', 'messages', 'members', 'channels', 'roles', 'voice', 'server'];

export async function GET(req: NextRequest, { params }: { params: { guildId: string } }) {
  if (!await assertGuildAccess(params.guildId))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const sp = req.nextUrl.searchParams;
  const page     = Math.max(0, parseInt(sp.get('page') ?? '0') || 0);
  const category = sp.get('category');

  const query: Record<string, unknown> = { guildId: params.guildId };
  if (category && VALID_CATEGORIES.includes(category)) query.category = category;

  const client = await clientPromise;
  const col = client.db('laguno').collection('auditlogs');

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
