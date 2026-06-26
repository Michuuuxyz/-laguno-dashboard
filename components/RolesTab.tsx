'use client';

import { useState } from 'react';

interface Role    { id: string; name: string; color: number; }
interface RoleEntry { roleId: string; label: string; emoji: string; }
interface RolePanel { id: string; title: string; description: string; roles: RoleEntry[]; }

interface Props {
  autoroles:  string[];
  rolePanels: RolePanel[];
  roles:      Role[];
  onChange:   (key: 'autoroles' | 'rolePanels', val: unknown) => void;
}

const field: React.CSSProperties = {
  background: 'var(--bg)', border: '1px solid var(--line)',
  borderRadius: 8, padding: '8px 12px', color: 'var(--text-1)',
  fontSize: 14, width: '100%', outline: 'none',
};

function hexColor(color: number) {
  return color ? `#${color.toString(16).padStart(6, '0')}` : 'var(--text-3)';
}

function generateId() {
  return Math.random().toString(36).slice(2, 8);
}

export function RolesTab({ autoroles, rolePanels, roles, onChange }: Props) {
  const [editingPanel, setEditingPanel] = useState<RolePanel | null>(null);
  const [newEntry, setNewEntry] = useState<RoleEntry>({ roleId: '', label: '', emoji: '' });

  const assignableRoles = roles.filter(r => r.name !== '@everyone');

  function toggleAutoRole(id: string) {
    onChange('autoroles', autoroles.includes(id) ? autoroles.filter(x => x !== id) : [...autoroles, id]);
  }

  function savePanel() {
    if (!editingPanel) return;
    const exists = rolePanels.find(p => p.id === editingPanel.id);
    onChange('rolePanels', exists
      ? rolePanels.map(p => p.id === editingPanel.id ? editingPanel : p)
      : [...rolePanels, editingPanel]
    );
    setEditingPanel(null);
  }

  function deletePanel(id: string) {
    onChange('rolePanels', rolePanels.filter(p => p.id !== id));
  }

  function addRoleToPanel() {
    if (!editingPanel || !newEntry.roleId || !newEntry.label) return;
    const role = roles.find(r => r.id === newEntry.roleId);
    setEditingPanel({ ...editingPanel, roles: [...editingPanel.roles, { ...newEntry, label: newEntry.label || role?.name || '' }] });
    setNewEntry({ roleId: '', label: '', emoji: '' });
  }

  return (
    <div>
      {/* Auto-roles */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px 24px', marginBottom: 14 }}>
        <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-1)', marginBottom: 6 }}>Auto-Roles</p>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>
          Cargos atribuídos automaticamente quando um membro entra no servidor.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {assignableRoles.map(r => (
            <button key={r.id} onClick={() => toggleAutoRole(r.id)} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
              background: autoroles.includes(r.id) ? hexColor(r.color) + '22' : 'var(--bg)',
              color: autoroles.includes(r.id) ? hexColor(r.color) : 'var(--text-3)',
              border: `1px solid ${autoroles.includes(r.id) ? hexColor(r.color) : 'var(--line)'}`,
              transition: 'all 0.15s',
            }}>
              {autoroles.includes(r.id) ? '● ' : '○ '}{r.name}
            </button>
          ))}
          {assignableRoles.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Nenhum cargo disponível.</p>}
        </div>
      </div>

      {/* Painéis de Self-Assign */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-1)' }}>Painéis de Self-Assign</p>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>
              Cria painéis com botões para os membros escolherem os seus cargos. Usa <code style={{ color: 'var(--green)' }}>/roles panel [id]</code> para enviar.
            </p>
          </div>
          <button className="btn-primary" onClick={() => setEditingPanel({ id: generateId(), title: '', description: '', roles: [] })}>
            + Novo Painel
          </button>
        </div>

        {/* Lista de painéis */}
        {rolePanels.length === 0 && !editingPanel && (
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Nenhum painel criado.</p>
        )}

        {rolePanels.map(panel => (
          <div key={panel.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>{panel.title}</p>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                ID: <code style={{ color: 'var(--green)' }}>{panel.id}</code> — {panel.roles.length} cargo(s)
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditingPanel({ ...panel })} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 6, color: 'var(--text-3)', cursor: 'pointer', padding: '4px 12px', fontSize: 12 }}>Editar</button>
              <button onClick={() => deletePanel(panel.id)} style={{ background: 'none', border: '1px solid #ef444444', borderRadius: 6, color: '#ef4444', cursor: 'pointer', padding: '4px 12px', fontSize: 12 }}>Remover</button>
            </div>
          </div>
        ))}

        {/* Editor de painel */}
        {editingPanel && (
          <div style={{ marginTop: 20, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 10, padding: '18px 20px' }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--green)', marginBottom: 14 }}>
              {rolePanels.find(p => p.id === editingPanel.id) ? 'Editar' : 'Novo'} Painel
              <code style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-3)' }}>id: {editingPanel.id}</code>
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 5 }}>Título</label>
                <input style={field} placeholder="Escolhe os teus cargos" value={editingPanel.title}
                  onChange={e => setEditingPanel({ ...editingPanel, title: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 5 }}>Descrição (opcional)</label>
                <input style={field} placeholder="Clica para receber um cargo" value={editingPanel.description}
                  onChange={e => setEditingPanel({ ...editingPanel, description: e.target.value })} />
              </div>
            </div>

            {/* Adicionar role ao painel */}
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>Adicionar cargo ao painel</p>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: 8, marginBottom: 14 }}>
              <select style={field} value={newEntry.roleId} onChange={e => {
                const role = roles.find(r => r.id === e.target.value);
                setNewEntry(n => ({ ...n, roleId: e.target.value, label: n.label || role?.name || '' }));
              }}>
                <option value="">— Seleciona cargo —</option>
                {assignableRoles.filter(r => !editingPanel.roles.find(x => x.roleId === r.id)).map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <input style={field} placeholder="Label do botão" value={newEntry.label}
                onChange={e => setNewEntry(n => ({ ...n, label: e.target.value }))} />
              <input style={field} placeholder="Emoji" value={newEntry.emoji}
                onChange={e => setNewEntry(n => ({ ...n, emoji: e.target.value }))} />
              <button className="btn-primary" onClick={addRoleToPanel}>+</button>
            </div>

            {/* Roles no painel */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {editingPanel.roles.map(r => {
                const role = roles.find(x => x.id === r.roleId);
                return (
                  <span key={r.roleId} style={{
                    background: 'var(--card)', border: '1px solid var(--line)',
                    borderRadius: 20, padding: '5px 12px', fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: 6,
                    color: role ? hexColor(role.color) : 'var(--text-3)',
                  }}>
                    {r.emoji && <span>{r.emoji}</span>}
                    {r.label}
                    <button onClick={() => setEditingPanel({ ...editingPanel, roles: editingPanel.roles.filter(x => x.roleId !== r.roleId) })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 13, padding: 0 }}>✕</button>
                  </span>
                );
              })}
              {editingPanel.roles.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Nenhum cargo adicionado.</p>}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-primary" onClick={savePanel}>Guardar Painel</button>
              <button onClick={() => setEditingPanel(null)} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 8, padding: '7px 16px', color: 'var(--text-3)', cursor: 'pointer', fontSize: 14 }}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
