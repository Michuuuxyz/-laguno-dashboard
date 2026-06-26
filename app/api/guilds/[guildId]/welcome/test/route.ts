import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { guildId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { channelId, type, headerText, message, footerText, accentColor, showAccountAge, bannerType, bannerUrl } = body;

  if (!channelId || !message) {
    return NextResponse.json({ error: 'channelId e message são obrigatórios' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${process.env.BOT_API_URL}/guilds/${params.guildId}/welcome/test`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.BOT_API_SECRET}` },
        body: JSON.stringify({ channelId, type: type ?? 'welcome', headerText, message, footerText, accentColor, showAccountAge, bannerType, bannerUrl, userId: session.user.id }),
      }
    );

    if (!res.ok) return NextResponse.json({ error: 'Bot não conseguiu enviar' }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Bot offline ou inacessível' }, { status: 503 });
  }
}
