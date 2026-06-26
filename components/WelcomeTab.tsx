'use client';

import { useState } from 'react';

interface Channel { id: string; name: string; }

export interface WelcomeConfig {
  enabled:       boolean;
  channelId:     string | null;
  headerText:    string;
  message:       string;
  footerText:    string;
  showAccountAge: boolean;
  bannerType:    'none' | 'avatar' | 'custom';
  bannerUrl:     string;
  accentColor:   string;
}

export interface GoodbyeConfig {
  enabled:     boolean;
  channelId:   string | null;
  headerText:  string;
  message:     string;
  footerText:  string;
  accentColor: string;
}

interface Props {
  welcome:  WelcomeConfig;
  goodbye:  GoodbyeConfig;
  channels: Channel[];
  guildName: string;
  guildId:  string;
  onChange: (key: 'welcome' | 'goodbye', val: WelcomeConfig | GoodbyeConfig) => void;
}

const VARIABLES = [
  { tag: '{user}',        desc: 'Menção (@utilizador)' },
  { tag: '{username}',    desc: 'Nome de utilizador' },
  { tag: '{displayname}', desc: 'Nome no servidor' },
  { tag: '{server}',      desc: 'Nome do servidor' },
  { tag: '{count}',       desc: 'Total de membros' },
  { tag: '{created}',     desc: 'Conta criada há...' },
  { tag: '{id}',          desc: 'ID do utilizador' },
];

const ACCENT_PRESETS = [
  { label: 'Verde',    color: '#3ecf8e' },
  { label: 'Azul',     color: '#5865f2' },
  { label: 'Roxo',     color: '#9b59b6' },
  { label: 'Laranja',  color: '#e67e22' },
  { label: 'Vermelho', color: '#e74c3c' },
  { label: 'Rosa',     color: '#e91e8c' },
  { label: 'Branco',   color: '#ffffff' },
  { label: 'Sem cor',  color: '' },
];

const inputStyle: React.CSSProperties = {
  background: 'var(--bg)', border: '1px solid var(--line)',
  borderRadius: 8, padding: '8px 12px', color: 'var(--text-1)',
  fontSize: 13.5, width: '100%', outline: 'none',
};

function parsePreview(text: string, guildName: string): string {
  return text
    .replace(/{user}/g,         '@Michu')
    .replace(/{username}/g,     'Michu')
    .replace(/{displayname}/g,  'Michu')
    .replace(/{server}/g,       guildName)
    .replace(/{count}/g,        '42')
    .replace(/{id}/g,           '123456789')
    .replace(/{created}/g,      'há 2 anos');
}

function mdToHtml(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g,     '<u>$1</u>')
    .replace(/\*(.*?)\*/g,     '<em>$1</em>')
    .replace(/`(.*?)`/g,       '<code style="background:rgba(255,255,255,.1);padding:1px 6px;border-radius:3px;font-size:12.5px">$1</code>')
    .replace(/\n/g,            '<br/>');
}

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

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{children}</p>
      {hint && <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2, opacity: .7 }}>{hint}</p>}
    </div>
  );
}

/* ─── Discord-style preview ─── */
function DiscordPreview({
  headerText, message, footerText, showAccountAge, bannerType, bannerUrl, accentColor, guildName, type,
}: {
  headerText: string; message: string; footerText: string; showAccountAge: boolean;
  bannerType: 'none' | 'avatar' | 'custom'; bannerUrl: string; accentColor: string;
  guildName: string; type: 'welcome' | 'goodbye';
}) {
  const accent = accentColor || (type === 'welcome' ? '#3ecf8e' : '#80848e');
  const headerParsed  = parsePreview(headerText, guildName);
  const bodyParsed    = parsePreview(message, guildName);
  const footerParsed  = parsePreview(footerText, guildName);

  const showBanner = bannerType !== 'none';
  const bannerSrc  = bannerType === 'custom' ? bannerUrl : null; // avatar = placeholder

  return (
    <div style={{ background: '#1e1f22', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,.06)', fontFamily: '"gg sans","Noto Sans",sans-serif' }}>
      {/* channel bar */}
      <div style={{ padding: '7px 14px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#80848e', fontSize: 13 }}>#</span>
        <span style={{ fontSize: 12.5, color: '#80848e' }}>boas-vindas</span>
      </div>

      {/* bot message */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {/* Bot avatar */}
          <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#3ecf8e,#1a9e6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff' }}>L</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Laguno</span>
              <span style={{ fontSize: 10, fontWeight: 600, background: '#5865f2', color: '#fff', padding: '1px 5px', borderRadius: 3 }}>BOT</span>
              <span style={{ fontSize: 11, color: '#80848e' }}>Hoje às 10:46</span>
            </div>

            {/* Container com accent */}
            <div style={{ background: '#2b2d31', borderRadius: 8, overflow: 'hidden', borderLeft: `3px solid ${accent}`, maxWidth: 440 }}>
              {/* Banner */}
              {showBanner && (
                <div style={{ height: 110, background: bannerSrc ? `url(${bannerSrc}) center/cover` : 'linear-gradient(135deg,rgba(62,207,142,.15),rgba(26,158,107,.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                  {bannerType === 'avatar' && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#3ecf8e,#1a9e6b)', margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', border: '3px solid #2b2d31' }}>M</div>
                      <p style={{ fontSize: 10, color: '#80848e' }}>avatar do membro</p>
                    </div>
                  )}
                  {bannerType === 'custom' && !bannerUrl && (
                    <p style={{ fontSize: 12, color: '#80848e' }}>URL da imagem aqui</p>
                  )}
                </div>
              )}

              <div style={{ padding: '12px 14px' }}>
                {headerText && (
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#dbdee1', marginBottom: 6 }}
                    dangerouslySetInnerHTML={{ __html: mdToHtml(headerParsed) }} />
                )}
                {message && (
                  <p style={{ fontSize: 13.5, color: '#dbdee1', lineHeight: 1.6, margin: 0 }}
                    dangerouslySetInnerHTML={{ __html: mdToHtml(bodyParsed) }} />
                )}
                {(footerText || showAccountAge) && (
                  <p style={{ fontSize: 11, color: '#80848e', marginTop: 8, borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 8 }}>
                    {footerText ? footerParsed : 'Conta criada há 2 anos'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─── */
export function WelcomeTab({ welcome, goodbye, channels, guildName, guildId, onChange }: Props) {
  const [section, setSection] = useState<'welcome' | 'goodbye'>('welcome');
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [activeField, setActiveField] = useState<'header' | 'message' | 'footer'>('message');

  const cfg = section === 'welcome' ? welcome : goodbye;
  const w = cfg as WelcomeConfig;
  const set = (val: Partial<WelcomeConfig & GoodbyeConfig>) =>
    onChange(section, { ...cfg, ...val } as WelcomeConfig | GoodbyeConfig);

  function insertVar(tag: string) {
    if (activeField === 'header')  set({ headerText:  cfg.headerText  + tag });
    if (activeField === 'message') set({ message:     cfg.message     + tag });
    if (activeField === 'footer')  set({ footerText:  cfg.footerText  + tag });
  }

  async function sendTest() {
    if (!cfg.channelId) return;
    setTestStatus('loading');
    try {
      const body: Record<string, unknown> = {
        channelId:    cfg.channelId,
        headerText:   cfg.headerText,
        message:      cfg.message,
        footerText:   cfg.footerText,
        accentColor:  cfg.accentColor,
        type:         section,
      };
      if (section === 'welcome') {
        body.showAccountAge = w.showAccountAge;
        body.bannerType = w.bannerType;
        body.bannerUrl  = w.bannerUrl;
      }
      const res = await fetch(`/api/guilds/${guildId}/welcome/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setTestStatus(res.ok ? 'ok' : 'err');
    } catch { setTestStatus('err'); }
    setTimeout(() => setTestStatus('idle'), 3000);
  }

  return (
    <div>
      {/* Section tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['welcome', 'goodbye'] as const).map(s => (
          <button key={s} onClick={() => setSection(s)} style={{
            padding: '7px 18px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
            background: section === s ? 'var(--green)' : 'var(--card)',
            color: section === s ? '#fff' : 'var(--text-3)',
            border: `1px solid ${section === s ? 'var(--green)' : 'var(--line)'}`,
            transition: 'all .15s',
          }}>
            {s === 'welcome' ? '👋 Boas-Vindas' : '👋 Despedidas'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>

        {/* ── LEFT: Config ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Enable + canal */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>
                  {section === 'welcome' ? 'Mensagem de Boas-Vindas' : 'Mensagem de Despedida'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                  {section === 'welcome' ? 'Enviada quando um novo membro entra.' : 'Enviada quando um membro sai.'}
                </p>
              </div>
              <Toggle on={cfg.enabled} onChange={() => set({ enabled: !cfg.enabled })} />
            </div>
            {cfg.enabled && (
              <div>
                <Label>Canal</Label>
                <select style={inputStyle} value={cfg.channelId ?? ''} onChange={e => set({ channelId: e.target.value || null })}>
                  <option value="">— Seleciona um canal —</option>
                  {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                </select>
              </div>
            )}
          </div>

          {cfg.enabled && (<>

            {/* Conteúdo */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '16px 18px' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 14 }}>Conteúdo da mensagem</p>

              <div style={{ marginBottom: 12 }}>
                <Label hint="Título em negrito no topo do container (opcional)">Cabeçalho</Label>
                <input style={inputStyle} placeholder="Ex: Bem-vindo ao {server}!" value={cfg.headerText}
                  onFocus={() => setActiveField('header')}
                  onChange={e => set({ headerText: e.target.value })} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <Label hint="Corpo principal da mensagem">Mensagem</Label>
                <textarea rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  value={cfg.message}
                  onFocus={() => setActiveField('message')}
                  onChange={e => set({ message: e.target.value })} />
              </div>

              <div style={{ marginBottom: section === 'welcome' ? 12 : 0 }}>
                <Label hint="Texto pequeno no fundo do container (opcional)">Rodapé</Label>
                <input style={inputStyle} placeholder="Ex: Lê as regras em #regras" value={cfg.footerText}
                  onFocus={() => setActiveField('footer')}
                  onChange={e => set({ footerText: e.target.value })} />
              </div>

              {section === 'welcome' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Mostrar idade da conta</p>
                    <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 1 }}>Adiciona "Conta criada há X" ao rodapé</p>
                  </div>
                  <Toggle on={w.showAccountAge} onChange={() => set({ showAccountAge: !w.showAccountAge })} />
                </div>
              )}
            </div>

            {/* Banner */}
            {section === 'welcome' && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '16px 18px' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 14 }}>Banner / Imagem</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  {([
                    { value: 'none',   label: 'Sem imagem' },
                    { value: 'avatar', label: 'Avatar do membro' },
                    { value: 'custom', label: 'URL personalizado' },
                  ] as const).map(opt => (
                    <button key={opt.value} onClick={() => set({ bannerType: opt.value })} style={{
                      flex: 1, padding: '7px 4px', borderRadius: 7, fontSize: 12, cursor: 'pointer',
                      background: w.bannerType === opt.value ? 'rgba(62,207,142,.12)' : 'var(--elevated)',
                      color: w.bannerType === opt.value ? 'var(--green)' : 'var(--text-3)',
                      border: `1px solid ${w.bannerType === opt.value ? 'rgba(62,207,142,.3)' : 'var(--line)'}`,
                      transition: 'all .12s',
                    }}>{opt.label}</button>
                  ))}
                </div>
                {w.bannerType === 'custom' && (
                  <input style={inputStyle} placeholder="https://exemplo.com/banner.png" value={w.bannerUrl}
                    onChange={e => set({ bannerUrl: e.target.value })} />
                )}
              </div>
            )}

            {/* Cor de acento */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '16px 18px' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 14 }}>Cor do container</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                {ACCENT_PRESETS.map(p => (
                  <button key={p.color} onClick={() => set({ accentColor: p.color })} title={p.label} style={{
                    width: 28, height: 28, borderRadius: '50%', border: `2px solid ${cfg.accentColor === p.color ? '#fff' : 'transparent'}`,
                    background: p.color || 'var(--elevated)', cursor: 'pointer', flexShrink: 0, transition: 'border-color .12s',
                    outline: p.color === '' ? '1px dashed var(--line)' : 'none',
                  }} />
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="color" value={cfg.accentColor || '#3ecf8e'}
                  onChange={e => set({ accentColor: e.target.value })}
                  style={{ width: 34, height: 34, borderRadius: 7, border: '1px solid var(--line)', background: 'none', cursor: 'pointer', padding: 2 }} />
                <input style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 13 }}
                  placeholder="#3ecf8e" value={cfg.accentColor}
                  onChange={e => set({ accentColor: e.target.value })} />
              </div>
            </div>

          </>)}
        </div>

        {/* ── RIGHT: Preview ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'sticky', top: 20 }}>
          {cfg.enabled ? (<>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Preview</p>
              <button onClick={sendTest} disabled={!cfg.channelId || testStatus === 'loading'} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 13px',
                borderRadius: 7, fontSize: 12.5, fontWeight: 500, cursor: cfg.channelId ? 'pointer' : 'not-allowed',
                border: '1px solid var(--line)', transition: 'all .15s',
                background: testStatus === 'ok' ? 'rgba(62,207,142,.12)' : testStatus === 'err' ? 'rgba(248,113,113,.1)' : 'var(--elevated)',
                color: testStatus === 'ok' ? 'var(--green)' : testStatus === 'err' ? '#f87171' : cfg.channelId ? 'var(--text-2)' : 'var(--text-3)',
                opacity: !cfg.channelId ? .5 : 1,
              }}>
                {testStatus === 'loading' ? '...' : testStatus === 'ok' ? '✓ Enviado!' : testStatus === 'err' ? '✕ Erro' : (
                  <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    {cfg.channelId ? `Testar em #${channels.find(c => c.id === cfg.channelId)?.name}` : 'Seleciona canal'}
                  </>
                )}
              </button>
            </div>

            <DiscordPreview
              headerText={cfg.headerText}
              message={cfg.message}
              footerText={cfg.footerText}
              showAccountAge={section === 'welcome' ? w.showAccountAge : false}
              bannerType={section === 'welcome' ? w.bannerType : 'none'}
              bannerUrl={section === 'welcome' ? w.bannerUrl : ''}
              accentColor={cfg.accentColor}
              guildName={guildName}
              type={section}
            />

            {/* Variáveis */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
                Variáveis — clica para inserir em <span style={{ color: 'var(--green)' }}>{activeField === 'header' ? 'Cabeçalho' : activeField === 'footer' ? 'Rodapé' : 'Mensagem'}</span>
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {VARIABLES.map(v => (
                  <button key={v.tag} onClick={() => insertVar(v.tag)} title={v.desc} style={{
                    background: 'var(--elevated)', border: '1px solid var(--line)', borderRadius: 6,
                    padding: '3px 9px', fontSize: 12, color: 'var(--green)', cursor: 'pointer',
                    fontFamily: 'monospace', transition: 'all .1s',
                  }}>{v.tag}</button>
                ))}
              </div>
            </div>
          </>) : (
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Ativa o módulo para configurar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
