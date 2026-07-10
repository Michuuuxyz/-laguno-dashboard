'use client';

import { useState } from 'react';
import { input as field } from './ui';

interface Channel { id: string; name: string; }
interface Role { id: string; name: string; color: number; }
interface RoleEntry { roleId: string; label: string; emoji: string; }
interface RolePanel { id: string; title: string; description: string; style?: 'buttons' | 'menu'; roles: RoleEntry[]; accentColor?: string; bannerUrl?: string; }

interface Props {
  rolePanels: RolePanel[];
  roles: Role[];
  channels: Channel[];
  guildId: string;
  onChange: (key: 'rolePanels', val: RolePanel[]) => void;
}

const lblCss: React.CSSProperties = { fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.04em', display: 'block', marginBottom: 6 };

function hexColor(color: number) {
  return color ? `#${color.toString(16).padStart(6, '0')}` : 'var(--text-3)';
}
function generateId() {
  return Math.random().toString(36).slice(2, 8);
}

function PanelPreview({ panel }: { panel: RolePanel }) {
  const hasRoles = panel.roles.length > 0;
  return (
    <div style={{ background: '#2b2d31', borderRadius: 12, padding: '1px', border: '1px solid #3f4147', overflow: 'hidden', borderLeft: panel.accentColor ? `4px solid ${panel.accentColor}` : '1px solid #3f4147' }}>
      {panel.bannerUrl?.trim() ? (
         
        <img src={panel.bannerUrl} alt="" style={{ width: '100%', maxHeight: 120, objectFit: 'cover', display: 'block' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
      ) : null}
      <div style={{ background: '#232428', borderRadius: 11, padding: '16px 18px' }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#f2f3f5', marginBottom: panel.description ? 4 : 0, lineHeight: 1.3 }}>
          {panel.title || <span style={{ color: '#5c5f66' }}>Sem título</span>}
        </p>
        {panel.description && <p style={{ fontSize: 13.5, color: '#b5bac1', marginBottom: 4, lineHeight: 1.5 }}>{panel.description}</p>}
        <p style={{ fontSize: 11, color: '#5c5f66', marginTop: 4 }}>
          {panel.style === 'menu' ? 'Usa o menu para escolher os teus cargos.' : 'Clica num botão para receber ou remover o cargo.'}
        </p>
        <div style={{ borderTop: '1px solid #3f4147', margin: '12px 0' }} />
        {hasRoles ? (
          panel.style === 'menu' ? (
            <div style={{ background: '#1e1f22', border: '1px solid #3f4147', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13.5, color: '#949ba4', userSelect: 'none' }}>
              <span>Escolhe os teus cargos ({Math.min(panel.roles.length, 25)} opções)</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {panel.roles.map(r => (
                <div key={r.roleId} style={{ background: '#4e5058', color: '#f2f3f5', borderRadius: 4, padding: '6px 16px', fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6, userSelect: 'none' }}>
                  {r.emoji && <span>{r.emoji}</span>}{r.label}
                </div>
              ))}
            </div>
          )
        ) : (
          <p style={{ fontSize: 12.5, color: '#5c5f66' }}>Nenhum cargo adicionado ainda.</p>
        )}
      </div>
    </div>
  );
}

function SendPanel({ panelId, channels, guildId }: { panelId: string; channels: Channel[]; guildId: string }) {
  const [channelId, setChannelId] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function send() {
    if (!channelId) return;
    setStatus('loading'); setErrMsg(null);
    try {
      const res = await fetch(`/api/guilds/${guildId}/roles/panel/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panelId, channelId }),
      });
      const data = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) { setStatus('err'); setErrMsg(data.error ?? 'Erro desconhecido'); return; }
      setStatus('ok'); setTimeout(() => setStatus('idle'), 4000);
    } catch { setStatus('err'); setErrMsg('Erro de ligação.'); }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <select style={{ ...field, width: 'auto', flex: 1, minWidth: 160, fontSize: 12.5, padding: '5px 10px' }} value={channelId} onChange={e => { setChannelId(e.target.value); setStatus('idle'); }}>
        <option value="">Escolher canal...</option>
        {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
      </select>
      <button disabled={!channelId || status === 'loading'} onClick={send} style={{
        padding: '5px 16px', borderRadius: 7, border: 'none', fontSize: 12.5, fontWeight: 600, cursor: !channelId || status === 'loading' ? 'not-allowed' : 'pointer',
        background: status === 'ok' ? 'rgba(109,184,62,.15)' : status === 'err' ? 'rgba(248,113,113,.15)' : 'var(--green)',
        color: status === 'ok' ? 'var(--green)' : status === 'err' ? '#f87171' : '#fff', transition: 'all .2s', whiteSpace: 'nowrap',
      }}>
        {status === 'loading' ? 'A enviar...' : status === 'ok' ? 'Enviado!' : status === 'err' ? 'Erro' : 'Enviar'}
      </button>
      {status === 'err' && errMsg && <p style={{ fontSize: 11.5, color: '#f87171', width: '100%', marginTop: 2 }}>{errMsg}</p>}
    </div>
  );
}

export function ReactionRolesTab({ rolePanels, roles, channels, guildId, onChange }: Props) {
  const [editingPanel, setEditingPanel] = useState<RolePanel | null>(null);
  const [newEntry, setNewEntry] = useState<RoleEntry>({ roleId: '', label: '', emoji: '' });
  const [openSend, setOpenSend] = useState<string | null>(null);

  const assignableRoles = roles.filter(r => r.name !== '@everyone');

  async function persist(newPanels: RolePanel[]) {
    onChange('rolePanels', newPanels);
    await fetch(`/api/guilds/${guildId}/config`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rolePanels: newPanels }),
    }).catch(() => null);
  }

  async function savePanel() {
    if (!editingPanel) return;
    const exists = rolePanels.find(p => p.id === editingPanel.id);
    const newPanels = exists ? rolePanels.map(p => p.id === editingPanel.id ? editingPanel : p) : [...rolePanels, editingPanel];
    setEditingPanel(null);
    await persist(newPanels);
  }
  async function deletePanel(id: string) {
    if (!confirm('Remover este painel?')) return;
    await persist(rolePanels.filter(p => p.id !== id));
  }
  function addRoleToPanel() {
    if (!editingPanel || !newEntry.roleId || !newEntry.label) return;
    setEditingPanel({ ...editingPanel, roles: [...editingPanel.roles, { ...newEntry }] });
    setNewEntry({ roleId: '', label: '', emoji: '' });
  }

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: rolePanels.length > 0 || editingPanel ? 16 : 0 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600 }}>Painéis de cargos</p>
          <p style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 3, lineHeight: 1.5 }}>
            Mensagens com botões (ou um menu) para os membros escolherem os seus próprios cargos. Envia o painel para um canal e está pronto.
          </p>
        </div>
        <button className="btn btn-primary" style={{ flexShrink: 0 }}
          onClick={() => { setEditingPanel({ id: generateId(), title: '', description: '', style: 'buttons', roles: [] }); setOpenSend(null); }}>
          + Novo Painel
        </button>
      </div>

      {rolePanels.length === 0 && !editingPanel && (
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 12 }}>Nenhum painel criado ainda.</p>
      )}

      {rolePanels.map((panel, i) => (
        <div key={panel.id} style={{ borderTop: i === 0 ? '1px solid var(--line)' : 'none', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13.5, fontWeight: 600 }}>{panel.title || <span style={{ color: 'var(--text-3)' }}>Sem título</span>}</p>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                {panel.roles.length} cargo(s) · {panel.style === 'menu' ? 'menu dropdown' : 'botões'} — ID: <code style={{ color: 'var(--green)', fontSize: 11 }}>{panel.id}</code>
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button onClick={() => setOpenSend(openSend === panel.id ? null : panel.id)} style={{ background: openSend === panel.id ? 'rgba(109,184,62,.12)' : 'var(--surface)', border: `1px solid ${openSend === panel.id ? 'rgba(109,184,62,.3)' : 'var(--line)'}`, borderRadius: 7, color: openSend === panel.id ? 'var(--green)' : 'var(--text-2)', cursor: 'pointer', padding: '5px 14px', fontSize: 12, fontWeight: 600 }}>Enviar</button>
              <button onClick={() => { setEditingPanel({ ...panel }); setOpenSend(null); }} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 7, color: 'var(--text-2)', cursor: 'pointer', padding: '5px 14px', fontSize: 12 }}>Editar</button>
              <button onClick={() => deletePanel(panel.id)} style={{ background: 'none', border: '1px solid rgba(248,113,113,.25)', borderRadius: 7, color: '#f87171', cursor: 'pointer', padding: '5px 14px', fontSize: 12 }}>Remover</button>
            </div>
          </div>
          {openSend === panel.id && (
            <div style={{ paddingBottom: 14 }}><SendPanel panelId={panel.id} channels={channels} guildId={guildId} /></div>
          )}
        </div>
      ))}

      {editingPanel && (
        <div style={{ marginTop: rolePanels.length > 0 ? 20 : 0, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px 22px' }}>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--green)', marginBottom: 16 }}>
            {rolePanels.find(p => p.id === editingPanel.id) ? 'Editar Painel' : 'Novo Painel'}
            <code style={{ marginLeft: 10, fontSize: 11, color: 'var(--text-3)', fontWeight: 400 }}>{editingPanel.id}</code>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={lblCss}>Título</label>
                <input style={field} placeholder="Escolhe os teus cargos" value={editingPanel.title} onChange={e => setEditingPanel({ ...editingPanel, title: e.target.value })} />
              </div>
              <div>
                <label style={lblCss}>Descrição <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></label>
                <input style={field} placeholder="Clica num botão para receber um cargo" value={editingPanel.description} onChange={e => setEditingPanel({ ...editingPanel, description: e.target.value })} />
              </div>
              <div>
                <label style={lblCss}>Estilo do painel</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {([['buttons', 'Botões'], ['menu', 'Menu dropdown']] as const).map(([v, l]) => {
                    const ativo = (editingPanel.style ?? 'buttons') === v;
                    return (
                      <button key={v} onClick={() => setEditingPanel({ ...editingPanel, style: v })} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', background: ativo ? 'rgba(109,184,62,.12)' : 'var(--card)', border: `1px solid ${ativo ? 'rgba(109,184,62,.35)' : 'var(--line)'}`, color: ativo ? 'var(--green)' : 'var(--text-2)', transition: 'all .15s' }}>{l}</button>
                    );
                  })}
                </div>
                {(editingPanel.style ?? 'buttons') === 'menu' && (
                  <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 6, lineHeight: 1.5 }}>
                    Menu de seleção múltipla (máx. 25 cargos) — o membro marca os cargos que quer e o bot sincroniza: adiciona os marcados e remove os desmarcados.
                  </p>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8, alignItems: 'end' }}>
                <div>
                  <label style={lblCss}>Cor</label>
                  <input type="color" value={editingPanel.accentColor || '#6db83e'} onChange={e => setEditingPanel({ ...editingPanel, accentColor: e.target.value })} style={{ width: 38, height: 34, borderRadius: 8, border: '1px solid var(--line)', background: 'none', cursor: 'pointer', padding: 2 }} />
                </div>
                <div>
                  <label style={lblCss}>Banner <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(URL de imagem, opcional)</span></label>
                  <input style={field} placeholder="https://exemplo.com/banner.png" value={editingPanel.bannerUrl ?? ''} onChange={e => setEditingPanel({ ...editingPanel, bannerUrl: e.target.value })} />
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                <label style={lblCss}>Adicionar cargo</label>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: 6, marginBottom: 6 }}>
                  <select style={field} value={newEntry.roleId} onChange={e => { const role = roles.find(r => r.id === e.target.value); setNewEntry(n => ({ ...n, roleId: e.target.value, label: n.label || role?.name || '' })); }}>
                    <option value="">— Cargo —</option>
                    {assignableRoles.filter(r => !editingPanel.roles.find(x => x.roleId === r.id)).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                  <input style={field} placeholder="Label do botão" value={newEntry.label} onChange={e => setNewEntry(n => ({ ...n, label: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addRoleToPanel()} />
                  <input style={field} placeholder="Emoji" value={newEntry.emoji} onChange={e => setNewEntry(n => ({ ...n, emoji: e.target.value }))} />
                </div>
                <button className="btn btn-secondary" onClick={addRoleToPanel} style={{ width: '100%', fontSize: 12.5 }}>+ Adicionar ao painel</button>
              </div>
              {editingPanel.roles.length > 0 && (
                <div>
                  <label style={lblCss}>Cargos no painel</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {editingPanel.roles.map(r => {
                      const role = roles.find(x => x.id === r.roleId);
                      return (
                        <span key={r.roleId} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 20, padding: '4px 10px 4px 12px', fontSize: 12.5, color: role ? hexColor(role.color) : 'var(--text-2)' }}>
                          {r.emoji && <span>{r.emoji}</span>}{r.label}
                          <button onClick={() => setEditingPanel({ ...editingPanel, roles: editingPanel.roles.filter(x => x.roleId !== r.roleId) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 0, lineHeight: 0, display: 'flex' }}>
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                <button className="btn btn-primary" onClick={savePanel}>Guardar Painel</button>
                <button onClick={() => setEditingPanel(null)} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 8, padding: '7px 16px', color: 'var(--text-3)', cursor: 'pointer', fontSize: 13.5 }}>Cancelar</button>
              </div>
            </div>

            <div>
              <label style={lblCss}>Preview — como fica no Discord</label>
              <PanelPreview panel={editingPanel} />
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8, lineHeight: 1.5 }}>
                Os botões são interativos no Discord. O bot trata de dar/tirar o cargo quando o membro clica.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
