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
        </Link>
        <Link href="/" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Voltar
        </Link>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '56px 24px 80px' }}>

        {/* Page title */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>Estado dos Serviços</h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>Monitorização em tempo real da infraestrutura do Laguno</p>
        </div>

        {/* Status banner */}
        <div style={{
          background: loading ? '#141518' : allOnline ? 'rgba(109,184,62,.08)' : anyOffline ? 'rgba(248,113,113,.08)' : '#141518',
          border: `1px solid ${loading ? '#1e2025' : allOnline ? 'rgba(109,184,62,.25)' : anyOffline ? 'rgba(248,113,113,.25)' : '#1e2025'}`,
          borderRadius: 12, padding: '16px 20px', marginBottom: 32,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          {loading ? (
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#334155', flexShrink: 0, animation: 'pulse 1.5s infinite' }} />
          ) : (
            <div style={{
              width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
              background: allOnline ? '#6db83e' : anyOffline ? '#f87171' : '#f59e0b',
              boxShadow: `0 0 8px ${allOnline ? '#6db83e88' : anyOffline ? '#f8717188' : '#f59e0b88'}`,
            }} />
          )}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
              {loading ? 'A verificar serviços...' : allOnline ? 'Todos os serviços operacionais' : anyOffline ? 'Um ou mais serviços com problemas' : 'A verificar...'}
            </p>
          </div>
          {lastChecked && (
            <p style={{ fontSize: 12, color: '#475569', whiteSpace: 'nowrap' }}>
              Atualizado às {lastChecked.toLocaleTimeString('pt-PT')}
            </p>
          )}
        </div>

        {/* Services */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 40 }}>
          {SERVICES.map((svc) => {
            const s = status?.[svc.key];
            const online = s?.online ?? null;
            return (
              <div key={svc.key} style={{
                background: '#141518',
                border: `1px solid ${online === false ? 'rgba(248,113,113,.15)' : '#1e2025'}`,
                borderRadius: 12, padding: '20px 24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: online === null ? '#334155' : online ? '#6db83e' : '#f87171',
                      boxShadow: online ? '0 0 6px #6db83e88' : online === false ? '0 0 6px #f8717188' : 'none',
                    }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{svc.label}</p>
                      <p style={{ fontSize: 12, color: '#475569' }}>{svc.desc}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    {s?.latency !== undefined && s.latency > 0 && (
                      <span style={{ fontSize: 12, color: '#64748b' }}>{s.latency}ms</span>
                    )}
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                      background: online === null ? '#1e2025' : online ? 'rgba(109,184,62,.12)' : 'rgba(248,113,113,.12)',
                      color: online === null ? '#475569' : online ? '#6db83e' : '#f87171',
                      border: `1px solid ${online === null ? 'transparent' : online ? 'rgba(109,184,62,.2)' : 'rgba(248,113,113,.2)'}`,
                    }}>
                      {online === null ? '...' : online ? 'Operacional' : 'Offline'}
                    </span>
                  </div>
                </div>

                {loading ? (
                  <div style={{ width: '100%', height: 20, borderRadius: 4, background: '#1e2025' }} />
                ) : (
                  <>
                    <UptimeBars online={online ?? false} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: '#334155' }}>45 dias atrás</span>
                      <span style={{ fontSize: 11, color: '#334155' }}>agora</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Refresh button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={fetchStatus} style={{
            background: 'rgba(109,184,62,.08)', border: '1px solid rgba(109,184,62,.2)',
            color: '#6db83e', borderRadius: 8, padding: '9px 22px', fontSize: 13,
            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            ↻ Verificar agora
          </button>
        </div>

      </div>


      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}
