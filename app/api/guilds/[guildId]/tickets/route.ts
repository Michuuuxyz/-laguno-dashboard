import { NextRequest, NextResponse } from 'next/server';
import { assertGuildAccess } from '@/lib/guildAuth';
import clientPromise from '@/lib/mongodb';

interface Question { id: string; label: string; placeholder?: string; style?: string; required?: boolean }
interface Category { id: string; label: string; emoji?: string; style?: number; color?: string; openingMessage?: string; format?: string; form?: Question[] }
interface Panel { panelId: string; title?: string; description?: string; color?: string; bannerUrl?: string; categories?: Category[] }

export async function GET(_: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  if (!await assertGuildAccess(guildId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const db = (await clientPromise).db();
  const cfg = await db.collection('guildconfigs').findOne({ guildId }, { projection: { tickets: 1 } });
  const panels = await db.collection('ticketpanels').find({ guildId }).sort({ createdAt: 1 }).toArray();
  return NextResponse.json({ config: cfg?.tickets ?? {}, panels });
}

// Limpa e limita um painel vindo do cliente (sem tocar em channelId/messageId).
function sanitizePanel(p: Panel): Record<string, unknown> {
  const cats = (p.categories ?? []).slice(0, 20).map((c) => ({
    id:             String(c.id || Math.random().toString(36).slice(2, 8)),
    label:          String(c.label || 'Suporte').slice(0, 60),
    emoji:          String(c.emoji || '').slice(0, 40),
    style:          [1, 2, 3, 4].includes(Number(c.style)) ? Number(c.style) : 2,
    color:          String(c.color || '#6db83e').slice(0, 9),
    openingMessage: String(c.openingMessage || '').slice(0, 1500),
    format:         ['channel', 'thread', 'default'].includes(String(c.format)) ? String(c.format) : 'default',
    form: (c.form ?? []).slice(0, 5).map((q) => ({
      id:          String(q.id || Math.random().toString(36).slice(2, 8)),
      label:       String(q.label || 'Pergunta').slice(0, 45),
      placeholder: String(q.placeholder || '').slice(0, 100),
      style:       q.style === 'paragraph' ? 'paragraph' : 'short',
      required:    q.required !== false,
    })),
  }));
  return {
    title:       String(p.title || 'Central de Suporte').slice(0, 100),
    description: String(p.description || '').slice(0, 2000),
    color:       String(p.color || '#6db83e').slice(0, 9),
    bannerUrl:   String(p.bannerUrl || '').slice(0, 500),
    categories:  cats,
  };
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  if (!await assertGuildAccess(guildId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: { config?: Record<string, unknown>; panels?: Panel[] };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON inválido' }, { status: 400 }); }

  const db = (await clientPromise).db();

  // Config — só os campos permitidos, via dot-notation (NUNCA toca no counter atómico)
  if (body.config) {
    const c = body.config;
    const set: Record<string, unknown> = {
      'tickets.enabled':             !!c.enabled,
      'tickets.supportRoles':        Array.isArray(c.supportRoles) ? (c.supportRoles as string[]).slice(0, 25) : [],
      'tickets.categoryChannelId':   c.categoryChannelId || null,
      'tickets.supportChannelId':    c.supportChannelId || null,
      'tickets.transcriptChannelId': c.transcriptChannelId || null,
      'tickets.perUserLimit':        Math.min(10, Math.max(1, Number(c.perUserLimit) || 1)),
      'tickets.defaultFormat':       c.defaultFormat === 'thread' ? 'thread' : 'channel',
      'tickets.namingScheme':        String(c.namingScheme || 'ticket-{number}').slice(0, 50),
    };
    await db.collection('guildconfigs').updateOne({ guildId }, { $set: { ...set, guildId } }, { upsert: true });
  }

  // Painéis — substitui o conjunto (remove os que sumiram, faz upsert dos restantes)
  if (Array.isArray(body.panels)) {
    const ids = body.panels.map(p => String(p.panelId)).filter(Boolean);
    await db.collection('ticketpanels').deleteMany({ guildId, panelId: { $nin: ids } });
    for (const p of body.panels) {
      if (!p.panelId) continue;
      await db.collection('ticketpanels').updateOne(
        { guildId, panelId: String(p.panelId) },
        { $set: { ...sanitizePanel(p), guildId, panelId: String(p.panelId) }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true },
      );
    }
  }

  // Invalida a cache do bot
  fetch(`${process.env.BOT_API_URL}/cache/invalidate/${guildId}`, {
    method: 'POST', headers: { Authorization: `Bearer ${process.env.BOT_API_SECRET}` },
  }).catch(() => null);

  return NextResponse.json({ ok: true });
}
