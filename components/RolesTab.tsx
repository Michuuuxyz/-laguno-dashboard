'use client';

import { useState } from 'react';

interface Channel  { id: string; name: string; }
interface Role     { id: string; name: string; color: number; }
interface RoleEntry { roleId: string; label: string; emoji: string; }
interface RolePanel { id: string; title: string; description: string; roles: RoleEntry[]; }

interface Props {
  autoroles:  string[];
  rolePanels: RolePanel[];
  roles:      Role[];
  channels:   Channel[];
  guildId:    string;
  onChange:   (key: 'autoroles' | 'rolePanels', val: unknown) => void;
}

const field: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--line)',
  borderRadius: 8, padding: '8px 12px', color: 'var(--text-1)',
  fontSize: 13.5, width: '100%', outline: 'none',
};

function hexColor(color: number) {
  return color ? `#${color.toString(16).padStart(6, '0')}` : 'var(--text-3)';
}

function generateId() {
  return Math.random().toString(36).slice(2, 8);
}

/* ── Preview do painel — imita o Components V2 container do Discord ── */
function PanelPreview({ panel }: { panel: RolePanel }) {
  const hasRoles = panel.roles.length > 0;
  return (
    <div style={{
      background: '#2b2d31', borderRadius: 12, padding: '1px',
      border: '1px solid #3f4147', overflow: 'hidden',
    }}>
      {/* Container card */}
      <div style={{ background: '#232428', borderRadius: 11, padding: '16px 18px' }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#f2f3f5', marginBottom: panel.description ? 4 : 0, lineHeight: 1.3 }}>
          {panel.title || <span style={{ color: '#5c5f66' }}>Sem título</span>}
        </p>
        {panel.description && (
          <p style={{ fontSize: 13.5, color: '#b5bac1', marginBottom: 4, lineHeight: 1.5 }}>{panel.description}</p>
        )}
        <p style={{ fontSize: 11, color: '#5c5f66', marginTop: 4 }}>Clica num botão para receber ou remover o cargo.</p>
        <div style={{ borderTop: '1px solid #3f4147', margin: '12px 0' }} />
        {hasRoles ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {panel.roles.map(r => (
              <div key={r.roleId} style={{
                background: '#4e5058', color: '#f2f3f5',
                borderRadius: 4, padding: '6px 16px',
                fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6,
                userSelect: 'none',
              }}>
                {r.emoji && <span>{r.emoji}</span>}
                {r.label}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 12.5, color: '#5c5f66' }}>Nenhum cargo adicionado ainda.</p>
        )}
      </div>
    </div>
  );
}

/* ── Inline send UI por painel ── */
function SendPanel({ panelId, channels, guildId }: { panelId: string; channels: Channel[]; guildId: string }) {
  const [channelId, setChannelId]   = useState('');
  const [status, setStatus]         = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg]         = useState<string | null>(null);

  async function send() {
    if (!channelId) return;
    setStatus('loading'); setErrMsg(null);
    try {
      const res = await fetch(`/api/guilds/${guildId}/roles/panel/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panelId, channelId }),
      });
      const data = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) { setStatus('err'); setErrMsg(data.error ?? 'Erro desconhecido'); return; }
      setStatus('ok');
      setTimeout(() => setStatus('idle'), 4000);
    } catch (e) {
      setStatus('err');
      setErrMsg('Erro de ligação.');
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <select style={{ ...field, width: 'auto', flex: 1, minWidth: 160, fontSize: 12.5, padding: '5px 10px' }}
        value={channelId} onChange={e => { setChannelId(e.target.value); setStatus('idle'); }}>
        <option value="">Escolher canal...</option>
        {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
      </select>
      <button
        disabled={!channelId || status === 'loading'}
        onClick={send}
        style={{
          padding: '5px 16px', borderRadius: 7, border: 'none', fontSize: 12.5, fontWeight: 600, cursor: !channelId || status === 'loading' ? 'not-allowed' : 'pointer',
          background: status === 'ok' ? 'rgba(109,184,62,.15)' : status === 'err' ? 'rgba(248,113,113,.15)' : 'var(--green)',
          color: status === 'ok' ? 'var(--green)' : status === 'err' ? '#f87171' : '#fff',
          transition: 'all .2s', whiteSpace: 'nowrap',
        }}>
        {status === 'loading' ? 'A enviar...' : status === 'ok' ? 'Enviado!' : status === 'err' ? 'Erro' : 'Enviar'}
      </button>
      {status === 'err' && errMsg && (
        <p style={{ fontSize: 11.5, color: '#f87171', width: '100%', marginTop: 2 }}>{errMsg}</p>
      )}
    </div>
  );
}

export function RolesTab({ autoroles, rolePanels, roles, channels, guildId, onChange }: Props) {
  const [editingPanel, setEditingPanel] = useState<RolePanel | null>(null);
  const [newEntry, setNewEntry]         = useState<RoleEntry>({ roleId: '', label: '', emoji: '' });
  const [openSend, setOpenSend]         = useState<string | null>(null);
  const [roleSearch, setRoleSearch]     = useState('');
  const [savingAR, setSavingAR]         = useState(false);
  const [savedAR, setSavedAR]           = useState(false);

  const assignableRoles = roles.filter(r => r.name !== '@everyone');
  const filteredRoles   = assignableRoles.filter(r => r.name.toLowerCase().includes(roleSearch.toLowerCase()));

  function toggleAutoRole(id: string) {
    onChange('autoroles', autoroles.includes(id) ? autoroles.filter(x => x !== id) : [...autoroles, id]);
  }

  async function saveAutoRoles() {
    setSavingAR(true);
    await fetch(`/api/guilds/${guildId}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autoroles }),
    }).catch(() => null);
    setSavingAR(false); setSavedAR(true);
    setTimeout(() => setSavedAR(false), 2500);
  }

  async function savePanel() {
    if (!editingPanel) return;
    const exists = rolePanels.find(p => p.id === editingPanel.id);
    const newPanels = exists
      ? rolePanels.map(p => p.id === editingPanel.id ? editingPanel : p)
      : [...rolePanels, editingPanel];
    onChange('rolePanels', newPanels);
    setEditingPanel(null);
    // Persiste imediatamente para que o "Enviar" funcione sem passo extra
    await fetch(`/api/guilds/${guildId}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rolePanels: newPanels, autoroles }),
    }).catch(() => null);
  }

  async function deletePanel(id: string) {
    if (!confirm('Remover este painel?')) return;
    const newPanels = rolePanels.filter(p => p.id !== id);
    onChange('rolePanels', newPanels);
    await fetch(`/api/guilds/${guildId}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rolePanels: newPanels, autoroles }),
    }).catch(() => null);
  }

  function addRoleToPanel() {
    if (!editingPanel || !newEntry.roleId || !newEntry.label) return;
    setEditingPanel({ ...editingPanel, roles: [...editingPanel.roles, { ...newEntry }] });
    setNewEntry({ roleId: '', label: '', emoji: '' });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Auto-roles */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '18px 22px 14px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>Auto-Roles</p>
            <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.5 }}>
              Cargos atribuídos automaticamente quando um membro entra no servidor.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {autoroles.length > 0 && (
              <span style={{ fontSize: 11.5, fontWeight: 600, background: 'rgba(109,184,62,.12)', color: 'var(--green)', border: '1px solid rgba(109,184,62,.25)', borderRadius: 20, padding: '2px 10px' }}>
                {autoroles.length} ativo{autoroles.length !== 1 ? 's' : ''}
              </span>
            )}
            <button onClick={saveAutoRoles} disabled={savingAR} style={{
              padding: '6px 16px', borderRadius: 7, border: 'none', fontSize: 12.5, fontWeight: 600,
              cursor: savingAR ? 'wait' : 'pointer',
              background: savedAR ? 'rgba(109,184,62,.15)' : 'var(--green)',
              color: savedAR ? 'var(--green)' : '#fff',
              transition: 'all .2s',
            }}>
              {savingAR ? 'A guardar...' : savedAR ? 'Guardado!' : 'Guardar'}
            </button>
          </div>
        </div>

        {/* Search */}
        {assignableRoles.length > 6 && (
          <div style={{ padding: '0 22px 12px' }}>
            <input
              style={{ ...field, fontSize: 13 }}
              placeholder="Pesquisar cargo..."
              value={roleSearch}
              onChange={e => setRoleSearch(e.target.value)}
            />
          </div>
        )}

        {/* Role list */}
        <div style={{ borderTop: '1px solid var(--line)' }}>
          {filteredRoles.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--text-3)', padding: '18px 22px' }}>
              {assignableRoles.length === 0 ? 'Nenhum cargo disponível.' : 'Nenhum cargo corresponde à pesquisa.'}
            </p>
          )}
          {filteredRoles.map((r, i) => {
            const active = autoroles.includes(r.id);
            const color  = hexColor(r.color);
            return (
              <div key={r.id} onClick={() => toggleAutoRole(r.id)} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '11px 22px',
                borderBottom: i < filteredRoles.length - 1 ? '1px solid var(--line)' : 'none',
                cursor: 'pointer',
                background: active ? `${color}08` : 'transparent',
                transition: 'background .12s',
              }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'var(--surface)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = active ? `${color}08` : 'transparent'; }}
              >
                {/* Color swatch */}
                <div style={{
                  width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                  background: r.color ? color : 'var(--line)',
                  boxShadow: active && r.color ? `0 0 0 3px ${color}30` : 'none',
                  transition: 'box-shadow .15s',
                }} />

                {/* Name */}
                <p style={{
                  flex: 1, fontSize: 13.5, fontWeight: active ? 600 : 400,
                  color: active ? color || 'var(--text-1)' : 'var(--text-2)',
                  transition: 'color .12s',
                }}>
                  @{r.name}
                </p>

                {/* Badge */}
                {active && (
                  <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', background: `${color}18`, color, border: `1px solid ${color}40`, borderRadius: 20, padding: '1px 8px', flexShrink: 0 }}>
                    ATIVO
                  </span>
                )}

                {/* Toggle */}
                <div style={{
                  width: 36, height: 20, borderRadius: 10, flexShrink: 0,
                  background: active ? (r.color ? color : 'var(--green)') : 'var(--elevated)',
                  position: 'relative', transition: 'background .2s',
                }}>
                  <span style={{
                    position: 'absolute', top: 2, left: active ? 18 : 2,
                    width: 16, height: 16, borderRadius: '50%', background: '#fff',
                    transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Painéis */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: rolePanels.length > 0 || editingPanel ? 16 : 0 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600 }}>Painéis de Self-Assign</p>
            <p style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 3, lineHeight: 1.5 }}>
              Cria painéis com botões para os membros escolherem os seus cargos.
            </p>
          </div>
          <button className="btn btn-primary" style={{ flexShrink: 0 }}
            onClick={() => { setEditingPanel({ id: generateId(), title: '', description: '', roles: [] }); setOpenSend(null); }}>
            + Novo Painel
          </button>
        </div>

        {rolePanels.length === 0 && !editingPanel && (
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 12 }}>Nenhum painel criado ainda.</p>
        )}

        {/* Lista de painéis */}
        {rolePanels.map((panel, i) => (
          <div key={panel.id} style={{
            borderTop: i === 0 ? '1px solid var(--line)' : 'none',
            borderBottom: '1px solid var(--line)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13.5, fontWeight: 600 }}>{panel.title || <span style={{ color: 'var(--text-3)' }}>Sem título</span>}</p>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                  {panel.roles.length} cargo(s) — ID: <code style={{ color: 'var(--green)', fontSize: 11 }}>{panel.id}</code>
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => setOpenSend(openSend === panel.id ? null : panel.id)}
                  style={{ background: openSend === panel.id ? 'rgba(109,184,62,.12)' : 'var(--surface)', border: `1px solid ${openSend === panel.id ? 'rgba(109,184,62,.3)' : 'var(--line)'}`, borderRadius: 7, color: openSend === panel.id ? 'var(--green)' : 'var(--text-2)', cursor: 'pointer', padding: '5px 14px', fontSize: 12, fontWeight: 600 }}>
                  Enviar
                </button>
                <button onClick={() => { setEditingPanel({ ...panel }); setOpenSend(null); }}
                  style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 7, color: 'var(--text-2)', cursor: 'pointer', padding: '5px 14px', fontSize: 12 }}>
                  Editar
                </button>
                <button onClick={() => deletePanel(panel.id)}
                  style={{ background: 'none', border: '1px solid rgba(248,113,113,.25)', borderRadius: 7, color: '#f87171', cursor: 'pointer', padding: '5px 14px', fontSize: 12 }}>
                  Remover
                </button>
              </div>
            </div>

            {/* Send UI inline */}
            {openSend === panel.id && (
              <div style={{ paddingBottom: 14 }}>
                <SendPanel panelId={panel.id} channels={channels} guildId={guildId} />
              </div>
            )}
          </div>
        ))}

        {/* Editor */}
        {editingPanel && (
          <div style={{ marginTop: rolePanels.length > 0 ? 20 : 0, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px 22px' }}>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--green)', marginBottom: 16 }}>
              {rolePanels.find(p => p.id === editingPanel.id) ? 'Editar Painel' : 'Novo Painel'}
              <code style={{ marginLeft: 10, fontSize: 11, color: 'var(--text-3)', fontWeight: 400 }}>{editingPanel.id}</code>
            </p>

            {/* Editor + Preview lado a lado */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

              {/* Campos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.04em', display: 'block', marginBottom: 6 }}>Título</label>
                  <input style={field} placeholder="Escolhe os teus cargos" value={editingPanel.title}
                    onChange={e => setEditingPanel({ ...editingPanel, title: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.04em', display: 'block', marginBottom: 6 }}>Descrição <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></label>
                  <input style={field} placeholder="Clica num botão para receber um cargo" value={editingPanel.description}
                    onChange={e => setEditingPanel({ ...editingPanel, description: e.target.value })} />
                </div>

                <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.04em', display: 'block', marginBottom: 8 }}>Adicionar cargo</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: 6, marginBottom: 6 }}>
                    <select style={field} value={newEntry.roleId} onChange={e => {
                      const role = roles.find(r => r.id === e.target.value);
                      setNewEntry(n => ({ ...n, roleId: e.target.value, label: n.label || role?.name || '' }));
                    }}>
                      <option value="">— Cargo —</option>
                      {assignableRoles.filter(r => !editingPanel.roles.find(x => x.roleId === r.id)).map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                    <input style={field} placeholder="Label do botão" value={newEntry.label}
                      onChange={e => setNewEntry(n => ({ ...n, label: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addRoleToPanel()} />
                    <input style={field} placeholder="Emoji" value={newEntry.emoji}
                      onChange={e => setNewEntry(n => ({ ...n, emoji: e.target.value }))} />
                  </div>
                  <button className="btn btn-secondary" onClick={addRoleToPanel} style={{ width: '100%', fontSize: 12.5 }}>+ Adicionar ao painel</button>
                </div>

                {/* Roles no painel */}
                {editingPanel.roles.length > 0 && (
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.04em', display: 'block', marginBottom: 8 }}>Cargos no painel</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {editingPanel.roles.map(r => {
                        const role = roles.find(x => x.id === r.roleId);
                        return (
                          <span key={r.roleId} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'var(--card)', border: '1px solid var(--line)',
                            borderRadius: 20, padding: '4px 10px 4px 12px', fontSize: 12.5,
                            color: role ? hexColor(role.color) : 'var(--text-2)',
                          }}>
                            {r.emoji && <span>{r.emoji}</span>}
                            {r.label}
                            <button onClick={() => setEditingPanel({ ...editingPanel, roles: editingPanel.roles.filter(x => x.roleId !== r.roleId) })}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 0, lineHeight: 0, display: 'flex' }}>
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

              {/* Preview */}
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.04em', display: 'block', marginBottom: 10 }}>Preview — como fica no Discord</label>
                <PanelPreview panel={editingPanel} />
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8, lineHeight: 1.5 }}>
                  Os botões são interativos no Discord. O bot trata de dar/tirar o cargo quando o membro clica.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
