'use client';

import { useEffect, useState, useCallback } from 'react';

interface ModLog {
  _id:          string;
  action:       string;
  targetId:     string;
  targetTag:    string;
  moderatorId:  string;
  moderatorTag: string;
  reason:       string;
  duration?:    string;
  createdAt:    string;
}

interface Props { guildId: string; }

const ACTIONS = ['BAN', 'KICK', 'WARN', 'TIMEOUT', 'UNBAN', 'MUTE', 'UNMUTE'] as const;

const ACTION_STYLE: Record<string, { icon: string; color: string; label: string }> = {
  BAN:     { icon: '🔨', color: '#f87171', label: 'Ban' },
  KICK:    { icon: '👢', color: '#fb923c', label: 'Kick' },
  WARN:    { icon: '⚠️', color: '#facc15', label: 'Aviso' },
  TIMEOUT: { icon: '⏱️', color: '#a78bfa', label: 'Timeout' },
  UNBAN:   { icon: '✅', color: '#4ade80', label: 'Unban' },
  MUTE:    { icon: '🔇', color: '#94a3b8', label: 'Mute' },
  UNMUTE:  { icon: '🔊', color: '#4ade80', label: 'Unmute' },
};

const inputStyle: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--line)',
  borderRadius: 7, padding: '8px 12px', color: 'var(--text-1)', fontSize: 13.5, outline: 'none',
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function ModLogsTab({ guildId }: Props) {
  const [logs, setLogs]     = useState<ModLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]     = useState(0);
  const [pages, setPages]   = useState(1);
  const [total, setTotal]   = useState(0);
  const [action, setAction] = useState('');
  const [user, setUser]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (action) params.set('action', action);
    if (user.trim()) params.set('user', user.trim());
    try {
      const res = await fetch(`/api/guilds/${guildId}/modlogs?${params}`);
      const data = await res.json();
      setLogs(data.items ?? []);
      setPages(data.pages ?? 1);
      setTotal(data.total ?? 0);
    } catch { setLogs([]); }
    setLoading(false);
  }, [guildId, page, action, user]);

  useEffect(() => { load(); }, [load]);

  // Reset para a primeira página quando muda um filtro
  useEffect(() => { setPage(0); }, [action, user]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 4 }}>Histórico de Moderação</h2>
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
          Todas as ações do Laguno neste servidor — bans, kicks, avisos, timeouts e mutes. {total > 0 && <strong style={{ color: 'var(--text-2)' }}>{total} registo{total !== 1 ? 's' : ''}.</strong>}
        </p>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <select style={{ ...inputStyle, minWidth: 150 }} value={action} onChange={e => setAction(e.target.value)}>
          <option value="">Todas as ações</option>
          {ACTIONS.map(a => <option key={a} value={a}>{ACTION_STYLE[a].icon} {ACTION_STYLE[a].label}</option>)}
        </select>
        <input style={{ ...inputStyle, flex: 1, minWidth: 200 }} placeholder="Filtrar por ID de utilizador" value={user} onChange={e => setUser(e.target.value)} />
        {(action || user) && (
          <button onClick={() => { setAction(''); setUser(''); }} style={{ ...inputStyle, cursor: 'pointer', color: 'var(--text-3)' }}>Limpar</button>
        )}
      </div>

      {/* Lista */}
      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--text-3)', padding: '40px 0', textAlign: 'center' }}>A carregar...</p>
      ) : logs.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Sem registos</p>
          <p style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{action || user ? 'Nenhuma ação corresponde aos filtros.' : 'Ainda não há ações de moderação registadas.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {logs.map(log => {
            const s = ACTION_STYLE[log.action] ?? { icon: '•', color: 'var(--text-2)', label: log.action };
            return (
              <div key={log._id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 4, height: 38, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.icon} {s.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{log.targetTag}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>({log.targetId})</span>
                    {log.duration && <span style={{ fontSize: 11, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 20, padding: '1px 8px', color: 'var(--text-2)' }}>{log.duration}</span>}
                  </div>
                  <p style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 2, wordBreak: 'break-word' }}>{log.reason}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-3)' }}>por <strong style={{ color: 'var(--text-2)' }}>{log.moderatorTag}</strong> · {fmtDate(log.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginação */}
      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 20 }}>
          <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} style={{ ...inputStyle, cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.4 : 1 }}>← Anterior</button>
          <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Página {page + 1} de {pages}</span>
          <button disabled={page + 1 >= pages} onClick={() => setPage(p => p + 1)} style={{ ...inputStyle, cursor: page + 1 >= pages ? 'default' : 'pointer', opacity: page + 1 >= pages ? 0.4 : 1 }}>Seguinte →</button>
        </div>
      )}
    </div>
  );
}
