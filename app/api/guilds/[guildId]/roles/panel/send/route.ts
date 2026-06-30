import { NextRequest, NextResponse } from 'next/server';
import { assertGuildAccess } from '@/lib/guildAuth';
import { MongoClient } from 'mongodb';

const DISCORD_API = 'https://discord.com/api/v10';

interface RoleEntry { roleId: string; label: string; emoji?: string; }
interface RolePanel  { id: string; title: string; description?: string; roles: RoleEntry[]; }

export async function POST(req: NextRequest, { params }: { params: { guildId: string } }) {
  if (!await assertGuildAccess(params.guildId))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { panelId, channelId } = await req.json();
  if (!panelId || !channelId)
    return NextResponse.json({ error: 'panelId e channelId são obrigatórios' }, { status: 400 });

  const token = process.env.DISCORD_TOKEN;
  if (!token)
    return NextResponse.json({ error: 'DISCORD_TOKEN em falta no servidor' }, { status: 503 });

  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  let panel: RolePanel | null = null;
  try {
    const cfg = await client.db('laguno').collection('guildconfigs').findOne({ guildId: params.guildId });
    panel = (cfg?.rolePanels as RolePanel[] | undefined)?.find(p => p.id === panelId) ?? null;
  } finally {
    await client.close();
  }

  if (!panel)
    return NextResponse.json({ error: `Painel "${panelId}" não encontrado` }, { status: 404 });
  if (panel.roles.length === 0)
    return NextResponse.json({ error: 'O painel não tem cargos configurados' }, { status: 400 });

  // Constrói a mensagem Components V2 (igual ao /roles panel do bot)
  const textContent = [
    `## ${panel.title}`,
    panel.description ?? '',
    '',
    '-# Clica num botão para receber ou remover o cargo.',
  ].filter((l, i) => i !== 1 || panel!.description).join('\n');

  const container = {
    type: 17,
    components: [
      { type: 10, content: textContent },
      { type: 14, spacing: 1, divider: true },
    ],
  };

  const chunks: RoleEntry[][] = [];
  for (let i = 0; i < panel.roles.length; i += 5) chunks.push(panel.roles.slice(i, i + 5));

  const rows = chunks.map(chunk => ({
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

  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ flags: 32768, components: [container, ...rows] }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    console.error('[roles/panel/send]', params.guildId, err);
    return NextResponse.json({ error: err.message ?? `Discord error ${res.status}` }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
