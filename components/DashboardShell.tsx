'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface Guild { id: string; name: string; icon: string | null; }
interface User  { name?: string | null; image?: string | null; }
interface Props { user: User; activeGuilds: Guild[]; guildMap: Record<string, Guild>; children: React.ReactNode; }

const NAV_MODULES = [
  { id: 'overview',   label: 'Overview',        section: 'GERAL' },
  { id: 'settings',   label: 'Configurações',   section: 'GERAL' },
  { id: 'welcome',    label: 'Boas-Vindas',     section: 'MÓDULOS' },
  { id: 'roles',      label: 'Roles & Painéis', section: 'MÓDULOS' },
  { id: 'giveaways',  label: 'Giveaway',         section: 'MÓDULOS' },
  { id: 'moderation', label: 'Moderação',       section: 'MODERAÇÃO' },
  { id: 'automod',    label: 'Auto-Mod',        section: 'MODERAÇÃO' },
  { id: 'warns',      label: 'Avisos',          section: 'MODERAÇÃO' },
  { id: 'auditlog',   label: 'Registo de Auditoria', section: 'ADMINISTRAÇÃO' },
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

/* ── Left icon rail — always visible ── */
function GuildRail({ guilds, currentGuildId, user }: { guilds: Guild[]; currentGuildId?: string; user: User }) {
  return (
    <div style={{
      width: 80, flexShrink: 0,
      background: 'var(--surface)', borderRight: '1px solid var(--line)',
      height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: 10, paddingBottom: 12, gap: 6, overflowY: 'auto',
    }}>
      {/* Laguno logo */}
      <Link href="/" title="Início" style={{ display: 'block', marginBottom: 4, flexShrink: 0 }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '.7')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <div style={{ width: 64, height: 64, overflow: 'hidden' }}>
          <Image src="/laguno.png" alt="Laguno" width={64} height={64} style={{ objectFit: 'contain' }} />
        </div>
      </Link>

      <div style={{ width: 40, height: 1, background: 'var(--line)', flexShrink: 0, marginBottom: 2 }} />

      {/* Server icons */}
      {guilds.map(g => {
        const icon   = guildIconUrl(g.id, g.icon);
        const active = currentGuildId === g.id;
        return (
          <Link key={g.id} href={`/dashboard/${g.id}`} title={g.name} style={{ position: 'relative', display: 'block', flexShrink: 0 }}>
            {active && (
              <span style={{
                position: 'absolute', left: -14, top: '50%', transform: 'translateY(-50%)',
                width: 4, height: 32, borderRadius: '0 3px 3px 0', background: 'var(--green)',
              }} />
            )}
            <div style={{
              width: 48, height: 48,
              borderRadius: active ? 16 : '50%',
              overflow: 'hidden',
              border: active ? '2px solid var(--green)' : '2px solid transparent',
              transition: 'border-radius .2s, border-color .2s',
              background: icon ? 'transparent' : 'var(--elevated)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, color: 'var(--text-2)',
            }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.borderRadius = '16px'; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.borderRadius = '50%'; }}
            >
              {icon
                ? <Image src={icon} alt={g.name} width={48} height={48} style={{ objectFit: 'cover', width: '100%', height: '100%' }} unoptimized={icon.endsWith('.gif')} />
                : guildInitial(g.name)
              }
            </div>
          </Link>
        );
      })}

      {/* Add server */}
      <Link href={`https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&scope=bot+applications.commands&permissions=1102129391846`}
        title="Adicionar servidor" target="_blank" rel="noreferrer"
        style={{ marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', border: '2px dashed var(--line)', color: 'var(--green)', transition: 'border-color .15s, border-radius .2s', flexShrink: 0 }}
        onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.borderRadius = '16px'; a.style.borderColor = 'var(--green)'; a.style.background = 'rgba(109,184,62,.08)'; }}
        onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.borderRadius = '50%'; a.style.borderColor = 'var(--line)'; a.style.background = 'transparent'; }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </Link>
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
      <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
        <GuildRail guilds={activeGuilds} user={user} />

        {/* User sidebar */}
        <aside style={{
          width: 220, flexShrink: 0,
          background: 'var(--surface)', borderRight: '1px solid var(--line)',
          height: '100vh', display: 'flex', flexDirection: 'column', overflowY: 'auto',
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

          {/* Vote + logout at bottom */}
          <div style={{ padding: '8px 8px 16px', borderTop: '1px solid var(--line)' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.09em', color: 'var(--text-3)', padding: '8px 8px 6px', textTransform: 'uppercase' }}>OUTROS</p>
            <a href="https://top.gg/bot/706487689519562833" target="_blank" rel="noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 7, marginBottom: 2,
              color: 'var(--text-2)', fontSize: 13.5, textDecoration: 'none', transition: 'all .12s',
            }}
              onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = 'var(--hover)'; a.style.color = 'var(--text-1)'; }}
              onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = 'transparent'; a.style.color = 'var(--text-2)'; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
              Votar
            </a>
            <button onClick={() => signOut({ callbackUrl: '/' })} style={{
              display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '7px 10px', borderRadius: 7,
              border: 'none', background: 'transparent', color: 'var(--text-3)', fontSize: 13.5, cursor: 'pointer', textAlign: 'left', transition: 'all .12s',
            }}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'rgba(248,113,113,.08)'; b.style.color = '#f87171'; }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'transparent'; b.style.color = 'var(--text-3)'; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Terminar sessão
            </button>
          </div>
        </aside>

        {/* Wide content area */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    );
  }

  /* ── /dashboard/[guildId] ── */
  const icon = guildIconUrl(currentGuild.id, currentGuild.icon);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Icon rail */}
      <GuildRail guilds={activeGuilds} currentGuildId={currentGuildId} user={user} />

      {/* Module nav sidebar */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: 'var(--surface)', borderRight: '1px solid var(--line)',
        height: '100vh', display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        {/* User mini header */}
        <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--line)', flexShrink: 0 }}>
            {user.image
              ? <Image src={user.image} alt="" width={36} height={36} style={{ objectFit: 'cover' }} unoptimized={user.image?.endsWith('.gif')} />
              : <div style={{ width: 36, height: 36, background: '#5865f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>{user.name?.charAt(0) ?? '?'}</div>
            }
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
            <p style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '.04em' }}>Discord</p>
          </div>
        </div>

        {/* Server header */}
        <div style={{ padding: '10px 14px 10px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
          {icon ? (
            <Image src={icon} alt={currentGuild.name} width={36} height={36}
              style={{ borderRadius: 10, flexShrink: 0 }} unoptimized={icon.endsWith('.gif')} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--elevated)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--text-2)', flexShrink: 0 }}>
              {guildInitial(currentGuild.name)}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-.02em' }}>{currentGuild.name}</p>
            <p style={{ fontSize: 10.5, color: 'var(--green)', fontWeight: 600, letterSpacing: '.04em' }}>CONFIGURAÇÕES</p>
          </div>
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
                      width: '100%', padding: '7px 10px', borderRadius: 7, marginBottom: 1,
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      background: isActive ? 'rgba(109,184,62,.1)' : 'transparent',
                      color: isActive ? 'var(--green)' : 'var(--text-2)',
                      fontSize: 13.5, fontWeight: isActive ? 600 : 400, transition: 'background .12s, color .12s',
                    }}
                      onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = 'var(--hover)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-1)'; } }}
                      onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-2)'; } }}
                    >
                      {isActive && <span style={{ width: 3, height: 14, borderRadius: 2, background: 'var(--green)', flexShrink: 0 }} />}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Vote + logout */}
        <div style={{ padding: '8px 8px 12px', borderTop: '1px solid var(--line)' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.09em', color: 'var(--text-3)', padding: '8px 8px 6px', textTransform: 'uppercase' }}>OUTROS</p>
          <a href="https://top.gg/bot/706487689519562833" target="_blank" rel="noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 7, marginBottom: 2,
            color: 'var(--text-2)', fontSize: 13.5, textDecoration: 'none', transition: 'all .12s',
          }}
            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = 'var(--hover)'; a.style.color = 'var(--text-1)'; }}
            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = 'transparent'; a.style.color = 'var(--text-2)'; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
            Votar
          </a>
          <button onClick={() => signOut({ callbackUrl: '/' })} style={{
            display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '7px 10px', borderRadius: 7,
            border: 'none', background: 'transparent', color: 'var(--text-3)', fontSize: 13.5, cursor: 'pointer', textAlign: 'left', transition: 'all .12s',
          }}
            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'rgba(248,113,113,.08)'; b.style.color = '#f87171'; }}
            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'transparent'; b.style.color = 'var(--text-3)'; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Terminar sessão
          </button>
        </div>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
