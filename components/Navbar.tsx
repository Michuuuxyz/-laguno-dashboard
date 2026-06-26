'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';

interface Props {
  user?: { name?: string | null; image?: string | null };
  guildName?: string;
  guildIcon?: string | null;
}

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const GridIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export function Navbar({ user, guildName, guildIcon }: Props) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const ref  = useRef<HTMLDivElement>(null);

  const isGuildPage = /^\/dashboard\/.+/.test(path);

  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <nav className="glass" style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(13,13,15,.92)',
      borderBottom: '1px solid var(--line)',
      height: 52,
      display: 'flex', alignItems: 'center',
      padding: '0 20px', gap: 16,
    }}>

      {/* Logo */}
      <Link href="/" style={{
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        padding: '0 12px 0 0', borderRight: '1px solid var(--line)',
        height: '100%',
      }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(62,207,142,.2)' }}>
          <Image src="/laguno.png" alt="Laguno" width={24} height={24} style={{ objectFit: 'cover' }} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--text-1)' }}>Laguno</span>
      </Link>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, overflow: 'hidden' }}>
        <Link href="/dashboard" style={{
          fontSize: 13.5,
          color: isGuildPage ? 'var(--text-3)' : 'var(--text-2)',
          fontWeight: isGuildPage ? 400 : 500,
          transition: 'color .14s',
          whiteSpace: 'nowrap',
        }}>
          Dashboard
        </Link>

        {isGuildPage && guildName && (
          <>
            <span style={{ color: 'var(--text-3)', flexShrink: 0 }}><ChevronRight /></span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
              {guildIcon && (
                <Image src={guildIcon} alt={guildName} width={18} height={18}
                  style={{ borderRadius: '50%', flexShrink: 0, border: '1px solid var(--line)' }}
                  unoptimized={guildIcon.endsWith('.gif')} />
              )}
              <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {guildName}
              </span>
            </div>
          </>
        )}
      </div>

      {/* External link */}
      <a href={`https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&scope=bot+applications.commands&permissions=8`}
        target="_blank" rel="noreferrer"
        className="btn btn-secondary"
        style={{ fontSize: 12.5, padding: '.38rem .85rem', flexShrink: 0 }}>
        Adicionar ao Discord
      </a>

      {/* User */}
      <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
        <button onClick={() => setOpen(v => !v)} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: open ? 'var(--elevated)' : 'transparent',
          border: `1px solid ${open ? 'var(--line-hover)' : 'transparent'}`,
          borderRadius: 8, padding: '4px 8px 4px 4px',
          cursor: 'pointer', transition: 'all .14s',
        }}>
          {user?.image ? (
            <Image src={user.image} alt="" width={24} height={24}
              style={{ borderRadius: '50%', border: '1px solid rgba(62,207,142,.3)' }}
              unoptimized={user.image.endsWith('.gif')} />
          ) : (
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
          )}
          <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>
            {user?.name?.split(' ')[0]}
          </span>
          <span style={{ color: 'var(--text-3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .14s' }}>
            <ChevronDown />
          </span>
        </button>

        {open && (
          <div className="card appear" style={{
            position: 'absolute', right: 0, top: 'calc(100% + 6px)',
            minWidth: 186, padding: 0, overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,.5)',
          }}>
            {/* User info */}
            <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                {user?.image ? (
                  <Image src={user.image} alt="" width={30} height={30}
                    style={{ borderRadius: '50%', border: '1px solid var(--line)' }}
                    unoptimized={user.image.endsWith('.gif')} />
                ) : (
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                    {user?.name?.charAt(0) ?? '?'}
                  </div>
                )}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.3 }}>{user?.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>Discord</p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div style={{ padding: '5px 5px' }}>
              <Link href="/dashboard" onClick={() => setOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '7px 10px', borderRadius: 6, fontSize: 13,
                color: 'var(--text-2)', transition: 'all .12s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--hover)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-2)'; }}
              >
                <GridIcon /> Meus servidores
              </Link>

              <div style={{ margin: '4px 0', borderTop: '1px solid var(--line)' }} />

              <button onClick={() => signOut({ callbackUrl: '/' })} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                padding: '7px 10px', borderRadius: 6, border: 'none',
                background: 'transparent', color: '#f87171', fontSize: 13,
                cursor: 'pointer', transition: 'background .12s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,.07)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <LogoutIcon /> Terminar sessão
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
