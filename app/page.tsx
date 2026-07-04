import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { SiteFooter } from '@/components/SiteFooter';
import { ScrollReveal } from '@/components/ScrollReveal';
import {
  MockWindow, MockMsg, MockText, MockSub, Mention, DCContainer, DCSep,
} from '@/components/DiscordMock';

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

/* Estatísticas em direto do bot (opcional — só renderiza se disponível) */
async function getStats(): Promise<{ guildCount: number; userCount: number } | null> {
  if (!process.env.BOT_API_URL) return null;
  try {
    const res = await fetch(`${process.env.BOT_API_URL}/stats`, {
      headers: { Authorization: `Bearer ${process.env.BOT_API_SECRET}` },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

/* ── O que ele faz — lista tranquila, os detalhes vivem em /features ── */
const CAPS = [
  { href: '/features#moderacao',  title: 'Moderação',   desc: 'Ban, kick, warn e timeout — com respostas que mudam de humor.' },
  { href: '/features#moderacao',  title: 'Auto-Mod',    desc: 'Spam, convites, caps e menções bloqueados antes de chegarem a ti.' },
  { href: '/features#boasvindas', title: 'Boas-Vindas', desc: 'Cada entrada recebida com banner, avatar e a tua mensagem.' },
  { href: '/features#selfroles',  title: 'Self-Roles',  desc: 'Painéis de botões — os membros servem-se sozinhos.' },
  { href: '/features#sorteios',   title: 'Sorteios',    desc: 'Criar, gerir e sortear sem sair do dashboard.' },
  { href: '/features#logs',       title: 'Registos',    desc: 'Mais de 30 eventos registados. Nada se perde.' },
];

export default async function Home() {
  const stats = await getStats();

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* ── HERO — a tese, na voz do crocodilo ── */}
      <section style={{ minHeight: '82vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 880, margin: '0 auto', padding: 'clamp(48px,8vh,80px) clamp(20px,4vw,56px)', textAlign: 'center' }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 26 }}>
            Bot de moderação · 100% em português
          </p>

          <h1 className="display" style={{
            fontSize: 'clamp(48px,9vw,110px)', fontWeight: 800,
            letterSpacing: '-.04em', lineHeight: 0.98, marginBottom: 0,
          }}>
            Tu dormes.<br />
            <span style={{ color: 'var(--green)' }}>Eu fico de olho.</span>
          </h1>

          {/* A assinatura: a linha de água, com os olhos a espreitar */}
          <div style={{ maxWidth: 560, margin: 'clamp(26px,4vh,38px) auto 0' }}>
            <div className="waterline" style={{ ['--eyes-x' as string]: '68%' } as React.CSSProperties}>
              <span className="waterline-eyes"><span /><span /></span>
            </div>
          </div>

          <p style={{ fontSize: 'clamp(15px,1.7vw,17px)', color: 'var(--text-2)', lineHeight: 1.75, maxWidth: 520, margin: '30px auto 32px' }}>
            O Laguno modera, regista, dá boas-vindas e faz sorteios — enquanto tu vives a tua vida.
            Configuras uma vez, num dashboard em português. Depois, é comigo.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            <a href={INVITE} target="_blank" rel="noreferrer" className="nav-cta-green" style={{ fontSize: 15, padding: '.85rem 2.2rem', fontWeight: 700 }}>
              Adicionar ao servidor
            </a>
            <Link href="/features" className="nav-cta-outline" style={{ fontSize: 15, padding: '.85rem 2.2rem' }}>
              Ver funcionalidades
            </Link>
          </div>

          <p style={{ fontSize: 12.5, color: 'var(--text-3)' }}>
            Grátis · Sem cartão · Pronto em 2 minutos
          </p>
        </div>
      </section>

      {/* ── A PROVA — um único momento, às 04:12 ── */}
      <section style={{ maxWidth: 640, margin: '0 auto', padding: '0 clamp(20px,4vw,56px) clamp(72px,10vh,110px)' }}>
        <ScrollReveal>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            <span className="display" style={{ color: 'var(--green)', fontSize: 14 }}>04:12</span> · enquanto dormias
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 18 }}>
            Isto aconteceu ontem, num servidor como o teu. Ninguém acordado para moderar — não fez falta.
          </p>
          <MockWindow channel="geral">
            <MockMsg avatarColor="#7a4e4e" name="xX_Dark_Xx" time="04:12">
              <MockText>GANHEM NITRO GRÁTIS AQUI 🔥🔥🔥</MockText>
              <MockText>GANHEM NITRO GRÁTIS AQUI 🔥🔥🔥</MockText>
              <MockText>GANHEM NITRO GRÁTIS AQUI 🔥🔥🔥</MockText>
            </MockMsg>
            <MockMsg avatar="/laguno.png" name="Laguno" bot time="04:12">
              <DCContainer accent="#6db83e">
                <MockText>Zzz... spam às 4 da manhã? <Mention color="#7c9fd4">@xX_Dark_Xx</Mention> levou timeout de 10 minutos.</MockText>
                <MockText style={{ color: '#80848e' }}>Deixem-me dormir.</MockText>
                <DCSep />
                <MockSub>Anti-Spam · mensagens eliminadas automaticamente</MockSub>
              </DCContainer>
            </MockMsg>
          </MockWindow>
          <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.7, marginTop: 16 }}>
            Às 4 da manhã responde em modo <em>sonolento</em>. De dia, depende do dia — o Laguno
            tem um motor de humor, e a frase nunca é a mesma. O resultado, sim.
          </p>
        </ScrollReveal>
      </section>

      {/* ── O QUE ELE FAZ — lista tranquila ── */}
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 clamp(20px,4vw,56px)' }}>
        <div style={{ height: 1, background: 'var(--line)' }} />
      </div>
      <section style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(56px,8vh,88px) clamp(20px,4vw,56px)' }}>
        <ScrollReveal style={{ marginBottom: 'clamp(32px,5vh,48px)' }}>
          <h2 className="display" style={{ fontSize: 'clamp(24px,3.2vw,36px)', fontWeight: 800, letterSpacing: '-.03em' }}>
            O resto do dia, resumido.
          </h2>
        </ScrollReveal>
        <div className="caps-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 clamp(32px,5vw,64px)' }}>
          {CAPS.map((c, i) => (
            <ScrollReveal key={c.title} delay={i * 0.05}>
              <Link href={c.href} style={{
                display: 'block', textDecoration: 'none',
                padding: '20px 0', borderTop: '1px solid var(--line)',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 5 }}>
                  <h3 style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.02em' }}>{c.title}</h3>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><line x1="7" y1="17" x2="17" y2="7"/><polyline points="8 7 17 7 17 16"/></svg>
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65 }}>{c.desc}</p>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 clamp(20px,4vw,56px)' }}>
        <div style={{ height: 1, background: 'var(--line)' }} />
      </div>
      <section style={{ padding: 'clamp(64px,10vh,110px) clamp(20px,4vw,56px)', textAlign: 'center' }}>
        <ScrollReveal>
          <h2 className="display" style={{ fontSize: 'clamp(28px,4.5vw,52px)', fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.05, marginBottom: 14 }}>
            Pronto quando tu estiveres.
          </h2>
          <p style={{ fontSize: 14.5, color: 'var(--text-2)', marginBottom: 28 }}>
            {stats
              ? <>Agora mesmo em <strong style={{ color: 'var(--green)' }}>{stats.guildCount} servidores</strong>, a vigiar <strong style={{ color: 'var(--green)' }}>{stats.userCount.toLocaleString('pt-PT')} membros</strong>.</>
              : 'Grátis, em dois minutos, sem cartão.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={INVITE} target="_blank" rel="noreferrer" className="nav-cta-green" style={{ fontSize: 15, padding: '.85rem 2.3rem', fontWeight: 700 }}>
              Adicionar ao servidor
            </a>
            <Link href="/comandos" className="nav-cta-outline" style={{ fontSize: 15, padding: '.85rem 2.3rem' }}>
              Ver comandos
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <SiteFooter />

      <style>{`
        @media (max-width: 720px) {
          .caps-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
