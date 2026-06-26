'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WelcomeTab } from './WelcomeTab';
import { RolesTab } from './RolesTab';

interface Channel { id: string; name: string; }
interface Warn { _id: string; userId: string; reason: string; moderatorId: string; createdAt: string; }
interface Role { id: string; name: string; color: number; }
interface AutoMod {
  antiSpam:    { enabled: boolean; maxMessages: number; interval: number; action: string };
  wordFilter:  { enabled: boolean; words: string[] };
  antiLink:    { enabled: boolean; whitelist: string[] };
  capsFilter:  { enabled: boolean; maxPercent: number; minLength: number };
  mentionSpam: { enabled: boolean; maxMentions: number; action: string };
  ignoredRoles:    string[];
  ignoredChannels: string[];
}
interface ModerationCfg {
  dmOnAction:    boolean;
  requireReason: boolean;
  appealUrl:     string;
  muteRoleId:    string | null;
}
interface WarnsCfg {
  autoAction: { enabled: boolean; threshold: number; action: string; duration: string };
  expiryDays: number;
}
interface WelcomeConfig { enabled: boolean; channelId: string | null; headerText: string; message: string; footerText: string; showAccountAge: boolean; bannerType: 'none'|'avatar'|'custom'; bannerUrl: string; accentColor: string; }
interface GoodbyeConfig { enabled: boolean; channelId: string | null; headerText: string; message: string; footerText: string; accentColor: string; }
interface RoleEntry   { roleId: string; label: string; emoji: string; }
interface RolePanel   { id: string; title: string; description: string; roles: RoleEntry[]; }
interface LogCategory {
  channelId: string | null;
  events: Record<string, boolean>;
}
interface LogsConfig {
  moderation: LogCategory;
  messages:   LogCategory;
  members:    LogCategory;
  channels:   LogCategory;
  roles:      LogCategory;
  voice:      LogCategory;
  server:     LogCategory;
}
interface Config {
  logChannelId: string | null;
  moderation: ModerationCfg;
  warns: WarnsCfg;
  autoMod: AutoMod;
  welcome: WelcomeConfig; goodbye: GoodbyeConfig;
  autoroles: string[]; rolePanels: RolePanel[];
  logs: LogsConfig;
}

const DEFAULT_AUTOMOD: AutoMod = {
  antiSpam:    { enabled: false, maxMessages: 5, interval: 5, action: 'timeout' },
  wordFilter:  { enabled: false, words: [] },
  antiLink:    { enabled: false, whitelist: [] },
  capsFilter:  { enabled: false, maxPercent: 70, minLength: 10 },
  mentionSpam: { enabled: false, maxMentions: 5, action: 'delete' },
  ignoredRoles: [], ignoredChannels: [],
};
const DEFAULT_MOD: ModerationCfg = { dmOnAction: true, requireReason: false, appealUrl: '', muteRoleId: null };
const DEFAULT_WARNS: WarnsCfg = { autoAction: { enabled: false, threshold: 3, action: 'timeout', duration: '1d' }, expiryDays: 0 };
const DEFAULT_LOG_CAT = (events: string[]): LogCategory => ({
  channelId: null,
  events: Object.fromEntries(events.map(e => [e, true])),
});
const LOG_CATEGORIES: { id: keyof LogsConfig; label: string; icon: string; events: { id: string; label: string; desc: string }[] }[] = [
  {
    id: 'moderation', label: 'Moderação', icon: '🛡️',
    events: [
      { id: 'purge',          label: 'Purge',            desc: 'Mensagens apagadas em bulk.' },
      { id: 'ban',            label: 'Ban',              desc: 'Utilizador banido do servidor.' },
      { id: 'unban',          label: 'Unban',            desc: 'Ban de utilizador levantado.' },
      { id: 'kick',           label: 'Kick',             desc: 'Utilizador expulso do servidor.' },
      { id: 'warn',           label: 'Warn',             desc: 'Aviso emitido a um membro.' },
      { id: 'warnRemove',     label: 'Warn removido',    desc: 'Aviso apagado do histórico.' },
      { id: 'timeout',        label: 'Timeout',          desc: 'Timeout aplicado a um membro.' },
      { id: 'timeoutRemove',  label: 'Timeout removido', desc: 'Timeout de um membro levantado.' },
    ],
  },
  {
    id: 'messages', label: 'Mensagens', icon: '💬',
    events: [
      { id: 'messageDelete',  label: 'Mensagem eliminada', desc: 'Conteúdo da mensagem apagada.' },
      { id: 'messageEdit',    label: 'Mensagem editada',   desc: 'Antes e depois da edição.' },
      { id: 'messageBulk',    label: 'Bulk delete',        desc: 'Limpeza em massa de mensagens.' },
      { id: 'messagePinned',  label: 'Mensagem fixada',    desc: 'Mensagem marcada como pin.' },
    ],
  },
  {
    id: 'members', label: 'Membros', icon: '👥',
    events: [
      { id: 'memberJoin',     label: 'Entrada',           desc: 'Novo membro entrou no servidor.' },
      { id: 'memberLeave',    label: 'Saída',             desc: 'Membro saiu ou foi expulso.' },
      { id: 'memberUpdate',   label: 'Atualização',       desc: 'Nick ou avatar alterado.' },
      { id: 'memberBoost',    label: 'Boost',             desc: 'Membro deu boost ao servidor.' },
      { id: 'memberBoostEnd', label: 'Boost terminado',   desc: 'Boost de um membro expirou.' },
    ],
  },
  {
    id: 'channels', label: 'Canais', icon: '#️⃣',
    events: [
      { id: 'channelCreate',  label: 'Canal criado',      desc: 'Novo canal de texto ou voz.' },
      { id: 'channelDelete',  label: 'Canal eliminado',   desc: 'Canal apagado do servidor.' },
      { id: 'channelEdit',    label: 'Canal editado',     desc: 'Nome, tópico ou permissões alterados.' },
    ],
  },
  {
    id: 'roles', label: 'Cargos', icon: '🏷️',
    events: [
      { id: 'roleCreate',     label: 'Cargo criado',      desc: 'Novo cargo adicionado.' },
      { id: 'roleDelete',     label: 'Cargo eliminado',   desc: 'Cargo removido do servidor.' },
      { id: 'roleEdit',       label: 'Cargo editado',     desc: 'Nome, cor ou permissões alterados.' },
      { id: 'roleAdd',        label: 'Cargo atribuído',   desc: 'Cargo dado a um membro.' },
      { id: 'roleRemove',     label: 'Cargo removido',    desc: 'Cargo tirado a um membro.' },
    ],
  },
  {
    id: 'voice', label: 'Voz', icon: '🔊',
    events: [
      { id: 'voiceJoin',      label: 'Entrou em voz',     desc: 'Membro entrou num canal de voz.' },
      { id: 'voiceLeave',     label: 'Saiu de voz',       desc: 'Membro saiu de canal de voz.' },
      { id: 'voiceMove',      label: 'Movido',            desc: 'Membro movido entre canais de voz.' },
      { id: 'voiceMute',      label: 'Mutado/Unmutado',   desc: 'Estado de mute de servidor alterado.' },
    ],
  },
  {
    id: 'server', label: 'Servidor', icon: '⚙️',
    events: [
      { id: 'serverEdit',     label: 'Servidor editado',  desc: 'Nome, ícone ou região alterados.' },
      { id: 'emojiCreate',    label: 'Emoji criado',      desc: 'Novo emoji adicionado.' },
      { id: 'emojiDelete',    label: 'Emoji eliminado',   desc: 'Emoji removido do servidor.' },
      { id: 'inviteCreate',   label: 'Invite criado',     desc: 'Novo link de convite gerado.' },
      { id: 'inviteDelete',   label: 'Invite eliminado',  desc: 'Link de convite removido.' },
      { id: 'stickerCreate',  label: 'Sticker criado',    desc: 'Novo sticker adicionado.' },
      { id: 'stickerDelete',  label: 'Sticker eliminado', desc: 'Sticker removido do servidor.' },
    ],
  },
];
const DEFAULT_LOGS: LogsConfig = Object.fromEntries(
  LOG_CATEGORIES.map(cat => [cat.id, DEFAULT_LOG_CAT(cat.events.map(e => e.id))])
) as unknown as LogsConfig;

const DEFAULT_WELCOME: WelcomeConfig = { enabled: false, channelId: null, headerText: 'Bem-vindo(a) ao {server}! 👋', message: 'Olá {user}, estamos felizes por teres chegado!\nDá uma vista de olhos às regras e apresenta-te à comunidade.', footerText: 'Membro nº {count}', showAccountAge: true, bannerType: 'avatar', bannerUrl: '', accentColor: '#3ecf8e' };
const DEFAULT_GOODBYE: GoodbyeConfig = { enabled: false, channelId: null, headerText: '', message: '**{displayname}** saiu do servidor. Ficamos agora **{count}** membros.', footerText: '', accentColor: '#80848e' };

/* ── Icons ── */
const IconGrid    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const IconShield  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconBolt    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconUsers   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconTag     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/></svg>;
const IconFile    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IconWarn    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconSettings= () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 0-14.14 0M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m0 18a9 9 0 0 1-9-9m9 9v-2M3 12a9 9 0 0 1 9-9m-9 9h2"/></svg>;
const IconChevron = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IconCheck   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

/* ── Sidebar nav structure ── */
const NAV = [
  {
    section: 'GERAL',
    items: [
      { id: 'overview',   label: 'Overview',          icon: <IconGrid /> },
      { id: 'settings',   label: 'Configurações',     icon: <IconSettings /> },
    ],
  },
  {
    section: 'MÓDULOS',
    items: [
      { id: 'welcome',    label: 'Boas-Vindas',       icon: <IconUsers /> },
      { id: 'roles',      label: 'Roles & Painéis',   icon: <IconTag /> },
    ],
  },
  {
    section: 'MODERAÇÃO',
    items: [
      { id: 'moderation', label: 'Moderação',         icon: <IconShield /> },
      { id: 'automod',    label: 'Auto-Mod',          icon: <IconBolt /> },
      { id: 'warns',      label: 'Avisos',            icon: <IconWarn /> },
    ],
  },
  {
    section: 'ADMINISTRAÇÃO',
    items: [
      { id: 'logs',       label: 'Logs',              icon: <IconFile /> },
    ],
  },
];

/* ── Overview cards ── */
const OVERVIEW_CARDS = [
  { id: 'settings',   label: 'Configurações',  desc: 'Canal de logs e configuração geral.',                              icon: <IconSettings /> },
  { id: 'logs',       label: 'Logs',           desc: '7 categorias de eventos — mensagens, membros, voz e mais.',        icon: <IconFile /> },
  { id: 'moderation', label: 'Moderação',      desc: '/ban, /kick, /warn, /timeout — controlo total do servidor.',       icon: <IconShield /> },
  { id: 'automod',    label: 'Auto-Moderação', desc: 'Anti-spam, filtro de palavras e bloqueio de links.',               icon: <IconBolt /> },
  { id: 'welcome',    label: 'Boas-Vindas',    desc: 'Mensagem de entrada e saída com variáveis dinâmicas.',             icon: <IconUsers /> },
  { id: 'roles',      label: 'Roles & Painéis',desc: 'Auto-roles na entrada e painéis de cargos com botões.',            icon: <IconTag /> },
  { id: 'warns',      label: 'Avisos',         desc: 'Histórico de warns emitidos neste servidor.',                      icon: <IconWarn /> },
];

/* ── Helpers ── */
function mergeDeep(base: Record<string, unknown>, override: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const k of Object.keys(override)) {
    if (override[k] && typeof override[k] === 'object' && !Array.isArray(override[k]) && base[k] && typeof base[k] === 'object') {
      out[k] = mergeDeep(base[k] as Record<string, unknown>, override[k] as Record<string, unknown>);
    } else if (override[k] !== undefined) {
      out[k] = override[k];
    }
  }
  return out;
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{
      width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
      background: on ? 'var(--green)' : 'var(--elevated)',
      position: 'relative', transition: 'background 0.2s',
      flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 3, left: on ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', display: 'block', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 5, lineHeight: 1.5 }}>{hint}</p>}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: '22px 24px', marginBottom: 12 }}>
      <div style={{ marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--line)' }}>
        <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</p>
        {subtitle && <p style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 3, lineHeight: 1.5 }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--line)', gap: 16 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</p>
        {desc && <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2, lineHeight: 1.5 }}>{desc}</p>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--line)',
  borderRadius: 7, padding: '8px 12px',
  color: 'var(--text-1)', fontSize: 13.5,
  width: '100%', outline: 'none',
};

/* ── Main component ── */
export function GuildSettings({ guildId, guildName = 'Servidor', initialTab = 'overview' }: {
  guildId: string; guildName?: string; initialTab?: string;
}) {
  const [config, setConfig] = useState<Config>({
    logChannelId: null,
    moderation: DEFAULT_MOD,
    warns: DEFAULT_WARNS,
    autoMod: DEFAULT_AUTOMOD,
    welcome: DEFAULT_WELCOME, goodbye: DEFAULT_GOODBYE, autoroles: [], rolePanels: [], logs: DEFAULT_LOGS,
  });
  const [channels, setChannels]   = useState<Channel[]>([]);
  const [roles, setRoles]         = useState<Role[]>([]);
  const [warns, setWarns]         = useState<Warn[]>([]);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [newWord, setNewWord]     = useState('');
  const [newDomain, setNewDomain] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const active = searchParams.get('tab') ?? initialTab;
  const setActive = (tab: string) => router.push(`?tab=${tab}`, { scroll: false });
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const safe = (p: Promise<unknown>, fallback: unknown) => p.catch(() => fallback);

    Promise.all([
      safe(fetch(`/api/guilds/${guildId}/config`).then(r => r.ok ? r.json() : null), null),
      safe(fetch(`/api/guilds/${guildId}/channels`).then(r => r.ok ? r.json() : []), []),
      safe(fetch(`/api/guilds/${guildId}/roles`).then(r => r.ok ? r.json() : []), []),
      safe(fetch(`/api/guilds/${guildId}/warns`).then(r => r.ok ? r.json() : []), []),
    ]).then(([cfg, ch, ro, wa]) => {
      if (cfg) setConfig(c => ({
        ...c, ...(cfg as object),
        moderation:  { ...DEFAULT_MOD,     ...(cfg as Config).moderation },
        warns:       { ...DEFAULT_WARNS,   ...(cfg as Config).warns, autoAction: { ...DEFAULT_WARNS.autoAction, ...(cfg as Config).warns?.autoAction } },
        autoMod:     { ...DEFAULT_AUTOMOD, ...(cfg as Config).autoMod, capsFilter: { ...DEFAULT_AUTOMOD.capsFilter, ...(cfg as Config).autoMod?.capsFilter }, mentionSpam: { ...DEFAULT_AUTOMOD.mentionSpam, ...(cfg as Config).autoMod?.mentionSpam } },
        welcome:     { ...DEFAULT_WELCOME, ...(cfg as Config).welcome } as WelcomeConfig,
        goodbye:     { ...DEFAULT_GOODBYE, ...(cfg as Config).goodbye } as GoodbyeConfig,
        logs:        mergeDeep(DEFAULT_LOGS as unknown as Record<string, unknown>, ((cfg as Config).logs as unknown as Record<string, unknown>) ?? {}) as unknown as LogsConfig,
      }));
      setChannels((ch as Channel[]) ?? []);
      setRoles((ro as Role[]) ?? []);
      setWarns((wa as Warn[]) ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [guildId]);

  async function save() {
    setSaving(true);
    await fetch(`/api/guilds/${guildId}/config`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function setAMSub<K extends keyof AutoMod>(key: K, sub: Partial<AutoMod[K]>) {
    setConfig(c => ({ ...c, autoMod: { ...c.autoMod, [key]: { ...(c.autoMod[key] as object), ...sub } } }));
  }
  function setAM<K extends keyof AutoMod>(key: K, value: AutoMod[K]) {
    setConfig(c => ({ ...c, autoMod: { ...c.autoMod, [key]: value } }));
  }
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1,2,3].map(i => <div key={i} className="skel" style={{ height: 120, borderRadius: 10 }} />)}
      </div>
    );
  }


  return (
    <div style={{ position: 'relative' }}>
      {active !== 'overview' && (
        <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}>
          <button className="btn btn-primary" onClick={save} disabled={saving} style={{ fontSize: 13 }}>
            {saving ? 'A guardar...' : saved ? 'Guardado!' : 'Guardar alterações'}
          </button>
        </div>
      )}

        {/* OVERVIEW */}
        {active === 'overview' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 4 }}>Visão Geral</h2>
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Todas as funcionalidades do Laguno neste servidor.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 10 }}>
              {OVERVIEW_CARDS.map(card => (
                <OverviewCard key={card.id} card={card} enabled={true} onVisit={() => setActive(card.id)} />
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {active === 'settings' && (
          <div>
            <Section title="Estatísticas do servidor">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {[
                  { label: 'Auto-roles', value: config.autoroles.length },
                  { label: 'Role panels', value: config.rolePanels.length },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, padding: '14px 16px' }}>
                    <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>{s.value}</p>
                    <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* MODERATION */}
        {active === 'moderation' && (
          <div>
            <Section title="Comportamento" subtitle="Como o Laguno age quando uma ação de moderação é executada.">
              <Row label="DM ao utilizador" desc="Envia uma mensagem privada ao membro quando é moderado (ban, kick, warn, timeout).">
                <Toggle on={config.moderation.dmOnAction} onChange={() => setConfig(c => ({ ...c, moderation: { ...c.moderation, dmOnAction: !c.moderation.dmOnAction } }))} />
              </Row>
              <Row label="Motivo obrigatório" desc="Os moderadores são obrigados a especificar um motivo em todas as ações.">
                <Toggle on={config.moderation.requireReason} onChange={() => setConfig(c => ({ ...c, moderation: { ...c.moderation, requireReason: !c.moderation.requireReason } }))} />
              </Row>
              <div style={{ paddingTop: 12 }}>
                <Field label="URL de apelos" hint="Incluído na DM de ban — onde o utilizador pode contestar.">
                  <input style={inputStyle} placeholder="https://forms.gle/..." value={config.moderation.appealUrl}
                    onChange={e => setConfig(c => ({ ...c, moderation: { ...c.moderation, appealUrl: e.target.value } }))} />
                </Field>
              </div>
            </Section>

            <Section title="Cargo de Mute" subtitle="Cargo atribuído como alternativa ao Discord Timeout (para servidores com canais privados).">
              <Field label="Cargo de mute">
                <select style={inputStyle} value={config.moderation.muteRoleId ?? ''}
                  onChange={e => setConfig(c => ({ ...c, moderation: { ...c.moderation, muteRoleId: e.target.value || null } }))}>
                  <option value="">— Usar Discord Timeout (padrão) —</option>
                  {roles.map(r => <option key={r.id} value={r.id}>@{r.name}</option>)}
                </select>
              </Field>
            </Section>

            <Section title="Canal de Logs" subtitle="Regista ações de moderação neste canal (complementar ao módulo Logs).">
              <Field label="Canal">
                <select style={inputStyle} value={config.logChannelId ?? ''}
                  onChange={e => setConfig(c => ({ ...c, logChannelId: e.target.value || null }))}>
                  <option value="">— Desativado —</option>
                  {channels.map(ch => <option key={ch.id} value={ch.id}>#{ch.name}</option>)}
                </select>
              </Field>
            </Section>
          </div>
        )}

        {/* AUTO-MOD */}
        {active === 'automod' && (
          <div>
            <Section title="Anti-Spam" subtitle="Pune utilizadores que enviam mensagens em excesso.">
              <Row label="Ativar Anti-Spam" desc="Deteta rajadas de mensagens e aplica a ação configurada.">
                <Toggle on={config.autoMod.antiSpam.enabled} onChange={() => setAMSub('antiSpam', { enabled: !config.autoMod.antiSpam.enabled })} />
              </Row>
              {config.autoMod.antiSpam.enabled && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 16 }}>
                  <Field label="Máx. mensagens">
                    <input type="number" min={2} max={20} style={inputStyle} value={config.autoMod.antiSpam.maxMessages}
                      onChange={e => setAMSub('antiSpam', { maxMessages: parseInt(e.target.value) || 5 })} />
                  </Field>
                  <Field label="Intervalo (seg)">
                    <input type="number" min={2} max={30} style={inputStyle} value={config.autoMod.antiSpam.interval}
                      onChange={e => setAMSub('antiSpam', { interval: parseInt(e.target.value) || 5 })} />
                  </Field>
                  <Field label="Ação">
                    <select style={inputStyle} value={config.autoMod.antiSpam.action}
                      onChange={e => setAMSub('antiSpam', { action: e.target.value })}>
                      <option value="delete">Apagar mensagem</option>
                      <option value="timeout">Timeout (5 min)</option>
                      <option value="kick">Kick</option>
                      <option value="ban">Ban</option>
                    </select>
                  </Field>
                </div>
              )}
            </Section>

            <Section title="Filtro de Palavras" subtitle="Apaga automaticamente mensagens com palavras proibidas.">
              <Row label="Ativar filtro" desc="Remove mensagens assim que são enviadas.">
                <Toggle on={config.autoMod.wordFilter.enabled} onChange={() => setAMSub('wordFilter', { enabled: !config.autoMod.wordFilter.enabled })} />
              </Row>
              {config.autoMod.wordFilter.enabled && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <input style={{ ...inputStyle, flex: 1 }} placeholder="palavra proibida"
                      value={newWord} onChange={e => setNewWord(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && newWord.trim()) { setAMSub('wordFilter', { words: [...config.autoMod.wordFilter.words, newWord.trim().toLowerCase()] }); setNewWord(''); } }} />
                    <button className="btn btn-primary" onClick={() => { if (!newWord.trim()) return; setAMSub('wordFilter', { words: [...config.autoMod.wordFilter.words, newWord.trim().toLowerCase()] }); setNewWord(''); }}>Adicionar</button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {config.autoMod.wordFilter.words.length === 0
                      ? <p style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Nenhuma palavra adicionada.</p>
                      : config.autoMod.wordFilter.words.map(w => (
                        <span key={w} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 20, padding: '4px 10px 4px 12px', fontSize: 12.5, color: '#f87171' }}>
                          {w}
                          <button onClick={() => setAMSub('wordFilter', { words: config.autoMod.wordFilter.words.filter(x => x !== w) })}
                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>✕</button>
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </Section>

            <Section title="Anti-Link" subtitle="Bloqueia links externos, exceto os domínios na whitelist.">
              <Row label="Ativar Anti-Link" desc="Apaga mensagens que contenham URLs.">
                <Toggle on={config.autoMod.antiLink.enabled} onChange={() => setAMSub('antiLink', { enabled: !config.autoMod.antiLink.enabled })} />
              </Row>
              {config.autoMod.antiLink.enabled && (
                <div style={{ marginTop: 16 }}>
                  <Field label="Domínios permitidos" hint="ex: youtube.com, twitch.tv">
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                      <input style={{ ...inputStyle, flex: 1 }} placeholder="dominio.com" value={newDomain}
                        onChange={e => setNewDomain(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && newDomain.trim()) { setAMSub('antiLink', { whitelist: [...config.autoMod.antiLink.whitelist, newDomain.trim().toLowerCase()] }); setNewDomain(''); } }} />
                      <button className="btn btn-ghost" onClick={() => { if (!newDomain.trim()) return; setAMSub('antiLink', { whitelist: [...config.autoMod.antiLink.whitelist, newDomain.trim().toLowerCase()] }); setNewDomain(''); }}>Permitir</button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {config.autoMod.antiLink.whitelist.length === 0
                        ? <p style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Todos os links são bloqueados.</p>
                        : config.autoMod.antiLink.whitelist.map(d => (
                          <span key={d} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--green-muted)', border: '1px solid var(--green-border)', borderRadius: 20, padding: '4px 10px 4px 12px', fontSize: 12.5, color: 'var(--green)' }}>
                            {d}
                            <button onClick={() => setAMSub('antiLink', { whitelist: config.autoMod.antiLink.whitelist.filter(x => x !== d) })}
                              style={{ background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>✕</button>
                          </span>
                        ))}
                    </div>
                  </Field>
                </div>
              )}
            </Section>

            <Section title="Filtro de CAPS" subtitle="Remove mensagens com excesso de letras maiúsculas.">
              <Row label="Ativar filtro de CAPS" desc="Apaga mensagens onde as maiúsculas ultrapassam o limite configurado.">
                <Toggle on={config.autoMod.capsFilter.enabled} onChange={() => setAMSub('capsFilter', { enabled: !config.autoMod.capsFilter.enabled })} />
              </Row>
              {config.autoMod.capsFilter.enabled && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                  <Field label="% máxima de maiúsculas" hint="Padrão: 70%">
                    <input type="number" min={30} max={100} style={inputStyle} value={config.autoMod.capsFilter.maxPercent}
                      onChange={e => setAMSub('capsFilter', { maxPercent: parseInt(e.target.value) || 70 })} />
                  </Field>
                  <Field label="Tamanho mínimo da mensagem" hint="Ignora mensagens curtas">
                    <input type="number" min={5} max={50} style={inputStyle} value={config.autoMod.capsFilter.minLength}
                      onChange={e => setAMSub('capsFilter', { minLength: parseInt(e.target.value) || 10 })} />
                  </Field>
                </div>
              )}
            </Section>

            <Section title="Anti-Menções" subtitle="Pune utilizadores que mencionam demasiados utilizadores ou cargos numa mensagem.">
              <Row label="Ativar Anti-Menções" desc="Apaga mensagens com demasiadas menções.">
                <Toggle on={config.autoMod.mentionSpam.enabled} onChange={() => setAMSub('mentionSpam', { enabled: !config.autoMod.mentionSpam.enabled })} />
              </Row>
              {config.autoMod.mentionSpam.enabled && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                  <Field label="Máx. menções por mensagem">
                    <input type="number" min={2} max={20} style={inputStyle} value={config.autoMod.mentionSpam.maxMentions}
                      onChange={e => setAMSub('mentionSpam', { maxMentions: parseInt(e.target.value) || 5 })} />
                  </Field>
                  <Field label="Ação">
                    <select style={inputStyle} value={config.autoMod.mentionSpam.action}
                      onChange={e => setAMSub('mentionSpam', { action: e.target.value })}>
                      <option value="delete">Apagar mensagem</option>
                      <option value="timeout">Timeout (10 min)</option>
                      <option value="kick">Kick</option>
                      <option value="ban">Ban</option>
                    </select>
                  </Field>
                </div>
              )}
            </Section>

            <Section title="Exceções">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Canais ignorados" hint="O auto-mod não atua nestes canais.">
                  <select style={inputStyle} onChange={e => { if (!e.target.value || config.autoMod.ignoredChannels.includes(e.target.value)) return; setAM('ignoredChannels', [...config.autoMod.ignoredChannels, e.target.value]); e.target.value = ''; }}>
                    <option value="">+ Adicionar canal...</option>
                    {channels.filter(c => !config.autoMod.ignoredChannels.includes(c.id)).map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                  </select>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {config.autoMod.ignoredChannels.map(id => (
                      <span key={id} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 20, padding: '3px 10px', fontSize: 12 }}>
                        #{channels.find(c => c.id === id)?.name ?? id}
                        <button onClick={() => setAM('ignoredChannels', config.autoMod.ignoredChannels.filter(x => x !== id))} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 12, padding: 0 }}>✕</button>
                      </span>
                    ))}
                  </div>
                </Field>
                <Field label="Roles imunes" hint="Membros com estes cargos ignoram o auto-mod.">
                  <select style={inputStyle} onChange={e => { if (!e.target.value || config.autoMod.ignoredRoles.includes(e.target.value)) return; setAM('ignoredRoles', [...config.autoMod.ignoredRoles, e.target.value]); e.target.value = ''; }}>
                    <option value="">+ Adicionar role...</option>
                    {roles.filter(r => !config.autoMod.ignoredRoles.includes(r.id)).map(r => <option key={r.id} value={r.id}>@{r.name}</option>)}
                  </select>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {config.autoMod.ignoredRoles.map(id => (
                      <span key={id} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 20, padding: '3px 10px', fontSize: 12 }}>
                        @{roles.find(r => r.id === id)?.name ?? id}
                        <button onClick={() => setAM('ignoredRoles', config.autoMod.ignoredRoles.filter(x => x !== id))} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 12, padding: 0 }}>✕</button>
                      </span>
                    ))}
                  </div>
                </Field>
              </div>
            </Section>
          </div>
        )}

        {/* BOAS-VINDAS */}
        {active === 'welcome' && (
          <WelcomeTab welcome={config.welcome} goodbye={config.goodbye} channels={channels} guildName={guildName} guildId={guildId}
            onChange={(key, val) => setConfig(c => ({ ...c, [key]: val }))} />
        )}

        {/* ROLES */}
        {active === 'roles' && (
          <RolesTab autoroles={config.autoroles} rolePanels={config.rolePanels} roles={roles}
            onChange={(key, val) => setConfig(c => ({ ...c, [key]: val }))} />
        )}


        {/* LOGS */}
        {active === 'logs' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 4 }}>Logs</h2>
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Configura um canal por categoria e ativa os eventos que queres registar.</p>
            </div>

            {LOG_CATEGORIES.map(cat => {
              const catCfg = config.logs[cat.id];
              const activeCount = Object.values(catCfg.events).filter(Boolean).length;
              const totalCount = cat.events.length;
              return (
                <div key={cat.id} style={{ marginBottom: 12, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
                  {/* Category header */}
                  <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}>
                    <span style={{ fontSize: 16 }}>{cat.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>{cat.label}</p>
                      <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 1 }}>
                        {activeCount === 0 ? 'Nenhum evento ativo' : `${activeCount} de ${totalCount} eventos ativos`}
                      </p>
                    </div>
                    {/* Channel selector */}
                    <select style={{ ...inputStyle, width: 180, fontSize: 12.5, padding: '5px 10px' }}
                      value={catCfg.channelId ?? ''}
                      onChange={e => setConfig(c => ({ ...c, logs: { ...c.logs, [cat.id]: { ...c.logs[cat.id], channelId: e.target.value || null } } }))}>
                      <option value="">— Sem canal —</option>
                      {channels.map(ch => <option key={ch.id} value={ch.id}>#{ch.name}</option>)}
                    </select>
                    {/* Enable all toggle */}
                    <button onClick={() => {
                      const allOn = Object.values(catCfg.events).every(Boolean);
                      setConfig(c => ({ ...c, logs: { ...c.logs, [cat.id]: { ...c.logs[cat.id], events: Object.fromEntries(cat.events.map(e => [e.id, !allOn])) } } }));
                    }} style={{
                      fontSize: 11.5, fontWeight: 500, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--line)',
                      background: 'transparent', color: 'var(--text-3)', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .12s',
                    }}>
                      {Object.values(catCfg.events).every(Boolean) ? 'Desativar todos' : 'Ativar todos'}
                    </button>
                  </div>

                  {/* Events grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                    {cat.events.map((ev, i) => {
                      const on = catCfg.events[ev.id] ?? false;
                      return (
                        <div key={ev.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '11px 18px', gap: 12,
                          borderBottom: i < cat.events.length - (cat.events.length % 2 === 0 ? 2 : 1) ? '1px solid var(--line)' : 'none',
                          borderRight: i % 2 === 0 ? '1px solid var(--line)' : 'none',
                        }}>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 500, color: on ? 'var(--text-1)' : 'var(--text-2)' }}>{ev.label}</p>
                            <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 1, lineHeight: 1.4 }}>{ev.desc}</p>
                          </div>
                          <Toggle on={on} onChange={() => setConfig(c => ({ ...c, logs: { ...c.logs, [cat.id]: { ...c.logs[cat.id], events: { ...c.logs[cat.id].events, [ev.id]: !on } } } }))} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* AVISOS */}
        {active === 'warns' && (
          <div>
            <Section title="Auto-Ação" subtitle="Aplica automaticamente uma punição quando um membro atinge X avisos.">
              <Row label="Ativar auto-ação" desc="Quando ativado, o Laguno aplica a punição configurada ao atingir o limite.">
                <Toggle on={config.warns.autoAction.enabled} onChange={() => setConfig(c => ({ ...c, warns: { ...c.warns, autoAction: { ...c.warns.autoAction, enabled: !c.warns.autoAction.enabled } } }))} />
              </Row>
              {config.warns.autoAction.enabled && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 16 }}>
                  <Field label="Nº de avisos" hint="Ao atingir este número">
                    <input type="number" min={2} max={20} style={inputStyle} value={config.warns.autoAction.threshold}
                      onChange={e => setConfig(c => ({ ...c, warns: { ...c.warns, autoAction: { ...c.warns.autoAction, threshold: parseInt(e.target.value) || 3 } } }))} />
                  </Field>
                  <Field label="Ação">
                    <select style={inputStyle} value={config.warns.autoAction.action}
                      onChange={e => setConfig(c => ({ ...c, warns: { ...c.warns, autoAction: { ...c.warns.autoAction, action: e.target.value } } }))}>
                      <option value="timeout">Timeout</option>
                      <option value="kick">Kick</option>
                      <option value="ban">Ban</option>
                    </select>
                  </Field>
                  {config.warns.autoAction.action === 'timeout' && (
                    <Field label="Duração do timeout">
                      <select style={inputStyle} value={config.warns.autoAction.duration}
                        onChange={e => setConfig(c => ({ ...c, warns: { ...c.warns, autoAction: { ...c.warns.autoAction, duration: e.target.value } } }))}>
                        <option value="30m">30 minutos</option>
                        <option value="1h">1 hora</option>
                        <option value="6h">6 horas</option>
                        <option value="12h">12 horas</option>
                        <option value="1d">1 dia</option>
                        <option value="3d">3 dias</option>
                        <option value="7d">7 dias</option>
                      </select>
                    </Field>
                  )}
                </div>
              )}
            </Section>

            <Section title="Expiração de Avisos" subtitle="Avisos antigos são ignorados pelo auto-mod após o prazo definido.">
              <Field label="Expirar avisos após" hint="0 = nunca expiram">
                <select style={inputStyle} value={config.warns.expiryDays}
                  onChange={e => setConfig(c => ({ ...c, warns: { ...c.warns, expiryDays: parseInt(e.target.value) } }))}>
                  <option value={0}>Nunca expirar</option>
                  <option value={7}>7 dias</option>
                  <option value={14}>14 dias</option>
                  <option value={30}>30 dias</option>
                  <option value={60}>60 dias</option>
                  <option value={90}>90 dias</option>
                </select>
              </Field>
            </Section>

            <Section title={`Histórico de Avisos · ${warns.length}`} subtitle="Todos os avisos registados neste servidor.">
              {warns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <p style={{ fontSize: 13.5, color: 'var(--text-2)', fontWeight: 500, marginBottom: 4 }}>Nenhum aviso registado</p>
                  <p style={{ fontSize: 12.5, color: 'var(--text-3)' }}>O servidor está em paz.</p>
                </div>
              ) : warns.map((w, i, a) => (
                <div key={w._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: i < a.length - 1 ? '1px solid var(--line)' : 'none', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', background: 'rgba(248,113,113,0.10)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', padding: '2px 8px', borderRadius: 5 }}>
                        @{w.userId}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                        {new Date(w.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: 13.5, color: 'var(--text-1)', marginBottom: 2 }}>{w.reason}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-3)' }}>por {w.moderatorId}</p>
                  </div>
                  <button onClick={async () => { await fetch(`/api/guilds/${guildId}/warns/${w._id}`, { method: 'DELETE' }); setWarns(ws => ws.filter(x => x._id !== w._id)); }}
                    style={{ background: 'none', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 7, color: '#f87171', cursor: 'pointer', padding: '5px 11px', fontSize: 12, flexShrink: 0, transition: 'all .12s' }}>
                    Remover
                  </button>
                </div>
              ))}
            </Section>
          </div>
        )}

    </div>
  );
}

/* ── Overview card component ── */
function OverviewCard({ card, enabled, onVisit }: {
  card: { id: string; label: string; desc: string; icon: React.ReactNode };
  enabled: boolean;
  onVisit: () => void;
}) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12,
      padding: '22px 20px 18px', display: 'flex', flexDirection: 'column',
      transition: 'border-color .15s, box-shadow .15s', cursor: 'default',
    }}
      onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = 'rgba(62,207,142,.25)'; d.style.boxShadow = '0 0 0 1px rgba(62,207,142,.08)'; }}
      onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = 'var(--line)'; d.style.boxShadow = 'none'; }}
    >
      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 11,
        background: 'var(--elevated)', border: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--green)', flexShrink: 0, marginBottom: 16,
      }}>
        {card.icon}
      </div>

      {/* Text */}
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 6, letterSpacing: '-.01em' }}>{card.label}</p>
      <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.7, flex: 1, marginBottom: 18 }}>{card.desc}</p>

      {/* Visit button */}
      <button onClick={onVisit} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        width: '100%', padding: '8px 0', borderRadius: 8,
        background: 'var(--elevated)', border: '1px solid var(--line)',
        color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
        transition: 'all .15s',
      }}
        onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'rgba(62,207,142,.1)'; b.style.color = 'var(--green)'; b.style.borderColor = 'rgba(62,207,142,.3)'; }}
        onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'var(--elevated)'; b.style.color = 'var(--text-2)'; b.style.borderColor = 'var(--line)'; }}
      >
        Visitar
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  );
}
