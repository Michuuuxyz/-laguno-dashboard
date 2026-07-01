import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { TypingHero } from '@/components/TypingHero';
import { ScrollReveal, ScrollRevealList, ScrollRevealItem } from '@/components/ScrollReveal';

export const metadata: Metadata = {
  title: 'Laguno — Bot de Discord em português',
  description: 'Bane spammers. Regista tudo. Dá boas-vindas. Em português, para toda a comunidade lusófona.',
  openGraph: {
    title: 'Laguno — Bot de Discord em português',
    description: 'Bane spammers. Regista tudo. Dá boas-vindas. Em português, para toda a comunidade lusófona.',
    url: 'https://www.lagunoapp.xyz',
  },
};

const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
const INVITE    = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=bot+applications.commands&permissions=1102129391846`;

export default function Home() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* ── HERO — título que domina, figurinha integrada ── */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: '92vh', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,4vw,56px)' }}>
          {/* Título gigante */}
          <TypingHero />

          {/* Figurinha sobreposta no título */}
          <div style={{
            position: 'absolute',
            right: 'clamp(20px,4vw,56px)',
            top: '50%',
            transform: 'translateY(-55%)',
          }} className="hero-fig">
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

          {/* Linha e descrição curta */}
          <div style={{ marginTop: 'clamp(32px,5vh,48px)', display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 'clamp(15px,1.6vw,18px)', color: 'var(--text-2)', lineHeight: 1.6, maxWidth: 380 }}>
              Bot de moderação em português. Ban, logs, boas-vindas, self-roles e sorteios.
              Tudo num dashboard. Tudo grátis.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <a href={INVITE} target="_blank" rel="noreferrer" className="nav-cta-green" style={{ fontSize: 15, padding: '.8rem 2rem', fontWeight: 700 }}>
                Adicionar
              </a>
              <Link href="/features" className="nav-cta-outline" style={{ fontSize: 15, padding: '.8rem 2rem' }}>
                Ver mais
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── BLOCO VERDE — declaração forte ── */}
      <section style={{ background: 'var(--green)', padding: 'clamp(48px,7vh,80px) clamp(20px,4vw,56px)' }}>
        <ScrollReveal style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
          <p style={{
            fontSize: 'clamp(24px,4vw,52px)',
            fontWeight: 900,
            letterSpacing: '-.04em',
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

      {/* ── MÓDULOS — lista direta, sem floreados ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(64px,9vh,100px) clamp(20px,4vw,56px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,5vw,80px)', alignItems: 'start' }} className="modules-split">

          {/* Esquerda: título */}
          <div style={{ position: 'sticky', top: 100 }}>
            <h2 style={{
              fontSize: 'clamp(32px,5vw,64px)',
              fontWeight: 900,
              letterSpacing: '-.05em',
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
                <div style={{
                  padding: 'clamp(20px,3vh,28px) 0',
                  borderBottom: '1px solid var(--line)',
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr',
                  gap: 24,
                  alignItems: 'baseline',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--green)', letterSpacing: '-.01em' }}>
                    {String(i + 1).padStart(2, '0')} {n}
                  </span>
                  <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.65 }}>{t}</p>
                </div>
              </ScrollRevealItem>
            ))}
          </ScrollRevealList>
        </div>
      </section>

      {/* ── PERSONALIDADE — sem simetria ── */}
      <section style={{ borderTop: '1px solid var(--line)', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(64px,9vh,100px) clamp(20px,4vw,56px)' }}>

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
              <h2 style={{
                fontSize: 'clamp(28px,5vw,60px)',
                fontWeight: 900,
                letterSpacing: '-.05em',
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

      {/* ── CTA FINAL — simples, direto ── */}
      <section style={{
        background: '#0a0a0b',
        borderTop: '1px solid var(--line)',
        padding: 'clamp(80px,12vh,140px) clamp(20px,4vw,56px)',
        textAlign: 'center',
      }}>
        <ScrollReveal>
          <h2 style={{
            fontSize: 'clamp(36px,7vw,88px)',
            fontWeight: 900,
            letterSpacing: '-.05em',
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

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--line)', padding: '18px clamp(20px,4vw,56px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--line)' }}>
            <Image src="/laguno.png" alt="" width={20} height={20} style={{ objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>Laguno</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/sobre"             style={{ fontSize: 12, color: 'var(--text-3)' }}>Sobre</Link>
          <Link href="/docs"              style={{ fontSize: 12, color: 'var(--text-3)' }}>Documentação</Link>
          <Link href="/legal?tab=terms"   style={{ fontSize: 12, color: 'var(--text-3)' }}>Termos</Link>
          <Link href="/legal?tab=privacy" style={{ fontSize: 12, color: 'var(--text-3)' }}>Privacidade</Link>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
            by <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>Michuu</span>
            <span style={{ margin: '0 6px' }}>·</span>© 2026
          </span>
        </div>
      </footer>

      <style>{`
        .fig-story:hover { transform: rotate(-5deg) scale(1.04) !important; }

        @media (max-width: 860px) {
          .hero-fig { display: none; }
          .modules-split { grid-template-columns: 1fr !important; }
          .modules-split > div:first-child { position: static !important; }
          .mood-grid { grid-template-columns: 1fr !important; }
          .mood-grid > img { display: none; }
        }
      `}</style>
    </div>
  );
}
