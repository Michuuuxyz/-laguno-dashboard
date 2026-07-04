'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mesma curva do ScrollReveal da página — o menu e o scroll falam a mesma língua
const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

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
      style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 12px', borderRadius: 10, textDecoration: 'none', transition: 'background .15s' }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--hover)';
        const box = e.currentTarget.querySelector('.di-box') as HTMLDivElement | null;
        if (box) { box.style.borderColor = 'rgba(109,184,62,.6)'; box.style.background = 'rgba(109,184,62,.14)'; }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        const box = e.currentTarget.querySelector('.di-box') as HTMLDivElement | null;
        if (box) { box.style.borderColor = 'rgba(109,184,62,.28)'; box.style.background = 'rgba(109,184,62,.07)'; }
      }}
    >
      {/* Ícone numa caixa arredondada com contorno — verde Laguno */}
      <div className="di-box" style={{
        width: 40, height: 40, borderRadius: 11, flexShrink: 0,
        border: '1px solid rgba(109,184,62,.28)',
        background: 'rgba(109,184,62,.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--green)', transition: 'border-color .15s, color .15s, background .15s',
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-1)', marginBottom: 3, letterSpacing: '-.01em' }}>{title}</p>
        <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.45 }}>{desc}</p>
      </div>
    </a>
  );
}

/* ── Menus de categoria com painel PARTILHADO ──
   - Abre no hover com a descida lenta (mega-drop)
   - Ao mudar de categoria com o menu aberto, o painel DESLIZA para o lado
     (transição de left/width) em vez de fechar e reabrir
   - Os itens entram em cascata (fade-up), como o scroll-reveal da página */
type MenuId = 'feat' | 'rec';
const MENU_WIDTHS: Record<MenuId, number> = { feat: 640, rec: 340 };

function MenuButton({ label, open, onHover, onClick, btnRef }: {
  label: string; open: boolean; onHover: () => void; onClick: () => void;
  btnRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <button ref={btnRef} onMouseEnter={onHover} onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 13.5, fontWeight: 500, color: open ? 'var(--text-1)' : 'var(--text-2)',
      padding: '7px 14px', borderRadius: 8, border: 'none',
      background: open ? 'var(--elevated)' : 'transparent',
      cursor: 'pointer', transition: 'color .15s, background .15s',
    }}>
      {label} <Chevron open={open} />
    </button>
  );
}

/* Item com entrada em cascata (fade-up) — framer-motion, como o ScrollReveal */
function Rise({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.08 + index * 0.06, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function NavMenus() {
  const [active, setActive] = useState<MenuId | null>(null);
  const [pos, setPos] = useState({ left: 0, width: MENU_WIDTHS.feat });
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const featRef = useRef<HTMLButtonElement>(null);
  const recRef  = useRef<HTMLButtonElement>(null);

  const openMenu = (m: MenuId) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    const btn = (m === 'feat' ? featRef : recRef).current;
    if (btn) {
      const center = btn.offsetLeft + btn.offsetWidth / 2;
      setPos({ left: center - MENU_WIDTHS[m] / 2, width: MENU_WIDTHS[m] });
    }
    setActive(m);
  };
  const cancelClose   = () => { if (closeTimer.current) clearTimeout(closeTimer.current); };
  const scheduleClose = () => { closeTimer.current = setTimeout(() => setActive(null), 140); };

  return (
    <div style={{ position: 'relative', display: 'flex', gap: 4 }} onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
      <MenuButton label="Funcionalidades" open={active === 'feat'} btnRef={featRef}
        onHover={() => openMenu('feat')} onClick={() => active === 'feat' ? setActive(null) : openMenu('feat')} />
      <MenuButton label="Recursos" open={active === 'rec'} btnRef={recRef}
        onHover={() => openMenu('rec')} onClick={() => active === 'rec' ? setActive(null) : openMenu('rec')} />

      <AnimatePresence>
      {active && (
        // wrapper com transição de left/width → o slide lateral entre categorias
        <div style={{
          position: 'absolute', top: '100%', left: pos.left, width: pos.width,
          paddingTop: 10, zIndex: 110,
          transition: 'left .45s cubic-bezier(.16,1,.3,1), width .45s cubic-bezier(.16,1,.3,1)',
        }}>
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, transition: { duration: 0.22, ease: EASE } }}
            transition={{ duration: 0.5, ease: EASE }}
            style={{
              background: 'var(--card)', border: '1px solid var(--line)',
              borderRadius: 16, padding: 10,
              boxShadow: '0 20px 60px rgba(0,0,0,.55)',
              overflow: 'hidden',
            }} onClick={() => setActive(null)}>
            {/* key={active} remonta o conteúdo → cascata dispara a cada troca */}
            <div key={active}>
              {active === 'feat' ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 14px' }}>
                    <Rise index={0}><DropItem href="/features#moderacao"  icon={DI.moderacao}  title="Moderação"   desc="Ban, kick e warn — com personalidade" /></Rise>
                    <Rise index={1}><DropItem href="/features#moderacao"  icon={DI.automod}    title="Auto-Mod"    desc="Spam e convites bloqueados sozinhos" /></Rise>
                    <Rise index={2}><DropItem href="/features#boasvindas" icon={DI.boasvindas} title="Boas-Vindas" desc="Recebe cada membro com estilo" /></Rise>
                    <Rise index={3}><DropItem href="/features#selfroles"  icon={DI.selfroles}  title="Self-Roles"  desc="Clica no botão, recebe o cargo" /></Rise>
                    <Rise index={4}><DropItem href="/features#sorteios"   icon={DI.sorteios}   title="Sorteios"    desc="Cria, gere e sorteia do dashboard" /></Rise>
                    <Rise index={5}><DropItem href="/features#builder"    icon={DI.builder}    title="Construtor"  desc="Mensagens com botões, sem código" /></Rise>
                  </div>
                  <Rise index={6}>
                    <div style={{ height: 1, background: 'var(--line)', margin: '6px 4px' }} />
                    <Link href="/features" style={{ display: 'block', padding: '10px 12px', fontSize: 12.5, fontWeight: 600, color: 'var(--green)', textDecoration: 'none' }}>
                      Ver todas as funcionalidades →
                    </Link>
                  </Rise>
                </>
              ) : (
                <>
                  <Rise index={0}><DropItem href="/comandos" icon={DI.comandos} title="Comandos"     desc="Todos os slash commands, pesquisáveis" /></Rise>
                  <Rise index={1}><DropItem href="/docs"     icon={DI.docs}     title="Documentação" desc="Guias de configuração passo a passo" /></Rise>
                  <Rise index={2}><DropItem href="/sobre"    icon={DI.sobre}    title="Sobre"        desc="A história do Laguno" /></Rise>
                  <Rise index={3}><DropItem href={SERVER_INVITE} external icon={DI.discord} title="Servidor Discord" desc="Junta-te à comunidade do Laguno" /></Rise>
                  <Rise index={4}><div style={{ height: 1, background: 'var(--line)', margin: '4px 0' }} /></Rise>
                  <Rise index={5}><DropItem href="/legal?tab=terms"   icon={DI.termos}      title="Termos de Serviço"       desc="Condições de utilização do bot" /></Rise>
                  <Rise index={6}><DropItem href="/legal?tab=privacy" icon={DI.privacidade} title="Política de Privacidade" desc="Como tratamos os teus dados" /></Rise>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
}

/* Ícones dos dropdowns */
const dic = (p: React.ReactNode) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{p}</svg>
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
  discord:    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>,
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
        /* (animações do mega-menu agora via framer-motion, como o ScrollReveal) */
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

        {/* Center nav (desktop) — painel partilhado com slide entre categorias */}
        <nav className="nav-desktop" style={{ gap: 4, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <NavMenus />
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
