import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { OrbitingCircles } from '@/components/OrbitingCircles';

export const metadata: Metadata = {
  title: 'Sobre — Laguno',
  description: 'O Laguno foi feito por um miúdo português que se fartou de bots que não percebem a língua do servidor.',
  openGraph: {
    title: 'Sobre — Laguno',
    description: 'O Laguno foi feito por um miúdo português que se fartou de bots que não percebem a língua do servidor.',
    url: 'https://www.lagunoapp.xyz/sobre',
  },
};

const CLIENT_ID  = process.env.NEXT_PUBLIC_CLIENT_ID;
const INVITE     = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=bot+applications.commands&permissions=1102129391846`;
const MICHU_ID   = '349527593634234370';

async function getMichuProfile() {
  try {
    const res = await fetch(`https://discord.com/api/v10/users/${MICHU_ID}`, {
      headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json() as { username: string; global_name?: string; avatar?: string; banner?: string };
    return {
      name:      data.global_name ?? data.username,
      username:  data.username,
      avatarUrl: data.avatar
        ? `https://cdn.discordapp.com/avatars/${MICHU_ID}/${data.avatar}.png?size=128`
        : `https://cdn.discordapp.com/embed/avatars/0.png`,
    };
  } catch {
    return null;
  }
}

export default async function Sobre() {
  const michu = await getMichuProfile();
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* ── INTRO ── */}
      <section style={{
        maxWidth: 860, margin: '0 auto',
        padding: 'clamp(64px,10vh,110px) clamp(20px,4vw,56px) 0',
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 20 }}>
          Sobre o projeto
        </p>
        <h1 style={{
          fontSize: 'clamp(36px,6vw,72px)',
          fontWeight: 800,
          letterSpacing: '-.05em',
          lineHeight: 1.0,
          marginBottom: 36,
        }}>
          Um bot feito<br />
          por frustração.<br />
          <span style={{ color: 'var(--green)' }}>A sério.</span>
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'start' }} className="sobre-intro">
          <div>
            <p style={{ fontSize: 17, color: 'var(--text-2)', lineHeight: 1.85, marginBottom: 20 }}>
              O Laguno nasceu porque o Michu se fartou. Fartou-se de bots em inglês num servidor português.
              Fartou-se de configurar oito bots diferentes para fazer o que um devia fazer.
              Fartou-se de mensagens de ban que pareciam saídas de um manual corporativo.
            </p>
            <p style={{ fontSize: 17, color: 'var(--text-2)', lineHeight: 1.85, marginBottom: 20 }}>
              Por isso pegou no TypeScript, no Discord.js, e fez ele próprio.
              Um bot com voz — literalmente. O Laguno tem estados de espírito.
              Às vezes está stressado e avisa-te com letras maiúsculas. Às vezes está sonolento
              e praticamente adormece a mandar a mensagem. Sempre em português.
            </p>
            <p style={{ fontSize: 17, color: 'var(--text-1)', lineHeight: 1.85, fontWeight: 500 }}>
              Não é um produto de uma empresa. É um projeto de uma pessoa
              que queria algo melhor para os seus servidores — e decidiu construí-lo.
            </p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <Image
              src="/fig1.png"
              alt="Laguno"
              width={200}
              height={200}
              style={{ transform: 'rotate(-8deg)', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,.4))' }}
            />
          </div>
        </div>
      </section>

      {/* ── LINHA DO TEMPO ── */}
      <section style={{
        maxWidth: 860, margin: '0 auto',
        padding: 'clamp(56px,8vh,96px) clamp(20px,4vw,56px)',
      }}>
        <div style={{ height: 1, background: 'var(--line)', marginBottom: 'clamp(40px,6vh,64px)' }} />

        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 40 }}>
          Como chegámos aqui
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            {
              fase: 'O problema',
              texto: 'Servidores portugueses a usar bots americanos. Comandos em inglês, mensagens em inglês, logs em inglês. O Michu queria um bot que falasse como as pessoas do servidor falavam.',
            },
            {
              fase: 'A primeira versão',
              texto: 'Comandos básicos. Warn, ban, kick. Nada de especial — mas em português e com aquela vibe de "foi feito por alguém que usa Discord de verdade". Já era diferente.',
            },
            {
              fase: 'A personalidade',
              texto: 'A ideia dos estados de espírito. Em vez de a mesma mensagem chata sempre que alguém leva warn, o Laguno reage diferente consoante o humor do dia. Stressado, sonolento, entediado, animado, feliz.',
            },
            {
              fase: 'O dashboard',
              texto: 'Porque configurar bots pelo terminal ou por ficheiros JSON é coisa de 2015. O Laguno tem um dashboard em Next.js onde configuras tudo com cliques — boas-vindas, logs, auto-mod, self-roles, sorteios.',
            },
            {
              fase: 'Agora',
              texto: 'O projeto continua. Há sempre mais um módulo a adicionar, mais um detalhe a afinar. Mas a base está lá — um bot que faz o trabalho e tem carácter próprio.',
            },
          ].map(({ fase, texto }, i) => (
            <div key={fase} style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr',
              gap: 32,
              padding: 'clamp(24px,4vh,36px) 0',
              borderBottom: i < 4 ? '1px solid var(--line)' : 'none',
              alignItems: 'start',
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', letterSpacing: '.06em', textTransform: 'uppercase', paddingTop: 2 }}>
                {fase}
              </p>
              <p style={{ fontSize: 15.5, color: 'var(--text-2)', lineHeight: 1.8 }}>
                {texto}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STACK ── */}
      <section style={{ borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
        <div style={{
          maxWidth: 860, margin: '0 auto',
          padding: 'clamp(40px,6vh,72px) clamp(20px,4vw,56px)',
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 48,
          alignItems: 'center',
        }} className="stack-grid">

          {/* Esquerda: lista */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 24 }}>
              O que está por baixo
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { icon: 'https://cdn.simpleicons.org/typescript/3178C6', nome: 'TypeScript',  desc: 'linguagem base' },
                { icon: 'https://cdn.simpleicons.org/discord/5865F2',    nome: 'Discord.js',  desc: 'interação com Discord' },
                { icon: 'https://cdn.simpleicons.org/nextdotjs/ffffff',  nome: 'Next.js 14',  desc: 'dashboard (App Router)' },
                { icon: 'https://cdn.simpleicons.org/mongodb/47A248',    nome: 'MongoDB',     desc: 'base de dados' },
                { icon: 'https://cdn.simpleicons.org/vercel/ffffff',     nome: 'Vercel',      desc: 'deploy do dashboard' },
                { icon: 'https://cdn.simpleicons.org/nodedotjs/339933',  nome: 'Node.js',     desc: 'runtime do bot' },
              ].map(({ icon, nome, desc }) => (
                <div key={nome} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={icon} alt={nome} width={22} height={22} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', flex: 1 }}>{nome}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Direita: orbiting circles */}
          <div style={{ position: 'relative', width: 340, height: 340, flexShrink: 0 }}>
            {/* Centro: logo Laguno */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 1 }}>
              <Image src="/laguno.png" alt="Laguno" width={56} height={56} style={{ objectFit: 'contain' }} />
            </div>

            {/* Órbita exterior */}
            <OrbitingCircles radius={140} iconSize={36}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://cdn.simpleicons.org/typescript/3178C6" alt="TypeScript" width={28} height={28} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://cdn.simpleicons.org/nextdotjs/ffffff" alt="Next.js" width={28} height={28} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://cdn.simpleicons.org/mongodb/47A248" alt="MongoDB" width={28} height={28} />
            </OrbitingCircles>

            {/* Órbita interior — sentido inverso */}
            <OrbitingCircles radius={80} iconSize={30}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://cdn.simpleicons.org/discord/5865F2" alt="Discord.js" width={24} height={24} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://cdn.simpleicons.org/vercel/ffffff" alt="Vercel" width={24} height={24} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://cdn.simpleicons.org/nodedotjs/339933" alt="Node.js" width={24} height={24} />
            </OrbitingCircles>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 700px) {
          .stack-grid { grid-template-columns: 1fr !important; }
          .stack-grid > div:last-child { display: none; }
        }
      `}</style>

      {/* ── MICHUU ── */}
      <section style={{
        maxWidth: 860, margin: '0 auto',
        padding: 'clamp(56px,8vh,96px) clamp(20px,4vw,56px)',
      }}>
        <div style={{ height: 1, background: 'var(--line)', marginBottom: 'clamp(40px,6vh,64px)' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 40, alignItems: 'center' }} className="sobre-michu">
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {michu ? (
              <Image
                src={michu.avatarUrl}
                alt={michu.name}
                width={72}
                height={72}
                style={{ borderRadius: '50%', border: '3px solid rgba(109,184,62,.3)' }}
              />
            ) : (
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'var(--green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 800, color: '#fff',
                border: '3px solid rgba(109,184,62,.3)',
              }}>M</div>
            )}
            <div style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 14, height: 14, borderRadius: '50%',
              background: '#23a559', border: '2px solid var(--bg)',
            }} />
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)', marginBottom: 2 }}>
              {michu?.name ?? 'Michuu'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>
              @{michu?.username ?? 'therealmichu'}
            </p>
            <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.7 }}>
              Desenvolvedor português. Constrói coisas para Discord porque passa demasiado tempo no Discord.
              O Laguno é o projeto principal — mas não o último.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
        <div style={{
          maxWidth: 860, margin: '0 auto',
          padding: 'clamp(48px,7vh,80px) clamp(20px,4vw,56px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 24,
        }}>
          <div>
            <p style={{ fontSize: 'clamp(18px,3vw,28px)', fontWeight: 800, letterSpacing: '-.03em', marginBottom: 6 }}>
              Queres experimentar?
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-2)' }}>É grátis. Não tens nada a perder.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href={INVITE} target="_blank" rel="noreferrer" className="nav-cta-green" style={{ fontSize: 15, padding: '.75rem 1.75rem', fontWeight: 700 }}>
              Adicionar ao servidor
            </a>
            <Link href="/docs" className="nav-cta-outline" style={{ fontSize: 15, padding: '.75rem 1.75rem' }}>
              Ver documentação
            </Link>
          </div>
        </div>
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
          <Link href="/features"          style={{ fontSize: 12, color: 'var(--text-3)' }}>Funcionalidades</Link>
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
        @media (max-width: 700px) {
          .sobre-intro { grid-template-columns: 1fr !important; }
          .sobre-intro > div:last-child { display: none; }
          .sobre-michu { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
