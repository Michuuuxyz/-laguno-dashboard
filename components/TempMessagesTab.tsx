'use client';

import { useEffect, useState } from 'react';
import { Toggle, input, card, lbl } from './ui';
import { V2BlockEditor, V2Preview } from './V2BlockEditor';
import { bid, type V2Block } from '@/lib/v2blocks';

interface Channel { id: string; name: string }
interface TempMsg {
  configId: string;
  channelId: string;
  mode: 'timer' | 'sticky';
  intervalSeconds: number;
  enabled: boolean;
  blocks: V2Block[];
}

// Intervalos prontos — mantêm o valor sempre acima do mínimo seguro (30s)
const PRESETS: { s: number; l: string }[] = [
  { s: 30, l: '30 segundos' }, { s: 60, l: '1 minuto' }, { s: 300, l: '5 minutos' },
  { s: 600, l: '10 minutos' }, { s: 1800, l: '30 minutos' }, { s: 3600, l: '1 hora' },
  { s: 21600, l: '6 horas' }, { s: 43200, l: '12 horas' }, { s: 86400, l: '24 horas' },
];

function novaMsg(): TempMsg {
  return {
    configId: bid() + bid(),
    channelId: '',
    mode: 'timer',
    intervalSeconds: 300,
    enabled: true,
    blocks: [{ id: bid(), type: 'container', accentColor: '#6db83e', blocks: [{ id: bid(), type: 'text', content: '## Aviso\nEsta mensagem renova-se sozinha.' }] }],
  };
}

export function TempMessagesTab({ guildId, channels }: { guildId: string; channels: Channel[] }) {
  const [msgs, setMsgs] = useState<TempMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/guilds/${guildId}/temp-messages`)
      .then(r => r.ok ? r.json() : [])
      .then((d: TempMsg[]) => setMsgs(Array.isArray(d) ? d : []))
      .catch(() => setMsgs([]))
      .finally(() => setLoading(false));
  }, [guildId]);

  const patch = (id: string, v: Partial<TempMsg>) => setMsgs(ms => ms.map(m => m.configId === id ? { ...m, ...v } : m));
  const remove = (id: string) => setMsgs(ms => ms.filter(m => m.configId !== id));

  async function save() {
    // Uma mensagem sem canal não faz sentido — e um save vazio apagava tudo
    const semCanal = msgs.findIndex(m => !m.channelId);
    if (semCanal !== -1) {
      setErr(`Escolhe um canal para a Mensagem ${semCanal + 1} antes de guardar.`);
      return;
    }
    const semConteudo = msgs.findIndex(m => !m.blocks?.length);
    if (semConteudo !== -1) {
      setErr(`A Mensagem ${semConteudo + 1} está vazia — adiciona pelo menos um bloco.`);
      return;
    }
    setSaving(true); setErr(null);
    try {
      const res = await fetch(`/api/guilds/${guildId}/temp-messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: msgs }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Não foi possível guardar.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="skel" style={{ height: 220, borderRadius: 12 }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ ...card, background: 'var(--card)' }}>
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
          Cria mensagens que se renovam sozinhas num canal. <strong style={{ color: 'var(--text-1)' }}>Temporizador</strong> reenvia de tempos a tempos;{' '}
          <strong style={{ color: 'var(--text-1)' }}>Fixar no fundo</strong> reenvia quando alguém escreve, para ficar sempre em baixo. Usa o editor Components V2 (texto, botões de link, separador, imagem).
        </p>
      </div>

      {msgs.map((m, i) => {
        const ch = channels.find(c => c.id === m.channelId);
        return (
          <div key={m.configId} style={{ ...card, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <p style={{ fontSize: 14, fontWeight: 700 }}>Mensagem {i + 1} {ch && <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>· #{ch.name}</span>}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{m.enabled ? 'Ativa' : 'Desativada'}</span>
                  <Toggle on={m.enabled} onChange={() => patch(m.configId, { enabled: !m.enabled })} />
                </div>
                <button onClick={() => remove(m.configId)} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 7, color: '#f87171', cursor: 'pointer', fontSize: 12, padding: '5px 10px' }}>Remover</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
              <div>
                <label style={lbl}>Canal</label>
                <select style={input} value={m.channelId} onChange={e => patch(m.configId, { channelId: e.target.value })}>
                  <option value="">Escolhe um canal…</option>
                  {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Modo</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['timer', 'sticky'] as const).map(md => (
                    <button key={md} onClick={() => patch(m.configId, { mode: md })} style={{
                      flex: 1, padding: '8px 6px', borderRadius: 7, fontSize: 12, cursor: 'pointer',
                      border: `1px solid ${m.mode === md ? 'var(--green)' : 'var(--line)'}`,
                      background: m.mode === md ? 'rgba(109,184,62,.1)' : 'var(--surface)',
                      color: m.mode === md ? 'var(--green)' : 'var(--text-2)',
                    }}>{md === 'timer' ? 'Temporizador' : 'Fixar no fundo'}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={lbl}>{m.mode === 'timer' ? 'Reenviar a cada' : 'Espera mínima'}</label>
                <select style={input} value={m.intervalSeconds} onChange={e => patch(m.configId, { intervalSeconds: parseInt(e.target.value) })}>
                  {PRESETS.map(p => <option key={p.s} value={p.s}>{p.l}</option>)}
                </select>
              </div>
            </div>

            <div className="tm-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
              <div>
                <label style={{ ...lbl, marginBottom: 8 }}>Mensagem</label>
                <V2BlockEditor blocks={m.blocks} onChange={b => patch(m.configId, { blocks: b })} />
              </div>
              <div>
                <label style={{ ...lbl, marginBottom: 8 }}>Pré-visualização</label>
                <div style={{ position: 'sticky', top: 12 }}>
                  <V2Preview blocks={m.blocks} channel={ch?.name ?? 'canal'} />
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <button onClick={() => setMsgs(ms => [...ms, novaMsg()])} style={{ ...input, cursor: 'pointer', color: 'var(--green)', fontWeight: 600, textAlign: 'center', padding: '10px' }}>
        + Adicionar mensagem
      </button>

      {err && <p style={{ fontSize: 12.5, color: '#f87171', background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.2)', borderRadius: 7, padding: '8px 10px' }}>{err}</p>}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={save} disabled={saving} className="nav-cta-green" style={{ border: 'none', cursor: saving ? 'wait' : 'pointer', padding: '.7rem 1.8rem', fontSize: 14 }}>
          {saving ? 'A guardar…' : saved ? 'Guardado!' : 'Guardar'}
        </button>
      </div>

      <style>{`@media (max-width: 820px) { .tm-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
