'use client';

import { useState } from 'react';

interface Channel { id: string; name: string; }
interface Role    { id: string; name: string; color: number; }

type ActionType = 'message' | 'role' | 'link';
interface BuilderButton {
  label: string;
  emoji: string;
  style: 1 | 2 | 3 | 4;
  actionType: ActionType;
  content: string;    // message
  ephemeral: boolean; // message
  roleId: string;     // role
  url: string;        // link
}

interface Props {
  guildId:  string;
  channels: Channel[];
  roles:    Role[];
}

const input: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8,
  padding: '8px 12px', color: 'var(--text-1)', fontSize: 13.5, width: '100%', outline: 'none',
};

const STYLE_OPTS: { v: 1 | 2 | 3 | 4; label: string; bg: string }[] = [
  { v: 1, label: 'Azul',     bg: '#5865f2' },
  { v: 2, label: 'Cinza',    bg: '#4e5058' },
  { v: 3, label: 'Verde',    bg: '#3ba55d' },
  { v: 4, label: 'Vermelho', bg: '#ed4245' },
];
const STYLE_BG: Record<number, string> = { 1: '#5865f2', 2: '#4e5058', 3: '#3ba55d', 4: '#ed4245', 5: '#4e5058' };

function md(text: string): string {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,.1);padding:1px 5px;border-radius:3px;font-size:12px">$1</code>')
    .replace(/\n/g, '<br/>');
}

const newButton = (): BuilderButton => ({
  label: 'Botão', emoji: '', style: 2, actionType: 'message',
  content: 'Olá! 👋', ephemeral: true, roleId: '', url: 'https://',
});

export function MessageBuilderTab({ guildId, channels, roles }: Props) {
  const [channelId, setChannelId] = useState('');
  const [accent, setAccent]       = useState('#6db83e');
  const [banner, setBanner]       = useState('');
  const [title, setTitle]         = useState('Anúncio');
  const [desc, setDesc]           = useState('Escreve aqui a tua mensagem. Aceita **markdown**.');
  const [footer, setFooter]       = useState('');
  const [buttons, setButtons]     = useState<BuilderButton[]>([newButton()]);
  const [status, setStatus]       = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [msg, setMsg]             = useState<string | null>(null);

  function patchBtn(i: number, patch: Partial<BuilderButton>) {
    setButtons(bs => bs.map((b, j) => j === i ? { ...b, ...patch } : b));
  }

  async function send() {
    setStatus('loading'); setMsg(null);
    const payload = {
      channelId, accentColor: accent, banner, title, description: desc, footer,
      buttons: buttons.map(b => ({
        label: b.label, emoji: b.emoji, style: b.style,
        action: b.actionType === 'message' ? { type: 'message', content: b.content, ephemeral: b.ephemeral }
              : b.actionType === 'role'    ? { type: 'role', roleId: b.roleId }
              : { type: 'link', url: b.url },
      })).filter(b => b.label.trim() && (b.action.type !== 'role' || b.action.roleId) && (b.action.type !== 'link' || b.action.url)),
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
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(109,184,62,.14)', border: '1px solid rgba(109,184,62,.3)', color: 'var(--green)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </span>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.02em' }}>Construtor de Mensagens</h2>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>Cria uma mensagem com botões interativos e envia para um canal.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }} className="mb-grid">
        {/* ── Editor ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Conteúdo</p>
            <div>
              <label style={lbl}>Título</label>
              <input style={input} value={title} onChange={e => setTitle(e.target.value)} placeholder="Anúncio" />
            </div>
            <div>
              <label style={lbl}>Texto <span style={{ opacity: .6 }}>(markdown)</span></label>
              <textarea rows={4} style={{ ...input, resize: 'vertical', lineHeight: 1.6 }} value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 10, alignItems: 'end' }}>
              <div>
                <label style={lbl}>Cor</label>
                <input type="color" value={accent} onChange={e => setAccent(e.target.value)} style={{ width: 40, height: 34, borderRadius: 8, border: '1px solid var(--line)', background: 'none', cursor: 'pointer', padding: 2 }} />
              </div>
              <div>
                <label style={lbl}>Banner <span style={{ opacity: .6 }}>(URL, opcional)</span></label>
                <input style={input} value={banner} onChange={e => setBanner(e.target.value)} placeholder="https://exemplo.com/banner.png" />
              </div>
            </div>
            <div>
              <label style={lbl}>Rodapé <span style={{ opacity: .6 }}>(opcional)</span></label>
              <input style={input} value={footer} onChange={e => setFooter(e.target.value)} placeholder="Laguno · lagunoapp.xyz" />
            </div>
          </div>

          {/* Botões */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Botões ({buttons.length}/25)</p>
              {buttons.length < 25 && (
                <button onClick={() => setButtons(b => [...b, newButton()])} style={{ ...pill, cursor: 'pointer' }}>+ Adicionar botão</button>
              )}
            </div>
            {buttons.map((b, i) => (
              <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--surface)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 60px 1fr auto', gap: 8 }}>
                  <input style={input} value={b.label} onChange={e => patchBtn(i, { label: e.target.value })} placeholder="Texto do botão" />
                  <input style={input} value={b.emoji} onChange={e => patchBtn(i, { emoji: e.target.value })} placeholder="😀" />
                  <select style={input} value={b.actionType} onChange={e => patchBtn(i, { actionType: e.target.value as ActionType })}>
                    <option value="message">Envia mensagem</option>
                    <option value="role">Dá/tira cargo</option>
                    <option value="link">Abre link</option>
                  </select>
                  <button onClick={() => setButtons(bs => bs.filter((_, j) => j !== i))} style={{ ...pill, color: '#f87171', borderColor: 'rgba(248,113,113,.3)', cursor: 'pointer' }}>Remover</button>
                </div>

                {/* Config por tipo */}
                {b.actionType === 'message' && (
                  <>
                    <textarea rows={2} style={{ ...input, resize: 'vertical' }} value={b.content} onChange={e => patchBtn(i, { content: e.target.value })} placeholder="Mensagem enviada ao clicar (markdown)" />
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-2)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={b.ephemeral} onChange={e => patchBtn(i, { ephemeral: e.target.checked })} />
                      Só quem clica vê (privado)
                    </label>
                  </>
                )}
                {b.actionType === 'role' && (
                  <select style={input} value={b.roleId} onChange={e => patchBtn(i, { roleId: e.target.value })}>
                    <option value="">— Escolhe o cargo —</option>
                    {roles.map(r => <option key={r.id} value={r.id}>@{r.name}</option>)}
                  </select>
                )}
                {b.actionType === 'link' && (
                  <input style={input} value={b.url} onChange={e => patchBtn(i, { url: e.target.value })} placeholder="https://..." />
                )}

                {b.actionType !== 'link' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    {STYLE_OPTS.map(s => (
                      <button key={s.v} onClick={() => patchBtn(i, { style: s.v })} title={s.label}
                        style={{ width: 26, height: 26, borderRadius: 6, background: s.bg, cursor: 'pointer', border: b.style === s.v ? '2px solid #fff' : '2px solid transparent' }} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Enviar */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <select style={{ ...input, flex: 1 }} value={channelId} onChange={e => setChannelId(e.target.value)}>
              <option value="">— Canal de destino —</option>
              {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
            </select>
            <button disabled={!channelId || status === 'loading'} onClick={send} style={{
              padding: '9px 22px', borderRadius: 8, border: 'none', fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap',
              cursor: !channelId || status === 'loading' ? 'not-allowed' : 'pointer', opacity: !channelId ? .5 : 1,
              background: status === 'ok' ? 'rgba(109,184,62,.15)' : status === 'err' ? 'rgba(248,113,113,.15)' : 'var(--green)',
              color: status === 'ok' ? 'var(--green)' : status === 'err' ? '#f87171' : '#fff',
            }}>
              {status === 'loading' ? 'A enviar...' : status === 'ok' ? 'Enviado! ✓' : status === 'err' ? 'Erro' : 'Enviar'}
            </button>
          </div>
          {status === 'err' && msg && <p style={{ fontSize: 12, color: '#f87171' }}>{msg}</p>}
        </div>

        {/* ── Preview ── */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Pré-visualização</p>
          <div style={{ background: '#313338', borderRadius: 10, padding: 14, fontFamily: '"gg sans","Noto Sans",sans-serif', position: 'sticky', top: 90 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#6db83e,#4a8a25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff' }}>L</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 5 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#f2f3f5' }}>Laguno</span>
                  <span style={{ fontSize: 9.5, fontWeight: 700, background: '#5865f2', color: '#fff', padding: '1px 4px', borderRadius: 3 }}>APP</span>
                </div>
                <div style={{ background: '#2b2d31', borderRadius: 8, borderLeft: `4px solid ${accent}`, overflow: 'hidden' }}>
                  {banner.trim() && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={banner} alt="" style={{ width: '100%', maxHeight: 130, objectFit: 'cover', display: 'block' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  )}
                  <div style={{ padding: '12px 14px' }}>
                    {title.trim() && <p style={{ fontSize: 16, fontWeight: 700, color: '#f2f3f5', marginBottom: 5 }} dangerouslySetInnerHTML={{ __html: md(title) }} />}
                    {desc.trim() && <p style={{ fontSize: 13.5, color: '#dbdee1', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: md(desc) }} />}
                    {footer.trim() && <>
                      <div style={{ height: 1, background: 'rgba(255,255,255,.08)', margin: '10px 0 8px' }} />
                      <p style={{ fontSize: 11, color: '#80848e' }} dangerouslySetInnerHTML={{ __html: md(footer) }} />
                    </>}
                    {/* Botões DENTRO do container */}
                    {buttons.length > 0 && <>
                      <div style={{ height: 1, background: 'rgba(255,255,255,.08)', margin: '12px 0 10px' }} />
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {buttons.map((b, i) => (
                          <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: STYLE_BG[b.actionType === 'link' ? 5 : b.style], color: '#fff', borderRadius: 4, padding: '6px 14px', fontSize: 13.5, fontWeight: 500 }}>
                            {b.emoji && <span>{b.emoji}</span>}
                            {b.label || 'Botão'}
                            {b.actionType === 'link' && <span style={{ opacity: .6, fontSize: 11 }}>↗</span>}
                          </div>
                        ))}
                      </div>
                    </>}
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

const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.04em', display: 'block', marginBottom: 6 };
const pill: React.CSSProperties = { padding: '5px 12px', borderRadius: 20, fontSize: 12, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text-2)' };
