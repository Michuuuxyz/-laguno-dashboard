'use client';

// Editor por blocos (Components V2) — estilo "Adicionar Texto / Botões /
// Separador / Galeria / Container". Monta a mensagem peça a peça, com
// pré-visualização Discord ao vivo. Fase 1: botões só de link.

import { bid, type V2Block, type V2Inner, type V2Container } from '@/lib/v2blocks';

const inp: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 7, padding: '7px 10px', color: 'var(--text-1)', fontSize: 13, width: '100%', outline: 'none' };
const lbl: React.CSSProperties = { fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4, display: 'block' };
const mini: React.CSSProperties = { width: 24, height: 24, borderRadius: 6, border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--text-2)', cursor: 'pointer', fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };

const NAMES: Record<string, string> = { text: 'Texto', separator: 'Separador', gallery: 'Galeria', buttons: 'Linha de Botões', container: 'Container' };

function newBlock(t: V2Block['type']): V2Block {
  if (t === 'text')      return { id: bid(), type: 'text', content: 'Olá {user}!' };
  if (t === 'separator') return { id: bid(), type: 'separator', divider: true, spacing: 1 };
  if (t === 'gallery')   return { id: bid(), type: 'gallery', urls: [''] };
  if (t === 'buttons')   return { id: bid(), type: 'buttons', buttons: [{ id: bid(), label: 'Abrir site', url: 'https://' }] };
  return { id: bid(), type: 'container', accentColor: '#6db83e', blocks: [{ id: bid(), type: 'text', content: 'Olá {user}!' }] };
}

/* ── Editor de um bloco interior (texto/separador/galeria/botões) ── */
function InnerEditor({ b, onChange }: { b: V2Inner; onChange: (v: Partial<V2Inner>) => void }) {
  if (b.type === 'text') {
    return <textarea rows={3} style={{ ...inp, resize: 'vertical', fontFamily: 'monospace', lineHeight: 1.55 }} value={b.content} onChange={e => onChange({ content: e.target.value } as Partial<V2Inner>)} placeholder={'## Título\nTexto com {user}, **negrito** e -# subtexto'} />;
  }
  if (b.type === 'separator') {
    return (
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>
          <input type="checkbox" checked={b.divider !== false} onChange={e => onChange({ divider: e.target.checked } as Partial<V2Inner>)} /> Linha visível
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
          Espaço:
          <select style={{ ...inp, width: 'auto', padding: '4px 8px' }} value={b.spacing === 2 ? 2 : 1} onChange={e => onChange({ spacing: parseInt(e.target.value) as 1 | 2 } as Partial<V2Inner>)}>
            <option value={1}>Pequeno</option><option value={2}>Grande</option>
          </select>
        </label>
      </div>
    );
  }
  if (b.type === 'gallery') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {b.urls.map((u, i) => (
          <div key={i} style={{ display: 'flex', gap: 6 }}>
            <input style={inp} value={u} onChange={e => { const urls = [...b.urls]; urls[i] = e.target.value; onChange({ urls } as Partial<V2Inner>); }} placeholder="https://…/imagem.png" />
            <button onClick={() => onChange({ urls: b.urls.filter((_, x) => x !== i) } as Partial<V2Inner>)} style={{ ...mini, color: '#f87171' }}>✕</button>
          </div>
        ))}
        {b.urls.length < 10 && <button onClick={() => onChange({ urls: [...b.urls, ''] } as Partial<V2Inner>)} style={{ ...inp, cursor: 'pointer', color: 'var(--green)', fontWeight: 600, textAlign: 'center' }}>+ Imagem ({b.urls.length}/10)</button>}
      </div>
    );
  }
  // buttons (links)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {b.buttons.map(btn => (
        <div key={btn.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 52px 2fr auto', gap: 6 }}>
          <input style={inp} value={btn.label} onChange={e => onChange({ buttons: b.buttons.map(x => x.id === btn.id ? { ...x, label: e.target.value } : x) } as Partial<V2Inner>)} placeholder="Texto do botão" />
          <input style={inp} value={btn.emoji ?? ''} onChange={e => onChange({ buttons: b.buttons.map(x => x.id === btn.id ? { ...x, emoji: e.target.value } : x) } as Partial<V2Inner>)} placeholder="😀" />
          <input style={inp} value={btn.url} onChange={e => onChange({ buttons: b.buttons.map(x => x.id === btn.id ? { ...x, url: e.target.value } : x) } as Partial<V2Inner>)} placeholder="https://…" />
          <button onClick={() => onChange({ buttons: b.buttons.filter(x => x.id !== btn.id) } as Partial<V2Inner>)} style={{ ...mini, color: '#f87171' }}>✕</button>
        </div>
      ))}
      {b.buttons.length < 5 && <button onClick={() => onChange({ buttons: [...b.buttons, { id: bid(), label: '', url: 'https://' }] } as Partial<V2Inner>)} style={{ ...inp, cursor: 'pointer', color: 'var(--green)', fontWeight: 600, textAlign: 'center' }}>+ Botão ({b.buttons.length}/5)</button>}
      <p style={{ fontSize: 10.5, color: 'var(--text-3)' }}>Botões de link — abrem o URL. (Botões com ações vivem no Construtor.)</p>
    </div>
  );
}

/* ── Cartão de um bloco: cabeçalho (nome + mover + remover) + editor ── */
function BlockCard({ name, onUp, onDown, onRemove, canUp, canDown, children }: {
  name: string; onUp: () => void; onDown: () => void; onRemove: () => void; canUp: boolean; canDown: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 9, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{name}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={onUp} disabled={!canUp} style={{ ...mini, opacity: canUp ? 1 : .3 }}>↑</button>
          <button onClick={onDown} disabled={!canDown} style={{ ...mini, opacity: canDown ? 1 : .3 }}>↓</button>
          <button onClick={onRemove} style={{ ...mini, color: '#f87171', borderColor: 'rgba(248,113,113,.3)' }}>✕</button>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── Barra "Adicionar X" ── */
function AddBar({ types, onAdd }: { types: V2Block['type'][]; onAdd: (t: V2Block['type']) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {types.map(t => (
        <button key={t} onClick={() => onAdd(t)} style={{
          flex: '1 1 auto', padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: 'var(--green)', color: '#fff', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
        }}>Adicionar {NAMES[t]}</button>
      ))}
    </div>
  );
}

export function V2BlockEditor({ blocks, onChange }: { blocks: V2Block[]; onChange: (b: V2Block[]) => void }) {
  const move = (list: V2Block[], i: number, dir: -1 | 1): V2Block[] => {
    const j = i + dir; if (j < 0 || j >= list.length) return list;
    const next = [...list]; [next[i], next[j]] = [next[j], next[i]]; return next;
  };
  const patchAt = (i: number, v: Partial<V2Block>) => onChange(blocks.map((b, x) => x === i ? { ...b, ...v } as V2Block : b));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <AddBar types={['text', 'buttons', 'separator', 'gallery', 'container']} onAdd={t => onChange([...blocks, newBlock(t)])} />

      {blocks.length === 0 && (
        <p style={{ fontSize: 12.5, color: 'var(--text-3)', textAlign: 'center', padding: '14px 0', border: '1px dashed var(--line)', borderRadius: 9 }}>
          Sem blocos ainda — adiciona um em cima para começar.
        </p>
      )}

      {blocks.map((b, i) => (
        <BlockCard key={b.id} name={NAMES[b.type]} canUp={i > 0} canDown={i < blocks.length - 1}
          onUp={() => onChange(move(blocks, i, -1))} onDown={() => onChange(move(blocks, i, 1))}
          onRemove={() => onChange(blocks.filter((_, x) => x !== i))}>
          {b.type === 'container' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <label style={{ ...lbl, marginBottom: 0 }}>Cor</label>
                <input type="color" value={b.accentColor || '#6db83e'} onChange={e => patchAt(i, { accentColor: e.target.value } as Partial<V2Block>)} style={{ width: 32, height: 28, borderRadius: 6, border: '1px solid var(--line)', background: 'none', cursor: 'pointer' }} />
                <input style={{ ...inp, maxWidth: 110 }} value={b.accentColor || ''} onChange={e => patchAt(i, { accentColor: e.target.value } as Partial<V2Block>)} />
              </div>
              {/* Blocos dentro do container */}
              <div style={{ borderLeft: '3px solid rgba(109,184,62,.4)', paddingLeft: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(b.blocks || []).map((ib, ii) => (
                  <BlockCard key={ib.id} name={NAMES[ib.type]} canUp={ii > 0} canDown={ii < b.blocks.length - 1}
                    onUp={() => patchAt(i, { blocks: move(b.blocks, ii, -1) as V2Inner[] } as Partial<V2Container>)}
                    onDown={() => patchAt(i, { blocks: move(b.blocks, ii, 1) as V2Inner[] } as Partial<V2Container>)}
                    onRemove={() => patchAt(i, { blocks: b.blocks.filter((_, x) => x !== ii) } as Partial<V2Container>)}>
                    <InnerEditor b={ib} onChange={v => patchAt(i, { blocks: b.blocks.map((x, xx) => xx === ii ? { ...x, ...v } as V2Inner : x) } as Partial<V2Container>)} />
                  </BlockCard>
                ))}
                <AddBar types={['text', 'buttons', 'separator', 'gallery']} onAdd={t => patchAt(i, { blocks: [...b.blocks, newBlock(t) as V2Inner] } as Partial<V2Container>)} />
              </div>
            </div>
          ) : (
            <InnerEditor b={b} onChange={v => patchAt(i, v as Partial<V2Block>)} />
          )}
        </BlockCard>
      ))}
    </div>
  );
}

/* ─────────── Pré-visualização Discord dos blocos ─────────── */

function esc(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function md(t: string): string {
  return esc(t)
    .replace(/^## (.*)$/gm, '<strong style="font-size:15px">$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/-#\s(.*?)(\n|$)/g, '<span style="font-size:11px;color:#80848e">$1</span>$2')
    .replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,.1);padding:1px 5px;border-radius:3px;font-size:12px">$1</code>')
    .replace(/\n/g, '<br/>');
}
function sample(t: string): string {
  return (t || '')
    .replace(/{user}/g, '@Michu').replace(/{@user}/g, '@Michu')
    .replace(/{username}/g, 'Michu').replace(/{user\.name}/g, 'michu').replace(/{user\.tag}/g, 'michu')
    .replace(/{displayname}/g, 'Michu').replace(/{user\.id}/g, '3495275936342')
    .replace(/{count}/g, '42').replace(/{guild\.size}/g, '42')
    .replace(/{server}/g, 'o servidor').replace(/{guild\.name}/g, 'o servidor').replace(/{guild}/g, 'o servidor')
    .replace(/{created}/g, 'há 2 anos');
}

function PreviewInner({ b }: { b: V2Inner }) {
  if (b.type === 'text') {
    return b.content?.trim()
      ? <p style={{ fontSize: 13, color: '#dbdee1', lineHeight: 1.6, margin: 0 }} dangerouslySetInnerHTML={{ __html: md(sample(b.content)) }} />
      : null;
  }
  if (b.type === 'separator') {
    return <div style={{ margin: b.spacing === 2 ? '10px 0' : '6px 0', borderTop: b.divider !== false ? '1px solid rgba(255,255,255,.09)' : 'none', height: b.divider !== false ? 0 : 4 }} />;
  }
  if (b.type === 'gallery') {
    const urls = b.urls.filter(u => /^https?:\/\//i.test(u));
    if (!urls.length) return null;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: urls.length > 1 ? '1fr 1fr' : '1fr', gap: 4, margin: '4px 0' }}>
        {urls.slice(0, 4).map((u, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={u} alt="" style={{ width: '100%', maxHeight: urls.length > 1 ? 90 : 150, objectFit: 'cover', borderRadius: 6, display: 'block' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
        ))}
      </div>
    );
  }
  const btns = b.buttons.filter(x => x.label?.trim());
  if (!btns.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '6px 0 2px' }}>
      {btns.map(x => (
        <span key={x.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#4e5058', color: '#f2f3f5', borderRadius: 4, padding: '6px 12px', fontSize: 12.5, fontWeight: 500 }}>
          {x.emoji ? `${x.emoji} ` : ''}{sample(x.label)}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#b5bac1" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
        </span>
      ))}
    </div>
  );
}

export function V2Preview({ blocks }: { blocks: V2Block[] }) {
  return (
    <div style={{ background: '#313338', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,.06)', fontFamily: '"gg sans","Noto Sans",sans-serif' }}>
      <div style={{ padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ color: '#80848e', fontSize: 13 }}>#</span>
        <span style={{ fontSize: 12, color: '#80848e' }}>boas-vindas</span>
      </div>
      <div style={{ padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/laguno.png" alt="" style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, objectFit: 'cover', border: '1px solid rgba(255,255,255,.08)' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 6 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#f2f3f5' }}>Laguno</span>
            <span style={{ fontSize: 9.5, fontWeight: 600, background: '#5865f2', color: '#fff', padding: '1px 4px', borderRadius: 3 }}>BOT</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 440 }}>
            {blocks.length === 0 && <p style={{ fontSize: 12.5, color: '#80848e', fontStyle: 'italic' }}>Adiciona blocos para veres a mensagem aqui…</p>}
            {blocks.map(b => b.type === 'container' ? (
              <div key={b.id} style={{ background: '#2b2d31', borderRadius: 8, borderLeft: `3px solid ${b.accentColor || '#6db83e'}`, padding: '10px 13px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {b.blocks.map(ib => <PreviewInner key={ib.id} b={ib} />)}
              </div>
            ) : (
              <PreviewInner key={b.id} b={b as V2Inner} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
