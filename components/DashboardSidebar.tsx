'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface Guild { id: string; name: string; icon: string | null; }
interface User  { name?: string | null; image?: string | null; }

interface Props {
  user: User;
  activeGuilds: Guild[];
}

const GridIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const ExternalIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

function guildFallback(id: string) {
  const n = parseInt(id.slice(-4), 16) % 6;
  return ['#5865f2','#57f287','#fee75c','#ed4245','#eb459e','#9b59b6'][n];
}

function guildIconUrl(id: string, icon: string | null) {
  if (!icon) return null;
  const ext = icon.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/icons/${id}/${icon}.${ext}?size=64`;
}

export function DashboardSidebar({ user, activeGuilds }: Props) {
  const path = usePathname();
  const currentGuildId = path.match(/\/dashboard\/(\d+)/)?.[1];

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--line)',
      height: '100vh', position: 'sticky', top: 0,
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{
        padding: '18px 16px 14px',
        borderBottom: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', gap: 9,
      }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
          <Image src="/laguno.png" alt="Laguno" width={30} height={30} style={{ objectFit: 'cover' }} />
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.03em', color: 'var(--text-1)' }}>
          Laguno
        </span>
      </div>

      {/* User card */}
      <div style={{
        margin: '12px 10px 8px',
        padding: '12px',
        background: 'var(--card)',
        borderRadius: 10,
        border: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        {user.image ? (
          <Image src={user.image} alt="" width={38} height={38}
            style={{ borderRadius: '50%', border: '1px solid var(--line)', flexShrink: 0 }}
            unoptimized={user.image.endsWith('.gif')} />
        ) : (
          <div style={{
            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
            background: 'var(--green-dim)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff',
          }}>
            {user.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>Discord</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '4px 10px', flex: 1 }}>
        {/* GERAL section */}
        <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.08em', color: 'var(--text-3)', padding: '10px 8px 4px', textTransform: 'uppercase' }}>
          Geral
        </p>

        <NavItem href="/dashboard" active={path === '/dashboard'} icon={<GridIcon />}>
          Visão Geral
        </NavItem>

        {/* SERVIDORES section */}
        {activeGuilds.length > 0 && (
          <>
            <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.08em', color: 'var(--text-3)', padding: '14px 8px 4px', textTransform: 'uppercase' }}>
              Servidores
            </p>
            {activeGuilds.map(g => {
              const icon = guildIconUrl(g.id, g.icon);
              const color = guildFallback(g.id);
              const isActive = currentGuildId === g.id;
              return (
                <Link key={g.id} href={`/dashboard/${g.id}`} style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '6px 8px', borderRadius: 7, marginBottom: 1,
                  background: isActive ? 'var(--elevated)' : 'transparent',
                  color: isActive ? 'var(--text-1)' : 'var(--text-2)',
                  fontSize: 13, fontWeight: isActive ? 500 : 400,
                  transition: 'all .12s',
                  textDecoration: 'none',
                }}
                  onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--hover)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-1)'; } }}
                  onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-2)'; } }}
                >
                  {icon ? (
                    <Image src={icon} alt={g.name} width={20} height={20}
                      style={{ borderRadius: '50%', flexShrink: 0 }}
                      unoptimized={icon.endsWith('.gif')} />
                  ) : (
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: color + '22', border: `1px solid ${color}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 700, color,
                    }}>
                      {g.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.name}
                  </span>
                  {isActive && <span style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />}
                </Link>
              );
            })}
          </>
        )}

        {/* LINKS section */}
        <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.08em', color: 'var(--text-3)', padding: '14px 8px 4px', textTransform: 'uppercase' }}>
          Links
        </p>
        <a
          href={`https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&scope=bot+applications.commands&permissions=8`}
          target="_blank" rel="noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '6px 8px', borderRadius: 7, marginBottom: 1,
            color: 'var(--text-2)', fontSize: 13, textDecoration: 'none', transition: 'all .12s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--hover)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-1)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-2)'; }}
        >
          <ExternalIcon /> Adicionar ao Discord
        </a>
      </nav>

      {/* Logout */}
      <div style={{ padding: '10px 10px 14px', borderTop: '1px solid var(--line)' }}>
        <button onClick={() => signOut({ callbackUrl: '/' })} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 9,
          padding: '7px 10px', borderRadius: 7, border: 'none',
          background: 'transparent', color: '#f87171', fontSize: 13,
          cursor: 'pointer', transition: 'background .12s', textAlign: 'left',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          <LogoutIcon /> Terminar sessão
        </button>
      </div>
    </aside>
  );
}

function NavItem({ href, active, icon, children }: { href: string; active: boolean; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: 9,
      padding: '6px 8px', borderRadius: 7, marginBottom: 1,
      background: active ? 'var(--elevated)' : 'transparent',
      color: active ? 'var(--text-1)' : 'var(--text-2)',
      fontSize: 13, fontWeight: active ? 500 : 400,
      transition: 'all .12s', textDecoration: 'none',
    }}
      onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--hover)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-1)'; } }}
      onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-2)'; } }}
    >
      {icon}
      {children}
    </Link>
  );
}
