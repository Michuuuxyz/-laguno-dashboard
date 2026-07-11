import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { SiteFooter } from '@/components/SiteFooter';
import { ScrollReveal } from '@/components/ScrollReveal';
import { HeroBadge } from '@/components/HeroBadge';
import { HeroMascot } from '@/components/HeroMascot';
import { LagoaBackground } from '@/components/LagoaBackground';
import {
  MockWindow, MockMsg, MockText, MockSub, Mention, DCContainer, DCSep,
} from '@/components/DiscordMock';

export const metadata: Metadata = {
  title: 'Laguno — Bot de Discord em português',
  description: 'O Laguno bane o spam às 4 da manhã, regista mais de 30 tipos de eventos e recebe cada membro novo. Em português, para toda a comunidade lusófona.',
  openGraph: {
    title: 'Laguno — Bot de Discord em português',
    description: 'O Laguno bane o spam às 4 da manhã, regista mais de 30 tipos de eventos e recebe cada membro novo. Em português, para toda a comunidade lusófona.',
    url: 'https://www.lagunoapp.xyz',
  },
};

const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
const INVITE    = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=bot+applications.commands&permissions=1102666262758`;

/* Estatísticas em direto do bot (opcional — só renderiza se disponível).
   Lidas do heartbeat que o bot grava no MongoDB (coleção botstatus). */
async function getStats(): Promise<{ guildCount: number; userCount: number } | null> {
  try {
    const { default: clientPromise } = await import('@/lib/mongodb');
    const client = await clientPromise;
    const doc = await client.db()
      .collection<{ _id: string; guildCount?: number; userCount?: number }>('botstatus')
      .findOne({ _id: 'laguno' });
    if (!doc?.guildCount) return null;
    return { guildCount: doc.guildCount, userCount: doc.userCount ?? 0 };
  } catch { return null; }
}

/* ── A equipa da lagoa — cada mascote apresenta o seu módulo ── */
const EQUIPA = [
  { img: 'thor',     nome: 'Thor',     papel: 'o segurança',    desc: 'Bane primeiro, boceja depois. Moderação e auto-mod sem folgas.', href: '/features#moderacao' },
  { img: 'coracoes', nome: 'Corações', papel: 'a anfitriã',     desc: 'Recebe os novos como se fossem primos. Cartão de boas-vindas incluído.', href: '/features#boasvindas' },
  { img: 'vigiar',   nome: 'Vigia',    papel: 'o cusco',        desc: 'Aponta tudo num caderninho. Mais de 30 cadernos, aliás.', href: '/features#logs' },
  { img: 'estrela',  nome: 'Estrela',  papel: 'a organizadora', desc: 'Dá os cargos a quem clica no botão. Sem filas, sem pedidos ao admin.', href: '/features#selfroles' },
  { img: 'pensar',   nome: 'Pensador', papel: 'o paciente',     desc: 'Abre tickets e ouve os teus dramas sem revirar os olhos.', href: '/docs' },
];

export default async function Home() {
  const stats = await getStats();

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* ── HERO — mascote primeiro: "Olá. Sou o Laguno." ── */}
      <section style={{ position: 'relative', minHeight: '74vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <LagoaBackground />

        <div className="hero-grid" style={{
          position: 'relative', zIndex: 1, width: '100%', maxWidth: 1050, margin: '0 auto',
          padding: 'clamp(36px,6vh,64px) clamp(20px,4vw,56px)',
          display: 'grid', gridTemplateColumns: 'minmax(0,44%) minmax(0,1fr)',
          gap: 'clamp(24px,4vw,56px)', alignItems: 'center',
        }}>
          <div className="hero-mascot" style={{ textAlign: 'center' }}>
            <HeroMascot src="/mascote/firme-hero.webp" alt="Laguno, o crocodilo" />
          </div>
          <div className="hero-text">
            <div className="hero-rise" style={{ ['--d' as string]: '.15s' }}><HeroBadge /></div>
            <p className="hero-rise" style={{ ['--d' as string]: '.25s', fontSize: 'clamp(16px,2vw,20px)', color: 'var(--text-2)', marginBottom: 2 }}>Olá. Sou o</p>
            <h1 className="display hero-rise" style={{
              ['--d' as string]: '.32s',
              fontSize: 'clamp(56px,8.5vw,104px)', fontWeight: 800,
              letterSpacing: '-.04em', lineHeight: 0.95, color: 'var(--green)',
            }}>
              Laguno.
            </h1>
            <p className="hero-rise" style={{ ['--d' as string]: '.42s', fontSize: 'clamp(15px,1.7vw,17px)', color: 'var(--text-2)', lineHeight: 1.75, maxWidth: 440, margin: '20px 0 28px' }}>
              O crocodilo que toma conta do teu servidor enquanto dormes.
              Não é preciso agradecer. Mas podes.
            </p>
            <div className="hero-rise" style={{ ['--d' as string]: '.52s', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href={INVITE} target="_blank" rel="noreferrer" className="nav-cta-green" style={{ fontSize: 15, padding: '.85rem 2.2rem', fontWeight: 700 }}>
                Adicionar ao servidor
              </a>
              <Link href="/dashboard" className="nav-cta-outline" style={{ fontSize: 15, padding: '.85rem 2.2rem' }}>
                Abrir dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* A assinatura: a linha de água, com os olhos a espreitar */}
      <div style={{ maxWidth: 880, margin: '0 auto clamp(48px,7vh,72px)', padding: '0 clamp(20px,4vw,56px)' }}>
        <div className="waterline" style={{ ['--eyes-x' as string]: '72%' } as React.CSSProperties}>
          <span className="waterline-eyes"><span /><span /></span>
        </div>
      </div>

      {/* ── A PROVA — um único momento, às 04:12 ── */}
      <section style={{ maxWidth: 640, margin: '0 auto', padding: '0 clamp(20px,4vw,56px) clamp(72px,10vh,110px)' }}>
        <ScrollReveal>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            <span className="display" style={{ color: 'var(--green)', fontSize: 14 }}>04:12</span> · enquanto dormias
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 18 }}>
            Isto aconteceu ontem, num servidor como o teu. Ninguém acordado para moderar. Não fez falta.
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
            Às 4 da manhã responde em modo <em>sonolento</em>. De dia, depende do dia: o Laguno
            tem um motor de humor, e a frase nunca é a mesma. O resultado, sim.
          </p>
        </ScrollReveal>
      </section>

      {/* ── A EQUIPA DA LAGOA — os mascotes apresentam os módulos ── */}
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 clamp(20px,4vw,56px)' }}>
        <div style={{ height: 1, background: 'var(--line)' }} />
      </div>
      <section style={{ maxWidth: 980, margin: '0 auto', padding: 'clamp(56px,8vh,88px) clamp(20px,4vw,56px)' }}>
        <ScrollReveal style={{ marginBottom: 'clamp(28px,4vh,40px)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            Quem vive cá
          </p>
          <h2 className="display" style={{ fontSize: 'clamp(24px,3.2vw,36px)', fontWeight: 800, letterSpacing: '-.03em' }}>
            A equipa da lagoa.
          </h2>
          <p style={{ fontSize: 14.5, color: 'var(--text-2)', marginTop: 8, lineHeight: 1.65 }}>
            Cada um trata do seu módulo. Tu não tratas de nada.
          </p>
        </ScrollReveal>
        <div className="equipa-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {EQUIPA.map((m, i) => (
            <ScrollReveal key={m.nome} delay={i * 0.06}>
              <Link href={m.href} className="equipa-card" style={{
                display: 'block', textDecoration: 'none', height: '100%',
                background: 'var(--surface)', border: '1px solid var(--line)',
                borderRadius: 14, padding: '20px 18px 18px', textAlign: 'center',
              }}>
                <img src={`/mascote/${m.img}.webp`} alt="" loading="lazy" style={{
                  height: 96, width: 'auto', maxWidth: '100%', objectFit: 'contain',
                  transform: `rotate(${i % 2 ? 2.5 : -2.5}deg)`,
                  filter: 'drop-shadow(0 10px 18px rgba(0,0,0,.4))',
                }} />
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.02em', marginTop: 12 }}>
                  {m.nome} <span style={{ fontWeight: 500, color: 'var(--green)' }}>· {m.papel}</span>
                </p>
                <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6, marginTop: 5 }}>{m.desc}</p>
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
            Traz o teu servidor para a lagoa.
          </h2>
          {stats && (
            <p style={{ fontSize: 14.5, color: 'var(--text-2)', marginBottom: 28 }}>
              Agora mesmo em <strong style={{ color: 'var(--green)' }}>{stats.guildCount} servidores</strong>, a vigiar <strong style={{ color: 'var(--green)' }}>{stats.userCount.toLocaleString('pt-PT')} membros</strong>.
            </p>
          )}
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
        .hero-rise { opacity: 0; animation: hero-rise .6s cubic-bezier(.16,1,.3,1) var(--d, 0s) forwards; }
        @keyframes hero-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        .equipa-card { transition: transform .18s ease, border-color .18s ease; }
        .equipa-card:hover { transform: translateY(-3px); border-color: rgba(109,184,62,.4); }
        @media (max-width: 760px) {
          .hero-grid { grid-template-columns: 1fr !important; text-align: center; }
          .hero-text { order: 2; display: flex; flex-direction: column; align-items: center; }
          .hero-mascot { order: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .equipa-card { transition: none; }
          .hero-rise { animation: none !important; opacity: 1 !important; }
        }
      `}</style>
    </div>
  );
}
