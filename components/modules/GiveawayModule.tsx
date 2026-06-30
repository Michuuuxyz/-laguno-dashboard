'use client';

import { useState, useEffect, useCallback } from 'react';

interface Channel  { id: string; name: string; }
interface Role     { id: string; name: string; color: number; }
interface Giveaway {
  _id: string; prize: string; description: string; bannerUrl?: string;
  channelId: string; endAt: string; winnersCount: number;
  entries: string[]; winners: string[]; ended: boolean; status: string;
  accentColor: number; requiredRoleId?: string; joinMessage?: string; winnerMessage?: string;
}

const DURATIONS = [
  { label: '10 minutos', value: 600 },
  { label: '30 minutos', value: 1800 },
  { label: '1 hora',     value: 3600 },
  { label: '6 horas',    value: 21600 },
  { label: '12 horas',   value: 43200 },
  { label: '1 dia',      value: 86400 },
  { label: '3 dias',     value: 259200 },
  { label: '7 dias',     value: 604800 },
];

const DEFAULT_JOIN    = '🎉 Entraste no sorteio de **{prize}**! Boa sorte, {mention}!';
const DEFAULT_WINNER  = '🎉 Parabéns {winners}! Ganhaste **{prize}**!';

function timeLeft(endAt: string) {
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return 'Terminado';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h restantes`;
  if (h > 0) return `${h}h ${m}m restantes`;
  return `${m}m restantes`;
}

const inp: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid var(--line)', background: 'var(--elevated)',
  color: 'var(--text-1)', fontSize: 13.5, outline: 'none', boxSizing: 'border-box',
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)' }}>{label}</span>
        {hint && <span style={{ fontSize: 11, color: 'var(--text-3)', opacity: .6 }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green)', borderBottom: '1px solid rgba(109,184,62,.15)', paddingBottom: 6 }}>{title}</p>
      {children}
    </div>
  );
}

export function GiveawayModule({ guildId }: { guildId: string }) {
  const [channels,       setChannels]       = useState<Channel[]>([]);
  const [roles,          setRoles]          = useState<Role[]>([]);
  const [giveaways,      setGiveaways]      = useState<Giveaway[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [saved,          setSaved]          = useState(false);
  const [rerolling,      setRerolling]      = useState<string | null>(null);
  const [deleting,       setDeleting]       = useState<string | null>(null);
  const [view,           setView]           = useState<'create' | 'list'>('create');

  const [prize,          setPrize]          = useState('');
  const [description,    setDescription]    = useState('');
  const [bannerUrl,      setBannerUrl]      = useState('');
  const [accentColor,    setAccentColor]    = useState('#6db83e');
  const [channelId,      setChannelId]      = useState('');
  const [duration,       setDuration]       = useState(3600);
  const [winnersCount,   setWinnersCount]   = useState(1);
  const [requiredRoleId, setRequiredRoleId] = useState('');
  const [joinMessage,    setJoinMessage]    = useState(DEFAULT_JOIN);
  const [winnerMessage,  setWinnerMessage]  = useState(DEFAULT_WINNER);

  const load = useCallback(async () => {
    setLoading(true);
    const [chRes, rolesRes, gwRes] = await Promise.all([
      fetch(`/api/guilds/${guildId}/channels`),
      fetch(`/api/guilds/${guildId}/roles`),
      fetch(`/api/giveaways/${guildId}`),
    ]);
    if (chRes.ok)    setChannels(await chRes.json());
    if (rolesRes.ok) setRoles(await rolesRes.json());
    if (gwRes.ok)    setGiveaways(await gwRes.json());
    setLoading(false);
  }, [guildId]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!prize || !channelId) return;
    setSaving(true);
    const res = await fetch(`/api/giveaways/${guildId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prize, description, bannerUrl, accentColor, channelId, duration,
        winnersCount, requiredRoleId: requiredRoleId || null,
        joinMessage:   joinMessage   || DEFAULT_JOIN,
        winnerMessage: winnerMessage || DEFAULT_WINNER,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setPrize(''); setDescription(''); setBannerUrl(''); setAccentColor('#6db83e');
      setChannelId(''); setDuration(3600); setWinnersCount(1); setRequiredRoleId('');
      setJoinMessage(DEFAULT_JOIN); setWinnerMessage(DEFAULT_WINNER);
      load(); setView('list');
    }
  }

  async function handleReroll(giveawayId: string) {
    setRerolling(giveawayId);
    await fetch(`/api/giveaways/${guildId}/${giveawayId}/reroll`, { method: 'POST' });
    setRerolling(null);
    load();
  }

  async function handleDelete(giveawayId: string) {
    setDeleting(giveawayId);
    await fetch(`/api/giveaways/${guildId}/${giveawayId}`, { method: 'DELETE' });
    setDeleting(null);
    setGiveaways(gs => gs.filter(g => g._id !== giveawayId));
  }

  async function handleScheduleReroll(giveawayId: string, scheduledAt: string | null) {
    await fetch(`/api/giveaways/${guildId}/${giveawayId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledRerollAt: scheduledAt }),
    });
    load();
  }

  const active = giveaways.filter(g => !g.ended);
  const past   = giveaways.filter(g => g.ended);

  return (
    <div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {(['create', 'list'] as const).map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '7px 16px', borderRadius: 8,
            border: view === v ? '1px solid rgba(109,184,62,.3)' : '1px solid var(--line)',
            cursor: 'pointer',
            background: view === v ? 'rgba(109,184,62,.1)' : 'transparent',
            color: view === v ? 'var(--green)' : 'var(--text-2)',
            fontWeight: view === v ? 600 : 400, fontSize: 13, transition: 'all .12s',
          }}>
            {v === 'create' ? 'Criar Sorteio' : `Histórico${giveaways.length ? ` · ${giveaways.length}` : ''}`}
          </button>
        ))}
      </div>

      {view === 'create' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Prémio */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Prémio</p>
              <Field label="Nome do prémio">
                <input value={prize} onChange={e => setPrize(e.target.value)}
                  placeholder="ex: Nitro Classic, 10€ PayPal..." required style={inp} />
              </Field>
              <Field label="Descrição" hint="opcional">
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Regras ou detalhes do prémio..." rows={2}
                  style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} />
              </Field>
              <Field label="Banner" hint="URL de imagem">
                <input value={bannerUrl} onChange={e => setBannerUrl(e.target.value)}
                  placeholder="https://i.imgur.com/..." style={inp} />
              </Field>
            </div>

            {/* Configuração */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Configuração</p>
              <Field label="Canal">
                <select value={channelId} onChange={e => setChannelId(e.target.value)} required style={inp}>
                  <option value="">Seleciona um canal...</option>
                  {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                </select>
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 10 }}>
                <Field label="Duração">
                  <select value={duration} onChange={e => setDuration(Number(e.target.value))} style={inp}>
                    {DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </Field>
                <Field label="Vencedores">
                  <input type="number" min={1} max={20} value={winnersCount}
                    onChange={e => setWinnersCount(Number(e.target.value))} style={inp} />
                </Field>
                <Field label="Cor">
                  <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)}
                    style={{ width: '100%', height: 38, borderRadius: 7, border: '1px solid var(--line)', cursor: 'pointer', padding: 2, background: 'none' }} />
                </Field>
              </div>
              <Field label="Cargo obrigatório" hint="opcional">
                <select value={requiredRoleId} onChange={e => setRequiredRoleId(e.target.value)} style={inp}>
                  <option value="">Nenhum — qualquer um pode participar</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </Field>
            </div>

            {/* Mensagens */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Mensagens</p>
              <Field label="Mensagem de entrada" hint="variáveis: {prize} {mention} {user}">
                <input value={joinMessage} onChange={e => setJoinMessage(e.target.value)} placeholder={DEFAULT_JOIN} style={inp} />
              </Field>
              <Field label="Mensagem de vencedor" hint="variáveis: {winners} {prize}">
                <input value={winnerMessage} onChange={e => setWinnerMessage(e.target.value)} placeholder={DEFAULT_WINNER} style={inp} />
              </Field>
            </div>

            <button type="submit" disabled={saving || !prize || !channelId} style={{
              padding: '11px 0', borderRadius: 8, border: 'none',
              cursor: saving || !prize || !channelId ? 'not-allowed' : 'pointer',
              background: saved ? 'rgba(109,184,62,.15)' : saving || !prize || !channelId ? 'var(--elevated)' : 'var(--green)',
              color: saved ? 'var(--green)' : saving || !prize || !channelId ? 'var(--text-3)' : '#0d0d0f',
              fontWeight: 700, fontSize: 14, transition: 'all .15s',
            }}>
              {saved ? 'Sorteio criado' : saving ? 'A publicar...' : 'Publicar Sorteio'}
            </button>
          </form>

          {/* Preview */}
          <div style={{ position: 'sticky', top: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Pré-visualização</p>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid var(--line)`, borderLeft: `4px solid ${accentColor}`, background: 'var(--card)' }}>
              {bannerUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bannerUrl} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
                  onError={e => (e.currentTarget.style.display = 'none')} />
              )}
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>🎉 {prize || 'Nome do prémio'}</p>
                {description && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.5 }}>{description}</p>}
                <div style={{ height: 1, background: 'var(--line)' }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 12px' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{DURATIONS.find(d => d.value === duration)?.label}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{winnersCount} vencedor{winnersCount !== 1 ? 'es' : ''}</span>
                  {channelId && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>#{channels.find(c => c.id === channelId)?.name}</span>}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 7, background: 'rgba(87,186,100,.15)', border: '1px solid rgba(87,186,100,.25)', color: '#57ba64', fontSize: 12.5, fontWeight: 600, width: 'fit-content' }}>
                  🎉 Participar
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'list' && (
        <div>
          {loading ? (
            <p style={{ color: 'var(--text-3)', fontSize: 13 }}>A carregar...</p>
          ) : giveaways.length === 0 ? (
            <div style={{ padding: '56px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>Sem sorteios ainda</p>
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Cria o primeiro no separador Criar Sorteio.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {active.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>Ativos · {active.length}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {active.map(g => <GiveawayRow key={g._id} g={g} channels={channels} roles={roles} onReroll={handleReroll} onDelete={handleDelete} onScheduleReroll={handleScheduleReroll} rerolling={rerolling} deleting={deleting} />)}
                  </div>
                </div>
              )}
              {past.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>Terminados · {past.length}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {past.map(g => <GiveawayRow key={g._id} g={g} channels={channels} roles={roles} onReroll={handleReroll} onDelete={handleDelete} onScheduleReroll={handleScheduleReroll} rerolling={rerolling} deleting={deleting} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GiveawayRow({ g, channels, roles, onReroll, onDelete, onScheduleReroll, rerolling, deleting }: {
  g: Giveaway; channels: Channel[]; roles: Role[];
  onReroll: (id: string) => void;
  onDelete: (id: string) => void;
  onScheduleReroll: (id: string, at: string | null) => void;
  rerolling: string | null; deleting: string | null;
}) {
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  const color     = `#${(g.accentColor || 0x6db83e).toString(16).padStart(6, '0')}`;
  const channel   = channels.find(c => c.id === g.channelId);
  const isRolling = rerolling === g._id;
  const isDeleting = deleting === g._id;

  // Converte para formato datetime-local (YYYY-MM-DDTHH:mm)
  function toLocalInput(iso: string) {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderLeft: `3px solid ${color}`, borderRadius: 9, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px' }}>
        {g.bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={g.bannerUrl} alt="" style={{ width: 44, height: 44, borderRadius: 7, objectFit: 'cover', flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.prize}</p>
            <span style={{
              fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0,
              background: g.ended ? 'rgba(248,113,113,.08)' : g.status === 'pending' ? 'rgba(251,191,36,.08)' : 'rgba(109,184,62,.08)',
              color: g.ended ? '#f87171' : g.status === 'pending' ? '#fbbf24' : 'var(--green)',
              border: `1px solid ${g.ended ? 'rgba(248,113,113,.15)' : g.status === 'pending' ? 'rgba(251,191,36,.15)' : 'rgba(109,184,62,.15)'}`,
            }}>
              {g.ended ? 'Terminado' : g.status === 'pending' ? 'A publicar' : 'Ativo'}
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
            {g.entries.length} participante{g.entries.length !== 1 ? 's' : ''}
            {channel ? ` · #${channel.name}` : ''}
            {g.ended
              ? g.winners.length > 0 ? ` · ${g.winners.length} vencedor${g.winners.length > 1 ? 'es' : ''}` : ' · sem participantes'
              : ` · ${timeLeft(g.endAt)}`}
          </p>
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {g.ended && g.entries.length > 0 && (
            <>
              <button onClick={() => onReroll(g._id)} disabled={isRolling} style={{
                padding: '5px 11px', borderRadius: 7, border: '1px solid var(--line)',
                background: 'transparent', color: 'var(--text-2)', fontSize: 12.5,
                cursor: isRolling ? 'not-allowed' : 'pointer', fontWeight: 500,
              }}>
                {isRolling ? 'A sortear...' : 'Reroll agora'}
              </button>
              <button onClick={() => setShowSchedule(s => !s)} style={{
                padding: '5px 11px', borderRadius: 7,
                border: showSchedule ? '1px solid rgba(109,184,62,.4)' : '1px solid var(--line)',
                background: showSchedule ? 'rgba(109,184,62,.08)' : 'transparent',
                color: showSchedule ? 'var(--green)' : 'var(--text-2)', fontSize: 12.5, cursor: 'pointer',
              }}>
                Agendar
              </button>
            </>
          )}
          <button onClick={() => onDelete(g._id)} disabled={isDeleting} style={{
            padding: '5px 11px', borderRadius: 7, border: '1px solid rgba(248,113,113,.25)',
            background: 'transparent', color: '#f87171', fontSize: 12.5,
            cursor: isDeleting ? 'not-allowed' : 'pointer',
          }}>
            {isDeleting ? '...' : 'Eliminar'}
          </button>
        </div>
      </div>

      {/* Vencedores */}
      {g.ended && g.winners.length > 0 && (
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--line)', background: 'rgba(109,184,62,.03)' }}>
          <p style={{ fontSize: 12, color: 'var(--green)', fontWeight: 500 }}>
            Vencedor{g.winners.length > 1 ? 'es' : ''}: {g.winners.map(w => `<@${w}>`).join(', ')}
          </p>
        </div>
      )}

      {/* Agendar reroll */}
      {showSchedule && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <p style={{ fontSize: 12.5, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>Fazer reroll em:</p>
          <input
            type="datetime-local"
            value={scheduleDate}
            min={toLocalInput(new Date().toISOString())}
            onChange={e => setScheduleDate(e.target.value)}
            style={{ ...inp, flex: 1, fontSize: 12.5, padding: '6px 10px' }}
          />
          <button
            disabled={!scheduleDate}
            onClick={() => { onScheduleReroll(g._id, scheduleDate ? new Date(scheduleDate).toISOString() : null); setShowSchedule(false); setScheduleDate(''); }}
            style={{
              padding: '6px 14px', borderRadius: 7, border: 'none',
              background: scheduleDate ? 'var(--green)' : 'var(--elevated)',
              color: scheduleDate ? '#0d0d0f' : 'var(--text-3)',
              fontWeight: 600, fontSize: 12.5, cursor: scheduleDate ? 'pointer' : 'not-allowed',
            }}
          >
            Confirmar
          </button>
          <button onClick={() => setShowSchedule(false)} style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid var(--line)', background: 'transparent', color: 'var(--text-3)', fontSize: 12.5, cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
