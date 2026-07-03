import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { TypingHero } from '@/components/TypingHero';
import { SiteFooter } from '@/components/SiteFooter';
import { ScrollReveal } from '@/components/ScrollReveal';
import {
  MockWindow, MockMsg, MockText, MockH2, MockSub,
  Mention, DCContainer, DCSep, DCBtn, DCBtnRow,
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

/* ── Ícones clássicos (linha, feitos à mão) ── */
const svg = (p: React.ReactNode) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{p}</svg>
);
const ICONS: Record<string, React.ReactNode> = {
  spam:     svg(<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>),
  welcome:  svg(<><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="9" cy="7" r="3.2"/><path d="M17 11l2 2 4-4"/></>),
  invites:  svg(<><path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z"/><path d="M9.5 12l1.8 1.8L15 10"/></>),
  roles:    svg(<><path d="M20.6 13.4L13 21a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 2.6 12l.4-6a2 2 0 0 1 2-2l6-.4a2 2 0 0 1 1.6.6l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="8.5" r="1.4"/></>),
  giveaway: svg(<><rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13"/><path d="M12 8S10.5 3 7.8 3.6C6 4 6 6.5 8 7.4 9.4 8 12 8 12 8zM12 8s1.5-5 4.2-4.4C18 4 18 6.5 16 7.4 14.6 8 12 8 12 8z"/></>),
  logs:     svg(<><path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5M8.5 13h7M8.5 16.5h7M8.5 9.5h3"/></>),
};

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

/* ── Um momento do dia na timeline ── */
function Moment({ time, icon, title, mood, caption, children }: {
  time: string; icon: React.ReactNode; title: string; mood?: string;
  caption: string; children: React.ReactNode;
}) {
  return (
    <ScrollReveal>
      <div className="tl-moment">
        {/* hora + nó */}
        <div className="tl-meta">
          <span className="tl-time display">{time}</span>
          <span className="tl-node">{icon}</span>
        </div>
        {/* conteúdo */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.02em' }}>{title}</h3>
            {mood && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, border: '1px solid var(--line)', color: 'var(--text-3)', fontStyle: 'italic' }}>
                modo {mood}
              </span>
            )}
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 16, maxWidth: 460 }}>{caption}</p>
          <div style={{ maxWidth: 540 }}>{children}</div>
        </div>
      </div>
    </ScrollReveal>
  );
}

export default async function Home() {
  const stats = await getStats();

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{ minHeight: '88vh', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,4vw,56px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40 }}>

          <div style={{ flex: '1 1 0', minWidth: 0 }}>
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

          <div className="hero-fig" style={{ flexShrink: 0 }}>
            <Image src="/fig3.png" alt="Laguno" width={320} height={320}
              style={{ filter: 'drop-shadow(0 40px 80px rgba(0,0,0,.5))', transform: 'rotate(6deg)' }} />
          </div>
        </div>
      </section>

      {/* ── A linha de água ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,4vw,56px)' }}>
        <div className="waterline" style={{ ['--eyes-x' as string]: '76%' } as React.CSSProperties}>
          <span className="waterline-eyes"><span /><span /></span>
        </div>
      </div>

      {/* ── UM DIA NA LAGOA — a estrutura é uma timeline ── */}
      <section style={{ background: '#0b0b0d' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(64px,9vh,110px) clamp(20px,4vw,56px)' }}>

          {/* Cabeçalho da timeline */}
          <ScrollReveal style={{ marginBottom: 'clamp(48px,7vh,72px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
            <div>
              <p className="depth-label" style={{ marginBottom: 18 }}>um dia na lagoa</p>
              <h2 className="display" style={{ fontSize: 'clamp(32px,5vw,60px)', fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.02, marginBottom: 14 }}>
                Isto aconteceu ontem,<br />num servidor como o teu.
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 480 }}>
                Enquanto tu vivias a tua vida, o Laguno trabalhava.
                {stats && <> Agora mesmo está em <strong style={{ color: 'var(--green)' }}>{stats.guildCount} servidores</strong> a vigiar <strong style={{ color: 'var(--green)' }}>{stats.userCount.toLocaleString('pt-PT')} membros</strong>.</>}
              </p>
            </div>
            <Image src="/fig2.png" alt="" width={130} height={130}
              style={{ transform: 'rotate(-8deg)', filter: 'drop-shadow(0 16px 32px rgba(0,0,0,.4))', flexShrink: 0 }} />
          </ScrollReveal>

          {/* A timeline — a espinha é a linha de água na vertical */}
          <div className="tl">

            <Moment time="04:12" icon={ICONS.spam} title="Anti-Spam" mood="sonolento"
              caption="Ninguém acordado para moderar. Não fazia falta — o Laguno estava.">
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
            </Moment>

            <Moment time="09:30" icon={ICONS.welcome} title="Boas-Vindas"
              caption="Cada membro novo é recebido com banner, avatar e a tua mensagem. Configurado uma vez, para sempre.">
              <MockWindow channel="boas-vindas">
                <MockMsg avatar="/laguno.png" name="Laguno" bot time="09:30">
                  <DCContainer accent="#6db83e">
                    <MockH2>Bem-vinda à lagoa 🐊</MockH2>
                    <MockText>Olá <Mention color="#7c9fd4">@Rita</Mention> — já estávamos à tua espera.</MockText>
                    <DCSep />
                    <MockSub>Membro nº 843 · conta criada há 2 anos</MockSub>
                    <DCBtnRow>
                      <DCBtn label="Ver regras" />
                      <DCBtn label="Escolher cargos" variant="primary" />
                    </DCBtnRow>
                  </DCContainer>
                </MockMsg>
              </MockWindow>
            </Moment>

            <Moment time="13:05" icon={ICONS.invites} title="Anti-Convites"
              caption="Convites para outros servidores desaparecem no segundo. Gifs e links normais passam sem drama.">
              <MockWindow channel="geral">
                <MockMsg avatarColor="#4e5058" name="random_guy" time="13:05">
                  <MockText style={{ textDecoration: 'line-through', color: '#80848e' }}>entrem no meu server discord.gg/xyz123</MockText>
                </MockMsg>
                <MockMsg avatar="/laguno.png" name="Laguno" bot time="13:05">
                  <MockText>⚠️ <Mention color="#7c9fd4">@random_guy</Mention> Convites para outros servidores não são permitidos.</MockText>
                  <MockSub>Regra nativa do Discord · aplicada instantaneamente</MockSub>
                </MockMsg>
              </MockWindow>
            </Moment>

            <Moment time="16:40" icon={ICONS.roles} title="Self-Roles"
              caption="Os membros servem-se sozinhos. Zero pedidos ao admin, zero tickets para dar um cargo.">
              <MockWindow channel="escolhe-cargos">
                <MockMsg avatar="/laguno.png" name="Laguno" bot time="16:40">
                  <DCContainer accent="#5865f2">
                    <MockText><strong>Escolhe os teus cargos.</strong></MockText>
                    <MockText>Clica para adicionar ou remover. Simples assim.</MockText>
                    <DCSep />
                    <DCBtnRow>
                      <DCBtn label="🎮 Gamer" />
                      <DCBtn label="🎵 Música" />
                      <DCBtn label="📢 Anúncios" />
                    </DCBtnRow>
                  </DCContainer>
                </MockMsg>
              </MockWindow>
            </Moment>

            <Moment time="19:00" icon={ICONS.giveaway} title="Sorteios"
              caption="Crias no dashboard, o Laguno publica, gere as inscrições e sorteia. Re-roll com um clique.">
              <MockWindow channel="sorteios">
                <MockMsg avatar="/laguno.png" name="Laguno" bot time="19:00">
                  <DCContainer accent="#f59e0b">
                    <MockH2>Nitro Classic 🎁</MockH2>
                    <MockText><span style={{ color: '#80848e' }}>Termina </span><span style={{ color: '#f2f3f5' }}>em 24 horas</span> · <span style={{ color: '#80848e' }}>Vencedores </span><span style={{ color: '#f2f3f5' }}>1</span></MockText>
                    <DCSep />
                    <MockSub>boa sorte a todos (não é mentira)</MockSub>
                    <DCBtnRow>
                      <DCBtn label="🎉 Quero participar" />
                    </DCBtnRow>
                  </DCContainer>
                </MockMsg>
              </MockWindow>
            </Moment>

            <Moment time="23:58" icon={ICONS.logs} title="Registos"
              caption="Tudo o que aconteceu, registado. Quem baniu, quem editou, quem entrou. Nada se perde.">
              <MockWindow channel="logs">
                <MockMsg avatar="/laguno.png" name="Laguno" bot time="23:58">
                  <MockH2>Resumo do dia</MockH2>
                  <MockText><span style={{ color: '#80848e' }}>Membros novos </span>42 · <span style={{ color: '#80848e' }}>Avisos </span>3 · <span style={{ color: '#80848e' }}>Timeouts </span>1 · <span style={{ color: '#80848e' }}>Dramas por resolver </span>0</MockText>
                  <DCSep />
                  <MockSub>Laguno Logs · mais de 30 eventos rastreados</MockSub>
                </MockMsg>
              </MockWindow>
            </Moment>

          </div>
        </div>
      </section>

      {/* ── PERSONALIDADE — faixa compacta ── */}
      <section style={{ background: '#09090b', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <ScrollReveal style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(40px,6vh,64px) clamp(20px,4vw,56px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 28, flexWrap: 'wrap' }}>
          <div>
            <h2 className="display" style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, letterSpacing: '-.02em', marginBottom: 8 }}>
              Tem dias bons e dias maus. <span style={{ color: 'var(--text-3)', fontWeight: 600 }}>Como toda a gente.</span>
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-2)', maxWidth: 520, lineHeight: 1.7 }}>
              O Laguno tem um motor de humor — a mensagem muda de tom conforme a hora e o caos. O resultado é sempre o mesmo. A frase, nunca.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['stressado', 'sonolento', 'entediado', 'animado', 'feliz'].map((m, i) => (
              <span key={m} style={{
                fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 99,
                border: '1px solid var(--line)',
                color: i === 0 ? '#ef4444' : i === 3 ? '#fbbf24' : i === 4 ? 'var(--green)' : 'var(--text-3)',
              }}>{m}</span>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ── BLOCO VERDE — declaração ── */}
      <section style={{ background: 'var(--green)', padding: 'clamp(48px,7vh,80px) clamp(20px,4vw,56px)' }}>
        <ScrollReveal style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
          <p className="display" style={{ fontSize: 'clamp(24px,4vw,48px)', fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.1, color: '#fff', maxWidth: 640 }}>
            Feito em português<br />para toda a comunidade lusófona.
          </p>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.75)', lineHeight: 1.7, maxWidth: 300 }}>
            Em português. Com personalidade. Sem desculpas.
          </p>
        </ScrollReveal>
      </section>

      {/* ── CTA — a noite ── */}
      <section style={{
        background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(109,184,62,.07), transparent), #060607',
        padding: 'clamp(90px,13vh,150px) clamp(20px,4vw,56px) clamp(64px,10vh,110px)',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'absolute', top: 0, left: 0, right: 0, padding: '0 clamp(20px,4vw,56px)' }}>
          <div className="waterline" style={{ ['--eyes-x' as string]: '22%' } as React.CSSProperties}>
            <span className="waterline-eyes"><span /><span /></span>
          </div>
        </div>
        <ScrollReveal>
          <p className="depth-label" style={{ justifyContent: 'center', marginBottom: 28 }}>04:12 · amanhã</p>
          <h2 className="display" style={{ fontSize: 'clamp(36px,7vw,84px)', fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.0, marginBottom: 20 }}>
            Ele não dorme.<br />
            <span style={{ color: 'var(--green)' }}>Tu podes.</span>
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-2)', marginBottom: 32 }}>Grátis, em dois minutos, sem cartão.</p>
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
        /* A timeline — espinha vertical como linha de água */
        .tl {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: clamp(56px, 8vh, 88px);
        }
        .tl::before {
          content: '';
          position: absolute;
          top: 8px; bottom: 8px;
          left: 106px;
          width: 2px;
          background: linear-gradient(180deg,
            rgba(109,184,62,.45),
            rgba(109,184,62,.12) 60%,
            transparent);
        }
        .tl-moment {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 28px;
          align-items: start;
        }
        .tl-meta {
          display: flex;
          align-items: center;
          gap: 14px;
          position: sticky;
          top: 90px;
        }
        .tl-time {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-2);
          font-variant-numeric: tabular-nums;
          letter-spacing: -.01em;
          width: 48px;
          text-align: right;
        }
        .tl-node {
          width: 44px; height: 44px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: #0b0b0d;
          border: 1px solid rgba(109,184,62,.35);
          color: var(--green);
          box-shadow: 0 0 0 6px #0b0b0d, 0 0 18px rgba(109,184,62,.15);
          flex-shrink: 0;
        }

        @media (max-width: 860px) {
          .hero-fig { display: none; }
          .tl::before { left: 21px; top: 0; }
          .tl-moment { grid-template-columns: 1fr; gap: 14px; }
          .tl-meta { position: static; }
          .tl-time { width: auto; text-align: left; order: 2; }
          .tl-node { order: 1; box-shadow: 0 0 0 6px #0b0b0d; }
        }
      `}</style>
    </div>
  );
}
