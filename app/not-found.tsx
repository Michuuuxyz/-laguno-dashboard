'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '0 24px',
      }}>
        <div style={{
          width: 100, height: 100, overflow: 'hidden',
          marginBottom: 32, opacity: 0.6,
        }}>
          <Image src="/laguno.png" alt="Laguno" width={100} height={100} style={{ objectFit: 'cover' }} />
        </div>

        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 16 }}>
          Erro 404
        </p>

        <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.03em', lineHeight: 1.15, marginBottom: 16 }}>
          Página não encontrada
        </h1>

        <p style={{ fontSize: 16, color: 'var(--text-2)', maxWidth: 360, lineHeight: 1.6, marginBottom: 40 }}>
          Esta página não existe ou foi removida. O Laguno também não a encontrou.
        </p>

        <Link href="/" className="nav-cta-green">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
