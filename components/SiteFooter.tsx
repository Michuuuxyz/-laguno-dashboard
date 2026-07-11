import Link from 'next/link';
import Image from 'next/image';

/* Footer único do site — usado em todas as páginas públicas.
   Onda curva no topo (em vez de linha reta), colunas organizadas e o
   crocodilo a espreitar. Sem redes sociais. */

interface FLink { href: string; label: string; external?: boolean }
const COLS: { title: string; links: FLink[] }[] = [
  {
    title: 'Produto',
    links: [
      { href: '/features',  label: 'Funcionalidades' },
      { href: '/comandos',  label: 'Comandos' },
      { href: '/docs',      label: 'Documentação' },
      { href: '/dashboard', label: 'Dashboard' },
    ],
  },
  {
    title: 'Laguno',
    links: [
      { href: '/sobre', label: 'Sobre o projeto' },
      { href: 'https://discord.gg/tVyHSRjEY9', label: 'Servidor de suporte', external: true },
      { href: 'https://top.gg/bot/706487689519562833', label: 'top.gg', external: true },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/legal?tab=terms',   label: 'Termos de Serviço' },
      { href: '/legal?tab=privacy', label: 'Privacidade' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer style={{ position: 'relative', marginTop: 'clamp(56px,9vh,100px)' }}>
      {/* Onda no topo — transição curva em vez de linha reta */}
      <svg viewBox="0 0 1440 70" preserveAspectRatio="none" aria-hidden
        style={{ display: 'block', width: '100%', height: 'clamp(38px,5vw,64px)' }}>
        <path d="M0,70 C240,8 480,8 720,34 C960,60 1200,60 1440,14 L1440,70 Z" fill="var(--surface)" />
      </svg>

      <div style={{ background: 'var(--surface)', padding: '0 clamp(20px,4vw,56px) clamp(26px,4vh,40px)' }}>
        <div className="footer-grid" style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
          gap: 'clamp(22px,4vw,52px)', paddingBottom: 'clamp(26px,4vh,38px)',
        }}>
          {/* Marca */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Image src="/laguno.png" alt="Laguno" width={36} height={36} style={{ objectFit: 'contain' }} />
              <span style={{ fontFamily: 'var(--font-fun)', fontSize: 20, fontWeight: 600, color: 'var(--text-1)' }}>Laguno</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, maxWidth: 250 }}>
              O crocodilo que toma conta do teu servidor enquanto dormes.
            </p>
          </div>

          {/* Colunas de links */}
          {COLS.map(col => (
            <div key={col.title}>
              <p style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>
                {col.title}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(l => (
                  l.external
                    ? <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="footer-link" style={{ fontSize: 13 }}>{l.label}</a>
                    : <Link key={l.label} href={l.href} className="footer-link" style={{ fontSize: 13 }}>{l.label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Copyright + crocodilo a espreitar */}
        <div style={{
          maxWidth: 1100, margin: '0 auto', borderTop: '1px solid var(--line)',
          paddingTop: 'clamp(16px,3vh,22px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        }}>
          <p style={{ fontSize: 12.5, color: 'var(--text-3)' }}>
            © <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>@michu</span>
            {' & '}
            <span style={{ color: 'var(--green)', fontWeight: 500 }}>Laguno</span>
            {' · 2026 · Todos os direitos reservados'}
          </p>
          <img src="/mascote/espreitar.webp" alt="" aria-hidden style={{ height: 46, width: 'auto', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,.4))' }} />
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
