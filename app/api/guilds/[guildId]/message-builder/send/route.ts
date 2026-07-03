import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { assertGuildAccess } from '@/lib/guildAuth';
import clientPromise from '@/lib/mongodb';

const DISCORD_API = 'https://discord.com/api/v10';
const BOT_TOKEN   = (process.env.DISCORD_TOKEN ?? process.env.DISCORD_BOT_TOKEN)!;

type ButtonAction =
  | { type: 'message'; content: string; ephemeral: boolean }
  | { type: 'role';    roleId: string }
  | { type: 'link';    url: string };

interface Btn {
  label: string;
  emoji?: string;
  style?: 1 | 2 | 3 | 4; // primary/secondary/success/danger (link é forçado a 5)
  action: ButtonAction;
}

interface Body {
  channelId:   string;
  accentColor?: string;
  banner?:     string;
  title?:      string;
  description?: string;
  footer?:     string;
  buttons:     Btn[];
}

const shortId = () => randomBytes(8).toString('hex'); // 16 chars

export async function POST(req: NextRequest, { params }: { params: { guildId: string } }) {
  if (!await assertGuildAccess(params.guildId))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (!BOT_TOKEN)
    return NextResponse.json({ error: 'DISCORD_TOKEN em falta' }, { status: 503 });

  let body: Body;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'JSON inválido' }, { status: 400 }); }

  if (!body.channelId) return NextResponse.json({ error: 'Escolhe um canal' }, { status: 400 });
  if (!body.title?.trim() && !body.description?.trim())
    return NextResponse.json({ error: 'A mensagem precisa de título ou texto' }, { status: 400 });

  const accentInt = body.accentColor ? parseInt(body.accentColor.replace('#', ''), 16) : NaN;

  // ── Componentes internos do container ──
  const inner: unknown[] = [];
  if (body.banner?.trim()) inner.push({ type: 12, items: [{ media: { url: body.banner.trim() } }] });

  const textParts: string[] = [];
  if (body.title?.trim())       textParts.push(`## ${body.title.trim()}`);
  if (body.description?.trim()) textParts.push(body.description.trim());
  if (textParts.length) inner.push({ type: 10, content: textParts.join('\n') });

  if (body.footer?.trim()) {
    inner.push({ type: 14, divider: true, spacing: 1 });
    inner.push({ type: 10, content: `-# ${body.footer.trim()}` });
  }

  // ── Botões (guarda ações de "mensagem" na BD) ──
  const client = await clientPromise;
  const col = client.db('laguno').collection('custombuttons');

  const buttonDocs: Record<string, unknown>[] = [];
  const buttonComponents = (body.buttons ?? []).slice(0, 25).map(b => {
    const base: Record<string, unknown> = { type: 2, label: b.label.slice(0, 80) };
    if (b.emoji?.trim()) base.emoji = { name: b.emoji.trim() };

    if (b.action.type === 'link') {
      base.style = 5;
      base.url = b.action.url;
    } else if (b.action.type === 'role') {
      base.style = b.style ?? 2;
      base.custom_id = `role_toggle:${b.action.roleId}`;
    } else {
      // message
      base.style = b.style ?? 2;
      const buttonId = shortId();
      base.custom_id = `cbtn:${buttonId}`;
      buttonDocs.push({
        buttonId, guildId: params.guildId,
        ephemeral: b.action.ephemeral !== false,
        content: b.action.content.slice(0, 2000),
        accentColor: body.accentColor ?? null,
        createdAt: new Date(),
      });
    }
    return base;
  });

  if (buttonDocs.length) await col.insertMany(buttonDocs);

  // Linhas de 5 botões
  const rows: unknown[] = [];
  for (let i = 0; i < buttonComponents.length; i += 5) {
    rows.push({ type: 1, components: buttonComponents.slice(i, i + 5) });
  }

  const container = {
    type: 17,
    ...(isNaN(accentInt) ? {} : { accent_color: accentInt }),
    components: inner,
  };

  const res = await fetch(`${DISCORD_API}/channels/${body.channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ flags: 1 << 15, components: [container, ...rows] }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    // Limpa os botões guardados se o envio falhou
    if (buttonDocs.length) await col.deleteMany({ buttonId: { $in: buttonDocs.map(d => d.buttonId) } }).catch(() => null);
    console.error('[message-builder]', params.guildId, err);
    return NextResponse.json({ error: err.message ?? `Discord recusou (${res.status})` }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
