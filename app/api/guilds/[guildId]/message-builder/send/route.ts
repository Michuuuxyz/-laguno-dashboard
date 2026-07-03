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

type Block =
  | { type: 'text';      content: string }
  | { type: 'image';     url: string }
  | { type: 'separator'; divider: boolean }
  | { type: 'buttons';   buttons: Btn[] };

interface Body {
  channelId:    string;
  accentColor?: string;
  blocks:       Block[];
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
  const blocks = body.blocks ?? [];
  if (blocks.length === 0)
    return NextResponse.json({ error: 'A mensagem está vazia — adiciona pelo menos um bloco' }, { status: 400 });

  const accentInt = body.accentColor ? parseInt(body.accentColor.replace('#', ''), 16) : NaN;

  const client = await clientPromise;
  const col = client.db('laguno').collection('custombuttons');
  const buttonDocs: Record<string, unknown>[] = [];

  function buildButton(b: Btn): Record<string, unknown> {
    const base: Record<string, unknown> = { type: 2, label: (b.label || 'Botão').slice(0, 80) };
    if (b.emoji?.trim()) base.emoji = { name: b.emoji.trim() };
    if (b.action.type === 'link') {
      base.style = 5; base.url = b.action.url;
    } else if (b.action.type === 'role') {
      base.style = b.style ?? 2; base.custom_id = `role_toggle:${b.action.roleId}`;
    } else {
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
  }

  // ── Blocos → componentes do container, pela ordem que o utilizador escolheu ──
  const inner: unknown[] = [];
  for (const block of blocks) {
    if (block.type === 'text' && block.content?.trim()) {
      inner.push({ type: 10, content: block.content.trim().slice(0, 4000) });
    } else if (block.type === 'image' && block.url?.trim()) {
      inner.push({ type: 12, items: [{ media: { url: block.url.trim() } }] });
    } else if (block.type === 'separator') {
      inner.push({ type: 14, divider: block.divider !== false, spacing: 1 });
    } else if (block.type === 'buttons') {
      const valid = (block.buttons ?? []).filter(b =>
        b.label?.trim() &&
        (b.action.type !== 'role' || b.action.roleId) &&
        (b.action.type !== 'link' || b.action.url?.trim()) &&
        (b.action.type !== 'message' || b.action.content?.trim())
      ).slice(0, 5);
      if (valid.length) inner.push({ type: 1, components: valid.map(buildButton) });
    }
  }

  if (inner.length === 0)
    return NextResponse.json({ error: 'Todos os blocos estão vazios' }, { status: 400 });

  if (buttonDocs.length) await col.insertMany(buttonDocs);

  const container = {
    type: 17,
    ...(isNaN(accentInt) ? {} : { accent_color: accentInt }),
    components: inner,
  };

  const res = await fetch(`${DISCORD_API}/channels/${body.channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ flags: 1 << 15, components: [container] }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    // Limpa os botões guardados se o envio falhou
    if (buttonDocs.length) await col.deleteMany({ buttonId: { $in: buttonDocs.map(d => d.buttonId as string) } }).catch(() => null);
    console.error('[message-builder]', params.guildId, err);
    return NextResponse.json({ error: err.message ?? `Discord recusou (${res.status})` }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
