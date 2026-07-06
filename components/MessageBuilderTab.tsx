'use client';

import { useState } from 'react';

interface Channel { id: string; name: string; }
interface Role    { id: string; name: string; color: number; }

type ActionType = 'message' | 'role' | 'link';
interface BuilderButton {
  label: string; emoji: string; style: 1 | 2 | 3 | 4;
  actionType: ActionType; content: string; ephemeral: boolean; roleId: string; url: string;
}

type AccKind = 'none' | 'image' | 'button';

type Block =
  | { id: string; type: 'text';      content: string; accKind?: AccKind; accUrl?: string; accBtn?: BuilderButton }
  | { id: string; type: 'image';     url: string }
  | { id: string; type: 'separator'; divider: boolean }
  | { id: string; type: 'buttons';   buttons: BuilderButton[] };

interface Props { guildId: string; channels: Channel[]; roles: Role[]; }

const input: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8,
  padding: '8px 12px', color: 'var(--text-1)', fontSize: 13.5, width: '100%', outline: 'none',
};
const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.04em', display: 'block', marginBottom: 6 };

const STYLE_OPTS: { v: 1 | 2 | 3 | 4; label: string; bg: string }[] = [
  { v: 1, label: 'Azul', bg: '#5865f2' }, { v: 2, label: 'Cinza', bg: '#4e5058' },
  { v: 3, label: 'Verde', bg: '#3ba55d' }, { v: 4, label: 'Vermelho', bg: '#ed4245' },
];
const STYLE_BG: Record<number, string> = { 1: '#5865f2', 2: '#4e5058', 3: '#3ba55d', 4: '#ed4245', 5: '#4e5058' };

const uid = () => Math.random().toString(36).slice(2, 9);
const newButton = (): BuilderButton => ({ label: 'Botão', emoji: '', style: 2, actionType: 'message', content: 'Olá! 👋', ephemeral: true, roleId: '', url: '' });

function md(text: string): string {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.*)$/gm, '<strong style="font-size:14px">$1</strong>')
    .replace(/^## (.*)$/gm, '<strong style="font-size:16px">$1</strong>')
    .replace(/^-# (.*)$/gm, '<span style="font-size:11px;color:#80848e">$1</span>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,.1);padding:1px 5px;border-radius:3px;font-size:12px">$1</code>')
    .replace(/\n/g, '<br/>');
}

export function MessageBuilderTab({ guildId, channels, roles }: Props) {
  const [channelId, setChannelId] = useState('');
  const [accent, setAccent]       = useState('#6db83e');
  const [blocks, setBlocks]       = useState<Block[]>([
    { id: uid(), type: 'text', content: '## Anúncio\nEscreve aqui a tua mensagem. Aceita **markdown**.' },
  ]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [msg, setMsg]       = useState<string | null>(null);

  function patch(id: string, p: Partial<Block>) {
    setBlocks(bs => bs.map(b => b.id === id ? { ...b, ...p } as Block : b));
  }
  function remove(id: string) { setBlocks(bs => bs.filter(b => b.id !== id)); }
  function move(id: string, dir: -1 | 1) {
    setBlocks(bs => {
      const i = bs.findIndex(b => b.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= bs.length) return bs;
      const copy = [...bs]; [copy[i], copy[j]] = [copy[j], copy[i]]; return copy;
    });
  }
  function add(type: Block['type']) {
    const base = { id: uid() };
    const block: Block =
      type === 'text'      ? { ...base, type, content: 'Novo texto' }
    : type === 'image'     ? { ...base, type, url: '' }
    : type === 'separator' ? { ...base, type, divider: true }
    :                        { ...base, type: 'buttons', buttons: [newButton()] };
    setBlocks(bs => [...bs, block]);
  }
  function patchBtn(blockId: string, idx: number, p: Partial<BuilderButton>) {
    setBlocks(bs => bs.map(b => b.id === blockId && b.type === 'buttons'
      ? { ...b, buttons: b.buttons.map((btn, j) => j === idx ? { ...btn, ...p } : btn) } : b));
  }

  function mapBtn(btn: BuilderButton) {
    return {
      label: btn.label, emoji: btn.emoji, style: btn.style,
      action: btn.actionType === 'message' ? { type: 'message', content: btn.content, ephemeral: btn.ephemeral }
            : btn.actionType === 'role'    ? { type: 'role', roleId: btn.roleId }
            : { type: 'link', url: btn.url },
    };
  }

  async function send() {
    setStatus('loading'); setMsg(null);
    const payload = {
      channelId, accentColor: accent,
      blocks: blocks.map(b => {
        if (b.type === 'buttons') return { type: 'buttons', buttons: b.buttons.map(mapBtn) };
        if (b.type === 'text') {
          const accessory =
            b.accKind === 'image' && b.accUrl?.trim() ? { kind: 'image', url: b.accUrl.trim() }
            : b.accKind === 'button' && b.accBtn ? { kind: 'button', button: mapBtn(b.accBtn) }
            : undefined;
          return { type: 'text', content: b.content, ...(accessory ? { accessory } : {}) };
        }
        return b;
      }),
    };
    try {
      const res = await fetch(`/api/guilds/${guildId}/message-builder/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { setStatus('ok'); setTimeout(() => setStatus('idle'), 3000); }
      else { setStatus('err'); setMsg(data.error ?? 'Erro ao enviar.'); }
    } catch { setStatus('err'); setMsg('Erro de ligação.'); }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
        <span style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(109,184,62,.14)', border: '1px solid rgba(109,184,62,.3)', color: 'var(--green)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </span>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.02em' }}>Construtor de Mensagens</h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>Adiciona blocos na ordem que quiseres — texto, imagem, separador e botões.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }} className="mb-grid">
        {/* ── Editor ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Cor + canal */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '14px 16px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12, alignItems: 'end' }}>
            <div>
              <label style={lbl}>Cor</label>
              <input type="color" value={accent} onChange={e => setAccent(e.target.value)} style={{ width: 40, height: 34, borderRadius: 8, border: '1px solid var(--line)', background: 'none', cursor: 'pointer', padding: 2 }} />
            </div>
            <div>
              <label style={lbl}>Canal de destino</label>
              <select style={input} value={channelId} onChange={e => setChannelId(e.target.value)}>
                <option value="">— Escolhe um canal —</option>
                {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Blocos */}
          {blocks.map((b, i) => (
            <div key={b.id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  {b.type === 'text' ? '📝 Texto' : b.type === 'image' ? '🖼️ Imagem' : b.type === 'separator' ? '➖ Separador' : '🔘 Botões'}
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => move(b.id, -1)} disabled={i === 0} style={{ ...ctrl, opacity: i === 0 ? .3 : 1 }}>↑</button>
                  <button onClick={() => move(b.id, 1)} disabled={i === blocks.length - 1} style={{ ...ctrl, opacity: i === blocks.length - 1 ? .3 : 1 }}>↓</button>
                  <button onClick={() => remove(b.id)} style={{ ...ctrl, color: '#f87171', borderColor: 'rgba(248,113,113,.3)' }}>✕</button>
                </div>
              </div>

              {b.type === 'text' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <textarea rows={3} style={{ ...input, resize: 'vertical', lineHeight: 1.6 }} value={b.content}
                    onChange={e => patch(b.id, { content: e.target.value })}
                    placeholder={'## Título\nTexto com **markdown**\n-# rodapé'} />

                  {/* Acessório à direita do texto (Section V2: thumbnail ou botão) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8, alignItems: 'center' }}>
                    <label style={{ ...lbl, marginBottom: 0 }}>À direita</label>
                    <select style={input} value={b.accKind ?? 'none'}
                      onChange={e => patch(b.id, { accKind: e.target.value as AccKind, ...(e.target.value === 'button' && !b.accBtn ? { accBtn: newButton() } : {}) })}>
                      <option value="none">Nada</option>
                      <option value="image">Imagem pequena</option>
                      <option value="button">Botão</option>
                    </select>
                  </div>

                  {b.accKind === 'image' && (
                    <input style={input} value={b.accUrl ?? ''} onChange={e => patch(b.id, { accUrl: e.target.value })}
                      placeholder="https://exemplo.com/imagem.png (aparece à direita do texto)" />
                  )}

                  {b.accKind === 'button' && b.accBtn && (
                    <div style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 10, background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 50px 1fr', gap: 6 }}>
                        <input style={input} value={b.accBtn.label} onChange={e => patch(b.id, { accBtn: { ...b.accBtn!, label: e.target.value } })} placeholder="Texto do botão" />
                        <input style={input} value={b.accBtn.emoji} onChange={e => patch(b.id, { accBtn: { ...b.accBtn!, emoji: e.target.value } })} placeholder=":)" />
                        <select style={input} value={b.accBtn.actionType} onChange={e => patch(b.id, { accBtn: { ...b.accBtn!, actionType: e.target.value as ActionType } })}>
                          <option value="message">Mensagem</option>
                          <option value="role">Cargo</option>
                          <option value="link">Link</option>
                        </select>
                      </div>
                      {b.accBtn.actionType === 'message' && <>
                        <textarea rows={2} style={{ ...input, resize: 'vertical' }} value={b.accBtn.content} onChange={e => patch(b.id, { accBtn: { ...b.accBtn!, content: e.target.value } })} placeholder="Mensagem ao clicar" />
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>
                          <input type="checkbox" checked={b.accBtn.ephemeral} onChange={e => patch(b.id, { accBtn: { ...b.accBtn!, ephemeral: e.target.checked } })} /> Só quem clica vê
                        </label>
                      </>}
                      {b.accBtn.actionType === 'role' && (
                        <select style={input} value={b.accBtn.roleId} onChange={e => patch(b.id, { accBtn: { ...b.accBtn!, roleId: e.target.value } })}>
                          <option value="">— Cargo —</option>
                          {roles.map(r => <option key={r.id} value={r.id}>@{r.name}</option>)}
                        </select>
                      )}
                      {b.accBtn.actionType === 'link' && (
                        <input style={input} value={b.accBtn.url} onChange={e => patch(b.id, { accBtn: { ...b.accBtn!, url: e.target.value } })} placeholder="https://..." />
                      )}
                      {b.accBtn.actionType !== 'link' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          {STYLE_OPTS.map(s => (
                            <button key={s.v} onClick={() => patch(b.id, { accBtn: { ...b.accBtn!, style: s.v } })} title={s.label}
                              style={{ width: 24, height: 24, borderRadius: 6, background: s.bg, cursor: 'pointer', border: b.accBtn!.style === s.v ? '2px solid #fff' : '2px solid transparent' }} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {b.type === 'image' && (
                <input style={input} value={b.url} onChange={e => patch(b.id, { url: e.target.value })} placeholder="https://exemplo.com/imagem.png" />
              )}
              {b.type === 'separator' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-2)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={b.divider} onChange={e => patch(b.id, { divider: e.target.checked })} />
                  Mostrar linha divisória
                </label>
              )}
              {b.type === 'buttons' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {b.buttons.map((btn, j) => (
                    <div key={j} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 10, background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 50px 1fr auto', gap: 6 }}>
                        <input style={input} value={btn.label} onChange={e => patchBtn(b.id, j, { label: e.target.value })} placeholder="Texto" />
                        <input style={input} value={btn.emoji} onChange={e => patchBtn(b.id, j, { emoji: e.target.value })} placeholder="😀" />
                        <select style={input} value={btn.actionType} onChange={e => patchBtn(b.id, j, { actionType: e.target.value as ActionType })}>
                          <option value="message">Mensagem</option>
                          <option value="role">Cargo</option>
                          <option value="link">Link</option>
                        </select>
                        <button onClick={() => patch(b.id, { buttons: b.buttons.filter((_, k) => k !== j) } as Partial<Block>)} style={{ ...ctrl, color: '#f87171', borderColor: 'rgba(248,113,113,.3)' }}>✕</button>
                      </div>
                      {btn.actionType === 'message' && <>
                        <textarea rows={2} style={{ ...input, resize: 'vertical' }} value={btn.content} onChange={e => patchBtn(b.id, j, { content: e.target.value })} placeholder="Mensagem ao clicar" />
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>
                          <input type="checkbox" checked={btn.ephemeral} onChange={e => patchBtn(b.id, j, { ephemeral: e.target.checked })} /> Só quem clica vê
                        </label>
                      </>}
                      {btn.actionType === 'role' && (
                        <select style={input} value={btn.roleId} onChange={e => patchBtn(b.id, j, { roleId: e.target.value })}>
                          <option value="">— Cargo —</option>
                          {roles.map(r => <option key={r.id} value={r.id}>@{r.name}</option>)}
                        </select>
                      )}
                      {btn.actionType === 'link' && (
                        <input style={input} value={btn.url} onChange={e => patchBtn(b.id, j, { url: e.target.value })} placeholder="https://..." />
                      )}
                      {btn.actionType !== 'link' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          {STYLE_OPTS.map(s => (
                            <button key={s.v} onClick={() => patchBtn(b.id, j, { style: s.v })} title={s.label}
                              style={{ width: 24, height: 24, borderRadius: 6, background: s.bg, cursor: 'pointer', border: btn.style === s.v ? '2px solid #fff' : '2px solid transparent' }} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {b.buttons.length < 5 && (
                    <button onClick={() => patch(b.id, { buttons: [...b.buttons, newButton()] } as Partial<Block>)} style={{ ...pill, cursor: 'pointer', alignSelf: 'flex-start' }}>+ Botão nesta linha</button>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Adicionar blocos */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {([['text', '📝 Texto'], ['image', '🖼️ Imagem'], ['separator', '➖ Separador'], ['buttons', '🔘 Botões']] as const).map(([t, l]) => (
              <button key={t} onClick={() => add(t)} style={{ ...pill, cursor: 'pointer', color: 'var(--green)', borderColor: 'rgba(109,184,62,.3)', background: 'rgba(109,184,62,.06)' }}>+ {l}</button>
            ))}
          </div>

          {/* Enviar */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
            <button disabled={!channelId || status === 'loading'} onClick={send} style={{
              padding: '10px 24px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap',
              cursor: !channelId || status === 'loading' ? 'not-allowed' : 'pointer', opacity: !channelId ? .5 : 1,
              background: status === 'ok' ? 'rgba(109,184,62,.15)' : status === 'err' ? 'rgba(248,113,113,.15)' : 'var(--green)',
              color: status === 'ok' ? 'var(--green)' : status === 'err' ? '#f87171' : '#fff',
            }}>
              {status === 'loading' ? 'A enviar...' : status === 'ok' ? 'Enviado! ✓' : status === 'err' ? 'Erro' : 'Enviar mensagem'}
            </button>
            {status === 'err' && msg && <p style={{ fontSize: 12, color: '#f87171' }}>{msg}</p>}
          </div>
        </div>

        {/* ── Preview ── */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Pré-visualização</p>
          <div style={{ background: '#313338', borderRadius: 10, padding: 14, fontFamily: '"gg sans","Noto Sans",sans-serif', position: 'sticky', top: 90 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/laguno.png" alt="Laguno" style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, objectFit: 'cover', border: '1px solid rgba(255,255,255,.08)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 5 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#f2f3f5' }}>Laguno</span>
                  <span style={{ fontSize: 9.5, fontWeight: 700, background: '#5865f2', color: '#fff', padding: '1px 4px', borderRadius: 3 }}>APP</span>
                </div>
                <div style={{ background: '#2b2d31', borderRadius: 8, borderLeft: `4px solid ${accent}`, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {blocks.map(b => {
                      if (b.type === 'text') {
                        if (!b.content.trim()) return null;
                        const texto = <p style={{ fontSize: 13.5, color: '#dbdee1', lineHeight: 1.6, flex: 1, minWidth: 0 }} dangerouslySetInnerHTML={{ __html: md(b.content) }} />;
                        if (b.accKind === 'image' && b.accUrl?.trim()) return (
                          <div key={b.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            {texto}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={b.accUrl} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                          </div>
                        );
                        if (b.accKind === 'button' && b.accBtn) return (
                          <div key={b.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            {texto}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: STYLE_BG[b.accBtn.actionType === 'link' ? 5 : b.accBtn.style], color: '#fff', borderRadius: 4, padding: '6px 14px', fontSize: 13.5, fontWeight: 500, flexShrink: 0 }}>
                              {b.accBtn.emoji && <span>{b.accBtn.emoji}</span>}{b.accBtn.label || 'Botão'}
                              {b.accBtn.actionType === 'link' && <span style={{ opacity: .6, fontSize: 11 }}>↗</span>}
                            </div>
                          </div>
                        );
                        return <div key={b.id}>{texto}</div>;
                      }
                      if (b.type === 'image') return b.url.trim()
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img key={b.id} src={b.url} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 4, display: 'block' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} /> : null;
                      if (b.type === 'separator') return <div key={b.id} style={{ height: b.divider ? 1 : 8, background: b.divider ? 'rgba(255,255,255,.08)' : 'transparent' }} />;
                      if (b.type === 'buttons') return (
                        <div key={b.id} style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {b.buttons.map((btn, j) => (
                            <div key={j} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: STYLE_BG[btn.actionType === 'link' ? 5 : btn.style], color: '#fff', borderRadius: 4, padding: '6px 14px', fontSize: 13.5, fontWeight: 500 }}>
                              {btn.emoji && <span>{btn.emoji}</span>}{btn.label || 'Botão'}
                              {btn.actionType === 'link' && <span style={{ opacity: .6, fontSize: 11 }}>↗</span>}
                            </div>
                          ))}
                        </div>
                      );
                      return null;
                    })}
                    {blocks.length === 0 && <p style={{ fontSize: 12.5, color: '#80848e', fontStyle: 'italic' }}>Adiciona blocos para veres a mensagem.</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 820px) { .mb-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

const pill: React.CSSProperties = { padding: '6px 14px', borderRadius: 20, fontSize: 12.5, fontWeight: 500, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text-2)' };
const ctrl: React.CSSProperties = { width: 26, height: 26, borderRadius: 6, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text-2)', cursor: 'pointer', fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
