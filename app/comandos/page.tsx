import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { SiteFooter } from '@/components/SiteFooter';
import { CommandsExplorer } from '@/components/CommandsExplorer';

export const metadata: Metadata = {
  title: 'Comandos — Laguno',
  description: 'Todos os comandos do Laguno: moderação (ban, kick, warn, timeout), utilidade (avatar, userinfo, serverinfo) e mais. Tudo em português.',
  alternates: { canonical: '/comandos' },
  openGraph: {
    title: 'Comandos — Laguno',
    description: 'Todos os comandos do Laguno: moderação, utilidade e mais. Em português.',
    url: 'https://lagunoapp.xyz/comandos',
  },
};

const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
const INVITE    = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=bot+applications.commands&permissions=1102129391846`;

export default function Comandos() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* ── Cabeçalho ── */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(56px,9vh,96px) clamp(20px,4vw,56px) 0' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 18 }}>
          Referência completa
        </p>
        <h1 className="display" style={{
          fontSize: 'clamp(34px,5.5vw,64px)', fontWeight: 800,
          letterSpacing: '-.03em', lineHeight: 1.02, marginBottom: 16,
        }}>
          Todos os comandos.<br />
          <span style={{ color: 'var(--text-3)' }}>Zero em inglês.</span>
        </h1>
        <p style={{ fontSize: 15.5, color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 560, marginBottom: 40 }}>
          Escreve <code style={{ background: 'var(--card)', border: '1px solid var(--line)', padding: '1px 8px', borderRadius: 5, color: 'var(--green)', fontSize: 14 }}>/</code> no
          Discord e aparecem todos. Os que exigem permissões só são visíveis para quem as tem —
          os restantes membros nem os veem.
        </p>
      </section>

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
              E as boas-vindas, auto-mod, sorteios e logs?
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
