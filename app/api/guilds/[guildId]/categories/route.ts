import { NextRequest, NextResponse } from 'next/server';
import { assertGuildAccess } from '@/lib/guildAuth';

// Devolve as CATEGORIAS (type 4) do servidor — usadas como canal-pai dos tickets.
export async function GET(_: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  if (!await assertGuildAccess(guildId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return NextResponse.json([]);
    const all = await res.json() as { id: string; name: string; type: number; position: number }[];
    return NextResponse.json(
      all.filter(c => c.type === 4)
        .sort((a, b) => a.position - b.position)
        .map(c => ({ id: c.id, name: c.name })),
    );
  } catch {
    return NextResponse.json([]);
  }
}
