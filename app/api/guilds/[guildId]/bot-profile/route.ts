import { NextRequest, NextResponse } from 'next/server';
import { assertGuildAccess } from '@/lib/guildAuth';
import { rateLimit, tooMany } from '@/lib/rateLimit';

const DISCORD_API = 'https://discord.com/api/v10';
const CDN = 'https://cdn.discordapp.com';

// Perfil do bot NESTE servidor. O Discord permite nick/avatar/banner/bio por
// servidor via PATCH /guilds/{id}/members/@me. A atividade/status NÃO é por
// servidor (é global, ao nível da ligação) — por isso não entra aqui.

async function botUser(token: string): Promise<{ id: string; username: string; avatar: string | null } | null> {
  const res = await fetch(`${DISCORD_API}/users/@me`, { headers: { Authorization: `Bot ${token}` }, cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  if (!await assertGuildAccess(guildId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const token = process.env.DISCORD_TOKEN;
  if (!token) return NextResponse.json({ error: 'DISCORD_TOKEN em falta' }, { status: 503 });

  const me = await botUser(token);
  if (!me) return NextResponse.json({ error: 'Não consegui identificar o bot' }, { status: 502 });

  const globalAvatar = me.avatar
    ? `${CDN}/avatars/${me.id}/${me.avatar}.png?size=256`
    : `${CDN}/embed/avatars/0.png`;

  const mRes = await fetch(`${DISCORD_API}/guilds/${guildId}/members/${me.id}`, {
    headers: { Authorization: `Bot ${token}` }, cache: 'no-store',
  });
  const m = mRes.ok ? await mRes.json() as { nick?: string | null; avatar?: string | null; banner?: string | null } : {};

  return NextResponse.json({
    globalName:   me.username,
    globalAvatar,
    nick:         m.nick ?? '',
    guildAvatar:  m.avatar ? `${CDN}/guilds/${guildId}/users/${me.id}/avatars/${m.avatar}.png?size=256` : null,
    guildBanner:  m.banner ? `${CDN}/guilds/${guildId}/users/${me.id}/banners/${m.banner}.png?size=600` : null,
  });
}

// Aceita data URI (data:image/png;base64,…), ou null para limpar, ou undefined
// para não mexer. Limita o tamanho para não estourar o pedido ao Discord.
function cleanImage(v: unknown): string | null | undefined {
  if (v === null) return null;
  if (typeof v !== 'string' || !v) return undefined;
  if (!/^data:image\/(png|jpe?g|gif|webp);base64,/.test(v)) return undefined;
  if (v.length > 8_000_000) return undefined; // ~6MB
  return v;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  if (!await assertGuildAccess(guildId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const token = process.env.DISCORD_TOKEN;
  if (!token) return NextResponse.json({ error: 'DISCORD_TOKEN em falta' }, { status: 503 });

  let body: { nick?: unknown; avatar?: unknown; banner?: unknown; bio?: unknown };
  if (!rateLimit('botprof:' + guildId, 4, 60_000)) return NextResponse.json(tooMany, { status: 429 });

  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON inválido' }, { status: 400 }); }

  // Só envia os campos realmente presentes — não mexe no que não vem.
  const patch: Record<string, unknown> = {};
  if (typeof body.nick === 'string') patch.nick = body.nick.slice(0, 32);
  if (typeof body.bio === 'string')  patch.bio  = body.bio.slice(0, 190);
  const avatar = cleanImage(body.avatar); if (avatar !== undefined) patch.avatar = avatar;
  const banner = cleanImage(body.banner); if (banner !== undefined) patch.banner = banner;

  if (Object.keys(patch).length === 0)
    return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 });

  const res = await fetch(`${DISCORD_API}/guilds/${guildId}/members/@me`, {
    method: 'PATCH',
    headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string; code?: number };
    console.error('[bot-profile]', guildId, res.status, err);
    // 50013 = sem permissão · avatar/banner por servidor pode estar limitado a bots em certos casos
    const friendly = res.status === 403 || err.code === 50013
      ? 'O Discord recusou. Confirma que o bot tem a permissão "Mudar Alcunha"; o avatar/banner por servidor pode não estar disponível para bots neste servidor.'
      : (err.message ?? `Discord recusou (${res.status})`);
    return NextResponse.json({ error: friendly, status: res.status }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
