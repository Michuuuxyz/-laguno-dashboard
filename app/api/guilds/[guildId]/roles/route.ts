import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: { guildId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${params.guildId}/roles`, {
      headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return NextResponse.json([]);
    const all = await res.json() as { id: string; name: string; color: number; managed: boolean; position: number }[];
    return NextResponse.json(
      all
        .filter(r => !r.managed && r.name !== '@everyone')
        .map(r => ({ id: r.id, name: r.name, color: r.color }))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  } catch {
    return NextResponse.json([]);
  }
}
