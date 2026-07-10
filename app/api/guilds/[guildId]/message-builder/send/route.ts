import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { assertGuildAccess } from '@/lib/guildAuth';
import { rateLimit, tooMany } from '@/lib/rateLimit';
import { channelBelongsToGuild } from '@/lib/channelGuard';
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

type TextAccessory =
  | { kind: 'image';  url: string }
  | { kind: 'button'; button: Btn };

type Block =
  | { type: 'text';      content: string; accessory?: TextAccessory }
  | { type: 'image';     url: string }
  | { type: 'separator'; divider: boolean }
  | { type: 'buttons';   buttons: Btn[] };

interface Body {
  channelId:    string;
  accentColor?: string;
  blocks:       Block[];
}

const shortId = () => randomBytes(8).toString('hex'); // 16 chars

// URL de link válido (tem de ter esquema http(s) e um domínio com ponto)
const isValidUrl = (u?: string) => !!u && /^https?:\/\/[^\s.]+\.[^\s]{2,}/i.test(u.trim());

// Emoji: aceita unicode ou custom <:nome:id> / <a:nome:id>; ignora texto normal
function parseEmoji(raw?: string): Record<string, unknown> | undefined {
  const s = raw?.trim();
  if (!s) return undefined;
  const custom = s.match(/^<(a)?:(\w+):(\d+)>$/);
  if (custom) return { name: custom[2], id: custom[3], animated: !!custom[1] };
  // só passa se contiver um caractere fora do ASCII (provável emoji)
  // (regex escrito com escapes de TEXTO para nunca ter bytes de controlo no ficheiro)
  if (new RegExp('[^\\x00-\\x7f]').test(s)) return { name: s };
  return undefined;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  if (!await assertGuildAccess(guildId))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (!rateLimit('mbsend:' + guildId, 6, 60_000)) return NextResponse.json(tooMany, { status: 429 });
  if (!BOT_TOKEN)
    return NextResponse.json({ error: 'DISCORD_TOKEN em falta' }, { status: 503 });

  let body: Body;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'JSON inválido' }, { status: 400 }); }

  if (!body.channelId) return NextResponse.json({ error: 'Escolhe um canal' }, { status: 400 });
  if (!await channelBelongsToGuild(body.channelId, guildId))
    return NextResponse.json({ error: 'Esse canal não pertence a este servidor.' }, { status: 403 });
  const blocks = body.blocks ?? [];
  if (blocks.length === 0)
    return NextResponse.json({ error: 'A mensagem está vazia — adiciona pelo menos um bloco' }, { status: 400 });

  // Valida URLs de link preenchidos, com erro claro (evita "Invalid Form Body")
  for (const block of blocks) {
    if (block.type === 'buttons') {
      for (const b of block.buttons ?? []) {
        if (b.action.type === 'link' && b.label?.trim() && b.action.url?.trim() && !isValidUrl(b.action.url)) {
          return NextResponse.json({ error: `O botão "${b.label}" tem um link inválido. Tem de começar por https:// e ter um domínio (ex: https://www.lagunoapp.xyz).` }, { status: 400 });
        }
      }
    }
    if (block.type === 'text' && block.accessory?.kind === 'button') {
      const b = block.accessory.button;
      if (b?.action?.type === 'link' && b.label?.trim() && b.action.url?.trim() && !isValidUrl(b.action.url)) {
        return NextResponse.json({ error: `O botão "${b.label}" (à direita do texto) tem um link inválido. Tem de começar por https:// e ter um domínio.` }, { status: 400 });
      }
    }
  }

  const accentInt = body.accentColor ? parseInt(body.accentColor.replace('#', ''), 16) : NaN;

  const client = await clientPromise;
  // client.db() usa a base de dados do connection string — a MESMA que o bot
  // (mongoose) usa. Hardcodear 'laguno' podia apontar para outra BD.
  const col = client.db().collection('custombuttons');
  const buttonDocs: Record<string, unknown>[] = [];

  function buildButton(b: Btn): Record<string, unknown> {
    const base: Record<string, unknown> = { type: 2, label: (b.label || 'Botão').slice(0, 80) };
    const emoji = parseEmoji(b.emoji);
    if (emoji) base.emoji = emoji;
    if (b.action.type === 'link') {
      base.style = 5; base.url = b.action.url.trim();
    } else if (b.action.type === 'role') {
      base.style = b.style ?? 2; base.custom_id = `role_toggle:${b.action.roleId}`;
    } else {
      base.style = b.style ?? 2;
      const buttonId = shortId();
      base.custom_id = `cbtn:${buttonId}`;
      buttonDocs.push({
        buttonId, guildId,
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
      const textComp = { type: 10, content: block.content.trim().slice(0, 4000) };
      const acc = block.accessory;
      const accBtnValido = acc?.kind === 'button' && !!acc.button?.label?.trim() &&
        (acc.button.action.type !== 'role'    || !!acc.button.action.roleId) &&
        (acc.button.action.type !== 'link'    || isValidUrl(acc.button.action.url)) &&
        (acc.button.action.type !== 'message' || !!acc.button.action.content?.trim());

      if (acc?.kind === 'image' && isValidUrl(acc.url)) {
        // Section V2: texto com thumbnail à direita
        inner.push({ type: 9, components: [textComp], accessory: { type: 11, media: { url: acc.url.trim() } } });
      } else if (acc?.kind === 'button' && accBtnValido) {
        // Section V2: texto com botão à direita
        inner.push({ type: 9, components: [textComp], accessory: buildButton(acc.button) });
      } else {
        inner.push(textComp);
      }
    } else if (block.type === 'image' && block.url?.trim()) {
      inner.push({ type: 12, items: [{ media: { url: block.url.trim() } }] });
    } else if (block.type === 'separator') {
      inner.push({ type: 14, divider: block.divider !== false, spacing: 1 });
    } else if (block.type === 'buttons') {
      const valid = (block.buttons ?? []).filter(b =>
        b.label?.trim() &&
        (b.action.type !== 'role' || b.action.roleId) &&
        (b.action.type !== 'link' || isValidUrl(b.action.url)) &&
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

  // A mensagem é enviada pelo próprio bot — o nome/avatar por servidor vêm do
  // "Personalizar Bot" (o remetente personalizado por webhook foi descontinuado).
  const res = await fetch(`${DISCORD_API}/channels/${body.channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ flags: 1 << 15, components: [container] }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    // Limpa os botões guardados se o envio falhou
    if (buttonDocs.length) await col.deleteMany({ buttonId: { $in: buttonDocs.map(d => d.buttonId as string) } }).catch(() => null);
    console.error('[message-builder]', guildId, err);
    return NextResponse.json({ error: err.message ?? `Discord recusou (${res.status})` }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
