'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mesma curva do ScrollReveal da página — o menu e o scroll falam a mesma língua
const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const SERVER_INVITE = 'https://discord.gg/tVyHSRjEY9';

// Navegação simples e direta — sem mega-menus. Os links falam por si.
const LINKS = [
  { href: '/features',  label: 'funcionalidades' },
  { href: '/comandos',  label: 'comandos' },
  { href: '/sobre',     label: 'sobre' },
  { href: '/dashboard', label: 'dashboard' },
];

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} style={{
      fontFamily: 'var(--font-fun)', fontSize: 15, fontWeight: 500,
      color: active ? 'var(--green)' : 'var(--text-2)',
      textDecoration: 'none', transition: 'color .15s',
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-1)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-2)'; }}
    >
      {label}
    </Link>
  );
}

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [userOpen, setUserOpen]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(16,18,26,.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--line)' }}>
      <style>{`
        @keyframes dropdown-in { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:none } }
        .nav-desktop { display: flex; }
        .nav-burger  { display: none; }
        @media (max-width: 780px) {
          .nav-desktop { display: none !important; }
          .nav-burger  { display: flex !important; }
        }
      `}</style>
      <div style={{ height: 62, display: 'flex', alignItems: 'center', padding: '0 clamp(16px,4vw,48px)', maxWidth: 1200, margin: '0 auto', width: '100%' }}>

        {/* Logo — o crocodilo + a marca */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0, marginRight: 40 }}>
          <Image src="/laguno.png" alt="Laguno" width={40} height={40} style={{ objectFit: 'contain', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-fun)', fontSize: 22, fontWeight: 600, color: 'var(--text-1)', letterSpacing: '.005em' }}>Laguno</span>
        </Link>

        {/* Links à direita (desktop) — texto simples separado por · */}
        <nav className="nav-desktop" style={{ gap: 12, flex: 1, alignItems: 'center', justifyContent: 'flex-end', marginRight: 24 }}>
          {LINKS.map((l, i) => (
            <div key={l.href} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {i > 0 && <span style={{ color: 'var(--text-3)', fontSize: 13, opacity: .6 }}>·</span>}
              <NavLink href={l.href} label={l.label} active={isActive(l.href)} />
            </div>
          ))}
        </nav>

        {/* Direita (desktop) — login / utilizador */}
        <div className="nav-desktop" style={{ gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {session?.user ? (
            <div ref={userRef} style={{ position: 'relative' }}>
              <button onClick={() => setUserOpen(o => !o)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(109,184,62,.4)', flexShrink: 0 }}>
                  {session.user.image
                    ? <Image src={session.user.image} alt={session.user.name ?? ''} width={34} height={34} style={{ objectFit: 'cover' }} />
                    : <div style={{ width: 34, height: 34, background: '#5865f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>{(session.user.name ?? 'U')[0].toUpperCase()}</div>
                  }
                </div>
              </button>

              <AnimatePresence>
              {userOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8, transition: { duration: 0.18, ease: EASE } }}
                  transition={{ duration: 0.4, ease: EASE }}
                  style={{
                    position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                    background: 'var(--card)', border: '1px solid var(--line)',
                    borderRadius: 14, padding: '6px 0', minWidth: 230,
                    boxShadow: '0 16px 48px rgba(0,0,0,.55)',
                    overflow: 'hidden',
                  }}>
                  {[
                    { href: '/dashboard', label: 'Dashboard' },
                    { href: SERVER_INVITE, label: 'Suporte', external: true },
                    { href: '/comandos', label: 'Comandos' },
                    { href: '/docs', label: 'Documentação' },
                  ].map(l => (
                    <a key={l.label} href={l.href} {...(l.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                      onClick={() => setUserOpen(false)}
                      style={{ display: 'block', padding: '11px 18px', fontSize: 14, fontWeight: 500, color: 'var(--text-1)', textDecoration: 'none', transition: 'background .12s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >{l.label}</a>
                  ))}
                  <div style={{ height: 1, background: 'var(--line)', margin: '6px 0' }} />
                  <button onClick={() => { setUserOpen(false); signOut({ callbackUrl: '/' }); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 18px', fontSize: 14, fontWeight: 500, color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background .12s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >Terminar sessão</button>
                </motion.div>
              )}
              </AnimatePresence>
            </div>
          ) : (
            <button onClick={() => signIn('discord', { callbackUrl: '/' })} className="nav-cta-green" style={{ border: 'none', cursor: 'pointer' }}>
              Login
            </button>
          )}
        </div>

        {/* Hamburger (mobile) */}
        <button
          className="nav-burger"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Menu"
          style={{
            marginLeft: 'auto', background: 'none', border: '1px solid var(--line)',
            borderRadius: 8, width: 38, height: 38, cursor: 'pointer', color: 'var(--text-1)',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          {mobileOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          )}
        </button>
      </div>

      {/* Painel mobile */}
      {mobileOpen && (
        <div className="nav-burger" style={{
          flexDirection: 'column', padding: '8px 16px 18px', gap: 2,
          borderTop: '1px solid var(--line)', background: 'rgba(16,18,26,.98)',
          animation: 'dropdown-in .15s ease both',
        }}>
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
              style={{ padding: '11px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>
              {l.label}
            </Link>
          ))}
          <a href={SERVER_INVITE} target="_blank" rel="noreferrer" onClick={() => setMobileOpen(false)}
            style={{ padding: '11px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'var(--text-2)' }}>
            Servidor de suporte
          </a>
          <div style={{ height: 1, background: 'var(--line)', margin: '8px 0' }} />
          {session?.user ? (
            <>
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="nav-cta-green" style={{ justifyContent: 'center', padding: '11px', fontSize: 14 }}>Ir para o Dashboard</Link>
              <button onClick={() => { setMobileOpen(false); signOut({ callbackUrl: '/' }); }}
                style={{ padding: '11px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#ef4444', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
                Terminar sessão
              </button>
            </>
          ) : (
            <button onClick={() => { setMobileOpen(false); signIn('discord', { callbackUrl: '/' }); }}
              className="nav-cta-green" style={{ justifyContent: 'center', padding: '11px', fontSize: 14, border: 'none', cursor: 'pointer', width: '100%' }}>
              Login
            </button>
          )}
        </div>
      )}
    </header>
  );
}
