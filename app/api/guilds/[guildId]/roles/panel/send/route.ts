import { NextRequest, NextResponse } from 'next/server';
import { assertGuildAccess } from '@/lib/guildAuth';
import { rateLimit, tooMany } from '@/lib/rateLimit';
import { channelBelongsToGuild } from '@/lib/channelGuard';
import clientPromise from '@/lib/mongodb';

const DISCORD_API = 'https://discord.com/api/v10';

interface RoleEntry { roleId: string; label: string; emoji?: string; }
interface RolePanel  { id: string; title: string; description?: string; style?: 'buttons' | 'menu'; roles: RoleEntry[]; accentColor?: string; bannerUrl?: string; }

export async function POST(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  if (!await assertGuildAccess(guildId))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { panelId, channelId } = await req.json();
  if (!rateLimit('rlsend:' + guildId, 6, 60_000)) return NextResponse.json(tooMany, { status: 429 });
  if (!panelId || !channelId)
    return NextResponse.json({ error: 'panelId e channelId são obrigatórios' }, { status: 400 });

  if (!await channelBelongsToGuild(channelId, guildId))
    return NextResponse.json({ error: 'Esse canal não pertence a este servidor.' }, { status: 403 });

  const token = process.env.DISCORD_TOKEN;
  if (!token)
    return NextResponse.json({ error: 'DISCORD_TOKEN em falta no servidor' }, { status: 503 });

  // client.db() usa a BD do connection string — a mesma que o bot (mongoose).
  const client = await clientPromise;
  const cfg = await client.db().collection('guildconfigs').findOne({ guildId });
  const panel: RolePanel | null = (cfg?.rolePanels as RolePanel[] | undefined)?.find(p => p.id === panelId) ?? null;

  if (!panel)
    return NextResponse.json({ error: `Painel "${panelId}" não encontrado` }, { status: 404 });
  if (panel.roles.length === 0)
    return NextResponse.json({ error: 'O painel não tem cargos configurados' }, { status: 400 });

  // Constrói a mensagem Components V2 (igual ao /roles panel do bot)
  const isMenu = panel.style === 'menu';
  const textContent = [
    `## ${panel.title}`,
    panel.description ?? '',
    '',
    `-# ${isMenu ? 'Usa o menu para escolher os teus cargos — marca os que queres, desmarca os que não.' : 'Clica num botão para receber ou remover o cargo.'}`,
  ].filter((l, i) => i !== 1 || panel!.description).join('\n');

  const accentInt = panel.accentColor ? parseInt(panel.accentColor.replace('#', ''), 16) : NaN;
  const innerComponents: unknown[] = [];
  if (panel.bannerUrl?.trim()) {
    innerComponents.push({ type: 12, items: [{ media: { url: panel.bannerUrl.trim() } }] });
  }
  innerComponents.push({ type: 10, content: textContent });
  innerComponents.push({ type: 14, spacing: 1, divider: true });

  const container = {
    type: 17,
    ...(isNaN(accentInt) ? {} : { accent_color: accentInt }),
    components: innerComponents,
  };

  let rows: Record<string, unknown>[];
  if (isMenu) {
    // Menu dropdown — até 25 cargos, seleção múltipla sincronizada pelo bot
    const options = panel.roles.slice(0, 25).map(r => {
      const opt: Record<string, unknown> = { label: r.label.slice(0, 100), value: r.roleId };
      if (r.emoji) opt.emoji = { name: r.emoji };
      return opt;
    });
    rows = [{
      type: 1,
      components: [{
        type: 3,
        custom_id: `role_menu:${panel.id}`,
        placeholder: 'Escolhe os teus cargos',
        min_values: 0,
        max_values: options.length,
        options,
      }],
    }];
  } else {
    const chunks: RoleEntry[][] = [];
    for (let i = 0; i < panel.roles.length; i += 5) chunks.push(panel.roles.slice(i, i + 5));
    rows = chunks.map(chunk => ({
      type: 1,
      components: chunk.map(r => {
        const btn: Record<string, unknown> = {
          type: 2, style: 2,
          label: r.label,
          custom_id: `role_toggle:${r.roleId}`,
        };
        if (r.emoji) btn.emoji = { name: r.emoji };
        return btn;
      }),
    }));
  }

  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ flags: 32768, components: [container, ...rows] }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    console.error('[roles/panel/send]', guildId, err);
    return NextResponse.json({ error: err.message ?? `Discord error ${res.status}` }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
