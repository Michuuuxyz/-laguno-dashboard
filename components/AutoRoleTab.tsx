'use client';

import { useState } from 'react';
import { input as field } from './ui';

interface Role { id: string; name: string; color: number; }
interface Props {
  autoroles: string[];
  roles: Role[];
  guildId: string;
  onChange: (key: 'autoroles', val: string[]) => void;
}


function hexColor(color: number) {
  return color ? `#${color.toString(16).padStart(6, '0')}` : 'var(--text-3)';
}

export function AutoRoleTab({ autoroles, roles, guildId, onChange }: Props) {
  const [roleSearch, setRoleSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const assignableRoles = roles.filter(r => r.name !== '@everyone');
  const filteredRoles = assignableRoles.filter(r => r.name.toLowerCase().includes(roleSearch.toLowerCase()));

  function toggle(id: string) {
    onChange('autoroles', autoroles.includes(id) ? autoroles.filter(x => x !== id) : [...autoroles, id]);
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/guilds/${guildId}/config`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autoroles }),
    }).catch(() => null);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '18px 22px 14px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>Cargos automáticos</p>
          <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.5 }}>
            Escolhe os cargos que cada membro recebe assim que entra no servidor. Ideal para dar acesso base ou um cargo de &quot;membro&quot;.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {autoroles.length > 0 && (
            <span style={{ fontSize: 11.5, fontWeight: 600, background: 'rgba(109,184,62,.12)', color: 'var(--green)', border: '1px solid rgba(109,184,62,.25)', borderRadius: 20, padding: '2px 10px' }}>
              {autoroles.length} ativo{autoroles.length !== 1 ? 's' : ''}
            </span>
          )}
          <button onClick={save} disabled={saving} style={{
            padding: '6px 16px', borderRadius: 7, border: 'none', fontSize: 12.5, fontWeight: 600,
            cursor: saving ? 'wait' : 'pointer',
            background: saved ? 'rgba(109,184,62,.15)' : 'var(--green)',
            color: saved ? 'var(--green)' : '#fff', transition: 'all .2s',
          }}>
            {saving ? 'A guardar...' : saved ? 'Guardado!' : 'Guardar'}
          </button>
        </div>
      </div>

      {assignableRoles.length > 6 && (
        <div style={{ padding: '0 22px 12px' }}>
          <input style={{ ...field, fontSize: 13 }} placeholder="Pesquisar cargo..." value={roleSearch} onChange={e => setRoleSearch(e.target.value)} />
        </div>
      )}

      <div style={{ borderTop: '1px solid var(--line)' }}>
        {filteredRoles.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--text-3)', padding: '18px 22px' }}>
            {assignableRoles.length === 0 ? 'Nenhum cargo disponível.' : 'Nenhum cargo corresponde à pesquisa.'}
          </p>
        )}
        {filteredRoles.map((r, i) => {
          const active = autoroles.includes(r.id);
          const color = hexColor(r.color);
          return (
            <div key={r.id} onClick={() => toggle(r.id)} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '11px 22px',
              borderBottom: i < filteredRoles.length - 1 ? '1px solid var(--line)' : 'none',
              cursor: 'pointer', background: active ? `${color}08` : 'transparent', transition: 'background .12s',
            }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'var(--surface)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = active ? `${color}08` : 'transparent'; }}
            >
              <div style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, background: r.color ? color : 'var(--line)', boxShadow: active && r.color ? `0 0 0 3px ${color}30` : 'none', transition: 'box-shadow .15s' }} />
              <p style={{ flex: 1, fontSize: 13.5, fontWeight: active ? 600 : 400, color: active ? color || 'var(--text-1)' : 'var(--text-2)', transition: 'color .12s' }}>@{r.name}</p>
              {active && (
                <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', background: `${color}18`, color, border: `1px solid ${color}40`, borderRadius: 20, padding: '1px 8px', flexShrink: 0 }}>ATIVO</span>
              )}
              <div style={{ width: 36, height: 20, borderRadius: 10, flexShrink: 0, background: active ? (r.color ? color : 'var(--green)') : 'var(--elevated)', position: 'relative', transition: 'background .2s' }}>
                <span style={{ position: 'absolute', top: 2, left: active ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
