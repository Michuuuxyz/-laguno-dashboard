import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: { guildId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${params.guildId}/channels`, {
      headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return NextResponse.json([]);
    const all = await res.json() as { id: string; name: string; type: number }[];
    // type 0 = text, type 5 = announcement — only return these
    return NextResponse.json(
      all
        .filter(c => c.type === 0 || c.type === 5)
        .map(c => ({ id: c.id, name: c.name }))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  } catch {
    return NextResponse.json([]);
  }
}
