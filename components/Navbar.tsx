'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const SERVER_INVITE = 'https://discord.gg/tVyHSRjEY9';

function Caret() {
  return (
    <svg className="lgnav-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/* Ícones duotone (verde no menu via currentColor) */
const dic = (p: React.ReactNode) => <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">{p}</svg>;
const DI = {
  moderacao:  dic(<><path d="M12 2.2l7.5 2.9a1 1 0 0 1 .6 1v5.4c0 4.9-3.3 8.4-7.8 9.9a1 1 0 0 1-.6 0C7.2 19.9 3.9 16.4 3.9 11.5V6.1a1 1 0 0 1 .6-1z" opacity=".35"/><path d="M10.6 13.2l-1.7-1.7-1.5 1.5 3.2 3.2 5.3-5.3-1.5-1.5z"/></>),
  automod:    dic(<><path d="M13.5 2.2 3.6 14a.7.7 0 0 0 .5 1.1H9l-1 6.3a.6.6 0 0 0 1.1.4L20.4 10a.7.7 0 0 0-.5-1.1H15z" opacity=".35"/><path d="M13.5 2.2 3.6 14a.7.7 0 0 0 .5 1.1H9z"/></>),
  boasvindas: dic(<><path d="M4 20.5a8 8 0 0 1 16 0 .9.9 0 0 1-.9.9H4.9a.9.9 0 0 1-.9-.9z" opacity=".35"/><circle cx="12" cy="7.5" r="4.3"/></>),
  reactionroles: dic(<><path d="M11.7 3.4A2 2 0 0 0 10.3 3H5.4a2 2 0 0 0-2 2v4.9a2 2 0 0 0 .6 1.4l8 8a2 2 0 0 0 2.8 0l4.9-4.9a2 2 0 0 0 0-2.8z" opacity=".35"/><circle cx="7.7" cy="7.7" r="1.9"/></>),
  sorteios:   dic(<><rect x="4" y="11" width="16" height="10" rx="2" opacity=".35"/><rect x="2.5" y="7" width="19" height="4.6" rx="1.4"/><rect x="10.4" y="7" width="3.2" height="14" opacity=".6"/></>),
  builder:    dic(<><path d="M4 4h16a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 16H9.5L4.8 20a.8.8 0 0 1-1.3-.6V5.5A1.5 1.5 0 0 1 4 4z" opacity=".35"/><rect x="7" y="8" width="10" height="2" rx="1"/><rect x="7" y="11.5" width="6.5" height="2" rx="1"/></>),
  comandos:   dic(<><rect x="2.5" y="4" width="19" height="16" rx="3" opacity=".35"/><path d="M6.7 9.3a1 1 0 0 1 1.5-1.3l2.8 3a1 1 0 0 1 0 1.4l-2.8 3a1 1 0 1 1-1.5-1.4L8.9 12z"/><rect x="12" y="14.3" width="5" height="1.9" rx=".95"/></>),
  docs:       dic(<><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 0 4 21.5z" opacity=".35"/><rect x="7.5" y="6.5" width="8.5" height="1.9" rx=".95"/><rect x="7.5" y="10.2" width="6" height="1.9" rx=".95"/></>),
  sobre:      dic(<><circle cx="12" cy="12" r="9.5" opacity=".35"/><circle cx="12" cy="8" r="1.4"/><rect x="11" y="10.8" width="2" height="6.2" rx="1"/></>),
  discord:    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>,
  termos:     dic(<><path d="M6 2.5h7L18.5 8v11.5A1.5 1.5 0 0 1 17 21H6a1.5 1.5 0 0 1-1.5-1.5V4A1.5 1.5 0 0 1 6 2.5z" opacity=".35"/><path d="M12.5 2.5V7.5a1 1 0 0 0 1 1H18.5" opacity=".55"/><rect x="7.5" y="12" width="7" height="1.7" rx=".85"/><rect x="7.5" y="15.2" width="7" height="1.7" rx=".85"/></>),
  privacidade: dic(<><path d="M12 2.2l7.5 2.9a1 1 0 0 1 .6 1v5.4c0 4.9-3.3 8.4-7.8 9.9a1 1 0 0 1-.6 0C7.2 19.9 3.9 16.4 3.9 11.5V6.1a1 1 0 0 1 .6-1z" opacity=".35"/><circle cx="12" cy="11.5" r="1.7"/><rect x="11.2" y="12" width="1.6" height="4" rx=".8"/></>),
};

/* Item de menu — ícone + título + descrição, no tema Laguno */
function Item({ href, external, icon, title, desc }: {
  href: string; external?: boolean; icon: React.ReactNode; title: string; desc: string;
}) {
  const props = external ? { target: '_blank', rel: 'noreferrer' } : {};
  return (
    <li>
      <NavigationMenu.Link asChild>
        <a className="lgnav-itemlink" href={href} {...props}>
          <span className="lgnav-itemicon">{icon}</span>
          <span>
            <span className="lgnav-itemtitle">{title}</span>
            <span className="lgnav-itemtext">{desc}</span>
          </span>
        </a>
      </NavigationMenu.Link>
    </li>
  );
}

const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
const INVITE = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=bot+applications.commands&permissions=1102666262758`;

function LagunoMenu() {
  return (
    <NavigationMenu.Root className="lgnav-root" delayDuration={100}>
      <NavigationMenu.List className="lgnav-list">

        <NavigationMenu.Item>
          <NavigationMenu.Trigger className="lgnav-trigger">Funcionalidades <Caret /></NavigationMenu.Trigger>
          <NavigationMenu.Content className="lgnav-content">
            <ul className="lgnav-panel one">
              <li style={{ gridRow: 'span 3' }}>
                <NavigationMenu.Link asChild>
                  <a className="lgnav-callout" href={INVITE} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/laguno.png" alt="" width={40} height={40} style={{ objectFit: 'contain' }} />
                    <div className="lgnav-callout-h">Adicionar ao servidor</div>
                    <p className="lgnav-callout-t">O guardião da tua lagoa. Grátis, em português, pronto em dois minutos.</p>
                  </a>
                </NavigationMenu.Link>
              </li>
              <Item href="/features#moderacao"  icon={DI.moderacao}     title="Moderação"      desc="Ban, kick e warn — com personalidade" />
              <Item href="/features#moderacao"  icon={DI.automod}       title="Auto-Mod"       desc="Spam e convites bloqueados sozinhos" />
              <Item href="/features#boasvindas" icon={DI.boasvindas}    title="Boas-Vindas"    desc="Recebe cada membro com estilo" />
              <Item href="/features#selfroles"  icon={DI.reactionroles} title="Reaction Roles" desc="Clica no botão, recebe o cargo" />
              <Item href="/features#sorteios"   icon={DI.sorteios}      title="Sorteios"       desc="Cria, gere e sorteia do dashboard" />
              <Item href="/features#builder"    icon={DI.builder}       title="Construtor"     desc="Mensagens com botões, sem código" />
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Trigger className="lgnav-trigger">Recursos <Caret /></NavigationMenu.Trigger>
          <NavigationMenu.Content className="lgnav-content">
            <ul className="lgnav-panel two">
              <Item href="/comandos" icon={DI.comandos} title="Comandos" desc="Todos os slash commands, pesquisáveis" />
              <Item href="/docs"     icon={DI.docs}     title="Documentação" desc="Guias de configuração passo a passo" />
              <Item href="/sobre"    icon={DI.sobre}    title="Sobre" desc="A história do Laguno" />
              <Item href={SERVER_INVITE} external icon={DI.discord} title="Servidor Discord" desc="Junta-te à comunidade" />
              <Item href="/legal?tab=terms"   icon={DI.termos}      title="Termos" desc="Condições de utilização" />
              <Item href="/legal?tab=privacy" icon={DI.privacidade} title="Privacidade" desc="Como tratamos os teus dados" />
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Link className="lgnav-link" asChild>
            <Link href="/comandos">Comandos</Link>
          </NavigationMenu.Link>
        </NavigationMenu.Item>

        <NavigationMenu.Indicator className="lgnav-indicator">
          <div className="lgnav-arrow" />
        </NavigationMenu.Indicator>
      </NavigationMenu.List>

      <div className="lgnav-viewport-pos">
        <NavigationMenu.Viewport className="lgnav-viewport" />
      </div>
    </NavigationMenu.Root>
  );
}

export function Navbar() {
  const { data: session } = useSession();
  const [userOpen, setUserOpen] = useState(false);
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
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,13,15,.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--line)' }}>
      <style>{`
        @keyframes dropdown-in { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:none } }
        .nav-desktop { display: flex; }
        .nav-burger  { display: none; }
        @media (max-width: 860px) {
          .nav-desktop { display: none !important; }
          .nav-burger  { display: flex !important; }
        }
      `}</style>
      <div style={{ height: 60, display: 'flex', alignItems: 'center', padding: '0 clamp(16px,4vw,48px)', maxWidth: 1240, margin: '0 auto', width: '100%' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0, marginRight: 20 }}>
          <Image src="/laguno.png" alt="Laguno" width={40} height={40} style={{ objectFit: 'contain', flexShrink: 0 }} />
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.02em' }}>Laguno</span>
        </Link>

        {/* Menu central (Radix) */}
        <div className="nav-desktop" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <LagunoMenu />
        </div>

        {/* Direita */}
        <div className="nav-desktop" style={{ gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {session?.user ? (
            <div ref={userRef} style={{ position: 'relative' }}>
              <button onClick={() => setUserOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(109,184,62,.4)', flexShrink: 0 }}>
                  {session.user.image
                    ? <Image src={session.user.image} alt={session.user.name ?? ''} width={34} height={34} style={{ objectFit: 'cover' }} />
                    : <div style={{ width: 34, height: 34, background: '#5865f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>{(session.user.name ?? 'U')[0].toUpperCase()}</div>}
                </div>
              </button>
              <AnimatePresence>
              {userOpen && (
                <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8, transition: { duration: 0.18, ease: EASE } }} transition={{ duration: 0.4, ease: EASE }}
                  style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: '6px 0', minWidth: 230, boxShadow: '0 16px 48px rgba(0,0,0,.55)', overflow: 'hidden' }}>
                  {[{ href: '/dashboard', label: 'Dashboard' }, { href: SERVER_INVITE, label: 'Suporte', external: true }, { href: '/comandos', label: 'Comandos' }, { href: '/docs', label: 'Documentação' }].map(l => (
                    <a key={l.label} href={l.href} {...(l.external ? { target: '_blank', rel: 'noreferrer' } : {})} onClick={() => setUserOpen(false)}
                      style={{ display: 'block', padding: '11px 18px', fontSize: 14, fontWeight: 500, color: 'var(--text-1)', textDecoration: 'none', transition: 'background .12s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>{l.label}</a>
                  ))}
                  <div style={{ height: 1, background: 'var(--line)', margin: '6px 0' }} />
                  <button onClick={() => { setUserOpen(false); signOut({ callbackUrl: '/' }); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 18px', fontSize: 14, fontWeight: 500, color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background .12s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>Terminar sessão</button>
                </motion.div>
              )}
              </AnimatePresence>
            </div>
          ) : (
            <button onClick={() => signIn('discord', { callbackUrl: '/' })} className="nav-cta-green" style={{ border: 'none', cursor: 'pointer' }}>Login</button>
          )}
        </div>

        {/* Hamburger (mobile) */}
        <button className="nav-burger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu"
          style={{ marginLeft: 'auto', background: 'none', border: '1px solid var(--line)', borderRadius: 8, width: 38, height: 38, cursor: 'pointer', color: 'var(--text-1)', alignItems: 'center', justifyContent: 'center' }}>
          {mobileOpen
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>}
        </button>
      </div>

      {/* Painel mobile */}
      {mobileOpen && (
        <div className="nav-burger" style={{ flexDirection: 'column', padding: '8px 16px 18px', gap: 2, borderTop: '1px solid var(--line)', background: 'rgba(13,13,15,.98)', animation: 'dropdown-in .15s ease both' }}>
          {[{ href: '/features', label: 'Funcionalidades' }, { href: '/comandos', label: 'Comandos' }, { href: '/docs', label: 'Documentação' }, { href: '/sobre', label: 'Sobre' }].map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} style={{ padding: '11px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>{l.label}</Link>
          ))}
          <a href={SERVER_INVITE} target="_blank" rel="noreferrer" onClick={() => setMobileOpen(false)} style={{ padding: '11px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'var(--text-2)' }}>Servidor de suporte</a>
          <div style={{ height: 1, background: 'var(--line)', margin: '8px 0' }} />
          {session?.user ? (
            <>
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="nav-cta-green" style={{ justifyContent: 'center', padding: '11px', fontSize: 14 }}>Ir para o Dashboard</Link>
              <button onClick={() => { setMobileOpen(false); signOut({ callbackUrl: '/' }); }} style={{ padding: '11px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#ef4444', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>Terminar sessão</button>
            </>
          ) : (
            <button onClick={() => { setMobileOpen(false); signIn('discord', { callbackUrl: '/' }); }} className="nav-cta-green" style={{ justifyContent: 'center', padding: '11px', fontSize: 14, border: 'none', cursor: 'pointer', width: '100%' }}>Login</button>
          )}
        </div>
      )}
    </header>
  );
}
