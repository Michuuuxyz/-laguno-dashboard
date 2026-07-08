'use client';

import { useEffect, useState, useCallback } from 'react';

interface Channel { id: string; name: string }
interface Role { id: string; name: string; color?: number }

interface Question { id: string; label: string; placeholder?: string; style?: 'short' | 'paragraph'; required?: boolean }
interface TButton { id: string; label: string; emoji?: string; style?: number; content?: string; ephemeral?: boolean }
interface Category { id: string; label: string; emoji?: string; style?: number; color?: string; openingMessage?: string; format?: string; categoryChannelId?: string | null; supportChannelId?: string | null; supportRoles?: string[]; form?: Question[]; buttons?: TButton[] }
interface Panel { panelId: string; title?: string; description?: string; color?: string; bannerUrl?: string; bannerPosition?: string; categories?: Category[]; channelId?: string | null }
interface Config {
  enabled?: boolean; supportRoles?: string[]; categoryChannelId?: string | null;
  supportChannelId?: string | null; transcriptChannelId?: string | null;
  perUserLimit?: number; defaultFormat?: string; namingScheme?: string;
  claimEnabled?: boolean; claimLabel?: string; claimEmoji?: string; closeLabel?: string; closeEmoji?: string;
  extraButtons?: TButton[];
}

const sid = () => Math.random().toString(36).slice(2, 8);

const input: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8,
  padding: '8px 12px', color: 'var(--text-1)', fontSize: 13.5, width: '100%', outline: 'none',
};
const card: React.CSSProperties = { background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '16px 18px' };
const lbl: React.CSSProperties = { fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6, display: 'block' };
const miniBtn: React.CSSProperties = { width: 26, height: 26, borderRadius: 6, border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--text-2)', cursor: 'pointer', fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{
      width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
      background: on ? 'var(--green)' : 'var(--elevated)', position: 'relative', transition: 'background .18s', flexShrink: 0,
    }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .18s' }} />
    </button>
  );
}

const STYLE_OPTS = [{ v: 1, l: 'Azul' }, { v: 2, l: 'Cinza' }, { v: 3, l: 'Verde' }, { v: 4, l: 'Vermelho' }];
const BTN_BG: Record<number, string> = { 1: '#5865f2', 2: '#4e5058', 3: '#3ba55d', 4: '#ed4245' };

/* Passo guiado — número + título + explicação, conteúdo indentado */
function Step({ n, title, desc, children }: { n: number; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16, marginTop: 16 }}>
      <div style={{ display: 'flex', gap: 11, marginBottom: 12 }}>
        <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(56,189,248,.14)', color: '#38bdf8', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</span>
        <div>
          <p style={{ fontSize: 13.5, fontWeight: 700 }}>{title}</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2, lineHeight: 1.55 }}>{desc}</p>
        </div>
      </div>
      <div style={{ paddingLeft: 33 }}>{children}</div>
    </div>
  );
}

function pmd(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^## (.*)$/gm, '<strong style="font-size:16px">$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,.1);padding:1px 5px;border-radius:3px;font-size:12px">$1</code>')
    .replace(/\n/g, '<br>');
}

/* Chip que imita um botão do Discord */
function btnChip(style: number): React.CSSProperties {
  return { display: 'inline-flex', alignItems: 'center', gap: 5, background: BTN_BG[style] ?? '#4e5058', color: '#fff', borderRadius: 4, padding: '5px 12px', fontSize: 12.5, fontWeight: 500 };
}

/* Pré-visualização do TICKET (mensagem de abertura + botões) para uma categoria */
function TicketPreview({ cat, cfg }: { cat: Category; cfg: Config }) {
  const accent = cat.color || '#6db83e';
  const custom = (cat.buttons ?? []).filter(b => b.label?.trim());
  return (
    <div style={{ marginTop: 2 }}>
      <p style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>Pré-visualização do ticket</p>
      <div style={{ background: '#313338', borderRadius: 8, padding: 12, fontFamily: '"gg sans","Noto Sans",sans-serif' }}>
        <div style={{ background: '#2b2d31', borderRadius: 8, borderLeft: `4px solid ${accent}`, padding: '10px 12px' }}>
          <p style={{ fontSize: 13, color: '#dbdee1', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: pmd(`## 🎫 Ticket #1 — ${cat.label || 'Suporte'}\n${cat.openingMessage || 'A equipa já foi notificada.'}`) }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {cfg.claimEnabled !== false && <span style={btnChip(3)}>{cfg.claimEmoji ? `${cfg.claimEmoji} ` : ''}{cfg.claimLabel || 'Reivindicar'}</span>}
            <span style={btnChip(4)}>{cfg.closeEmoji ? `${cfg.closeEmoji} ` : ''}{cfg.closeLabel || 'Fechar'}</span>
          </div>
          {custom.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {custom.map(b => <span key={b.id} style={btnChip(b.style ?? 2)}>{b.emoji ? `${b.emoji} ` : ''}{b.label}</span>)}
            </div>
          )}
          {(cfg.extraButtons ?? []).filter(b => b.label?.trim()).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {(cfg.extraButtons ?? []).filter(b => b.label?.trim()).map(b => <span key={b.id} style={btnChip(b.style ?? 2)}>{b.emoji ? `${b.emoji} ` : ''}{b.label}</span>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Pré-visualização em direto do painel — igual ao construtor de mensagens */
function PanelPreview({ panel }: { panel: Panel }) {
  const accent = panel.color || '#6db83e';
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Pré-visualização</p>
      <div style={{ background: '#313338', borderRadius: 10, padding: 14, fontFamily: '"gg sans","Noto Sans",sans-serif', position: 'sticky', top: 90 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/laguno.png" alt="" style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, objectFit: 'cover', border: '1px solid rgba(255,255,255,.08)' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 5 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#f2f3f5' }}>Laguno</span>
              <span style={{ fontSize: 9.5, fontWeight: 700, background: '#5865f2', color: '#fff', padding: '1px 4px', borderRadius: 3 }}>APP</span>
            </div>
            <div style={{ background: '#2b2d31', borderRadius: 8, borderLeft: `4px solid ${accent}`, overflow: 'hidden' }}>
              {panel.bannerUrl?.trim() && (panel.bannerPosition ?? 'top') !== 'bottom' && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={panel.bannerUrl} alt="" style={{ width: '100%', maxHeight: 140, objectFit: 'cover', display: 'block' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              )}
              <div style={{ padding: '12px 14px' }}>
                <p style={{ fontSize: 13.5, color: '#dbdee1', lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: pmd(`## ${panel.title || 'Central de Suporte'}\n${panel.description || ''}`) }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                  {(panel.categories ?? []).map(c => (
                    <div key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: BTN_BG[c.style ?? 2] ?? '#4e5058', color: '#fff', borderRadius: 4, padding: '6px 14px', fontSize: 13.5, fontWeight: 500 }}>
                      {c.emoji && <span>{c.emoji}</span>}{c.label || 'Abrir ticket'}
                    </div>
                  ))}
                  {(panel.categories ?? []).length === 0 && <span style={{ fontSize: 12.5, color: '#80848e', fontStyle: 'italic' }}>Adiciona categorias para veres os botões.</span>}
                </div>
              </div>
              {panel.bannerUrl?.trim() && (panel.bannerPosition ?? 'top') === 'bottom' && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={panel.bannerUrl} alt="" style={{ width: '100%', maxHeight: 140, objectFit: 'cover', display: 'block' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TicketsTab({ guildId, channels, roles }: { guildId: string; channels: Channel[]; roles: Role[] }) {
  const [config, setConfig] = useState<Config>({ enabled: false, supportRoles: [], perUserLimit: 1, defaultFormat: 'channel', namingScheme: 'ticket-{number}', claimEnabled: true, claimLabel: 'Reivindicar', claimEmoji: '🙋', closeLabel: 'Fechar', closeEmoji: '🔒' });
  const [panels, setPanels] = useState<Panel[]>([]);
  const [categories, setCategories] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const [sendTarget, setSendTarget] = useState<Record<string, string>>({});
  const [showAdv, setShowAdv] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/guilds/${guildId}/tickets`).then(r => r.ok ? r.json() : { config: {}, panels: [] }).catch(() => ({ config: {}, panels: [] })),
      fetch(`/api/guilds/${guildId}/categories`).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([data, cats]) => {
      setConfig({ enabled: false, supportRoles: [], perUserLimit: 1, defaultFormat: 'channel', namingScheme: 'ticket-{number}', ...data.config });
      setPanels(data.panels ?? []);
      setCategories(cats ?? []);
      setLoading(false);
    });
  }, [guildId]);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3500); };

  const save = useCallback(async () => {
    setSaving(true);
    const res = await fetch(`/api/guilds/${guildId}/tickets`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config, panels }),
    }).catch(() => null);
    setSaving(false);
    flash(res && res.ok ? 'Guardado.' : 'Não foi possível guardar. Confirma que és gestor deste servidor.');
  }, [guildId, config, panels]);

  async function sendPanel(panelId: string) {
    const channelId = sendTarget[panelId];
    if (!channelId) return flash('Escolhe um canal para enviar o painel.');
    await save(); // garante que o painel está gravado antes de enviar
    const res = await fetch(`/api/guilds/${guildId}/tickets/panel/send`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ panelId, channelId }),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    flash(res && res.ok ? 'Painel enviado para o canal.' : (data?.error ?? 'Falha ao enviar o painel.'));
  }

  const setC = (v: Partial<Config>) => setConfig(c => ({ ...c, ...v }));
  const patchPanel = (id: string, v: Partial<Panel>) => setPanels(ps => ps.map(p => p.panelId === id ? { ...p, ...v } : p));
  const patchCat = (pid: string, cid: string, v: Partial<Category>) =>
    setPanels(ps => ps.map(p => p.panelId !== pid ? p : { ...p, categories: (p.categories ?? []).map(c => c.id === cid ? { ...c, ...v } : c) }));
  const moveCat = (pid: string, cid: string, dir: -1 | 1) =>
    setPanels(ps => ps.map(p => {
      if (p.panelId !== pid) return p;
      const cats = [...(p.categories ?? [])];
      const i = cats.findIndex(c => c.id === cid);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= cats.length) return p;
      [cats[i], cats[j]] = [cats[j], cats[i]];
      return { ...p, categories: cats };
    }));
  const removeCat = (pid: string, cid: string) =>
    setPanels(ps => ps.map(p => p.panelId !== pid ? p : { ...p, categories: (p.categories ?? []).filter(c => c.id !== cid) }));

  if (loading) return <div className="skel" style={{ height: 200, borderRadius: 12 }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Config geral ── */}
      <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 14.5, fontWeight: 700 }}>Sistema de Tickets</p>
            <p style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2 }}>Ativa para permitir que os membros abram tickets pelos painéis.</p>
          </div>
          <Toggle on={!!config.enabled} onChange={() => setC({ enabled: !config.enabled })} />
        </div>

        {config.enabled && (
          <div>

            {/* Passo 1 — Equipa */}
            <Step n={1} title="A tua equipa de suporte" desc="Os cargos que veem, reivindicam e fecham os tickets. Sem isto, só quem tiver a permissão 'Gerir Canais' os consegue ver.">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {(config.supportRoles ?? []).map(rid => {
                  const r = roles.find(x => x.id === rid);
                  return (
                    <span key={rid} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--elevated)', border: '1px solid var(--line)', borderRadius: 6, padding: '4px 8px', fontSize: 12.5 }}>
                      {r?.name ?? rid}
                      <button onClick={() => setC({ supportRoles: (config.supportRoles ?? []).filter(x => x !== rid) })} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 13 }}>✕</button>
                    </span>
                  );
                })}
                {(config.supportRoles ?? []).length === 0 && <span style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>Nenhum cargo escolhido ainda.</span>}
              </div>
              <select style={{ ...input, maxWidth: 320 }} value="" onChange={e => { const v = e.target.value; if (v && !(config.supportRoles ?? []).includes(v)) setC({ supportRoles: [...(config.supportRoles ?? []), v] }); }}>
                <option value="">+ adicionar cargo…</option>
                {roles.filter(r => !(config.supportRoles ?? []).includes(r.id)).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </Step>

            {/* Passo 2 — Onde ficam */}
            <Step n={2} title="Onde ficam os tickets" desc="Escolhe como cada ticket é criado e onde guardar o histórico ao fechar.">
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                {[{ v: 'channel', t: 'Canal privado', d: 'Um canal de texto por ticket, numa categoria.' }, { v: 'thread', t: 'Thread privada', d: 'Uma thread por ticket, sem limite de canais.' }].map(o => {
                  const on = (config.defaultFormat ?? 'channel') === o.v;
                  return (
                    <button key={o.v} onClick={() => setC({ defaultFormat: o.v })} style={{ flex: '1 1 200px', textAlign: 'left', padding: '10px 14px', borderRadius: 9, cursor: 'pointer', border: on ? '1px solid var(--green)' : '1px solid var(--line)', background: on ? 'rgba(109,184,62,.08)' : 'var(--surface)', transition: 'all .12s' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: on ? 'var(--green)' : 'var(--text-1)' }}>{o.t}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, lineHeight: 1.45 }}>{o.d}</p>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 12 }}>
                {(config.defaultFormat ?? 'channel') === 'channel' ? (
                  <div>
                    <label style={lbl}>Categoria onde criar os canais</label>
                    <select style={input} value={config.categoryChannelId ?? ''} onChange={e => setC({ categoryChannelId: e.target.value || null })}>
                      <option value="">— escolhe uma categoria —</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label style={lbl}>Canal onde criar as threads</label>
                    <select style={input} value={config.supportChannelId ?? ''} onChange={e => setC({ supportChannelId: e.target.value || null })}>
                      <option value="">— escolhe um canal —</option>
                      {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label style={lbl}>Canal de transcripts <span style={{ opacity: .6, textTransform: 'none' }}>(opcional)</span></label>
                  <select style={input} value={config.transcriptChannelId ?? ''} onChange={e => setC({ transcriptChannelId: e.target.value || null })}>
                    <option value="">— nenhum —</option>
                    {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                  </select>
                </div>
              </div>
            </Step>

            {/* Passo 3 — Botões */}
            <Step n={3} title="Botões dentro do ticket" desc="Os botões que a equipa vê dentro de cada ticket. Podes mudar os textos e emojis.">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, maxWidth: 460 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>Botão &quot;Reivindicar&quot;</p>
                  <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>A staff assume o ticket. Desliga para o esconder.</p>
                </div>
                <Toggle on={config.claimEnabled !== false} onChange={() => setC({ claimEnabled: !(config.claimEnabled !== false) })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: 10 }}>
                {config.claimEnabled !== false && <>
                  <div><label style={lbl}>Texto do &quot;Reivindicar&quot;</label><input style={input} value={config.claimLabel ?? ''} onChange={e => setC({ claimLabel: e.target.value })} placeholder="Reivindicar" /></div>
                  <div><label style={lbl}>Emoji</label><input style={input} value={config.claimEmoji ?? ''} onChange={e => setC({ claimEmoji: e.target.value })} placeholder="🙋" /></div>
                </>}
                <div><label style={lbl}>Texto do &quot;Fechar&quot;</label><input style={input} value={config.closeLabel ?? ''} onChange={e => setC({ closeLabel: e.target.value })} placeholder="Fechar" /></div>
                <div><label style={lbl}>Emoji</label><input style={input} value={config.closeEmoji ?? ''} onChange={e => setC({ closeEmoji: e.target.value })} placeholder="🔒" /></div>
              </div>

              {/* Botões extra — aparecem em TODOS os tickets */}
              <div style={{ borderTop: '1px solid var(--line)', marginTop: 14, paddingTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>Botões extra</p>
                    <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2, maxWidth: 400 }}>Os teus próprios botões, iguais em <strong>todos</strong> os tickets. Ao clicar, respondem com o texto que definires.</p>
                  </div>
                  {(config.extraButtons ?? []).length < 5 && <button onClick={() => setC({ extraButtons: [...(config.extraButtons ?? []), { id: sid(), label: 'Botão', style: 2, content: '', ephemeral: true }] })} style={{ background: 'var(--elevated)', border: '1px solid var(--line)', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: 'var(--green)', cursor: 'pointer', flexShrink: 0 }}>+ Botão</button>}
                </div>
                {(config.extraButtons ?? []).map(b => (
                  <div key={b.id} style={{ border: '1px solid var(--line)', borderRadius: 8, padding: 10, marginBottom: 6, display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--card)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 60px 1fr auto', gap: 6, alignItems: 'center' }}>
                      <input style={input} value={b.label} onChange={e => setC({ extraButtons: (config.extraButtons ?? []).map(x => x.id === b.id ? { ...x, label: e.target.value } : x) })} placeholder="Texto do botão" />
                      <input style={input} value={b.emoji ?? ''} onChange={e => setC({ extraButtons: (config.extraButtons ?? []).map(x => x.id === b.id ? { ...x, emoji: e.target.value } : x) })} placeholder="😀" />
                      <select style={input} value={b.style ?? 2} onChange={e => setC({ extraButtons: (config.extraButtons ?? []).map(x => x.id === b.id ? { ...x, style: parseInt(e.target.value) } : x) })}>{STYLE_OPTS.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}</select>
                      <button onClick={() => setC({ extraButtons: (config.extraButtons ?? []).filter(x => x.id !== b.id) })} style={{ ...miniBtn, color: '#f87171', borderColor: 'rgba(248,113,113,.3)' }}>✕</button>
                    </div>
                    <textarea rows={2} style={{ ...input, resize: 'vertical' }} value={b.content ?? ''} onChange={e => setC({ extraButtons: (config.extraButtons ?? []).map(x => x.id === b.id ? { ...x, content: e.target.value } : x) })} placeholder="Texto mostrado ao clicar (ex: regras, FAQ, links úteis…)" />
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={b.ephemeral !== false} onChange={e => setC({ extraButtons: (config.extraButtons ?? []).map(x => x.id === b.id ? { ...x, ephemeral: e.target.checked } : x) })} /> Só quem clica vê a resposta
                    </label>
                  </div>
                ))}
              </div>
            </Step>

            {/* Opções avançadas */}
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, marginTop: 16 }}>
              <button onClick={() => setShowAdv(v => !v)} style={{ background: 'none', border: 'none', color: 'var(--text-2)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>
                Opções avançadas <span style={{ fontSize: 10 }}>{showAdv ? '▲' : '▼'}</span>
              </button>
              {showAdv && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 12, marginTop: 12, paddingLeft: 2 }}>
                  <div>
                    <label style={lbl}>Limite de tickets por membro</label>
                    <input type="number" min={1} max={10} style={input} value={config.perUserLimit ?? 1} onChange={e => setC({ perUserLimit: Math.max(1, Math.min(10, parseInt(e.target.value) || 1)) })} />
                  </div>
                  <div>
                    <label style={lbl}>Nome do canal <span style={{ opacity: .6, textTransform: 'none' }}>{'{number}'} · {'{username}'}</span></label>
                    <input style={input} value={config.namingScheme ?? ''} onChange={e => setC({ namingScheme: e.target.value })} placeholder="ticket-{number}" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Passo 4 — Painéis ── */}
      {config.enabled && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', gap: 11 }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(56,189,248,.14)', color: '#38bdf8', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>4</span>
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 700 }}>Painéis — o que os membros veem</p>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2, lineHeight: 1.55, maxWidth: 460 }}>A mensagem com botões que envias para um canal. Cada botão abre um tipo de ticket.</p>
              </div>
            </div>
            <button onClick={() => { const id = sid(); setPanels(p => [...p, { panelId: id, title: 'Central de Suporte', description: 'Precisas de ajuda? Escolhe uma opção abaixo.', color: '#6db83e', categories: [{ id: sid(), label: 'Suporte', style: 2, color: '#6db83e', openingMessage: 'A equipa já foi notificada e vai atender-te.', format: 'default', form: [] }] }]); setOpenPanel(id); }}
              style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>+ Novo painel</button>
          </div>

          {panels.length === 0 && <div style={{ ...card, textAlign: 'center', color: 'var(--text-3)', fontSize: 13, padding: '24px 18px' }}>Ainda não há painéis. Clica em <strong style={{ color: 'var(--green)' }}>+ Novo painel</strong> para criar o primeiro.</div>}

          {panels.map(panel => {
            const open = openPanel === panel.panelId;
            return (
              <div key={panel.panelId} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, cursor: 'pointer' }} onClick={() => setOpenPanel(open ? null : panel.panelId)}>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 600 }}>{panel.title || 'Painel'}</p>
                    <p style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{(panel.categories ?? []).length} botão(ões){panel.channelId ? ' · enviado' : ''}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={e => { e.stopPropagation(); setPanels(p => p.filter(x => x.panelId !== panel.panelId)); }} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: '#f87171', cursor: 'pointer' }}>Apagar</button>
                    <span style={{ color: 'var(--text-3)', fontSize: 13 }}>{open ? '▲' : '▼'}</span>
                  </div>
                </div>

                {open && (
                  <div style={{ borderTop: '1px solid var(--line)', marginTop: 14, paddingTop: 14 }}>
                  <div className="tk-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 12 }}>
                      <div><label style={lbl}>Título</label><input style={input} value={panel.title ?? ''} onChange={e => patchPanel(panel.panelId, { title: e.target.value })} /></div>
                      <div><label style={lbl}>Cor</label><div style={{ display: 'flex', gap: 6 }}><input type="color" value={panel.color ?? '#6db83e'} onChange={e => patchPanel(panel.panelId, { color: e.target.value })} style={{ width: 38, height: 36, borderRadius: 8, border: '1px solid var(--line)', background: 'none', cursor: 'pointer' }} /><input style={input} value={panel.color ?? ''} onChange={e => patchPanel(panel.panelId, { color: e.target.value })} /></div></div>
                      <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>Descrição</label><textarea rows={2} style={{ ...input, resize: 'vertical' }} value={panel.description ?? ''} onChange={e => patchPanel(panel.panelId, { description: e.target.value })} /></div>
                      <div><label style={lbl}>Banner (URL, opcional)</label><input style={input} value={panel.bannerUrl ?? ''} onChange={e => patchPanel(panel.panelId, { bannerUrl: e.target.value })} placeholder="https://…" /></div>
                      <div><label style={lbl}>Posição do banner</label><select style={input} value={panel.bannerPosition ?? 'top'} onChange={e => patchPanel(panel.panelId, { bannerPosition: e.target.value })}><option value="top">Em cima (topo)</option><option value="bottom">Em baixo (depois dos botões)</option></select></div>
                    </div>

                    {/* Categorias (botões) */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Botões / categorias</p>
                        <button onClick={() => patchPanel(panel.panelId, { categories: [...(panel.categories ?? []), { id: sid(), label: 'Nova opção', style: 2, color: '#6db83e', openingMessage: 'A equipa já foi notificada.', format: 'default', form: [] }] })}
                          style={{ background: 'var(--elevated)', border: '1px solid var(--line)', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: 'var(--green)', cursor: 'pointer' }}>+ Categoria</button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {(panel.categories ?? []).map((cat, ci, arr) => (
                          <div key={cat.id} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {/* Cabeçalho: nome + reordenar + remover */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Categoria {ci + 1}</span>
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button title="Mover para cima" onClick={() => moveCat(panel.panelId, cat.id, -1)} disabled={ci === 0} style={{ ...miniBtn, opacity: ci === 0 ? .3 : 1 }}>↑</button>
                                <button title="Mover para baixo" onClick={() => moveCat(panel.panelId, cat.id, 1)} disabled={ci === arr.length - 1} style={{ ...miniBtn, opacity: ci === arr.length - 1 ? .3 : 1 }}>↓</button>
                                <button title="Remover" onClick={() => removeCat(panel.panelId, cat.id)} style={{ ...miniBtn, color: '#f87171', borderColor: 'rgba(248,113,113,.3)' }}>✕</button>
                              </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: 8 }}>
                              <div><label style={lbl}>Texto do botão</label><input style={input} value={cat.label} onChange={e => patchCat(panel.panelId, cat.id, { label: e.target.value })} /></div>
                              <div><label style={lbl}>Emoji</label><input style={input} value={cat.emoji ?? ''} onChange={e => patchCat(panel.panelId, cat.id, { emoji: e.target.value })} placeholder="🎫" /></div>
                              <div><label style={lbl}>Cor do botão</label><select style={input} value={cat.style ?? 2} onChange={e => patchCat(panel.panelId, cat.id, { style: parseInt(e.target.value) })}>{STYLE_OPTS.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}</select></div>
                              <div><label style={lbl}>Formato</label><select style={input} value={cat.format ?? 'default'} onChange={e => patchCat(panel.panelId, cat.id, { format: e.target.value })}><option value="default">Por defeito</option><option value="channel">Canal</option><option value="thread">Thread</option></select></div>
                            </div>
                            {/* Destino próprio desta categoria (senão usa o do servidor) */}
                            {(() => {
                              const fmt = (cat.format && cat.format !== 'default') ? cat.format : (config.defaultFormat ?? 'channel');
                              return (
                                <div>
                                  {fmt === 'thread' ? (
                                    <><label style={lbl}>Canal de destino <span style={{ opacity: .6, textTransform: 'none' }}>(só esta categoria)</span></label>
                                      <select style={input} value={cat.supportChannelId ?? ''} onChange={e => patchCat(panel.panelId, cat.id, { supportChannelId: e.target.value || null })}>
                                        <option value="">— usar o canal do servidor —</option>
                                        {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                                      </select></>
                                  ) : (
                                    <><label style={lbl}>Categoria de destino <span style={{ opacity: .6, textTransform: 'none' }}>(só esta categoria)</span></label>
                                      <select style={input} value={cat.categoryChannelId ?? ''} onChange={e => patchCat(panel.panelId, cat.id, { categoryChannelId: e.target.value || null })}>
                                        <option value="">— usar a categoria do servidor —</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                      </select></>
                                  )}
                                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5, lineHeight: 1.45 }}>Ex: os tickets de &quot;Parcerias&quot; vão para um sítio, os de &quot;Suporte&quot; para outro.</p>
                                </div>
                              );
                            })()}

                            {/* Cargos extra que veem SÓ esta categoria */}
                            <div>
                              <label style={lbl}>Cargos extra desta categoria <span style={{ opacity: .6, textTransform: 'none' }}>(além dos do servidor)</span></label>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                                {(cat.supportRoles ?? []).map(rid => {
                                  const r = roles.find(x => x.id === rid);
                                  return (
                                    <span key={rid} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--elevated)', border: '1px solid var(--line)', borderRadius: 6, padding: '3px 8px', fontSize: 12 }}>
                                      {r?.name ?? rid}
                                      <button onClick={() => patchCat(panel.panelId, cat.id, { supportRoles: (cat.supportRoles ?? []).filter(x => x !== rid) })} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 12 }}>✕</button>
                                    </span>
                                  );
                                })}
                              </div>
                              <select style={input} value="" onChange={e => { const v = e.target.value; if (v && !(cat.supportRoles ?? []).includes(v)) patchCat(panel.panelId, cat.id, { supportRoles: [...(cat.supportRoles ?? []), v] }); }}>
                                <option value="">+ adicionar cargo…</option>
                                {roles.filter(r => !(cat.supportRoles ?? []).includes(r.id)).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                              </select>
                            </div>

                            <div><label style={lbl}>Mensagem de abertura do ticket</label><textarea rows={2} style={{ ...input, resize: 'vertical' }} value={cat.openingMessage ?? ''} onChange={e => patchCat(panel.panelId, cat.id, { openingMessage: e.target.value })} /></div>

                            {/* Formulário */}
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                <label style={{ ...lbl, marginBottom: 0 }}>Formulário (perguntas antes de abrir, máx 5)</label>
                                {(cat.form ?? []).length < 5 && <button onClick={() => patchCat(panel.panelId, cat.id, { form: [...(cat.form ?? []), { id: sid(), label: 'Pergunta', style: 'short', required: true }] })} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 6, padding: '2px 8px', fontSize: 11.5, color: 'var(--green)', cursor: 'pointer' }}>+ Pergunta</button>}
                              </div>
                              {(cat.form ?? []).map(q => (
                                <div key={q.id} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                                  <input style={{ ...input, flex: 2 }} value={q.label} onChange={e => patchCat(panel.panelId, cat.id, { form: (cat.form ?? []).map(x => x.id === q.id ? { ...x, label: e.target.value } : x) })} placeholder="Pergunta" />
                                  <select style={{ ...input, width: 120, flex: '0 0 auto' }} value={q.style ?? 'short'} onChange={e => patchCat(panel.panelId, cat.id, { form: (cat.form ?? []).map(x => x.id === q.id ? { ...x, style: e.target.value as 'short' | 'paragraph' } : x) })}><option value="short">Curta</option><option value="paragraph">Longa</option></select>
                                  <button onClick={() => patchCat(panel.panelId, cat.id, { form: (cat.form ?? []).filter(x => x.id !== q.id) })} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 14, flex: '0 0 auto' }}>✕</button>
                                </div>
                              ))}
                            </div>

                            {/* Botões dentro do ticket (respondem com texto ao clicar) */}
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                <label style={{ ...lbl, marginBottom: 0 }}>Botões dentro do ticket <span style={{ opacity: .6, textTransform: 'none' }}>(respondem com texto ao clicar)</span></label>
                                {(cat.buttons ?? []).length < 10 && <button onClick={() => patchCat(panel.panelId, cat.id, { buttons: [...(cat.buttons ?? []), { id: sid(), label: 'Botão', style: 2, content: '', ephemeral: true }] })} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 6, padding: '2px 8px', fontSize: 11.5, color: 'var(--green)', cursor: 'pointer' }}>+ Botão</button>}
                              </div>
                              {(cat.buttons ?? []).map(b => (
                                <div key={b.id} style={{ border: '1px solid var(--line)', borderRadius: 8, padding: 10, marginBottom: 6, display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--card)' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 60px 1fr auto', gap: 6, alignItems: 'center' }}>
                                    <input style={input} value={b.label} onChange={e => patchCat(panel.panelId, cat.id, { buttons: (cat.buttons ?? []).map(x => x.id === b.id ? { ...x, label: e.target.value } : x) })} placeholder="Texto do botão" />
                                    <input style={input} value={b.emoji ?? ''} onChange={e => patchCat(panel.panelId, cat.id, { buttons: (cat.buttons ?? []).map(x => x.id === b.id ? { ...x, emoji: e.target.value } : x) })} placeholder="😀" />
                                    <select style={input} value={b.style ?? 2} onChange={e => patchCat(panel.panelId, cat.id, { buttons: (cat.buttons ?? []).map(x => x.id === b.id ? { ...x, style: parseInt(e.target.value) } : x) })}>{STYLE_OPTS.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}</select>
                                    <button onClick={() => patchCat(panel.panelId, cat.id, { buttons: (cat.buttons ?? []).filter(x => x.id !== b.id) })} style={{ ...miniBtn, color: '#f87171', borderColor: 'rgba(248,113,113,.3)' }}>✕</button>
                                  </div>
                                  <textarea rows={2} style={{ ...input, resize: 'vertical' }} value={b.content ?? ''} onChange={e => patchCat(panel.panelId, cat.id, { buttons: (cat.buttons ?? []).map(x => x.id === b.id ? { ...x, content: e.target.value } : x) })} placeholder="Texto mostrado ao clicar (ex: as regras, um FAQ, instruções…)" />
                                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={b.ephemeral !== false} onChange={e => patchCat(panel.panelId, cat.id, { buttons: (cat.buttons ?? []).map(x => x.id === b.id ? { ...x, ephemeral: e.target.checked } : x) })} /> Só quem clica vê a resposta
                                  </label>
                                </div>
                              ))}
                            </div>

                            <TicketPreview cat={cat} cfg={config} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Enviar para canal */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                      <select style={{ ...input, flex: 1 }} value={sendTarget[panel.panelId] ?? ''} onChange={e => setSendTarget(s => ({ ...s, [panel.panelId]: e.target.value }))}>
                        <option value="">Escolhe o canal para enviar…</option>
                        {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                      </select>
                      <button onClick={() => sendPanel(panel.panelId)} style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>Enviar painel</button>
                    </div>
                  </div>
                  <PanelPreview panel={panel} />
                  </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <style>{`@media (max-width: 860px) { .tk-grid { grid-template-columns: 1fr !important; } }`}</style>

      {/* ── Guardar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', bottom: 0, paddingTop: 4 }}>
        <button onClick={save} disabled={saving} style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 24px', fontSize: 13.5, fontWeight: 600, cursor: saving ? 'wait' : 'pointer' }}>
          {saving ? 'A guardar…' : 'Guardar tudo'}
        </button>
        {toast && <span style={{ fontSize: 13, color: toast.includes('não') || toast.includes('Falha') ? '#f87171' : 'var(--green)' }}>{toast}</span>}
      </div>
    </div>
  );
}
