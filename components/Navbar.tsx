'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';

const CLIENT_ID    = process.env.NEXT_PUBLIC_CLIENT_ID;
const BOT_INVITE   = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=bot+applications.commands&permissions=1102129391846`;
const SERVER_INVITE = 'https://discord.gg/tVyHSRjEY9';

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function DropItem({ href, external, icon, title, desc, onClick }: {
  href: string; external?: boolean; onClick?: () => void;
  icon: React.ReactNode; title: string; desc: string;
}) {
  const props = external ? { target: '_blank', rel: 'noreferrer' } : {};
  return (
    <a href={href} {...props} onClick={onClick}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 10px', borderRadius: 8, textDecoration: 'none', transition: 'background .12s' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--green-muted)', border: '1px solid var(--green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--green)' }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 1 }}>{title}</p>
        <p style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.4 }}>{desc}</p>
      </div>
    </a>
  );
}

export function Navbar() {
  const { data: session } = useSession();
  const [suporteOpen, setSuporteOpen] = useState(false);
  const [userOpen, setUserOpen]       = useState(false);
  const suporteRef = useRef<HTMLDivElement>(null);
  const userRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suporteRef.current && !suporteRef.current.contains(e.target as Node)) setSuporteOpen(false);
      if (userRef.current    && !userRef.current.contains(e.target as Node))    setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,13,15,.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--line)' }}>
      <style>{`@keyframes dropdown-in { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:none } }`}</style>
      <div style={{ height: 58, display: 'flex', alignItems: 'center', padding: '0 clamp(16px,4vw,48px)', maxWidth: 1200, margin: '0 auto', width: '100%' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0, marginRight: 32 }}>
          <Image src="/laguno.png" alt="Laguno" width={52} height={52} style={{ objectFit: 'contain', flexShrink: 0 }} />
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.02em' }}>Laguno</span>
        </Link>

        {/* Center nav */}
        <nav style={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Link href="/features" className="nav-link">Funcionalidades</Link>
          <Link href="/docs" className="nav-link">Documentação</Link>
          <Link href="/sobre" className="nav-link">Sobre</Link>

          {/* Suporte dropdown */}
          <div ref={suporteRef} style={{ position: 'relative' }}>
            <button onClick={() => setSuporteOpen(o => !o)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 13.5, fontWeight: 500, color: suporteOpen ? 'var(--text-1)' : 'var(--text-2)',
              padding: '6px 14px', borderRadius: 6, border: 'none',
              background: suporteOpen ? 'var(--elevated)' : 'transparent',
              cursor: 'pointer', transition: 'color .12s, background .12s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.background = 'var(--elevated)'; }}
              onMouseLeave={e => { if (!suporteOpen) { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'transparent'; } }}
            >
              Suporte <Chevron open={suporteOpen} />
            </button>

            {suporteOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
                background: 'var(--card)', border: '1px solid var(--line)',
                borderRadius: 12, padding: 6, minWidth: 260,
                boxShadow: '0 12px 40px rgba(0,0,0,.6)',
                animation: 'dropdown-in .15s ease both',
              }}>
                <DropItem
                  href={SERVER_INVITE} external
                  onClick={() => setSuporteOpen(false)}
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>}
                  title="Servidor Discord"
                  desc="Junta-te à comunidade do Laguno"
                />
                <div style={{ height: 1, background: 'var(--line)', margin: '4px 0' }} />
                <DropItem
                  href="/legal?tab=terms"
                  onClick={() => setSuporteOpen(false)}
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>}
                  title="Termos de Serviço"
                  desc="Condições de utilização do bot"
                />
                <DropItem
                  href="/legal?tab=privacy"
                  onClick={() => setSuporteOpen(false)}
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
                  title="Política de Privacidade"
                  desc="Como tratamos os teus dados"
                />
              </div>
            )}
          </div>
        </nav>

        {/* Right */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
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
                <Chevron open={userOpen} />
              </button>

              {userOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                  background: 'var(--card)', border: '1px solid var(--line)',
                  borderRadius: 10, padding: 6, minWidth: 180,
                  boxShadow: '0 8px 32px rgba(0,0,0,.5)',
                  animation: 'dropdown-in .15s ease both',
                }}>
                  <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--line)', marginBottom: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 1 }}>{session.user.name}</p>
                    <p style={{ fontSize: 11.5, color: 'var(--text-2)' }}>Discord</p>
                  </div>
                  <Link href="/dashboard" onClick={() => setUserOpen(false)}
                    style={{ display: 'block', padding: '7px 10px', borderRadius: 6, fontSize: 13, color: 'var(--text-1)', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >Dashboard</Link>
                  <button onClick={() => { setUserOpen(false); signOut({ callbackUrl: '/' }); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 6, fontSize: 13, color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >Terminar sessão</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/dashboard" className="nav-cta-outline">Dashboard</Link>
              <a href={BOT_INVITE} target="_blank" rel="noreferrer" className="nav-cta-green">Adicionar grátis</a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
