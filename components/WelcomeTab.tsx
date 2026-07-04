'use client';

import { useState, useRef } from 'react';

interface Channel { id: string; name: string; }

export interface WelcomeConfig {
  enabled:     boolean;
  channelId:   string | null;
  message:     string;
  deleteAfter: number;
  accentColor: string;
  dmEnabled:   boolean;
  dmMessage:   string;
  bannerUrl?:  string;
  showAvatar?: boolean;
  footer?:     string;
}

export interface GoodbyeConfig {
  enabled:           boolean;
  channelId:         string | null;
  message:           string;
  deleteAfter:       number;
  accentColor:       string;
  banMessageEnabled: boolean;
  banMessage:        string;
  bannerUrl?:        string;
  showAvatar?:       boolean;
  footer?:           string;
}

export interface ContainerExtras {
  bannerUrl:  string;
  showAvatar: boolean;
  footer:     string;
}

interface Props {
  welcome:         WelcomeConfig;
  goodbye:         GoodbyeConfig;
  channels:        Channel[];
  guildName:       string;
  guildId:         string;
  onChange:        (key: 'welcome' | 'goodbye', val: WelcomeConfig | GoodbyeConfig) => void;
  onSaveWelcome?:  () => Promise<boolean>;
  onSaveGoodbye?:  () => Promise<boolean>;
  onPersistWelcome?: (w: WelcomeConfig) => Promise<boolean>;
  onPersistGoodbye?: (g: GoodbyeConfig) => Promise<boolean>;
}

function SaveBtn({ id, saving, saved, error, onSave }: { id: string; saving: string | null; saved: string | null; error?: string | null; onSave: () => void }) {
  const isErr = error === id;
  return (
    <button onClick={onSave} disabled={saving === id} style={{
      background: isErr ? 'rgba(248,113,113,.15)' : saved === id ? 'rgba(109,184,62,.15)' : 'var(--green)',
      color: isErr ? '#f87171' : saved === id ? 'var(--green)' : '#fff',
      border: 'none', borderRadius: 7, padding: '5px 14px', fontSize: 12, fontWeight: 600,
      cursor: saving === id ? 'wait' : 'pointer', transition: 'all .2s', minWidth: 80, flexShrink: 0,
    }}>
      {saving === id ? 'A guardar...' : isErr ? 'Falhou ✕' : saved === id ? 'Guardado!' : 'Guardar'}
    </button>
  );
}

const VARIABLES = [
  { tag: '{user}',        desc: 'Menção do utilizador' },
  { tag: '{username}',    desc: 'Nome de utilizador' },
  { tag: '{displayname}', desc: 'Nome no servidor' },
  { tag: '{server}',      desc: 'Nome do servidor' },
  { tag: '{count}',       desc: 'Total de membros' },
  { tag: '{id}',          desc: 'ID do utilizador' },
  { tag: '{created}',     desc: 'Conta criada há...' },
];

const inputStyle: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--line)',
  borderRadius: 8, padding: '8px 12px', color: 'var(--text-1)',
  fontSize: 13.5, width: '100%', outline: 'none',
};

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{
      width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
      background: on ? 'var(--green)' : 'var(--elevated)',
      position: 'relative', transition: 'background .18s', flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 3, left: on ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        transition: 'left .18s', display: 'block',
      }} />
    </button>
  );
}

function parsePreview(text: string, guildName: string): string {
  return text
    .replace(/{user}/g,         '@Michu')
    .replace(/{username}/g,     'Michu')
    .replace(/{displayname}/g,  'Michu')
    .replace(/{server}/g,       guildName)
    .replace(/{count}/g,        '42')
    .replace(/{id}/g,           '349527593634234370')
    .replace(/{created}/g,      'há 2 anos');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function mdToHtml(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g,     '<u>$1</u>')
    .replace(/\*(.*?)\*/g,     '<em>$1</em>')
    .replace(/-#\s(.*?)(\n|$)/g, '<span style="font-size:11px;color:#80848e">$1</span>$2')
    .replace(/## (.*?)(\n|$)/g, '<strong style="font-size:15px">$1</strong>$2')
    .replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,.1);padding:1px 6px;border-radius:3px;font-size:12px">$1</code>')
    .replace(/\n/g, '<br/>');
}

/* ─── Discord-like message preview ─── */
function DiscordPreview({ message, accentColor, guildName, extras }: {
  message: string; accentColor: string; guildName: string; extras?: ContainerExtras;
}) {
  const accent = accentColor || '#6db83e';
  const parsed = parsePreview(message, guildName);

  return (
    <div style={{ background: '#313338', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,.06)', fontFamily: '"gg sans","Noto Sans",sans-serif' }}>
      <div style={{ padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ color: '#80848e', fontSize: 13 }}>#</span>
        <span style={{ fontSize: 12, color: '#80848e' }}>boas-vindas</span>
      </div>
      <div style={{ padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/laguno.png" alt="Laguno" style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, objectFit: 'cover', border: '1px solid rgba(255,255,255,.08)' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 5 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#f2f3f5' }}>Laguno</span>
            <span style={{ fontSize: 9.5, fontWeight: 600, background: '#5865f2', color: '#fff', padding: '1px 4px', borderRadius: 3 }}>BOT</span>
            <span style={{ fontSize: 11, color: '#80848e' }}>Hoje às 10:46</span>
          </div>
          <div style={{ background: '#2b2d31', borderRadius: 8, borderLeft: `3px solid ${accent}`, overflow: 'hidden', maxWidth: 400 }}>
            {/* Banner */}
            {extras?.bannerUrl?.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={extras.bannerUrl} alt="" style={{ width: '100%', maxHeight: 140, objectFit: 'cover', display: 'block' }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            ) : null}
            <div style={{ padding: '10px 13px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {message ? (
                  <p style={{ fontSize: 13.5, color: '#dbdee1', lineHeight: 1.65, margin: 0 }}
                    dangerouslySetInnerHTML={{ __html: mdToHtml(parsed) }} />
                ) : (
                  <p style={{ fontSize: 13, color: '#80848e', fontStyle: 'italic' }}>A tua mensagem aparece aqui...</p>
                )}
              </div>
              {/* Avatar do membro (thumbnail) */}
              {extras?.showAvatar && (
                <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg,#5865f2,#3b3f8f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: '#fff' }}>M</div>
              )}
            </div>
            {/* Rodapé */}
            {extras?.footer?.trim() ? (
              <div style={{ padding: '0 13px 10px' }}>
                <div style={{ height: 1, background: 'rgba(255,255,255,.08)', margin: '2px 0 8px' }} />
                <p style={{ fontSize: 11, color: '#80848e', margin: 0 }}
                  dangerouslySetInnerHTML={{ __html: mdToHtml(parsePreview(extras.footer, guildName)) }} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Message Editor Modal ─── */
function MessageEditor({ message, accentColor, guildName, onSubmit, onClose, title, extras: initialExtras, showExtras }: {
  message: string;
  accentColor: string;
  guildName: string;
  onSubmit: (msg: string, accent: string, extras: ContainerExtras) => void;
  onClose: () => void;
  title: string;
  extras?: ContainerExtras;
  showExtras?: boolean;
}) {
  const [msg, setMsg] = useState(message);
  const [accent, setAccent] = useState(accentColor || '#6db83e');
  const [extras, setExtras] = useState<ContainerExtras>(initialExtras ?? { bannerUrl: '', showAvatar: false, footer: '' });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insertVar(tag: string) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newMsg = msg.slice(0, start) + tag + msg.slice(end);
    setMsg(newMsg);
    setTimeout(() => { el.focus(); el.setSelectionRange(start + tag.length, start + tag.length); }, 0);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14,
        width: '100%', maxWidth: 860, maxHeight: '90vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em' }}>{title}</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 0, flex: 1, overflowY: 'auto' }}>

          {/* Left: editor */}
          <div style={{ padding: '18px 20px', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Conteúdo da Mensagem</p>
              <textarea
                ref={textareaRef}
                rows={8}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65, fontFamily: 'monospace', fontSize: 13 }}
                placeholder={'## Bem-vindo ao {server}! 👋\nOlá {user}, estamos felizes por teres chegado!\n-# Membro nº {count}'}
                value={msg}
                onChange={e => setMsg(e.target.value)}
              />
            </div>

            {/* Variables */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
                Quais variáveis/placeholders posso usar?
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {VARIABLES.map(v => (
                  <button key={v.tag} onClick={() => insertVar(v.tag)} title={v.desc} style={{
                    background: 'var(--elevated)', border: '1px solid var(--line)', borderRadius: 6,
                    padding: '4px 10px', fontSize: 12, color: 'var(--green)', cursor: 'pointer',
                    fontFamily: 'monospace', transition: 'all .1s',
                  }}>{v.tag}</button>
                ))}
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 10, lineHeight: 1.6 }}>
                Podes usar markdown: <code style={{ background: 'var(--elevated)', padding: '1px 5px', borderRadius: 4 }}>**negrito**</code>, <code style={{ background: 'var(--elevated)', padding: '1px 5px', borderRadius: 4 }}>## título</code>, <code style={{ background: 'var(--elevated)', padding: '1px 5px', borderRadius: 4 }}>-# subtexto</code>
              </p>
            </div>

            {/* Accent color */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Cor do container</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="color" value={accent} onChange={e => setAccent(e.target.value)}
                  style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--line)', background: 'none', cursor: 'pointer', padding: 2 }} />
                <input style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 13 }}
                  value={accent} onChange={e => setAccent(e.target.value)} placeholder="#6db83e" />
              </div>
            </div>

            {/* Personalização do container (banner, avatar, rodapé) */}
            {showExtras && (
              <>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Banner (URL de imagem)</p>
                  <input style={{ ...inputStyle, fontSize: 13 }} placeholder="https://exemplo.com/banner.png"
                    value={extras.bannerUrl} onChange={e => setExtras(x => ({ ...x, bannerUrl: e.target.value }))} />
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5, lineHeight: 1.5 }}>Imagem no topo do container (png, jpg ou gif). Deixa vazio para não usar.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 12.5, fontWeight: 600 }}>Mostrar avatar do membro</p>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Foto do membro ao lado da mensagem, como thumbnail.</p>
                  </div>
                  <Toggle on={extras.showAvatar} onChange={() => setExtras(x => ({ ...x, showAvatar: !x.showAvatar }))} />
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Rodapé</p>
                  <input style={{ ...inputStyle, fontSize: 13 }} placeholder="Membro nº {count} · diverte-te!"
                    value={extras.footer} onChange={e => setExtras(x => ({ ...x, footer: e.target.value }))} />
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5, lineHeight: 1.5 }}>Linha pequena no fundo, separada por divisória. Aceita as mesmas variáveis.</p>
                </div>
              </>
            )}
          </div>

          {/* Right: preview */}
          <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', background: 'var(--bg)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Pré-visualização da Mensagem</p>
            <DiscordPreview message={msg} accentColor={accent} guildName={guildName} extras={showExtras ? extras : undefined} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{
            padding: '8px 18px', borderRadius: 8, border: '1px solid var(--line)',
            background: 'var(--elevated)', color: 'var(--text-2)', fontSize: 13, cursor: 'pointer',
          }}>Cancelar</button>
          <button onClick={() => { onSubmit(msg, accent, extras); onClose(); }} style={{
            padding: '8px 22px', borderRadius: 8, border: 'none',
            background: 'var(--green)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Guardar e aplicar</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Config row ─── */
function ConfigBlock({ label, hint, children, toggle, toggled }: {
  label: string; hint?: string; children?: React.ReactNode;
  toggle?: React.ReactNode; toggled?: boolean;
}) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10, padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: toggled && children ? 12 : 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)' }}>{label}</p>
          {hint && <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3, lineHeight: 1.5 }}>{hint}</p>}
        </div>
        {toggle}
      </div>
      {toggled && children && <div>{children}</div>}
    </div>
  );
}

/* ─── Compact message preview ─── */
function MessagePreview({ message, accentColor, guildName, onEdit }: {
  message: string; accentColor: string; guildName: string; onEdit: () => void;
}) {
  const accent = accentColor || '#6db83e';
  const parsed = parsePreview(message || '', guildName);

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>Mensagem</p>
        <button onClick={onEdit} style={{
          padding: '5px 14px', borderRadius: 7, border: '1px solid var(--line)',
          background: 'var(--elevated)', color: 'var(--text-2)', fontSize: 12.5,
          cursor: 'pointer', fontWeight: 500, transition: 'all .12s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(109,184,62,.1)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--green)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--elevated)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-2)'; }}
        >Editar</button>
      </div>
      <div style={{ background: '#2b2d31', borderRadius: 8, borderLeft: `3px solid ${accent}`, padding: '10px 13px', maxHeight: 100, overflow: 'hidden', position: 'relative' }}>
        {message ? (
          <p style={{ fontSize: 12.5, color: '#dbdee1', lineHeight: 1.6, margin: 0, fontFamily: '"gg sans","Noto Sans",sans-serif' }}
            dangerouslySetInnerHTML={{ __html: mdToHtml(parsed) }} />
        ) : (
          <p style={{ fontSize: 12.5, color: '#80848e', fontStyle: 'italic', fontFamily: '"gg sans",sans-serif' }}>Sem mensagem — clica em Editar para configurar.</p>
        )}
      </div>
    </div>
  );
}

/* ─── Main ─── */
export function WelcomeTab({ welcome, goodbye, channels, guildName, guildId, onChange, onSaveWelcome, onSaveGoodbye, onPersistWelcome, onPersistGoodbye }: Props) {
  const [editingModal, setEditingModal] = useState<null | 'welcome' | 'goodbye' | 'dm' | 'ban'>(null);
  const [testStatusWelcome, setTestStatusWelcome] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [testStatusGoodbye, setTestStatusGoodbye] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [savingCard, setSavingCard] = useState<string | null>(null);
  const [savedCard, setSavedCard] = useState<string | null>(null);
  const [errorCard, setErrorCard] = useState<string | null>(null);

  async function saveCard(id: string, fn?: () => Promise<boolean>) {
    if (!fn) return;
    setSavingCard(id); setErrorCard(null);
    const ok = await fn().catch(() => false);
    setSavingCard(null);
    if (ok) {
      setSavedCard(id);
      setTimeout(() => setSavedCard(c => c === id ? null : c), 2500);
    } else {
      setErrorCard(id);
      setTimeout(() => setErrorCard(c => c === id ? null : c), 4000);
    }
  }

  function setW(val: Partial<WelcomeConfig>) { onChange('welcome', { ...welcome, ...val }); }
  function setG(val: Partial<GoodbyeConfig>) { onChange('goodbye', { ...goodbye, ...val }); }

  // Aplica ao estado (preview imediato) e grava na BD, com feedback no botão da secção.
  function applyAndSave(kind: 'welcome' | 'goodbye', val: WelcomeConfig | GoodbyeConfig) {
    onChange(kind, val);
    const persist = kind === 'welcome' ? onPersistWelcome : onPersistGoodbye;
    const fallback = kind === 'welcome' ? onSaveWelcome : onSaveGoodbye;
    saveCard(kind, persist ? () => persist(val as WelcomeConfig & GoodbyeConfig) : fallback);
  }

  async function sendTest(type: 'welcome' | 'goodbye') {
    const cfg = type === 'welcome' ? welcome : goodbye;
    if (!cfg.channelId) return;
    const set = type === 'welcome' ? setTestStatusWelcome : setTestStatusGoodbye;
    set('loading');
    try {
      const res = await fetch(`/api/guilds/${guildId}/welcome/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: cfg.channelId, message: cfg.message, accentColor: cfg.accentColor, type,
          bannerUrl: cfg.bannerUrl ?? '', showAvatar: cfg.showAvatar ?? false, footer: cfg.footer ?? '',
        }),
      });
      set(res.ok ? 'ok' : 'err');
    } catch { set('err'); }
    setTimeout(() => set('idle'), 3000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── BOAS-VINDAS ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em' }}>Boas-Vindas</h3>
          <SaveBtn id="welcome" saving={savingCard} saved={savedCard} error={errorCard} onSave={() => saveCard('welcome', onSaveWelcome)} />
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 14 }}>Enviada quando um novo membro entra no servidor.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          <ConfigBlock
            label="Ativar as mensagens quando alguém entrar"
            toggle={<Toggle on={welcome.enabled} onChange={() => setW({ enabled: !welcome.enabled })} />}
            toggled={welcome.enabled}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginBottom: 6 }}>Canal onde será enviada a mensagem</p>
                <select style={inputStyle} value={welcome.channelId ?? ''} onChange={e => setW({ channelId: e.target.value || null })}>
                  <option value="">— Seleciona um canal —</option>
                  {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                </select>
              </div>

              <div>
                <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginBottom: 6 }}>Segundos para apagar a mensagem <span style={{ opacity: .6 }}>(0 = nunca apagar)</span></p>
                <input type="number" min={0} style={{ ...inputStyle, width: 120 }}
                  value={welcome.deleteAfter}
                  onChange={e => setW({ deleteAfter: Math.max(0, parseInt(e.target.value) || 0) })} />
              </div>

              <MessagePreview
                message={welcome.message}
                accentColor={welcome.accentColor}
                guildName={guildName}
                onEdit={() => setEditingModal('welcome')}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => sendTest('welcome')} disabled={!welcome.channelId || testStatusWelcome === 'loading'} style={{
                  padding: '6px 14px', borderRadius: 7, border: '1px solid var(--line)',
                  background: testStatusWelcome === 'ok' ? 'rgba(109,184,62,.12)' : testStatusWelcome === 'err' ? 'rgba(248,113,113,.1)' : 'var(--elevated)',
                  color: testStatusWelcome === 'ok' ? 'var(--green)' : testStatusWelcome === 'err' ? '#f87171' : 'var(--text-2)',
                  fontSize: 12.5, cursor: welcome.channelId ? 'pointer' : 'not-allowed', opacity: !welcome.channelId ? .5 : 1,
                }}>
                  {testStatusWelcome === 'loading' ? 'A enviar...' : testStatusWelcome === 'ok' ? '✓ Enviado!' : testStatusWelcome === 'err' ? '✕ Erro' : 'Testar Mensagem'}
                </button>
              </div>
            </div>
          </ConfigBlock>

          <ConfigBlock
            label="Ativar as mensagens diretas ao entrar"
            hint="Envia uma DM ao membro quando entra — útil para mostrar regras ou boas-vindas privadas."
            toggle={<Toggle on={welcome.dmEnabled} onChange={() => setW({ dmEnabled: !welcome.dmEnabled })} />}
            toggled={welcome.dmEnabled}
          >
            <MessagePreview
              message={welcome.dmMessage}
              accentColor={welcome.accentColor}
              guildName={guildName}
              onEdit={() => setEditingModal('dm')}
            />
          </ConfigBlock>

        </div>
      </div>

      {/* ── DESPEDIDAS ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em' }}>Despedidas</h3>
          <SaveBtn id="goodbye" saving={savingCard} saved={savedCard} error={errorCard} onSave={() => saveCard('goodbye', onSaveGoodbye)} />
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 14 }}>Enviada quando um membro sai ou é expulso.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          <ConfigBlock
            label="Ativar as mensagens quando alguém sair"
            toggle={<Toggle on={goodbye.enabled} onChange={() => setG({ enabled: !goodbye.enabled })} />}
            toggled={goodbye.enabled}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginBottom: 6 }}>Canal onde será enviada a mensagem</p>
                <select style={inputStyle} value={goodbye.channelId ?? ''} onChange={e => setG({ channelId: e.target.value || null })}>
                  <option value="">— Seleciona um canal —</option>
                  {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                </select>
              </div>

              <div>
                <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginBottom: 6 }}>Segundos para apagar a mensagem <span style={{ opacity: .6 }}>(0 = nunca apagar)</span></p>
                <input type="number" min={0} style={{ ...inputStyle, width: 120 }}
                  value={goodbye.deleteAfter}
                  onChange={e => setG({ deleteAfter: Math.max(0, parseInt(e.target.value) || 0) })} />
              </div>

              <MessagePreview
                message={goodbye.message}
                accentColor={goodbye.accentColor}
                guildName={guildName}
                onEdit={() => setEditingModal('goodbye')}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => sendTest('goodbye')} disabled={!goodbye.channelId || testStatusGoodbye === 'loading'} style={{
                  padding: '6px 14px', borderRadius: 7, border: '1px solid var(--line)',
                  background: testStatusGoodbye === 'ok' ? 'rgba(109,184,62,.12)' : testStatusGoodbye === 'err' ? 'rgba(248,113,113,.1)' : 'var(--elevated)',
                  color: testStatusGoodbye === 'ok' ? 'var(--green)' : testStatusGoodbye === 'err' ? '#f87171' : 'var(--text-2)',
                  fontSize: 12.5, cursor: goodbye.channelId ? 'pointer' : 'not-allowed', opacity: !goodbye.channelId ? .5 : 1,
                }}>
                  {testStatusGoodbye === 'loading' ? 'A enviar...' : testStatusGoodbye === 'ok' ? '✓ Enviado!' : testStatusGoodbye === 'err' ? '✕ Erro' : 'Testar Mensagem'}
                </button>
              </div>
            </div>
          </ConfigBlock>

          <ConfigBlock
            label="Mostrar mensagem diferenciada ao ser banido"
            hint="Envia uma mensagem diferente quando o membro foi banido em vez de ter saído voluntariamente."
            toggle={<Toggle on={goodbye.banMessageEnabled} onChange={() => setG({ banMessageEnabled: !goodbye.banMessageEnabled })} />}
            toggled={goodbye.banMessageEnabled}
          >
            <MessagePreview
              message={goodbye.banMessage}
              accentColor={goodbye.accentColor}
              guildName={guildName}
              onEdit={() => setEditingModal('ban')}
            />
          </ConfigBlock>

        </div>
      </div>

      {/* ── Modals ── */}
      {editingModal === 'welcome' && (
        <MessageEditor
          title="Editar mensagem de Boas-Vindas"
          message={welcome.message}
          accentColor={welcome.accentColor}
          guildName={guildName}
          showExtras
          extras={{ bannerUrl: welcome.bannerUrl ?? '', showAvatar: welcome.showAvatar ?? false, footer: welcome.footer ?? '' }}
          onSubmit={(msg, accent, ex) => applyAndSave('welcome', { ...welcome, message: msg, accentColor: accent, bannerUrl: ex.bannerUrl, showAvatar: ex.showAvatar, footer: ex.footer })}
          onClose={() => setEditingModal(null)}
        />
      )}
      {editingModal === 'dm' && (
        <MessageEditor
          title="Editar mensagem de DM"
          message={welcome.dmMessage}
          accentColor={welcome.accentColor}
          guildName={guildName}
          onSubmit={(msg, accent) => applyAndSave('welcome', { ...welcome, dmMessage: msg, accentColor: accent })}
          onClose={() => setEditingModal(null)}
        />
      )}
      {editingModal === 'goodbye' && (
        <MessageEditor
          title="Editar mensagem de Despedida"
          message={goodbye.message}
          accentColor={goodbye.accentColor}
          guildName={guildName}
          showExtras
          extras={{ bannerUrl: goodbye.bannerUrl ?? '', showAvatar: goodbye.showAvatar ?? false, footer: goodbye.footer ?? '' }}
          onSubmit={(msg, accent, ex) => applyAndSave('goodbye', { ...goodbye, message: msg, accentColor: accent, bannerUrl: ex.bannerUrl, showAvatar: ex.showAvatar, footer: ex.footer })}
          onClose={() => setEditingModal(null)}
        />
      )}
      {editingModal === 'ban' && (
        <MessageEditor
          title="Editar mensagem de Ban"
          message={goodbye.banMessage}
          accentColor={goodbye.accentColor}
          guildName={guildName}
          onSubmit={(msg, accent) => applyAndSave('goodbye', { ...goodbye, banMessage: msg, accentColor: accent })}
          onClose={() => setEditingModal(null)}
        />
      )}
    </div>
  );
}
