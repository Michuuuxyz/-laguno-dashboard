import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { SiteFooter } from '@/components/SiteFooter';
import { CommandsExplorer } from '@/components/CommandsExplorer';
import { PageHero } from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'Comandos — Laguno',
  description: 'Todos os comandos do Laguno: moderação (ban, kick, warn, timeout), utilidade (avatar, userinfo, serverinfo) e mais. Tudo em português.',
  alternates: { canonical: '/comandos' },
  keywords: ['comandos laguno', 'comandos bot discord', 'comando ban discord', 'comando kick discord', 'comando warn discord', 'slash commands português', 'lista de comandos discord'],
  openGraph: {
    title: 'Comandos — Laguno',
    description: 'Todos os comandos do Laguno: moderação, utilidade e mais. Em português.',
    url: 'https://www.lagunoapp.xyz/comandos',
  },
};

const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
const INVITE    = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=bot+applications.commands&permissions=1102666262758`;

export default function Comandos() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* ── PAGE HERO — mesma estrutura mascote + rabiscos do site ── */}
      <PageHero
        eyebrow="Referência completa"
        title="Todos os comandos."
        titleAccent="Zero em inglês."
        desc="Escreve / no Discord e aparecem todos. Os que exigem permissões só são visíveis para quem as tem — os restantes membros nem os veem."
        mascot="/mascote/estrela.webp"
        mascotAlt="Laguno"
      />

      {/* ── Explorador ── */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 clamp(20px,4vw,56px) clamp(56px,8vh,88px)' }}>
        <CommandsExplorer />

        {/* Nota: o resto vive no dashboard */}
        <div style={{
          marginTop: 40, padding: '22px 26px', borderRadius: 14,
          background: 'var(--card)', border: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
        }}>
          <div>
            <p style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 4, letterSpacing: '-.01em' }}>
              E as boas-vindas, auto-mod, tickets e logs?
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
              Isso não são comandos — configuram-se uma vez no dashboard e correm sozinhos, para sempre.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="nav-cta-green" style={{ fontSize: 13.5, padding: '.6rem 1.4rem' }}>
              Abrir o dashboard
            </Link>
            <Link href="/docs" className="nav-cta-outline" style={{ fontSize: 13.5, padding: '.6rem 1.4rem' }}>
              Documentação
            </Link>
          </div>
        </div>

        {/* CTA final */}
        <div style={{ textAlign: 'center', marginTop: 56 }}>
          <p style={{ fontSize: 13.5, color: 'var(--text-3)', marginBottom: 14 }}>
            Ainda não tens o Laguno no teu servidor? Isso explica muita coisa.
          </p>
          <a href={INVITE} target="_blank" rel="noreferrer" className="nav-cta-green" style={{ fontSize: 15, padding: '.8rem 2.2rem', fontWeight: 700 }}>
            Adicionar ao servidor
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
