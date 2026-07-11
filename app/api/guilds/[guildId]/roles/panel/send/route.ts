import { NextRequest, NextResponse } from 'next/server';
import { assertGuildAccess } from '@/lib/guildAuth';
import { rateLimit, tooMany } from '@/lib/rateLimit';
import { channelBelongsToGuild } from '@/lib/channelGuard';
import clientPromise from '@/lib/mongodb';

const DISCORD_API = 'https://discord.com/api/v10';

interface RoleEntry { roleId: string; label: string; emoji?: string; }
interface RolePanel  { id: string; title: string; description?: string; style?: 'buttons' | 'menu'; roles: RoleEntry[]; accentColor?: string; bannerUrl?: string; }

// Emoji: aceita unicode ou custom <:nome:id> / <a:nome:id>; ignora texto normal.
// Sem isto, um emoji personalizado (ex: <:pepe:123>) ia como { name } inteiro
// e o Discord respondia "Invalid Form Body".
function parseEmoji(raw?: string): Record<string, unknown> | undefined {
  const s = raw?.trim();
  if (!s) return undefined;
  const custom = s.match(/^<(a)?:(\w+):(\d+)>$/);
  if (custom) return { name: custom[2], id: custom[3], animated: !!custom[1] };
  // só passa se contiver um caractere fora do ASCII (provável emoji)
  if (new RegExp('[^\\x00-\\x7f]').test(s)) return { name: s };
  return undefined;
}

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

  // Só entram cargos com roleId válido; o label cai para "Cargo" se vier vazio
  // (um botão/opção sem label nem emoji faz o Discord recusar a mensagem).
  const validRoles = panel.roles.filter(r => r.roleId);
  if (validRoles.length === 0)
    return NextResponse.json({ error: 'O painel não tem cargos válidos' }, { status: 400 });

  let rows: Record<string, unknown>[];
  if (isMenu) {
    // Menu dropdown — até 25 cargos, seleção múltipla sincronizada pelo bot
    const options = validRoles.slice(0, 25).map(r => {
      const opt: Record<string, unknown> = { label: (r.label || 'Cargo').slice(0, 100), value: r.roleId };
      const emoji = parseEmoji(r.emoji);
      if (emoji) opt.emoji = emoji;
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
    for (let i = 0; i < validRoles.length; i += 5) chunks.push(validRoles.slice(i, i + 5));
    rows = chunks.map(chunk => ({
      type: 1,
      components: chunk.map(r => {
        const btn: Record<string, unknown> = {
          type: 2, style: 2,
          label: (r.label || 'Cargo').slice(0, 80),
          custom_id: `role_toggle:${r.roleId}`,
        };
        const emoji = parseEmoji(r.emoji);
        if (emoji) btn.emoji = emoji;
        return btn;
      }),
    }));
  }

  // Botões/menu vão DENTRO do container (a seguir ao separador), para ficarem
  // dentro da caixa da embed em vez de soltos por baixo.
  innerComponents.push(...rows);

  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ flags: 32768, components: [container] }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    console.error('[roles/panel/send]', guildId, err);
    const raw = JSON.stringify(err);
    const friendly = /emoji/i.test(raw)
      ? 'Um dos emojis é inválido ou de outro servidor. Usa um emoji normal, ou um emoji personalizado deste servidor.'
      : (err.message ?? `Discord error ${res.status}`);
    return NextResponse.json({ error: friendly }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
