'use client';

import { useStats, formatUptime } from '@/lib/hooks/useStats';

export function StatsBar() {
  const { stats, loading, online } = useStats(10_000);

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'stretch', overflow: 'hidden', marginBottom: 24, padding: 0 }}>
      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '12px 18px', borderRight: '1px solid var(--line)', flexShrink: 0 }}>
        <span className={online ? 'dot dot-green' : 'dot dot-red'} />
        <span style={{ fontSize: 12.5, fontWeight: 500, color: online ? 'var(--green)' : '#f87171' }}>
          {online ? 'Online' : 'Offline'}
        </span>
      </div>

      {loading && (
        <div style={{ display: 'flex', gap: 12, padding: '12px 18px', alignItems: 'center', flex: 1 }}>
          {[80, 100, 60, 90].map((w, i) => <div key={i} className="skel" style={{ height: 12, width: w }} />)}
        </div>
      )}

      {!loading && online && stats && (
        <div style={{ display: 'flex', flex: 1 }}>
          {[
            { l: 'Servidores',   v: stats.guildCount.toLocaleString() },
            { l: 'Utilizadores', v: stats.userCount.toLocaleString() },
            { l: 'Latência',     v: `${stats.ping}ms` },
            { l: 'Uptime',       v: formatUptime(stats.uptime) },
          ].map((s, i, a) => (
            <div key={s.l} style={{ padding: '10px 20px', textAlign: 'center', flex: 1, borderRight: i < a.length - 1 ? '1px solid var(--line)' : 'none' }}>
              <p style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', fontVariantNumeric: 'tabular-nums' }}>{s.v}</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, letterSpacing: '.02em' }}>{s.l}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && !online && (
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 18px', flex: 1 }}>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Bot offline — inicia o bot para ver estatísticas.</p>
        </div>
      )}
    </div>
  );
}
