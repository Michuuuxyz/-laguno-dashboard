'use client';

import { useEffect, useState, useCallback } from 'react';

interface Channel { id: string; name: string }
interface Role { id: string; name: string; color?: number }

interface Question { id: string; label: string; placeholder?: string; style?: 'short' | 'paragraph'; required?: boolean }
interface Category { id: string; label: string; emoji?: string; style?: number; color?: string; openingMessage?: string; format?: string; form?: Question[] }
interface Panel { panelId: string; title?: string; description?: string; color?: string; bannerUrl?: string; categories?: Category[]; channelId?: string | null }
interface Config {
  enabled?: boolean; supportRoles?: string[]; categoryChannelId?: string | null;
  supportChannelId?: string | null; transcriptChannelId?: string | null;
  perUserLimit?: number; defaultFormat?: string; namingScheme?: string;
  claimEnabled?: boolean; claimLabel?: string; claimEmoji?: string; closeLabel?: string; closeEmoji?: string;
}

const sid = () => Math.random().toString(36).slice(2, 8);

const input: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8,
  padding: '8px 12px', color: 'var(--text-1)', fontSize: 13.5, width: '100%', outline: 'none',
};
const card: React.CSSProperties = { background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '16px 18px' };
const lbl: React.CSSProperties = { fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6, display: 'block' };

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

function pmd(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^## (.*)$/gm, '<strong style="font-size:16px">$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,.1);padding:1px 5px;border-radius:3px;font-size:12px">$1</code>')
    .replace(/\n/g, '<br>');
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
              {panel.bannerUrl?.trim() && (
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 14, borderTop: '1px solid var(--line)', paddingTop: 16 }}>
            <div>
              <label style={lbl}>Formato por defeito</label>
              <select style={input} value={config.defaultFormat} onChange={e => setC({ defaultFormat: e.target.value })}>
                <option value="channel">Canal privado</option>
                <option value="thread">Thread privada</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Categoria dos tickets (canais)</label>
              <select style={input} value={config.categoryChannelId ?? ''} onChange={e => setC({ categoryChannelId: e.target.value || null })}>
                <option value="">— nenhuma —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Canal base (threads)</label>
              <select style={input} value={config.supportChannelId ?? ''} onChange={e => setC({ supportChannelId: e.target.value || null })}>
                <option value="">— nenhum —</option>
                {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Canal de transcripts</label>
              <select style={input} value={config.transcriptChannelId ?? ''} onChange={e => setC({ transcriptChannelId: e.target.value || null })}>
                <option value="">— nenhum —</option>
                {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Limite por membro</label>
              <input type="number" min={1} max={10} style={input} value={config.perUserLimit ?? 1} onChange={e => setC({ perUserLimit: Math.max(1, Math.min(10, parseInt(e.target.value) || 1)) })} />
            </div>
            <div>
              <label style={lbl}>Nome do canal <span style={{ opacity: .6, textTransform: 'none' }}>{'{number}'} {'{username}'}</span></label>
              <input style={input} value={config.namingScheme ?? ''} onChange={e => setC({ namingScheme: e.target.value })} placeholder="ticket-{number}" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Cargos de suporte (veem e gerem os tickets)</label>
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
              </div>
              <select style={input} value="" onChange={e => { const v = e.target.value; if (v && !(config.supportRoles ?? []).includes(v)) setC({ supportRoles: [...(config.supportRoles ?? []), v] }); }}>
                <option value="">+ adicionar cargo…</option>
                {roles.filter(r => !(config.supportRoles ?? []).includes(r.id)).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>

            {/* Botões de controlo dentro do ticket */}
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--line)', paddingTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>Botão &quot;Reivindicar&quot;</p>
                  <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>Permite à staff assumir um ticket. Desliga para o esconder.</p>
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
            </div>
          </div>
        )}
      </div>

      {/* ── Painéis ── */}
      {config.enabled && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 13.5, fontWeight: 700 }}>Painéis de tickets</p>
            <button onClick={() => { const id = sid(); setPanels(p => [...p, { panelId: id, title: 'Central de Suporte', description: 'Precisas de ajuda? Escolhe uma opção abaixo.', color: '#6db83e', categories: [{ id: sid(), label: 'Suporte', style: 2, color: '#6db83e', openingMessage: 'A equipa já foi notificada e vai atender-te.', format: 'default', form: [] }] }]); setOpenPanel(id); }}
              style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>+ Novo painel</button>
          </div>

          {panels.length === 0 && <div style={{ ...card, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>Ainda não há painéis. Cria um para os membros abrirem tickets.</div>}

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
                      <div style={{ gridColumn: '1 / -1' }}><label style={lbl}>Banner (URL, opcional)</label><input style={input} value={panel.bannerUrl ?? ''} onChange={e => patchPanel(panel.panelId, { bannerUrl: e.target.value })} placeholder="https://…" /></div>
                    </div>

                    {/* Categorias (botões) */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Botões / categorias</p>
                        <button onClick={() => patchPanel(panel.panelId, { categories: [...(panel.categories ?? []), { id: sid(), label: 'Nova opção', style: 2, color: '#6db83e', openingMessage: 'A equipa já foi notificada.', format: 'default', form: [] }] })}
                          style={{ background: 'var(--elevated)', border: '1px solid var(--line)', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: 'var(--green)', cursor: 'pointer' }}>+ Categoria</button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {(panel.categories ?? []).map(cat => (
                          <div key={cat.id} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: 8 }}>
                              <div><label style={lbl}>Texto do botão</label><input style={input} value={cat.label} onChange={e => patchCat(panel.panelId, cat.id, { label: e.target.value })} /></div>
                              <div><label style={lbl}>Emoji</label><input style={input} value={cat.emoji ?? ''} onChange={e => patchCat(panel.panelId, cat.id, { emoji: e.target.value })} placeholder="🎫" /></div>
                              <div><label style={lbl}>Cor do botão</label><select style={input} value={cat.style ?? 2} onChange={e => patchCat(panel.panelId, cat.id, { style: parseInt(e.target.value) })}>{STYLE_OPTS.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}</select></div>
                              <div><label style={lbl}>Formato</label><select style={input} value={cat.format ?? 'default'} onChange={e => patchCat(panel.panelId, cat.id, { format: e.target.value })}><option value="default">Por defeito</option><option value="channel">Canal</option><option value="thread">Thread</option></select></div>
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

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <button onClick={() => patchPanel(panel.panelId, { categories: (panel.categories ?? []).filter(c => c.id !== cat.id) })} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: 12, cursor: 'pointer' }}>Remover categoria</button>
                            </div>
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
