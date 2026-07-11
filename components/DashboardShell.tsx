'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { ThemeToggle } from './ThemeToggle';

interface Guild { id: string; name: string; icon: string | null; }
interface User  { name?: string | null; image?: string | null; }
interface Props { user: User; activeGuilds: Guild[]; guildMap: Record<string, Guild>; children: React.ReactNode; }

// Ícones duotone — preenchidos, duas tonalidades da MESMA cor (currentColor),
// por isso ficam verdes quando o módulo está ativo e cinza quando não está.
const di = (p: React.ReactNode) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>{p}</svg>
);
const NAV_ICONS: Record<string, React.ReactNode> = {
  overview:   di(<><rect x="3" y="3" width="8" height="8" rx="2.2" opacity=".35"/><rect x="13" y="3" width="8" height="8" rx="2.2" opacity=".35"/><rect x="3" y="13" width="8" height="8" rx="2.2" opacity=".35"/><rect x="13" y="13" width="8" height="8" rx="2.2"/></>),
  settings:   di(<><rect x="3" y="5.1" width="18" height="2.8" rx="1.4" opacity=".35"/><rect x="3" y="16.1" width="18" height="2.8" rx="1.4" opacity=".35"/><circle cx="9" cy="6.5" r="3.1"/><circle cx="15" cy="17.5" r="3.1"/></>),
  welcome:    di(<><path d="M4 20.5a8 8 0 0 1 16 0 .9.9 0 0 1-.9.9H4.9a.9.9 0 0 1-.9-.9z" opacity=".35"/><circle cx="12" cy="7.5" r="4.3"/></>),
  reactionroles: di(<><path d="M11.7 3.4A2 2 0 0 0 10.3 3H5.4a2 2 0 0 0-2 2v4.9a2 2 0 0 0 .6 1.4l8 8a2 2 0 0 0 2.8 0l4.9-4.9a2 2 0 0 0 0-2.8z" opacity=".35"/><circle cx="7.7" cy="7.7" r="1.9"/></>),
  autorole:   di(<><circle cx="9" cy="8" r="3.6" opacity=".35"/><path d="M3 20a6 6 0 0 1 12 0 .8.8 0 0 1-.8.8H3.8A.8.8 0 0 1 3 20z" opacity=".35"/><path d="M18 6.5v7M14.5 10h7" /></>),
  builder:    di(<><path d="M4 4h16a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 16H9.5L4.8 20a.8.8 0 0 1-1.3-.6V5.5A1.5 1.5 0 0 1 4 4z" opacity=".35"/><rect x="7" y="8" width="10" height="2" rx="1"/><rect x="7" y="11.5" width="6.5" height="2" rx="1"/></>),
  tempmessages: di(<><circle cx="12" cy="12" r="9" opacity=".35"/><path d="M12 6.6a1 1 0 0 1 1 1V11.6l2.5 2.5a1 1 0 0 1-1.4 1.4l-2.8-2.8A1 1 0 0 1 11 12V7.6a1 1 0 0 1 1-1z"/></>),
  tickets:    di(<><path d="M3 8.5A2 2 0 0 1 5 6.5h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z" opacity=".35"/><rect x="8.6" y="6.5" width="2" height="12" rx="1"/></>),
  moderation: di(<><path d="M12 2.2l7.5 2.9a1 1 0 0 1 .6 1v5.4c0 4.9-3.3 8.4-7.8 9.9a1 1 0 0 1-.6 0C7.2 19.9 3.9 16.4 3.9 11.5V6.1a1 1 0 0 1 .6-1z" opacity=".35"/><path d="M10.6 13.2l-1.7-1.7-1.5 1.5 3.2 3.2 5.3-5.3-1.5-1.5z"/></>),
  automod:    di(<><path d="M13.5 2.2 3.6 14a.7.7 0 0 0 .5 1.1H9l-1 6.3a.6.6 0 0 0 1.1.4L20.4 10a.7.7 0 0 0-.5-1.1H15z" opacity=".35"/><path d="M13.5 2.2 3.6 14a.7.7 0 0 0 .5 1.1H9z"/></>),
  warns:      di(<><path d="M10.3 3.6 1.9 18a1.6 1.6 0 0 0 1.4 2.4h17.4a1.6 1.6 0 0 0 1.4-2.4L13.7 3.6a1.6 1.6 0 0 0-2.8 0z" opacity=".35"/><rect x="11" y="8.5" width="2" height="5.5" rx="1"/><circle cx="12" cy="17" r="1.3"/></>),
  logs:       di(<><path d="M6 3h7.2L19 8.8V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" opacity=".35"/><path d="M13 3v5a1 1 0 0 0 1 1h5" opacity=".55"/><rect x="8" y="12" width="8" height="1.9" rx=".95"/><rect x="8" y="15.6" width="8" height="1.9" rx=".95"/></>),
  botprofile: di(<><rect x="3" y="4" width="18" height="16" rx="2.6" opacity=".35"/><circle cx="12" cy="10" r="2.9"/><path d="M6.8 17.6a5.2 5.2 0 0 1 10.4 0z"/></>),
};
const NAV_MODULES = [
  { id: 'overview',   label: 'Overview',        section: 'GERAL' },
  { id: 'settings',   label: 'Configurações',   section: 'GERAL' },
  { id: 'botprofile', label: 'Personalizar Bot', section: 'GERAL' },
  { id: 'welcome',       label: 'Boas-Vindas',    section: 'MÓDULOS' },
  { id: 'reactionroles', label: 'Reaction Roles', section: 'MÓDULOS' },
  { id: 'autorole',      label: 'Auto-Role',      section: 'MÓDULOS' },
  { id: 'builder',    label: 'Construtor',       section: 'MÓDULOS' },
  { id: 'tempmessages', label: 'Mensagens Temporárias', section: 'MÓDULOS' },
  { id: 'tickets',    label: 'Tickets',          section: 'MÓDULOS' },
  { id: 'moderation', label: 'Moderação',       section: 'MODERAÇÃO' },
  { id: 'automod',    label: 'Auto-Mod',        section: 'MODERAÇÃO' },
  { id: 'warns',      label: 'Avisos',          section: 'MODERAÇÃO' },
  { id: 'logs',       label: 'Logs',            section: 'ADMINISTRAÇÃO' },
];
const SECTIONS = ['GERAL', 'MÓDULOS', 'MODERAÇÃO', 'ADMINISTRAÇÃO'];

function guildIconUrl(id: string, icon: string | null) {
  if (!icon) return null;
  return `https://cdn.discordapp.com/icons/${id}/${icon}.${icon.startsWith('a_') ? 'gif' : 'png'}?size=256`;
}
function guildInitial(name: string) {
  return name.replace(/[^a-zA-Z0-9]/g, '').charAt(0).toUpperCase() || name.charAt(0).toUpperCase();
}

/* ── Left icon rail — always visible ── */
function GuildRail({ guilds, currentGuildId, user }: { guilds: Guild[]; currentGuildId?: string; user: User }) {
  // Menu do avatar — posição fixed calculada no clique para não ser cortado pelo overflow do rail
  const [menu, setMenu] = useState<{ top: number; left: number } | null>(null);

  const menuItemStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 9, width: '100%',
    padding: '8px 10px', borderRadius: 8, border: 'none', background: 'transparent',
    color: 'var(--text-2)', fontSize: 13.5, cursor: 'pointer', textDecoration: 'none',
    textAlign: 'left', transition: 'background .12s, color .12s',
  };
  const hoverOn  = (e: React.MouseEvent) => { const t = e.currentTarget as HTMLElement; t.style.background = 'var(--hover)'; t.style.color = 'var(--text-1)'; };
  const hoverOff = (e: React.MouseEvent) => { const t = e.currentTarget as HTMLElement; t.style.background = 'transparent'; t.style.color = 'var(--text-2)'; };

  return (
    <div style={{
      width: 80, flexShrink: 0,
      background: 'var(--surface)', borderRight: '1px solid var(--line)',
      height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: 14, paddingBottom: 12, gap: 6, overflowY: 'auto',
    }}>
      {/* Avatar do utilizador — volta à página Bem-vindo (lista de servidores) */}
      <Link href="/dashboard" title="Os teus servidores" style={{ display: 'block', flexShrink: 0 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', overflow: 'hidden',
          border: !currentGuildId ? '2px solid var(--green)' : '2px solid var(--line)',
          transition: 'border-color .2s',
          background: 'var(--elevated)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 700, color: '#fff',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--green)'; }}
          onMouseLeave={e => { if (currentGuildId) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--line)'; }}
        >
          {user.image
            ? <Image src={user.image} alt={user.name ?? ''} width={64} height={64} style={{ objectFit: 'cover', width: '100%', height: '100%' }} unoptimized={user.image?.endsWith('.gif')} />
            : (user.name?.charAt(0).toUpperCase() ?? '?')
          }
        </div>
      </Link>

      {/* Botão ⋯ — abre o menu (Votar, Terminar sessão) */}
      <button data-keep-nav title={user.name ?? 'Menu'} style={{
        width: 34, height: 20, borderRadius: 10, flexShrink: 0, marginBottom: 2,
        border: '1px solid var(--line)', cursor: 'pointer',
        background: menu ? 'var(--elevated)' : 'transparent',
        color: menu ? 'var(--green)' : 'var(--text-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, lineHeight: 1, letterSpacing: '.05em',
        transition: 'background .15s, color .15s, border-color .15s',
      }}
        onClick={e => {
          const r = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
          setMenu(menu ? null : { top: r.top, left: r.right + 14 });
        }}
        onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = 'var(--green)'; b.style.borderColor = 'rgba(109,184,62,.4)'; }}
        onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; if (!menu) { b.style.color = 'var(--text-3)'; b.style.borderColor = 'var(--line)'; } }}
      >⋯</button>

      {/* Popover do avatar — único sítio com Votar e Terminar sessão */}
      {menu && (
        <>
          <div data-keep-nav onClick={() => setMenu(null)} style={{ position: 'fixed', inset: 0, zIndex: 500 }} />
          <div style={{
            position: 'fixed', top: menu.top, left: menu.left, zIndex: 501,
            background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12,
            padding: 6, minWidth: 200, boxShadow: '0 12px 32px rgba(0,0,0,.45)',
          }}>
            <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)', padding: '8px 10px 8px', borderBottom: '1px solid var(--line)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </p>
            <a href="https://top.gg/bot/706487689519562833" target="_blank" rel="noreferrer" onClick={() => setMenu(null)} style={menuItemStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
              Votar
            </a>
            <button onClick={() => signOut({ callbackUrl: '/' })} style={{ ...menuItemStyle, color: '#f87171' }}
              onMouseEnter={e => { const t = e.currentTarget as HTMLElement; t.style.background = 'rgba(248,113,113,.08)'; }}
              onMouseLeave={e => { const t = e.currentTarget as HTMLElement; t.style.background = 'transparent'; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Terminar sessão
            </button>
          </div>
        </>
      )}

      <div style={{ width: 40, height: 1, background: 'var(--line)', flexShrink: 0, marginBottom: 2 }} />

      {/* Server icons */}
      {guilds.map(g => {
        const icon   = guildIconUrl(g.id, g.icon);
        const active = currentGuildId === g.id;
        return (
          <Link key={g.id} href={`/dashboard/${g.id}`} title={g.name} style={{ position: 'relative', display: 'block', flexShrink: 0 }}>
            {active && (
              <span style={{
                position: 'absolute', left: -8, top: '50%', transform: 'translateY(-50%)',
                width: 4, height: 36, borderRadius: '0 3px 3px 0', background: 'var(--green)',
              }} />
            )}
            <div style={{
              width: 64, height: 64,
              borderRadius: active ? 20 : '50%',
              overflow: 'hidden',
              border: active ? '2px solid var(--green)' : '2px solid transparent',
              transition: 'border-radius .2s, border-color .2s',
              background: icon ? 'transparent' : 'var(--elevated)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 700, color: 'var(--text-2)',
            }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.borderRadius = '20px'; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.borderRadius = '50%'; }}
            >
              {icon
                ? <Image src={icon} alt={g.name} width={64} height={64} style={{ objectFit: 'cover', width: '100%', height: '100%' }} unoptimized={icon.endsWith('.gif')} />
                : guildInitial(g.name)
              }
            </div>
          </Link>
        );
      })}

      {/* Add server */}
      <Link href={`https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&scope=bot+applications.commands&permissions=1102666262758`}
        title="Adicionar servidor" target="_blank" rel="noreferrer"
        style={{ marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', border: '2px dashed var(--line)', color: 'var(--green)', transition: 'border-color .15s, border-radius .2s', flexShrink: 0 }}
        onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.borderRadius = '20px'; a.style.borderColor = 'var(--green)'; a.style.background = 'rgba(109,184,62,.08)'; }}
        onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.borderRadius = '50%'; a.style.borderColor = 'var(--line)'; a.style.background = 'transparent'; }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </Link>
    </div>
  );
}

/* ── Invólucro responsivo ──
   Desktop: rail + sidebar lado a lado (display:contents mantém o flex).
   Mobile (≤900px): topbar fixa com hambúrguer; rail+sidebar viram um drawer
   deslizante com backdrop. Fecha ao navegar (clique em link/botão). */
function Shell({ rail, sidebar, children }: { rail: React.ReactNode; sidebar: React.ReactNode; children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="dash-theme" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Topbar desktop — logo centrado, volta à página principal */}
      <div className="dash-desktop-topbar" style={{ position: 'relative' }}>
        <Link href="/" title="Início" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', transition: 'opacity .15s' }}
          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '.75')}
          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')}
        >
          <Image src="/laguno.png" alt="Laguno" width={36} height={36} style={{ objectFit: 'contain' }} />
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--text-1)' }}>Laguno</span>
        </Link>
        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
          <ThemeToggle compact />
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
      {/* Topbar — só visível em mobile */}
      <div className="dash-topbar">
        <button aria-label="Abrir menu" onClick={() => setNavOpen(true)} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 38, height: 38, borderRadius: 9, border: '1px solid var(--line)',
          background: 'var(--card)', color: 'var(--text-1)', cursor: 'pointer', flexShrink: 0,
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <Image src="/laguno.png" alt="Laguno" width={30} height={30} style={{ objectFit: 'contain' }} />
          <span style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.02em' }}>Laguno</span>
        </Link>
        <div style={{ marginLeft: 'auto' }}><ThemeToggle compact /></div>
      </div>

      {navOpen && <div className="dash-backdrop" onClick={() => setNavOpen(false)} />}

      <div
        className={`dash-nav${navOpen ? ' open' : ''}`}
        onClick={e => {
          // Fecha o drawer quando o utilizador navega (link ou botão de módulo);
          // ignora o avatar/backdrop do menu, que só abrem o popover
          const t = e.target as HTMLElement;
          if (t.closest('a,button') && !t.closest('[data-keep-nav]')) setNavOpen(false);
        }}
      >
        {rail}
        {sidebar}
      </div>

      <main className="dash-main" style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </main>
      </div>

      <style>{`
        .dash-desktop-topbar {
          display: flex; align-items: center; justify-content: center;
          height: 54px; flex-shrink: 0;
          background: var(--surface); border-bottom: 1px solid var(--line);
        }
        .dash-topbar { display: none; }
        .dash-nav { display: contents; }
        .dash-backdrop { display: none; }
        @media (max-width: 900px) {
          .dash-desktop-topbar { display: none; }
          .dash-topbar {
            display: flex; align-items: center; gap: 12px;
            position: fixed; top: 0; left: 0; right: 0; height: 56px; z-index: 200;
            background: var(--nav-bg);
            -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--line);
            padding: 0 14px;
          }
          .dash-nav {
            display: flex;
            position: fixed; top: 0; left: 0; bottom: 0; z-index: 400;
            transform: translateX(-105%);
            transition: transform .22s ease;
            box-shadow: 16px 0 48px rgba(0,0,0,.5);
          }
          .dash-nav.open { transform: none; }
          .dash-backdrop {
            display: block; position: fixed; inset: 0; z-index: 300;
            background: rgba(0,0,0,.55);
          }
          .dash-main { padding-top: 56px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .dash-nav { transition: none; }
        }
      `}</style>
    </div>
  );
}

export function DashboardShell({ user, activeGuilds, guildMap, children }: Props) {
  const path   = usePathname();
  const params = useSearchParams();
  const router = useRouter();

  const guildMatch     = path.match(/\/dashboard\/(\d+)/);
  const currentGuildId = guildMatch?.[1];
  const currentGuild   = currentGuildId ? guildMap[currentGuildId] : null;
  const activeTab      = params.get('tab') ?? 'overview';

  function navTo(tab: string) {
    router.push(`/dashboard/${currentGuildId}?tab=${tab}`);
  }

  /* ── /dashboard (server list) ── */
  if (!currentGuild) {
    return (
      <Shell rail={<GuildRail guilds={activeGuilds} user={user} />} sidebar={
        <aside style={{
          width: 220, flexShrink: 0,
          background: 'var(--surface)', borderRight: '1px solid var(--line)',
          height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto',
        }}>
          {/* User hero */}
          <div style={{ padding: '28px 16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(109,184,62,.25)', flexShrink: 0 }}>
              {user.image
                ? <Image src={user.image} alt="" width={72} height={72} style={{ objectFit: 'cover' }} unoptimized={user.image?.endsWith('.gif')} />
                : <div style={{ width: 72, height: 72, background: '#5865f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff' }}>{user.name?.charAt(0) ?? '?'}</div>
              }
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.02em', textAlign: 'center' }}>{user.name}</p>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />
        </aside>
      }>
        {children}
      </Shell>
    );
  }

  /* ── /dashboard/[guildId] ── */
  const icon = guildIconUrl(currentGuild.id, currentGuild.icon);

  return (
    <Shell rail={<GuildRail guilds={activeGuilds} currentGuildId={currentGuildId} user={user} />} sidebar={
      <aside style={{
        width: 220, flexShrink: 0,
        background: 'var(--surface)', borderRight: '1px solid var(--line)',
        height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        {/* Server hero — logo grande centrado com o nome por baixo */}
        <div style={{ padding: '26px 16px 18px', borderBottom: '1px solid var(--line)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
            border: '3px solid rgba(109,184,62,.25)', background: 'var(--elevated)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 700, color: 'var(--text-2)',
          }}>
            {icon
              ? <Image src={icon} alt={currentGuild.name} width={96} height={96} style={{ objectFit: 'cover', width: '100%', height: '100%' }} unoptimized={icon.endsWith('.gif')} />
              : guildInitial(currentGuild.name)
            }
          </div>
          <p className="display" style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.03em', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentGuild.name}
          </p>
        </div>

        {/* Nav modules */}
        <nav style={{ padding: '6px 8px', flex: 1 }}>
          {SECTIONS.map(section => {
            const items = NAV_MODULES.filter(m => m.section === section);
            return (
              <div key={section} style={{ marginBottom: 4 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.09em', color: 'var(--text-3)', padding: '10px 8px 4px', textTransform: 'uppercase' }}>
                  {section}
                </p>
                {items.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button key={item.id} onClick={() => navTo(item.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', padding: '7px 10px 7px 8px', borderRadius: '0 7px 7px 0', marginBottom: 1,
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      // Estilo Discord: item ativo com fundo elevado + barra verde à esquerda
                      borderLeft: isActive ? '3px solid var(--green)' : '3px solid transparent',
                      background: isActive ? 'var(--hover)' : 'transparent',
                      color: isActive ? 'var(--text-1)' : 'var(--text-2)',
                      fontSize: 13.5, fontWeight: isActive ? 600 : 400, transition: 'background .12s, color .12s',
                    }}
                      onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = 'var(--hover)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-1)'; } }}
                      onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-2)'; } }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', color: isActive ? 'var(--green)' : 'var(--text-3)', flexShrink: 0 }}>{NAV_ICONS[item.id]}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

      </aside>
    }>
      {children}
    </Shell>
  );
}
