import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { TypingHero } from '@/components/TypingHero';
import { SiteFooter } from '@/components/SiteFooter';
import { ScrollReveal, ScrollRevealList, ScrollRevealItem } from '@/components/ScrollReveal';

export const metadata: Metadata = {
  title: 'Laguno — Bot de Discord em português',
  description: 'Bane spammers. Regista tudo. Dá boas-vindas. Em português, para toda a comunidade lusófona.',
  openGraph: {
    title: 'Laguno — Bot de Discord em português',
    description: 'Bane spammers. Regista tudo. Dá boas-vindas. Em português, para toda a comunidade lusófona.',
    url: 'https://lagunoapp.xyz',
  },
};

const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
const INVITE    = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=bot+applications.commands&permissions=1102129391846`;

/* ── Ícones clássicos (linha, feitos à mão) ── */
const svg = (p: React.ReactNode) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{p}</svg>
);
const MODULE_ICONS: Record<string, React.ReactNode> = {
  Moderação:    svg(<><path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z"/><path d="M9.5 12l1.8 1.8L15 10"/></>),
  'Auto-Mod':   svg(<><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></>),
  Registos:     svg(<><path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5M8.5 13h7M8.5 16.5h7M8.5 9.5h3"/></>),
  'Boas-vindas':svg(<><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="9" cy="7" r="3.2"/><path d="M17 11l2 2 4-4"/></>),
  'Self-Roles': svg(<><path d="M20.6 13.4L13 21a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 2.6 12l.4-6a2 2 0 0 1 2-2l6-.4a2 2 0 0 1 1.6.6l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="8.5" r="1.4"/></>),
  Sorteios:     svg(<><rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13"/><path d="M12 8S10.5 3 7.8 3.6C6 4 6 6.5 8 7.4 9.4 8 12 8 12 8zM12 8s1.5-5 4.2-4.4C18 4 18 6.5 16 7.4 14.6 8 12 8 12 8z"/></>),
};

export default function Home() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* ── HERO — título que domina, figurinha integrada ── */}
      <section style={{ minHeight: '92vh', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,4vw,56px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40 }}>

          {/* Esquerda: texto */}
          <div style={{ flex: '1 1 0', minWidth: 0 }}>
            {/* Eyebrow badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '5px 12px 5px 8px', borderRadius: 99, marginBottom: 24,
              background: 'var(--card)', border: '1px solid var(--line)',
            }}>
              <span style={{ display: 'inline-flex', width: 18, height: 18, borderRadius: '50%', background: 'rgba(109,184,62,.15)', alignItems: 'center', justifyContent: 'center', color: 'var(--green)' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z"/></svg>
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)', letterSpacing: '-.01em' }}>
                Moderação em português · <span style={{ color: 'var(--green)' }}>grátis</span>
              </span>
            </div>

            <TypingHero />
            <div style={{ marginTop: 'clamp(32px,5vh,48px)', display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
              <p style={{ fontSize: 'clamp(15px,1.6vw,18px)', color: 'var(--text-2)', lineHeight: 1.6, maxWidth: 380 }}>
                Bot de moderação em português. Ban, logs, boas-vindas, self-roles e sorteios.
                Tudo num dashboard. Tudo grátis.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <a href={INVITE} target="_blank" rel="noreferrer" className="nav-cta-green" style={{ fontSize: 15, padding: '.8rem 2rem', fontWeight: 700 }}>
                    Adicionar
                  </a>
                  <Link href="/features" className="nav-cta-outline" style={{ fontSize: 15, padding: '.8rem 2rem' }}>
                    Ver mais
                  </Link>
                </div>
                {/* Linha de confiança */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: 'var(--text-3)', flexWrap: 'wrap' }}>
                  {['Grátis, sem cartão', 'Pronto em 2 minutos', '100% em português'].map(t => (
                    <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Direita: figurinha */}
          <div className="hero-fig" style={{ flexShrink: 0 }}>
            <Image
              src="/fig3.png"
              alt="Laguno"
              width={320}
              height={320}
              style={{
                filter: 'drop-shadow(0 40px 80px rgba(0,0,0,.5))',
                transform: 'rotate(6deg)',
              }}
            />
          </div>
        </div>
      </section>

      {/* ── A linha de água — daqui para baixo, mergulhas ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,4vw,56px)' }}>
        <div className="waterline" style={{ ['--eyes-x' as string]: '76%' } as React.CSSProperties}>
          <span className="waterline-eyes"><span /><span /></span>
        </div>
        <p className="depth-label" style={{ marginTop: 14 }}>Superfície · a lagoa do Laguno</p>
      </div>

      {/* ── BLOCO VERDE — declaração forte ── */}
      <section style={{ background: 'var(--green)', padding: 'clamp(48px,7vh,80px) clamp(20px,4vw,56px)', marginTop: 'clamp(32px,5vh,56px)' }}>
        <ScrollReveal style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
          <p className="display" style={{
            fontSize: 'clamp(24px,4vw,52px)',
            fontWeight: 800,
            letterSpacing: '-.03em',
            lineHeight: 1.1,
            color: '#fff',
            maxWidth: 700,
          }}>
            Feito em português<br />para toda a comunidade lusófona.
          </p>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.75)', lineHeight: 1.7, maxWidth: 320 }}>
            Em português. Com personalidade. Sem desculpas.
          </p>
        </ScrollReveal>
      </section>

      {/* ── MÓDULOS — a 2 metros de profundidade ── */}
      <section style={{ background: '#0b0b0d', borderBottom: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(64px,9vh,100px) clamp(20px,4vw,56px)' }}>
        <p className="depth-label" style={{ marginBottom: 'clamp(32px,5vh,48px)' }}>−2 m · os módulos</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,5vw,80px)', alignItems: 'start' }} className="modules-split">

          {/* Esquerda: título */}
          <div style={{ position: 'sticky', top: 100 }}>
            <h2 className="display" style={{
              fontSize: 'clamp(32px,5vw,64px)',
              fontWeight: 800,
              letterSpacing: '-.03em',
              lineHeight: 1.0,
              marginBottom: 24,
            }}>
              Faz o<br />trabalho<br />chato.
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 32 }}>
              Para ti sobrar tempo para o que interessa.
            </p>
            <Image
              src="/fig2.png"
              alt=""
              width={160}
              height={160}
              style={{ transform: 'rotate(-8deg)', filter: 'drop-shadow(0 16px 32px rgba(0,0,0,.4))' }}
            />
          </div>

          {/* Direita: lista de módulos com stagger */}
          <ScrollRevealList>
            {[
              { n: 'Moderação',      t: 'Ban, kick, mute, warn, timeout, purge, lock. Com histórico e ações automáticas.' },
              { n: 'Auto-Mod',       t: 'Filtros de palavras, anti-spam, anti-flood, bloqueio de links. Configuras uma vez.' },
              { n: 'Registos',       t: 'Mais de 30 eventos num canal à tua escolha. Quem baniu, quem editou, quem entrou.' },
              { n: 'Boas-vindas',    t: 'Mensagem com menção, nome, servidor. DM privada e auto-delete opcionais.' },
              { n: 'Self-Roles',     t: 'Painéis de botões para membros escolherem cargos. Sem trabalho teu.' },
              { n: 'Sorteios',       t: 'Crias no dashboard, o Laguno publica e sorteia. Re-roll com um clique.' },
            ].map(({ n, t }, i) => (
              <ScrollRevealItem key={n}>
                <div className="module-row" style={{
                  padding: 'clamp(20px,3vh,28px) 0',
                  borderBottom: '1px solid var(--line)',
                  display: 'grid',
                  gridTemplateColumns: '44px 150px 1fr',
                  gap: 20,
                  alignItems: 'center',
                }}>
                  <span className="module-icon" style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--card)', border: '1px solid var(--line)',
                    color: 'var(--green)', transition: 'all .18s',
                  }}>
                    {MODULE_ICONS[n]}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--text-1)' }}>
                    <span style={{ color: 'var(--green)', fontSize: 12, fontWeight: 700, marginRight: 8, fontVariantNumeric: 'tabular-nums' }}>{String(i + 1).padStart(2, '0')}</span>
                    {n}
                  </span>
                  <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>{t}</p>
                </div>
              </ScrollRevealItem>
            ))}
          </ScrollRevealList>
        </div>
      </div>
      </section>

      {/* ── PERSONALIDADE — a 10 metros, onde vive o humor ── */}
      <section style={{ background: '#09090b', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(64px,9vh,100px) clamp(20px,4vw,56px)' }}>
          <p className="depth-label" style={{ marginBottom: 'clamp(28px,4vh,40px)' }}>−10 m · a personalidade</p>

          <ScrollReveal>
            <div style={{ display: 'flex', gap: 16, marginBottom: 48, flexWrap: 'wrap' }}>
              {['stressado', 'sonolento', 'entediado', 'animado', 'feliz'].map((m, i) => (
                <span key={m} style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: 99,
                  border: '1px solid var(--line)',
                  color: i === 0 ? '#ef4444' : i === 3 ? '#fbbf24' : i === 4 ? 'var(--green)' : 'var(--text-3)',
                }}>{m}</span>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'clamp(40px,6vw,96px)', alignItems: 'center' }} className="mood-grid">
            <Image
              src="/fig1.png"
              alt="Laguno"
              width={220}
              height={220}
              style={{ transform: 'rotate(-5deg)', filter: 'drop-shadow(0 24px 48px rgba(0,0,0,.4))', flexShrink: 0 }}
              className="fig-story"
            />
            <div>
              <h2 className="display" style={{
                fontSize: 'clamp(28px,5vw,60px)',
                fontWeight: 800,
                letterSpacing: '-.03em',
                lineHeight: 1.05,
                marginBottom: 24,
              }}>
                Tem dias bons<br />e dias maus.<br />
                <span style={{ color: 'var(--text-3)', fontWeight: 400, fontSize: '70%' }}>Como toda a gente.</span>
              </h2>
              <div style={{
                background: 'var(--card)',
                border: '1px solid var(--line)',
                borderLeft: '3px solid var(--green)',
                borderRadius: '0 8px 8px 0',
                padding: '16px 20px',
                maxWidth: 440,
              }}>
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 6, fontStyle: 'italic' }}>modo sonolento</p>
                <p style={{ fontSize: 15, color: 'var(--text-1)', lineHeight: 1.6 }}>
                  "Zzz... <span style={{ color: 'var(--green)' }}>@spammer</span> aviso #3...
                  já estou quase a dormir e ainda apareces..."
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── CTA FINAL — o leito da lagoa ── */}
      <section style={{
        background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(109,184,62,.07), transparent), #060607',
        padding: 'clamp(80px,12vh,140px) clamp(20px,4vw,56px) clamp(64px,10vh,110px)',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'absolute', top: 0, left: 0, right: 0, padding: '0 clamp(20px,4vw,56px)' }}>
          <div className="waterline" style={{ ['--eyes-x' as string]: '22%' } as React.CSSProperties}>
            <span className="waterline-eyes"><span /><span /></span>
          </div>
        </div>
        <ScrollReveal>
          <p className="depth-label" style={{ justifyContent: 'center', marginBottom: 28 }}>leito da lagoa · o fim</p>
          <h2 className="display" style={{
            fontSize: 'clamp(36px,7vw,88px)',
            fontWeight: 800,
            letterSpacing: '-.03em',
            lineHeight: 1.0,
            marginBottom: 32,
          }}>
            É grátis.<br />
            <span style={{ color: 'var(--green)' }}>Adiciona já.</span>
          </h2>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={INVITE} target="_blank" rel="noreferrer" className="nav-cta-green" style={{ fontSize: 16, padding: '.9rem 2.5rem', fontWeight: 800 }}>
              Adicionar ao servidor
            </a>
            <Link href="/docs" className="nav-cta-outline" style={{ fontSize: 16, padding: '.9rem 2.5rem' }}>
              Documentação
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <SiteFooter />

      <style>{`
        .fig-story:hover { transform: rotate(-5deg) scale(1.04) !important; }
        .module-row:hover .module-icon {
          border-color: var(--green);
          background: rgba(109,184,62,.08);
          transform: translateY(-2px);
        }

        @media (max-width: 860px) {
          .hero-fig { display: none; }
          .modules-split { grid-template-columns: 1fr !important; }
          .modules-split > div:first-child { position: static !important; }
          .mood-grid { grid-template-columns: 1fr !important; }
          .mood-grid > img { display: none; }
        }
        @media (max-width: 560px) {
          .module-row { grid-template-columns: 40px 1fr !important; row-gap: 6px !important; }
          .module-row > p { grid-column: 1 / -1; }
        }
      `}</style>
    </div>
  );
}
