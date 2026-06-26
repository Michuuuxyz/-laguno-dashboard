import Link from 'next/link';
import Image from 'next/image';

const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
const INVITE    = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=bot+applications.commands&permissions=8`;

/* ── Icons ─────────────────────────────────── */
const Shield = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const Bolt   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>;
const Users  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const Tag    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/></svg>;
const Code   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
const Layout = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>;
const Arrow  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;

const features = [
  { icon: <Shield />, title: 'Moderação',             desc: 'Ban, kick, warn e timeout com permissões configuráveis. Log automático de todas as ações de moderação.' },
  { icon: <Bolt />,   title: 'Auto-moderação',        desc: 'Filtra spam, links e palavras proibidas automaticamente, com exceções por canal e cargo.' },
  { icon: <Users />,  title: 'Boas-vindas',           desc: 'Mensagens de entrada e saída com variáveis dinâmicas: nome, contagem de membros, data de criação.' },
  { icon: <Tag />,    title: 'Role panels',           desc: 'Painéis com botões para os membros escolherem os próprios cargos, configuráveis no dashboard.' },
  { icon: <Code />,   title: 'Comandos personalizados', desc: 'Define respostas automáticas com prefixo próprio. Ativa e desativa individualmente por servidor.' },
  { icon: <Layout />, title: 'Dashboard web',         desc: 'Painel de controlo completo no browser. Alterações em tempo real, sem reiniciar o bot.' },
];

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      {/* ── Navbar ─────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(13,13,15,.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--line)',
      }}>
        {/* Green accent line at very top */}
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #3ecf8e 40%, transparent)' }} />

        <div style={{
          height: 54, display: 'flex', alignItems: 'center',
          padding: '0 clamp(16px,4vw,64px)', gap: 32,
          maxWidth: 1200, margin: '0 auto', width: '100%',
        }}>
          {/* Nav links — center */}
          <nav style={{ display: 'flex', gap: 4, flex: 1, justifyContent: 'center' }}>
            <a href="#features" className="nav-link">Funcionalidades</a>
            <a href={INVITE} target="_blank" rel="noreferrer" className="nav-link">Adicionar ao Discord</a>
          </nav>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <Link href="/dashboard" className="nav-cta-outline">Dashboard</Link>
            <a href={INVITE} target="_blank" rel="noreferrer" className="nav-cta-green">Adicionar grátis</a>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────── */}
      <section style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 'clamp(40px,6vw,96px)', alignItems: 'center',
        maxWidth: 1080, margin: '0 auto', width: '100%',
        padding: 'clamp(64px,10vh,120px) clamp(16px,4vw,64px)',
        minHeight: '86vh',
      }}>
        <div>
          <div className="fade-up" style={{ marginBottom: 20 }}>
            <span className="badge badge-green" style={{ fontSize: 11.5 }}>
              <span className="dot dot-green" />
              Bot disponível
            </span>
          </div>

          <h1 className="fade-up d-1" style={{
            fontSize: 'clamp(30px,4vw,50px)', fontWeight: 700,
            letterSpacing: '-.04em', lineHeight: 1.1, marginBottom: 20,
          }}>
            Gestão de servidores<br />
            <span style={{ color: 'var(--green)' }}>sem complicações</span>
          </h1>

          <p className="fade-up d-2" style={{
            fontSize: 15.5, color: 'var(--text-2)',
            lineHeight: 1.75, marginBottom: 36, maxWidth: 440,
          }}>
            Moderação, auto-mod, boas-vindas e roles — por servidor, em tempo real, via dashboard web.
          </p>

          <div className="fade-up d-3" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href={INVITE} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ fontSize: 14, padding: '.62rem 1.4rem' }}>
              Adicionar ao Discord
            </a>
            <Link href="/dashboard" className="btn btn-secondary" style={{ fontSize: 14, padding: '.62rem 1.4rem' }}>
              Abrir dashboard <Arrow />
            </Link>
          </div>
        </div>

        {/* Bot image */}
        <div className="fade-up d-2" style={{ position: 'relative' }}>
          <div style={{
            position: 'relative', borderRadius: 14, overflow: 'hidden',
            aspectRatio: '3/4', maxWidth: 360, margin: '0 auto',
            border: '1px solid var(--line)',
            boxShadow: '0 24px 64px rgba(0,0,0,.5)',
          }}>
            <Image src="/laguno.png" alt="Laguno bot" fill style={{ objectFit: 'cover', objectPosition: 'center top' }} priority />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,13,15,.96) 0%, rgba(13,13,15,.1) 45%, transparent 100%)' }} />
            <div style={{
              position: 'absolute', bottom: 18, left: 16, right: 16,
              background: 'rgba(20,20,22,.96)', backdropFilter: 'blur(12px)',
              border: '1px solid var(--line)', borderRadius: 12,
              padding: '12px 14px',
            }}>
              {/* Command input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--elevated)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <code style={{ fontSize: 12, color: 'var(--text-2)', letterSpacing: '-.01em' }}>
                  <span style={{ color: 'var(--green)', fontWeight: 600 }}>/warn</span>
                  {' '}<span style={{ color: '#7c9fd4' }}>@spammer</span>
                  {' '}<span style={{ color: 'var(--text-3)' }}>flood no canal</span>
                </code>
              </div>

              {/* Bot response */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--line)' }}>
                    <Image src="/laguno.png" alt="Laguno" width={26} height={26} style={{ objectFit: 'cover' }} />
                  </div>
                  <span style={{ position: 'absolute', bottom: -1, right: -1, width: 8, height: 8, borderRadius: '50%', background: '#57f287', border: '1.5px solid rgba(20,20,22,.96)' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>Laguno</span>
                    <span style={{ fontSize: 9.5, fontWeight: 600, background: '#5865f2', color: '#fff', padding: '1px 5px', borderRadius: 3, letterSpacing: '.02em' }}>BOT</span>
                  </div>
                  <p style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.5 }}>
                    Aviso registado. <span style={{ color: 'var(--green)' }}>1 aviso</span> total para este utilizador.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────── */}
      <section id="features" style={{ position: 'relative', zIndex: 1,
        maxWidth: 1080, margin: '0 auto', width: '100%',
        padding: 'clamp(48px,8vh,80px) clamp(16px,4vw,64px)',
        borderTop: '1px solid var(--line)',
      }}>
        <div className="fade-up" style={{ marginBottom: 44 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 12 }}>Funcionalidades</p>
          <h2 style={{ fontSize: 'clamp(20px,2.8vw,30px)', fontWeight: 700, letterSpacing: '-.03em', maxWidth: 440 }}>
            Um bot. Tudo o que um servidor precisa.
          </h2>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))',
          border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden',
        }}>
          {features.map((f, i) => (
            <div key={f.title} className={`feature-cell fade-up d-${Math.min(i+1,6)}`} style={{ padding: '26px 28px' }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: 'rgba(62,207,142,.08)', border: '1px solid rgba(62,207,142,.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--green)', marginBottom: 14,
              }}>
                {f.icon}
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-.01em', marginBottom: 6 }}>{f.title}</p>
              <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────── */}
      <section style={{ maxWidth: 1080, margin: '0 auto', width: '100%', padding: '32px clamp(16px,4vw,64px) clamp(64px,10vh,100px)' }}>
        <div style={{
          padding: 'clamp(28px,4vw,48px)',
          background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 20,
        }}>
          <div>
            <p style={{ fontSize: 'clamp(16px,2.2vw,22px)', fontWeight: 700, letterSpacing: '-.025em', marginBottom: 5 }}>
              Adiciona o Laguno ao teu servidor
            </p>
            <p style={{ fontSize: 13.5, color: 'var(--text-2)', maxWidth: 380, lineHeight: 1.65 }}>
              Configura em menos de 2 minutos. Sem código.
            </p>
          </div>
          <a href={INVITE} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ fontSize: 13.5, padding: '.62rem 1.3rem', flexShrink: 0 }}>
            Começar grátis
          </a>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--line)', marginTop: 'auto',
        padding: '18px clamp(16px,4vw,64px)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--line)' }}>
            <Image src="/laguno.png" alt="" width={20} height={20} style={{ objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>Laguno</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/legal?tab=terms"   style={{ fontSize: 12, color: 'var(--text-3)', textDecoration: 'none' }}>Termos</Link>
          <Link href="/legal?tab=privacy" style={{ fontSize: 12, color: 'var(--text-3)', textDecoration: 'none' }}>Privacidade</Link>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
            by <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>Michuu</span>
            <span style={{ margin: '0 6px' }}>·</span>
            © 2026
          </span>
        </div>
      </footer>
    </div>
  );
}
