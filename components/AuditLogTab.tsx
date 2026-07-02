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

const CATEGORIES: { id: string; label: string; icon: string; color: string }[] = [
  { id: 'moderation', label: 'Moderação', icon: '🛡️', color: '#f87171' },
  { id: 'members',    label: 'Membros',   icon: '👥', color: '#4ade80' },
  { id: 'messages',   label: 'Mensagens', icon: '💬', color: '#60a5fa' },
  { id: 'channels',   label: 'Canais',    icon: '📁', color: '#fbbf24' },
  { id: 'roles',      label: 'Cargos',    icon: '🏷️', color: '#a78bfa' },
  { id: 'voice',      label: 'Voz',       icon: '🔊', color: '#f472b6' },
  { id: 'server',     label: 'Servidor',  icon: '⚙️', color: '#94a3b8' },
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

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (category) params.set('category', category);
    try {
      const res = await fetch(`/api/guilds/${guildId}/auditlog?${params}`);
      const data = await res.json();
      setEntries(data.items ?? []);
      setPages(data.pages ?? 1);
      setTotal(data.total ?? 0);
    } catch { setEntries([]); }
    setLoading(false);
  }, [guildId, page, category]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(0); }, [category]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 4 }}>Registo de Auditoria</h2>
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
                <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{cat.icon}</span>
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
