'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface Guild { id: string; name: string; icon: string | null; }
interface User  { name?: string | null; image?: string | null; }

interface Props {
  user: User;
  activeGuilds: Guild[];
  guildMap: Record<string, Guild>;
  children: React.ReactNode;
}

const NAV_MODULES = [
  { id: 'overview',   label: 'Overview',        section: 'GERAL' },
  { id: 'settings',   label: 'Configurações',   section: 'GERAL' },
  { id: 'music',      label: 'Música',          section: 'MÓDULOS' },
  { id: 'welcome',    label: 'Boas-Vindas',     section: 'MÓDULOS' },
  { id: 'roles',      label: 'Roles & Painéis', section: 'MÓDULOS' },
  { id: 'moderation', label: 'Moderação',       section: 'MODERAÇÃO' },
  { id: 'automod',    label: 'Auto-Mod',        section: 'MODERAÇÃO' },
  { id: 'warns',      label: 'Avisos',          section: 'MODERAÇÃO' },
  { id: 'logs',       label: 'Logs',            section: 'ADMINISTRAÇÃO' },
];

const SECTIONS = ['GERAL', 'MÓDULOS', 'MODERAÇÃO', 'ADMINISTRAÇÃO'];

function guildIconUrl(id: string, icon: string | null) {
  if (!icon) return null;
  return `https://cdn.discordapp.com/icons/${id}/${icon}.${icon.startsWith('a_') ? 'gif' : 'png'}?size=128`;
}

function guildInitial(name: string) {
  return name.replace(/[^a-zA-Z0-9]/g, '').charAt(0).toUpperCase() || name.charAt(0).toUpperCase();
}

function ExternalIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}

/* ── Shared sidebar footer (user + logout) ── */
function SidebarFooter({ user }: { user: User }) {
  return (
    <div style={{
      padding: '10px 14px 14px',
      borderTop: '1px solid var(--line)',
      display: 'flex', alignItems: 'center', gap: 9,
    }}>
      {user.image
        ? <Image src={user.image} alt="" width={32} height={32}
            style={{ borderRadius: '50%', border: '1px solid var(--line)', flexShrink: 0 }}
            unoptimized={user.image.endsWith('.gif')} />
        : <div style={{
            width: 32, height: 32, borderRadius: '50%', background: 'var(--elevated)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'var(--text-2)', flexShrink: 0,
          }}>{user.name?.charAt(0) ?? '?'}</div>
      }
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.name}
        </p>
        <p style={{ fontSize: 10.5, color: 'var(--text-3)' }}>Discord</p>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        title="Terminar sessão"
        style={{
          display: 'flex', alignItems: 'center', padding: 6, borderRadius: 7,
          border: 'none', background: 'transparent', color: 'var(--text-3)',
          cursor: 'pointer', transition: 'color .12s, background .12s', flexShrink: 0,
        }}
        onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = '#f87171'; b.style.background = 'rgba(248,113,113,.08)'; }}
        onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = 'var(--text-3)'; b.style.background = 'transparent'; }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </div>
  );
}

export function DashboardShell({ user, activeGuilds, guildMap, children }: Props) {
  const path = usePathname();
  const params = useSearchParams();
  const router = useRouter();

  const guildMatch = path.match(/\/dashboard\/(\d+)/);
  const currentGuildId = guildMatch?.[1];
  const currentGuild = currentGuildId ? guildMap[currentGuildId] : null;
  const activeTab = params.get('tab') ?? 'overview';

  function navTo(tab: string) {
    router.push(`/dashboard/${currentGuildId}?tab=${tab}`);
  }

  /* ── MAIN /dashboard page — sidebar with server list ── */
  if (!currentGuild) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>

        {/* Sidebar */}
        <aside style={{
          width: 240, flexShrink: 0,
          background: 'var(--surface)', borderRight: '1px solid var(--line)',
          height: '100vh', display: 'flex', flexDirection: 'column', overflowY: 'auto',
        }}>
          {/* Logo */}
          <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid rgba(62,207,142,.3)', flexShrink: 0 }}>
              <Image src="/laguno.png" alt="Laguno" width={32} height={32} style={{ objectFit: 'cover' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-.03em', color: 'var(--text-1)', lineHeight: 1.15 }}>Laguno</p>
              <p style={{ fontSize: 9.5, color: 'var(--green)', letterSpacing: '.05em', textTransform: 'uppercase', fontWeight: 600 }}>Dashboard</p>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding: '8px 10px', flex: 1 }}>
            {/* Geral */}
            <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.08em', color: 'var(--text-3)', padding: '8px 8px 4px', textTransform: 'uppercase' }}>
              Geral
            </p>
            <Link href="/dashboard" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '7px 10px', borderRadius: 7, marginBottom: 1,
              background: 'rgba(62,207,142,.1)', color: 'var(--green)',
              fontSize: 13.5, fontWeight: 600, textDecoration: 'none',
            }}>
              <span>Servidores</span>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
            </Link>

            {/* Servidores ativos */}
            {activeGuilds.length > 0 && (
              <>
                <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.08em', color: 'var(--text-3)', padding: '14px 8px 4px', textTransform: 'uppercase' }}>
                  Servidores ativos
                </p>
                {activeGuilds.map(g => {
                  const icon = guildIconUrl(g.id, g.icon);
                  return (
                    <Link key={g.id} href={`/dashboard/${g.id}`} style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      padding: '6px 10px', borderRadius: 7, marginBottom: 1,
                      color: 'var(--text-2)', fontSize: 13, textDecoration: 'none', transition: 'all .12s',
                    }}
                      onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = 'var(--hover)'; a.style.color = 'var(--text-1)'; }}
                      onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = 'transparent'; a.style.color = 'var(--text-2)'; }}
                    >
                      {icon ? (
                        <Image src={icon} alt={g.name} width={22} height={22}
                          style={{ borderRadius: '50%', flexShrink: 0 }}
                          unoptimized={icon.endsWith('.gif')} />
                      ) : (
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                          background: 'var(--elevated)', border: '1px solid var(--line)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, fontWeight: 700, color: 'var(--text-2)',
                        }}>
                          {guildInitial(g.name)}
                        </div>
                      )}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{g.name}</span>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
                    </Link>
                  );
                })}
              </>
            )}

            {/* Links */}
            <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.08em', color: 'var(--text-3)', padding: '14px 8px 4px', textTransform: 'uppercase' }}>
              Links
            </p>
            <a
              href={`https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&scope=bot+applications.commands&permissions=8`}
              target="_blank" rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 7, marginBottom: 1,
                color: 'var(--text-2)', fontSize: 13.5, textDecoration: 'none', transition: 'all .12s',
              }}
              onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = 'var(--hover)'; a.style.color = 'var(--text-1)'; }}
              onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = 'transparent'; a.style.color = 'var(--text-2)'; }}
            >
              <ExternalIcon /> Adicionar ao Discord
            </a>
          </nav>

          <SidebarFooter user={user} />
        </aside>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    );
  }

  /* ── Guild page — sidebar with server nav ── */
  const icon = guildIconUrl(currentGuild.id, currentGuild.icon);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>

      {/* Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: 'var(--surface)', borderRight: '1px solid var(--line)',
        height: '100vh', display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        {/* Back */}
        <div style={{ padding: '14px 14px 6px' }}>
          <Link href="/dashboard" style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 12, color: 'var(--text-3)', textDecoration: 'none',
            padding: '4px 6px', borderRadius: 6, transition: 'color .12s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-3)'; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Servidores
          </Link>
        </div>

        {/* Server hero */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 16px 18px', gap: 10 }}>
          {icon ? (
            <Image src={icon} alt={currentGuild.name} width={72} height={72}
              style={{ borderRadius: '50%', border: '2px solid var(--line)', flexShrink: 0 }}
              unoptimized={icon.endsWith('.gif')} />
          ) : (
            <div style={{
              width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
              background: 'var(--elevated)', border: '2px solid var(--line)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 700, color: 'var(--text-2)',
            }}>
              {guildInitial(currentGuild.name)}
            </div>
          )}
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', textAlign: 'center', lineHeight: 1.3, letterSpacing: '-.02em' }}>
            {currentGuild.name}
          </p>
        </div>

        <div style={{ height: 1, background: 'var(--line)', margin: '0 14px 4px' }} />

        {/* Nav */}
        <nav style={{ padding: '4px 10px', flex: 1 }}>
          {SECTIONS.map(section => {
            const items = NAV_MODULES.filter(m => m.section === section);
            return (
              <div key={section} style={{ marginBottom: 2 }}>
                <p style={{
                  fontSize: 10.5, fontWeight: 600, letterSpacing: '.08em',
                  color: 'var(--text-3)', padding: '10px 8px 4px', textTransform: 'uppercase',
                }}>
                  {section}
                </p>
                {items.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button key={item.id} onClick={() => navTo(item.id)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', padding: '7px 10px', borderRadius: 7, marginBottom: 1,
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      background: isActive ? 'rgba(62,207,142,.1)' : 'transparent',
                      color: isActive ? 'var(--green)' : 'var(--text-2)',
                      fontSize: 13.5, fontWeight: isActive ? 600 : 400, transition: 'background .12s, color .12s',
                    }}
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'var(--hover)'; }}
                      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                    >
                      <span>{item.label}</span>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                        background: isActive ? 'var(--green)' : 'var(--elevated)',
                        border: isActive ? 'none' : '1px solid var(--line)',
                        transition: 'background .12s',
                      }} />
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <SidebarFooter user={user} />
      </aside>

      {/* Content */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
