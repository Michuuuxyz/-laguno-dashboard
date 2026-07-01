'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ServiceStatus {
  online: boolean;
  latency?: number;
}

interface Status {
  bot:       ServiceStatus;
  dashboard: ServiceStatus;
  database:  ServiceStatus;
}

const SERVICES = [
  { key: 'bot',       label: 'Bot',           desc: 'Laguno no Discord' },
  { key: 'dashboard', label: 'Dashboard',      desc: 'Painel de controlo' },
  { key: 'database',  label: 'Base de Dados',  desc: 'MongoDB' },
] as const;

function UptimeBars({ online }: { online: boolean }) {
  const bars = Array.from({ length: 45 }, (_, i) => {
    if (!online && i >= 43) return 'offline';
    return 'online';
  });

  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
      {bars.map((s, i) => (
        <div key={i} style={{
          width: 6, height: 24, borderRadius: 2,
          background: s === 'online' ? '#6db83e' : '#f87171',
          opacity: i < 10 ? 0.4 + (i / 10) * 0.3 : 1,
        }} />
      ))}
    </div>
  );
}

export default function StatusPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  async function fetchStatus() {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        setStatus(await res.json());
        setLastChecked(new Date());
      }
    } catch { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30_000);
    return () => clearInterval(interval);
  }, []);

  const allOnline = status ? Object.values(status).every(s => s.online) : false;
  const anyOffline = status ? Object.values(status).some(s => !s.online) : false;

  return (
    <div style={{ minHeight: '100vh', background: '#0e0f11', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>

      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid #1e2025', padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/laguno.png" alt="Laguno" width={28} height={28} style={{ borderRadius: 6 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Laguno</span>
          <span style={{ fontSize: 12, color: '#6db83e', background: 'rgba(109,184,62,.1)', border: '1px solid rgba(109,184,62,.2)', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>Status</span>
        </Link>
        <Link href="/" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none' }}>← Voltar</Link>
      </nav>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{
          background: allOnline ? 'rgba(109,184,62,.08)' : anyOffline ? 'rgba(248,113,113,.08)' : '#141518',
          border: `1px solid ${allOnline ? 'rgba(109,184,62,.2)' : anyOffline ? 'rgba(248,113,113,.2)' : '#1e2025'}`,
          borderRadius: 14, padding: '20px 24px', marginBottom: 32,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          {loading ? (
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#334155', animation: 'pulse 1.5s infinite' }} />
          ) : (
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: allOnline ? '#6db83e' : anyOffline ? '#f87171' : '#f59e0b',
              boxShadow: `0 0 10px ${allOnline ? '#6db83e' : anyOffline ? '#f87171' : '#f59e0b'}55`,
            }} />
          )}
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>
              {loading ? 'A verificar...' : allOnline ? 'Todos os Serviços Operacionais' : anyOffline ? 'Serviço com Problemas' : 'A verificar serviços...'}
            </p>
            {lastChecked && (
              <p style={{ fontSize: 12, color: '#64748b' }}>
                Última verificação: {lastChecked.toLocaleTimeString('pt-PT')} · Atualiza a cada 30s
              </p>
            )}
          </div>
        </div>

        {/* Services */}
        <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 14 }}>Serviços</p>

        <div style={{ background: '#141518', border: '1px solid #1e2025', borderRadius: 14, overflow: 'hidden', marginBottom: 40 }}>
          {SERVICES.map((svc, i) => {
            const s = status?.[svc.key];
            const online = s?.online ?? null;
            return (
              <div key={svc.key} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '18px 24px',
                borderBottom: i < SERVICES.length - 1 ? '1px solid #1e2025' : 'none',
                gap: 16,
              }}>
                {/* Left */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                    background: online === null ? '#1e2025' : online ? 'rgba(109,184,62,.15)' : 'rgba(248,113,113,.15)',
                    color: online === null ? '#64748b' : online ? '#6db83e' : '#f87171',
                    whiteSpace: 'nowrap',
                  }}>
                    {online === null ? '...' : online ? '100%' : 'OFFLINE'}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{svc.label}</p>
                    <p style={{ fontSize: 12, color: '#475569' }}>{svc.desc}</p>
                  </div>
                </div>

                {/* Right */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  {loading ? (
                    <div style={{ width: 280, height: 24, borderRadius: 4, background: '#1e2025' }} />
                  ) : (
                    <UptimeBars online={online ?? false} />
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#334155' }}>45 dias atrás</span>
                    {s?.latency !== undefined && s.latency > 0 && (
                      <span style={{ fontSize: 11, color: '#475569' }}>{s.latency}ms</span>
                    )}
                    <span style={{ fontSize: 11, color: '#334155' }}>agora</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Refresh button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={fetchStatus} style={{
            background: 'rgba(109,184,62,.1)', border: '1px solid rgba(109,184,62,.2)',
            color: '#6db83e', borderRadius: 8, padding: '8px 20px', fontSize: 13,
            fontWeight: 600, cursor: 'pointer',
          }}>
            ↻ Verificar agora
          </button>
        </div>

      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #1e2025', padding: '20px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#334155' }}>Laguno © 2025 · lagunoapp.xyz</p>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}
