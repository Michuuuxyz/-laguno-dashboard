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
      <div style={{ width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--green)', marginTop: 1 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 1 }}>{title}</p>
        <p style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.4 }}>{desc}</p>
      </div>
    </a>
  );
}

/* ── Dropdown de categoria — abre no hover, fecha com pequena tolerância ── */
function NavDrop({ label, width, children }: { label: string; width: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enter = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setOpen(true); };
  const leave = () => { closeTimer.current = setTimeout(() => setOpen(false), 140); };

  return (
    <div style={{ position: 'relative' }} onMouseEnter={enter} onMouseLeave={leave}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 13.5, fontWeight: 500, color: open ? 'var(--text-1)' : 'var(--text-2)',
        padding: '7px 14px', borderRadius: 8, border: 'none',
        background: open ? 'var(--elevated)' : 'transparent',
        cursor: 'pointer', transition: 'color .15s, background .15s',
      }}>
        {label} <Chevron open={open} />
      </button>

      {open && (
        // padding-top faz "ponte" entre o botão e o painel — o hover não quebra
        <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', paddingTop: 10, zIndex: 110 }}>
          <div style={{
            background: 'var(--card)', border: '1px solid var(--line)',
            borderRadius: 14, padding: 8, width,
            boxShadow: '0 16px 48px rgba(0,0,0,.55)',
            animation: 'dropdown-in .18s cubic-bezier(.16,1,.3,1) both',
          }} onClick={() => setOpen(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

/* Ícones dos dropdowns */
const dic = (p: React.ReactNode) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{p}</svg>
);
const DI = {
  moderacao:  dic(<><path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z"/><path d="M9.5 12l1.8 1.8L15 10"/></>),
  automod:    dic(<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>),
  boasvindas: dic(<><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="9" cy="7" r="3.2"/><path d="M17 11l2 2 4-4"/></>),
  selfroles:  dic(<><path d="M20.6 13.4L13 21a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 2.6 12l.4-6a2 2 0 0 1 2-2l6-.4a2 2 0 0 1 1.6.6l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="8.5" r="1.4"/></>),
  sorteios:   dic(<><rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13"/><path d="M12 8S10.5 3 7.8 3.6C6 4 6 6.5 8 7.4 9.4 8 12 8 12 8zM12 8s1.5-5 4.2-4.4C18 4 18 6.5 16 7.4 14.6 8 12 8 12 8z"/></>),
  builder:    dic(<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>),
  comandos:   dic(<><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></>),
  docs:       dic(<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>),
  sobre:      dic(<><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>),
  discord:    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>,
  termos:     dic(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>),
  privacidade: dic(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>),
};

export function Navbar() {
  const { data: session } = useSession();
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

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,13,15,.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--line)' }}>
      <style>{`
        @keyframes dropdown-in { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:none } }
        .nav-desktop { display: flex; }
        .nav-burger  { display: none; }
        @media (max-width: 780px) {
          .nav-desktop { display: none !important; }
          .nav-burger  { display: flex !important; }
        }
      `}</style>
      <div style={{ height: 58, display: 'flex', alignItems: 'center', padding: '0 clamp(16px,4vw,48px)', maxWidth: 1200, margin: '0 auto', width: '100%' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0, marginRight: 32 }}>
          <Image src="/laguno.png" alt="Laguno" width={52} height={52} style={{ objectFit: 'contain', flexShrink: 0 }} />
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.02em' }}>Laguno</span>
        </Link>

        {/* Center nav (desktop) */}
        <nav className="nav-desktop" style={{ gap: 4, flex: 1, justifyContent: 'center', alignItems: 'center' }}>

          {/* Funcionalidades — mega-menu em 2 colunas */}
          <NavDrop label="Funcionalidades" width={520}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <DropItem href="/features#moderacao"  icon={DI.moderacao}  title="Moderação"    desc="Ban, kick e warn — com personalidade" />
              <DropItem href="/features#moderacao"  icon={DI.automod}    title="Auto-Mod"     desc="Spam e convites bloqueados sozinhos" />
              <DropItem href="/features#boasvindas" icon={DI.boasvindas} title="Boas-Vindas"  desc="Recebe cada membro com estilo" />
              <DropItem href="/features#selfroles"  icon={DI.selfroles}  title="Self-Roles"   desc="Clica no botão, recebe o cargo" />
              <DropItem href="/features#sorteios"   icon={DI.sorteios}   title="Sorteios"     desc="Cria, gere e sorteia do dashboard" />
              <DropItem href="/features#builder"    icon={DI.builder}    title="Construtor"   desc="Mensagens com botões, sem código" />
            </div>
            <div style={{ height: 1, background: 'var(--line)', margin: '6px 4px' }} />
            <Link href="/features" style={{ display: 'block', padding: '8px 10px', fontSize: 12.5, fontWeight: 600, color: 'var(--green)', textDecoration: 'none' }}>
              Ver todas as funcionalidades →
            </Link>
          </NavDrop>

          {/* Recursos */}
          <NavDrop label="Recursos" width={290}>
            <DropItem href="/comandos" icon={DI.comandos} title="Comandos"      desc="Todos os slash commands, pesquisáveis" />
            <DropItem href="/docs"     icon={DI.docs}     title="Documentação"  desc="Guias de configuração passo a passo" />
            <DropItem href="/sobre"    icon={DI.sobre}    title="Sobre"         desc="A história do Laguno" />
            <DropItem href={SERVER_INVITE} external icon={DI.discord} title="Servidor Discord" desc="Junta-te à comunidade do Laguno" />
            <div style={{ height: 1, background: 'var(--line)', margin: '4px 0' }} />
            <DropItem href="/legal?tab=terms"   icon={DI.termos}      title="Termos de Serviço"       desc="Condições de utilização do bot" />
            <DropItem href="/legal?tab=privacy" icon={DI.privacidade} title="Política de Privacidade" desc="Como tratamos os teus dados" />
          </NavDrop>
        </nav>

        {/* Right (desktop) */}
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
          borderTop: '1px solid var(--line)', background: 'rgba(13,13,15,.98)',
          animation: 'dropdown-in .15s ease both',
        }}>
          {[
            { href: '/features', label: 'Funcionalidades' },
            { href: '/comandos', label: 'Comandos' },
            { href: '/docs',     label: 'Documentação' },
            { href: '/sobre',    label: 'Sobre' },
          ].map(l => (
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
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="nav-cta-outline" style={{ flex: 1, justifyContent: 'center', padding: '11px' }}>Dashboard</Link>
              <a href={BOT_INVITE} target="_blank" rel="noreferrer" onClick={() => setMobileOpen(false)} className="nav-cta-green" style={{ flex: 1, justifyContent: 'center', padding: '11px' }}>Adicionar</a>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
