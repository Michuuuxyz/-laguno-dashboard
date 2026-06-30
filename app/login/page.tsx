'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';

const DiscordIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
  </svg>
);

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ width: 80, height: 80, overflow: 'hidden' }}>
            <Image src="/laguno.png" alt="Laguno" width={80} height={80} style={{ objectFit: 'contain' }} />
          </div>
        </div>

        {/* Text */}
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.03em', marginBottom: 8 }}>
          Entrar no Laguno
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 32, maxWidth: 300, margin: '0 auto 32px' }}>
          Usa a tua conta Discord para aceder ao dashboard e gerir os teus servidores.
        </p>

        {/* Button */}
        <button
          onClick={async () => { setLoading(true); await signIn('discord', { callbackUrl: '/dashboard' }); }}
          disabled={loading}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '11px 20px', borderRadius: 8, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? 'var(--elevated)' : '#5865f2',
            color: '#fff', fontSize: 14.5, fontWeight: 600, transition: 'opacity .15s',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin .7s linear infinite' }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeDasharray="28" strokeDashoffset="8" strokeLinecap="round"/></svg>
            : <DiscordIcon />
          }
          {loading ? 'A entrar...' : 'Continuar com Discord'}
        </button>

        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 20, lineHeight: 1.6 }}>
          Ao entrares, aceitas os termos de uso do Laguno.
        </p>
      </div>
    </div>
  );
}
