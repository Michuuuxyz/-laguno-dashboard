import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch(`${process.env.BOT_API_URL}/stats`, {
      headers: { Authorization: `Bearer ${process.env.BOT_API_SECRET}` },
      next: { revalidate: 10 },
    });

    if (!res.ok) return NextResponse.json({ error: 'Bot offline' }, { status: 503 });

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Bot offline' }, { status: 503 });
  }
}
