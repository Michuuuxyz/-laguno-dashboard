'use client';

import { useEffect, useState, useCallback } from 'react';

interface AuditEntry {
  _id:       string;
  category:  string;
  event:     string;
  content:   string;
  createdAt: string;
}

interface Props { guildId: string; }

const S = (p: React.ReactNode) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{p}</svg>
);

const CATEGORIES: { id: string; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'moderation', label: 'Moderação', color: '#f87171', icon: S(<><path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z"/><path d="M9.5 12l1.8 1.8L15 10"/></>) },
  { id: 'members',    label: 'Membros',   color: '#4ade80', icon: S(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="3.2"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></>) },
  { id: 'messages',   label: 'Mensagens', color: '#60a5fa', icon: S(<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>) },
  { id: 'channels',   label: 'Canais',    color: '#fbbf24', icon: S(<path d="M3 7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>) },
  { id: 'roles',      label: 'Cargos',    color: '#a78bfa', icon: S(<><path d="M20.6 13.4L13 21a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 2.6 12l.4-6a2 2 0 0 1 2-2l6-.4a2 2 0 0 1 1.6.6l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="8.5" r="1.3"/></>) },
  { id: 'voice',      label: 'Voz',       color: '#f472b6', icon: S(<><path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14"/></>) },
  { id: 'server',     label: 'Servidor',  color: '#94a3b8', icon: S(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15H4.5a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 6 9.4l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 11 4.6V4.5a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 2.82 1.17l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 11h.1a2 2 0 1 1 0 4h-.1z"/></>) },
];

const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

const inputStyle: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--line)',
  borderRadius: 7, padding: '8px 12px', color: 'var(--text-1)', fontSize: 13.5, outline: 'none',
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// Remove markdown do Discord para exibição limpa; primeira linha = título
function parseContent(raw: string): { title: string; body: string } {
  const clean = raw
    .replace(/[`*_~]/g, '')
    .replace(/^#+\s*/gm, '')
    .replace(/<t:\d+:[A-Za-z]>/g, '')
    .trim();
  const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);
  return { title: lines[0] ?? '', body: lines.slice(1).join(' · ') };
}

export function AuditLogTab({ guildId }: Props) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(0);
  const [pages, setPages]     = useState(1);
  const [total, setTotal]     = useState(0);
  const [category, setCategory] = useState('');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (category) params.set('category', category);
    try {
      const res = await fetch(`/api/guilds/${guildId}/auditlog?${params}`);
      const data = await res.json();
      setEntries(data.items ?? []);
      setPages(data.pages ?? 1);
      setTotal(data.total ?? 0);
    } catch { if (!silent) setEntries([]); }
    if (!silent) setLoading(false);
  }, [guildId, page, category]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(0); }, [category]);

  // Ao vivo — atualiza sozinho a cada 10s quando estás na primeira página
  useEffect(() => {
    if (page !== 0) return;
    const t = setInterval(() => load(true), 10_000);
    return () => clearInterval(t);
  }, [page, load]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.02em' }}>Registo de Auditoria</h2>
          {page === 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 700, letterSpacing: '.05em', color: 'var(--green)', background: 'rgba(109,184,62,.1)', border: '1px solid rgba(109,184,62,.25)', borderRadius: 99, padding: '2px 9px', textTransform: 'uppercase' }}>
              <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
              Ao vivo
            </span>
          )}
        </div>
        <style>{`@keyframes livePulse { 0%,100% { opacity: 1; } 50% { opacity: .3; } } .live-dot { animation: livePulse 1.6s ease-in-out infinite; }`}</style>
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
          Tudo o que acontece no servidor, como no registo de auditoria do Discord — entradas, saídas, mensagens, canais, cargos, voz e moderação. {total > 0 && <strong style={{ color: 'var(--text-2)' }}>{total} evento{total !== 1 ? 's' : ''}.</strong>} <span style={{ color: 'var(--text-3)' }}>Mantido durante 30 dias.</span>
        </p>
      </div>

      {/* Filtros por categoria */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        <button onClick={() => setCategory('')} style={{
          padding: '5px 12px', borderRadius: 20, fontSize: 12.5, cursor: 'pointer',
          border: category === '' ? '1px solid var(--green)' : '1px solid var(--line)',
          background: category === '' ? 'rgba(109,184,62,.1)' : 'var(--surface)',
          color: category === '' ? 'var(--green)' : 'var(--text-2)',
        }}>Tudo</button>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)} style={{
            padding: '5px 12px', borderRadius: 20, fontSize: 12.5, cursor: 'pointer',
            border: category === c.id ? `1px solid ${c.color}` : '1px solid var(--line)',
            background: category === c.id ? c.color + '1a' : 'var(--surface)',
            color: category === c.id ? c.color : 'var(--text-2)',
          }}>{c.icon} {c.label}</button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--text-3)', padding: '40px 0', textAlign: 'center' }}>A carregar...</p>
      ) : entries.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Sem eventos</p>
          <p style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{category ? 'Nenhum evento nesta categoria.' : 'Ainda não há eventos registados. Assim que algo acontecer no servidor, aparece aqui.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {entries.map(e => {
            const cat = CAT_MAP[e.category] ?? { icon: '•', color: 'var(--text-2)', label: e.category };
            const { title, body } = parseContent(e.content);
            return (
              <div key={e._id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ flexShrink: 0, marginTop: 2, width: 26, height: 26, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: cat.color + '1a', color: cat.color }}>{cat.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: cat.color + '1a', color: cat.color, letterSpacing: '.03em', textTransform: 'uppercase' }}>{cat.label}</span>
                  </div>
                  {body && <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2, wordBreak: 'break-word' }}>{body}</p>}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0, whiteSpace: 'nowrap' }}>{fmtDate(e.createdAt)}</span>
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
