'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WelcomeTab } from './WelcomeTab';
import { RolesTab } from './RolesTab';
import { GiveawayModule } from './modules/GiveawayModule';
import { MessageBuilderTab } from './MessageBuilderTab';
import { WORD_TEMPLATE_WORDS } from '@/lib/wordTemplates';

interface Channel { id: string; name: string; }
interface Warn { _id: string; userId: string; reason: string; moderatorId: string; createdAt: string; }
interface Role { id: string; name: string; color: number; }
interface AutoMod {
  antiSpam:      { enabled: boolean; maxMessages: number; interval: number; action: string };
  wordFilter:    { enabled: boolean; words: string[] };
  antiLink:      { enabled: boolean; whitelist: string[] };
  capsFilter:    { enabled: boolean; maxPercent: number; minLength: number };
  mentionSpam:   { enabled: boolean; maxMentions: number; action: string };
  keywordPreset: { enabled: boolean };
  memberProfile: { enabled: boolean; words: string[] };
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
interface WelcomeConfig { enabled: boolean; channelId: string | null; message: string; deleteAfter: number; accentColor: string; dmEnabled: boolean; dmMessage: string; }
interface GoodbyeConfig { enabled: boolean; channelId: string | null; message: string; deleteAfter: number; accentColor: string; banMessageEnabled: boolean; banMessage: string; }
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

/* ── Filtro de palavras: templates e lista por defeito ── */
const WORD_TEMPLATES: { id: string; label: string; desc: string; words: string[] }[] = [
  { id: 'pt_basico',     label: 'Português — Básico',   desc: 'Palavrões comuns em português.',               words: [...WORD_TEMPLATE_WORDS.pt_basico] },
  { id: 'pt_insultos',   label: 'Português — Insultos', desc: 'Insultos e ofensas em português.',              words: [...WORD_TEMPLATE_WORDS.pt_insultos] },
  { id: 'en_basico',     label: 'Inglês — Básico',      desc: 'Common English profanity.',                    words: [...WORD_TEMPLATE_WORDS.en_basico] },
  { id: 'discriminacao', label: 'Discriminação & Ódio', desc: 'Slurs racistas, homofóbicos e discriminatórios.', words: [...WORD_TEMPLATE_WORDS.discriminacao] },
  { id: 'nsfw',          label: 'NSFW',                 desc: 'Conteúdo sexual explícito.',                   words: [...WORD_TEMPLATE_WORDS.nsfw] },
  { id: 'spam_scam',     label: 'Spam & Scam',          desc: 'Termos usados em spam, scams e publicidade indesejada.', words: [...WORD_TEMPLATE_WORDS.spam_scam] },
];

const DEFAULT_BAD_WORDS = [
  ...WORD_TEMPLATE_WORDS.pt_basico,
  ...WORD_TEMPLATE_WORDS.pt_insultos,
  ...WORD_TEMPLATE_WORDS.en_basico,
  ...WORD_TEMPLATE_WORDS.discriminacao,
];

const DEFAULT_AUTOMOD: AutoMod = {
  antiSpam:      { enabled: false, maxMessages: 5, interval: 5, action: 'timeout' },
  wordFilter:    { enabled: false, words: [] },
  antiLink:      { enabled: false, whitelist: [] },
  capsFilter:    { enabled: false, maxPercent: 70, minLength: 10 },
  mentionSpam:   { enabled: false, maxMentions: 5, action: 'delete' },
  keywordPreset: { enabled: false },
  memberProfile: { enabled: false, words: [] },
  ignoredRoles: [], ignoredChannels: [],
};
const DEFAULT_MOD: ModerationCfg = { dmOnAction: true, requireReason: false, appealUrl: '', muteRoleId: null };
const DEFAULT_WARNS: WarnsCfg = { autoAction: { enabled: false, threshold: 3, action: 'timeout', duration: '1d' }, expiryDays: 0 };
const DEFAULT_LOG_CAT = (events: string[]): LogCategory => ({
  channelId: null,
  events: Object.fromEntries(events.map(e => [e, true])),
});
const logIc = (p: React.ReactNode) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{p}</svg>
);
const LOG_CATEGORIES: { id: keyof LogsConfig; label: string; icon: React.ReactNode; color: string; events: { id: string; label: string; desc: string }[] }[] = [
  {
    id: 'moderation', label: 'Moderação', color: '#f87171', icon: logIc(<><path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z"/><path d="M9.5 12l1.8 1.8L15 10"/></>),
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
    id: 'messages', label: 'Mensagens', color: '#60a5fa', icon: logIc(<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>),
    events: [
      { id: 'messageDelete',  label: 'Mensagem eliminada', desc: 'Conteúdo da mensagem apagada.' },
      { id: 'messageEdit',    label: 'Mensagem editada',   desc: 'Antes e depois da edição.' },
      { id: 'messageBulk',    label: 'Bulk delete',        desc: 'Limpeza em massa de mensagens.' },
      { id: 'messagePinned',  label: 'Mensagem fixada',    desc: 'Mensagem marcada como pin.' },
    ],
  },
  {
    id: 'members', label: 'Membros', color: '#4ade80', icon: logIc(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="3.2"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></>),
    events: [
      { id: 'memberJoin',     label: 'Entrada',           desc: 'Novo membro entrou no servidor.' },
      { id: 'memberLeave',    label: 'Saída',             desc: 'Membro saiu ou foi expulso.' },
      { id: 'memberUpdate',   label: 'Atualização',       desc: 'Nick ou avatar alterado.' },
      { id: 'memberBoost',    label: 'Boost',             desc: 'Membro deu boost ao servidor.' },
      { id: 'memberBoostEnd', label: 'Boost terminado',   desc: 'Boost de um membro expirou.' },
    ],
  },
  {
    id: 'channels', label: 'Canais', color: '#fbbf24', icon: logIc(<path d="M3 7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>),
    events: [
      { id: 'channelCreate',  label: 'Canal criado',      desc: 'Novo canal de texto ou voz.' },
      { id: 'channelDelete',  label: 'Canal eliminado',   desc: 'Canal apagado do servidor.' },
      { id: 'channelEdit',    label: 'Canal editado',     desc: 'Nome, tópico ou permissões alterados.' },
    ],
  },
  {
    id: 'roles', label: 'Cargos', color: '#a78bfa', icon: logIc(<><path d="M20.6 13.4L13 21a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 2.6 12l.4-6a2 2 0 0 1 2-2l6-.4a2 2 0 0 1 1.6.6l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="8.5" r="1.3"/></>),
    events: [
      { id: 'roleCreate',     label: 'Cargo criado',      desc: 'Novo cargo adicionado.' },
      { id: 'roleDelete',     label: 'Cargo eliminado',   desc: 'Cargo removido do servidor.' },
      { id: 'roleEdit',       label: 'Cargo editado',     desc: 'Nome, cor ou permissões alterados.' },
      { id: 'roleAdd',        label: 'Cargo atribuído',   desc: 'Cargo dado a um membro.' },
      { id: 'roleRemove',     label: 'Cargo removido',    desc: 'Cargo tirado a um membro.' },
    ],
  },
  {
    id: 'voice', label: 'Voz', color: '#f472b6', icon: logIc(<><path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14"/></>),
    events: [
      { id: 'voiceJoin',      label: 'Entrou em voz',     desc: 'Membro entrou num canal de voz.' },
      { id: 'voiceLeave',     label: 'Saiu de voz',       desc: 'Membro saiu de canal de voz.' },
      { id: 'voiceMove',      label: 'Movido',            desc: 'Membro movido entre canais de voz.' },
      { id: 'voiceMute',      label: 'Mutado/Unmutado',   desc: 'Estado de mute de servidor alterado.' },
    ],
  },
  {
    id: 'server', label: 'Servidor', color: '#94a3b8', icon: logIc(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15H4.5a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 6 9.4l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 11 4.6V4.5a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 2.82 1.17l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 11h.1a2 2 0 1 1 0 4h-.1z"/></>),
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

const DEFAULT_WELCOME: WelcomeConfig = { enabled: false, channelId: null, message: '## Bem-vindo(a) ao {server}! 👋\nOlá {user}, estamos felizes por teres chegado!\n-# Membro nº {count}', deleteAfter: 0, accentColor: '#6db83e', dmEnabled: false, dmMessage: 'Bem-vindo(a) ao {server}! Lê as regras e diverte-te.' };
const DEFAULT_GOODBYE: GoodbyeConfig = { enabled: false, channelId: null, message: '**{displayname}** saiu do servidor. Ficamos agora **{count}** membros.', deleteAfter: 0, accentColor: '#80848e', banMessageEnabled: false, banMessage: '**{displayname}** foi banido do servidor.' };

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
const IconGift    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;

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
    section: 'EXTRA',
    items: [
      { id: 'giveaways',  label: 'Sorteios',          icon: <IconGift /> },
    ],
  },
  {
    section: 'ADMINISTRAÇÃO',
    items: [
      { id: 'logs',       label: 'Logs',              icon: <IconFile /> },
    ],
  },
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

/* ── Cabeçalho unificado de módulo ── */
function ModuleHeader({ icon, accent, title, desc, chip }: {
  icon: React.ReactNode; accent: string; title: string; desc: string; chip?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
      <span style={{
        width: 40, height: 40, borderRadius: 11, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: accent + '16', border: `1px solid ${accent}30`, color: accent,
      }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.02em' }}>{title}</h2>
          {chip && (
            <span style={{
              fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', padding: '2px 9px', borderRadius: 20,
              background: accent + '14', color: accent, border: `1px solid ${accent}30`, whiteSpace: 'nowrap',
            }}>{chip}</span>
          )}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>{desc}</p>
      </div>
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

function AMCard({ title, desc, badge, enabled, onToggle, onSave, saving, saved, cardId, children }: {
  title: string; desc: string; badge: 'discord' | 'bot';
  enabled: boolean; onToggle: () => void;
  onSave?: () => void; saving?: string | null; saved?: string | null; cardId?: string;
  children?: React.ReactNode;
}) {
  return (
    <div style={{
      background: 'var(--card)', border: `1px solid ${enabled ? 'var(--green-border, rgba(109,184,62,.3))' : 'var(--line)'}`,
      borderRadius: 12, overflow: 'hidden',
      transition: 'border-color .15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>{title}</span>
            {badge === 'discord'
              ? <span style={{ fontSize: 10.5, fontWeight: 600, background: 'rgba(88,101,242,.15)', color: '#818cf8', padding: '1px 7px', borderRadius: 4, letterSpacing: '.03em', flexShrink: 0 }}>DISCORD NATIVO</span>
              : <span style={{ fontSize: 10.5, fontWeight: 600, background: 'var(--surface)', color: 'var(--text-3)', padding: '1px 7px', borderRadius: 4, border: '1px solid var(--line)', letterSpacing: '.03em', flexShrink: 0 }}>BOT</span>
            }
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.4 }}>{desc}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {onSave && <SaveBtn id={cardId ?? title} saving={saving ?? null} saved={saved ?? null} onSave={onSave} />}
          <Toggle on={enabled} onChange={onToggle} />
        </div>
      </div>
      {enabled && children && (
        <div style={{ padding: '0 18px 16px', borderTop: '1px solid var(--line)' }}>
          <div style={{ paddingTop: 14 }}>{children}</div>
        </div>
      )}
    </div>
  );
}

/* ── AutoMod Rule Row (module-level, stable reference) ── */
function AMRuleRow({ ruleKey, title, desc, badge, enabled, onToggle, actionLabels, expanded, onExpand, onSave, saving, saved, saveMsg, children }: {
  ruleKey: string; title: string; desc: string; badge: 'discord' | 'bot';
  enabled: boolean; onToggle: () => void;
  actionLabels: string[];
  expanded: boolean; onExpand: () => void;
  onSave?: () => void; saving?: boolean; saved?: boolean; saveMsg?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <div style={{
      background: 'var(--card)',
      border: enabled ? '1px solid rgba(109,184,62,.25)' : '1px solid var(--line)',
      borderRadius: 12, overflow: 'hidden', transition: 'border-color .2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
        {/* Color bar */}
        <div style={{
          width: 4, height: 40, borderRadius: 2, flexShrink: 0,
          background: enabled ? 'var(--green)' : 'var(--line)',
          transition: 'background .2s',
        }} />

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <p style={{ fontSize: 13.5, fontWeight: 700 }}>{title}</p>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '.05em', padding: '1px 6px', borderRadius: 4,
              background: badge === 'discord' ? 'rgba(88,101,242,.12)' : 'rgba(109,184,62,.1)',
              color: badge === 'discord' ? '#818cf8' : 'var(--green)',
            }}>{badge === 'discord' ? 'DISCORD NATIVO' : 'BOT'}</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: enabled && actionLabels.length ? 8 : 0 }}>{desc}</p>
          {enabled && actionLabels.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {actionLabels.map(l => (
                <span key={l} style={{
                  background: 'var(--surface)', border: '1px solid var(--line)',
                  borderRadius: 20, padding: '2px 10px', fontSize: 11.5, color: 'var(--text-2)',
                }}>{l}</span>
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {children && enabled && (
            <button onClick={onExpand} style={{
              background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 7,
              padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--text-2)',
            }}>{expanded ? 'Fechar' : 'Configurar'}</button>
          )}
          {onSave && (
            <button onClick={onSave} disabled={saving} style={{
              background: saved ? 'rgba(109,184,62,.15)' : 'var(--green)',
              color: saved ? 'var(--green)' : '#fff',
              border: 'none', borderRadius: 7,
              padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: saving ? 'wait' : 'pointer',
              transition: 'all .2s', minWidth: 80,
            }}>
              {saving ? 'A guardar...' : saved ? 'Guardado!' : 'Guardar'}
            </button>
          )}
          <Toggle on={enabled} onChange={onToggle} />
        </div>
      </div>

      {expanded && children && (
        <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--line)' }}>
          <div style={{ paddingTop: 16 }}>{children}</div>
          {saveMsg && (
            <p style={{ fontSize: 12, color: '#f87171', marginTop: 10, lineHeight: 1.4, background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.2)', borderRadius: 7, padding: '8px 10px' }}>{saveMsg}</p>
          )}
        </div>
      )}
    </div>
  );
}

function AMSectionHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div style={{ paddingTop: 22, paddingBottom: 8 }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-3)', marginBottom: desc ? 3 : 0 }}>{title}</p>
      {desc && <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{desc}</p>}
    </div>
  );
}

function AMTags({ items, color, empty, onRemove }: {
  items: string[]; color: 'red' | 'green'; empty: string; onRemove: (v: string) => void;
}) {
  const c = color === 'red'
    ? { bg: 'rgba(248,113,113,.08)', border: 'rgba(248,113,113,.2)', text: '#f87171' }
    : { bg: 'var(--green-muted, rgba(109,184,62,.08))', border: 'var(--green-border, rgba(109,184,62,.2))', text: 'var(--green)' };
  if (items.length === 0) return <p style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{empty}</p>;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {items.map(v => (
        <span key={v} style={{ display: 'flex', alignItems: 'center', gap: 6, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 20, padding: '3px 10px 3px 12px', fontSize: 12.5, color: c.text }}>
          {v}
          <button onClick={() => onRemove(v)} aria-label="Remover" style={{ background: 'none', border: 'none', color: c.text, cursor: 'pointer', padding: 0, lineHeight: 0, display: 'flex' }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </span>
      ))}
    </div>
  );
}

/* ── Botão de guardar inline (reutilizável) ── */
function SaveBtn({ id, saving, saved, onSave }: { id: string; saving: string | null; saved: string | null; onSave: () => void }) {
  return (
    <button onClick={onSave} disabled={saving === id} style={{
      background: saved === id ? 'rgba(109,184,62,.15)' : 'var(--green)',
      color: saved === id ? 'var(--green)' : '#fff',
      border: 'none', borderRadius: 7, padding: '5px 14px', fontSize: 12, fontWeight: 600,
      cursor: saving === id ? 'wait' : 'pointer', transition: 'all .2s', minWidth: 80, flexShrink: 0,
    }}>
      {saving === id ? 'A guardar...' : saved === id ? 'Guardado!' : 'Guardar'}
    </button>
  );
}

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
  const [saveMsg, setSaveMsg]     = useState<string | null>(null);
  const [newWord, setNewWord]         = useState('');
  const [newDomain, setNewDomain]     = useState('');
  const [newProfileWord, setNewProfileWord] = useState('');
  const [setupStatus, setSetupStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [setupMsg, setSetupMsg] = useState<string | null>(null);
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [savingRule, setSavingRule]   = useState<string | null>(null);
  const [savedRule, setSavedRule]     = useState<string | null>(null);
  const [ruleSaveMsg, setRuleSaveMsg] = useState<string | null>(null);
  const [savingCard, setSavingCard]   = useState<string | null>(null);
  const [savedCard, setSavedCard]     = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const active = searchParams.get('tab') ?? initialTab;
  const setActive = (tab: string) => router.push(`?tab=${tab}`, { scroll: false });
  const [loading, setLoading]     = useState(true);

  // Barra de "alterações por guardar" (estilo Discord)
  const [savedSnapshot, setSavedSnapshot] = useState<Config | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const dirty = savedSnapshot !== null && JSON.stringify(config) !== JSON.stringify(savedSnapshot);

  // Captura o snapshot inicial assim que a config carrega
  useEffect(() => {
    if (!loading && savedSnapshot === null) setSavedSnapshot(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function saveAll() {
    setSavingAll(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/config`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json().catch(() => ({}));
      setSavedSnapshot(config);
      setSaveToast(data.autoModWarning ?? 'Alterações guardadas.');
      setTimeout(() => setSaveToast(null), data.autoModWarning ? 8000 : 3000);
    } catch {
      setSaveToast('Não foi possível guardar. Confirma que és dono ou gestor deste servidor e tenta novamente.');
      setTimeout(() => setSaveToast(null), 5000);
    } finally {
      setSavingAll(false);
    }
  }

  function resetAll() {
    if (savedSnapshot) setConfig(savedSnapshot);
  }

  // Limpa avisos/estado de guardado ao trocar de secção
  useEffect(() => { setSaveMsg(null); setSaved(false); }, [active]);

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

  // Gravação de baixo nível — verifica res.ok e devolve se resultou, para que
  // um 403 (sem permissão) ou 500 deixem de aparecer como "Guardado!".
  async function saveOne(cardKey: string, payload: Partial<Config>): Promise<boolean> {
    setSavingCard(cardKey);
    let ok = false;
    try {
      const res = await fetch(`/api/guilds/${guildId}/config`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      ok = res.ok;
    } catch { ok = false; }
    setSavingCard(null);
    if (ok) {
      setSavedSnapshot(s => s ? { ...s, ...payload } as Config : s);
      setSavedCard(cardKey);
      setTimeout(() => setSavedCard(c => c === cardKey ? null : c), 2500);
    } else {
      setSaveToast('Não foi possível guardar. Confirma que és dono ou gestor deste servidor e tenta novamente.');
      setTimeout(() => setSaveToast(null), 5000);
    }
    return ok;
  }

  function saveFields(cardKey: string, keys: (keyof Config)[]): Promise<boolean> {
    const payload: Partial<Config> = {};
    for (const k of keys) (payload as Record<string, unknown>)[k] = config[k];
    return saveOne(cardKey, payload);
  }

  async function saveRule(key: string) {
    setSavingRule(key); setRuleSaveMsg(null);
    try {
      const res = await fetch(`/api/guilds/${guildId}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoMod: config.autoMod }),
      });
      if (!res.ok) { setRuleSaveMsg('Não foi possível guardar. Confirma que és dono ou gestor deste servidor.'); return; }
      const data = await res.json().catch(() => ({}));
      if (data.autoModWarning) setRuleSaveMsg(data.autoModWarning);
      setSavedSnapshot(s => s ? { ...s, autoMod: config.autoMod } : s);
      setSavedRule(key);
      setTimeout(() => setSavedRule(null), 2500);
    } finally {
      setSavingRule(null);
    }
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

        {/* OVERVIEW */}
        {active === 'overview' && (() => {
          const amOn = !!(config.autoMod.wordFilter?.enabled || config.autoMod.antiSpam?.enabled
            || config.autoMod.mentionSpam?.enabled || config.autoMod.antiLink?.enabled
            || config.autoMod.keywordPreset?.enabled || config.autoMod.memberProfile?.enabled
            || config.autoMod.capsFilter?.enabled);
          const logsOn  = Object.values(config.logs).some(c => (c as LogCategory)?.channelId);
          const rolesOn = config.autoroles.length > 0 || config.rolePanels.length > 0;
          const modules = [
            { id: 'moderation', label: 'Moderação',   icon: <IconShield />,  on: true,  desc: 'Comandos /ban, /kick, /warn e mais.', always: true },
            { id: 'automod',    label: 'Auto-Mod',    icon: <IconBolt />,    on: amOn,  desc: amOn ? 'Regras ativas a proteger o servidor.' : 'Nenhuma regra ativa. Ativa em 1 clique.' },
            { id: 'welcome',    label: 'Boas-Vindas', icon: <IconUsers />,   on: !!(config.welcome?.enabled || config.goodbye?.enabled), desc: 'Mensagens de entrada e saída.' },
            { id: 'logs',       label: 'Logs',        icon: <IconFile />,    on: logsOn, desc: logsOn ? 'Eventos a serem registados.' : 'Sem canal de logs configurado.' },
            { id: 'roles',      label: 'Self-Roles',  icon: <IconTag />,     on: rolesOn, desc: `${config.autoroles.length} auto-role${config.autoroles.length !== 1 ? 's' : ''} · ${config.rolePanels.length} painel${config.rolePanels.length !== 1 ? 'éis' : ''}` },
            { id: 'warns',      label: 'Auto-ação de Avisos', icon: <IconWarn />, on: !!config.warns.autoAction?.enabled, desc: config.warns.autoAction?.enabled ? `${config.warns.autoAction.action} ao fim de ${config.warns.autoAction.threshold} avisos.` : 'Sem ação automática configurada.' },
          ];
          const recentWarns = warns.slice(0, 3);
          return (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 4 }}>Visão Geral</h2>
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>O estado do Laguno em <strong style={{ color: 'var(--text-2)' }}>{guildName}</strong>, num relance.</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: 10, marginBottom: 22 }}>
              {[
                { label: 'Avisos',     value: warns.length },
                { label: 'Auto-roles', value: config.autoroles.length },
                { label: 'Painéis',    value: config.rolePanels.length },
                { label: 'Canais',     value: channels.length },
                { label: 'Cargos',     value: roles.length },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10, padding: '14px 16px' }}>
                  <p style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.03em', color: 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>{s.value}</p>
                  <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Estado dos módulos */}
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 10 }}>Estado dos módulos</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px,1fr))', gap: 10, marginBottom: 26 }}>
              {modules.map(m => (
                <button key={m.id} onClick={() => setActive(m.id)} style={{
                  textAlign: 'left', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12,
                  padding: '15px 16px', cursor: 'pointer', transition: 'border-color .15s',
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(109,184,62,.35)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--line)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ display: 'flex', color: m.on ? 'var(--green)' : 'var(--text-3)' }}>{m.icon}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)', flex: 1 }}>{m.label}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '.05em', padding: '2px 8px', borderRadius: 20,
                      background: m.on ? 'rgba(109,184,62,.12)' : 'var(--surface)',
                      color: m.on ? 'var(--green)' : 'var(--text-3)',
                      border: m.on ? '1px solid rgba(109,184,62,.3)' : '1px solid var(--line)',
                    }}>{m.always ? 'SEMPRE' : m.on ? 'ATIVO' : 'OFF'}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>{m.desc}</p>
                </button>
              ))}
            </div>

            {/* Últimos avisos + ações rápidas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 12 }} className="overview-bottom">
              <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', borderBottom: '1px solid var(--line)' }}>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>Últimos avisos</p>
                  {warns.length > 0 && (
                    <button onClick={() => setActive('warns')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>Ver todos →</button>
                  )}
                </div>
                {recentWarns.length === 0 ? (
                  <p style={{ fontSize: 12.5, color: 'var(--text-3)', padding: '26px 18px', textAlign: 'center' }}>O servidor está em paz. Nenhum aviso registado.</p>
                ) : recentWarns.map((w, i, a) => (
                  <div key={w._id} style={{ padding: '11px 18px', borderBottom: i < a.length - 1 ? '1px solid var(--line)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: '#f87171' }}>@{w.userId}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{new Date(w.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.reason}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '.07em', textTransform: 'uppercase' }}>Ações rápidas</p>
                {[
                  { label: amOn ? 'Rever Auto-Mod' : 'Ativar Auto-Mod', tab: 'automod' },
                  { label: 'Criar sorteio',            tab: 'giveaways' },
                  { label: 'Configurar boas-vindas',   tab: 'welcome' },
                  { label: 'Escolher canal de logs',   tab: 'logs' },
                ].map(a => (
                  <button key={a.tab} onClick={() => setActive(a.tab)} style={{
                    textAlign: 'left', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10,
                    padding: '11px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--text-1)',
                    transition: 'border-color .15s, background .15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(109,184,62,.35)'; e.currentTarget.style.background = 'rgba(109,184,62,.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'var(--card)'; }}
                  >{a.label} <span style={{ color: 'var(--green)' }}>→</span></button>
                ))}
              </div>
            </div>
            <style>{`@media (max-width: 760px) { .overview-bottom { grid-template-columns: 1fr !important; } }`}</style>
          </div>
          );
        })()}

        {/* SETTINGS */}
        {active === 'settings' && (
          <div>
            <ModuleHeader icon={<IconSettings />} accent="#94a3b8" title="Configurações"
              desc="Definições gerais do Laguno neste servidor." />
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ModuleHeader icon={<IconShield />} accent="#f87171" title="Moderação"
              desc="Comportamento dos comandos /ban, /kick, /warn, /timeout e restantes." />

            {/* Comportamento */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>Comportamento</p>
                  <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Como o Laguno age quando uma ação de moderação é executada.</p>
                </div>
                <SaveBtn id="mod-behavior" saving={savingCard} saved={savedCard} onSave={() => saveFields('mod-behavior', ['moderation'])} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--line)', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 500 }}>DM ao utilizador</p>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Envia mensagem privada ao membro quando é banido, expulso ou avisado.</p>
                  </div>
                  <Toggle on={config.moderation.dmOnAction} onChange={() => setConfig(c => ({ ...c, moderation: { ...c.moderation, dmOnAction: !c.moderation.dmOnAction } }))} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 500 }}>Motivo obrigatório</p>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Moderadores têm de especificar um motivo em todas as ações.</p>
                  </div>
                  <Toggle on={config.moderation.requireReason} onChange={() => setConfig(c => ({ ...c, moderation: { ...c.moderation, requireReason: !c.moderation.requireReason } }))} />
                </div>
              </div>
            </div>

            {/* URL de apelos + Cargo de mute + Canal de logs — numa linha */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                {
                  id: 'mod-appeal', title: 'URL de apelos', desc: 'Enviado na DM de ban para o membro contestar.',
                  child: <input style={inputStyle} placeholder="https://forms.gle/..." value={config.moderation.appealUrl}
                    onChange={e => setConfig(c => ({ ...c, moderation: { ...c.moderation, appealUrl: e.target.value } }))} />,
                  keys: ['moderation'] as (keyof Config)[],
                },
                {
                  id: 'mod-mute', title: 'Cargo de mute', desc: 'Alternativa ao Discord Timeout para canais privados.',
                  child: <select style={inputStyle} value={config.moderation.muteRoleId ?? ''}
                    onChange={e => setConfig(c => ({ ...c, moderation: { ...c.moderation, muteRoleId: e.target.value || null } }))}>
                    <option value="">Discord Timeout (padrão)</option>
                    {roles.map(r => <option key={r.id} value={r.id}>@{r.name}</option>)}
                  </select>,
                  keys: ['moderation'] as (keyof Config)[],
                },
                {
                  id: 'mod-logch', title: 'Canal de logs', desc: 'Regista ações de moderação neste canal.',
                  child: <select style={inputStyle} value={config.logChannelId ?? ''}
                    onChange={e => setConfig(c => ({ ...c, logChannelId: e.target.value || null }))}>
                    <option value="">Desativado</option>
                    {channels.map(ch => <option key={ch.id} value={ch.id}>#{ch.name}</option>)}
                  </select>,
                  keys: ['logChannelId'] as (keyof Config)[],
                },
              ].map(card => (
                <div key={card.id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>{card.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{card.desc}</p>
                    </div>
                    <SaveBtn id={card.id} saving={savingCard} saved={savedCard} onSave={() => saveFields(card.id, card.keys)} />
                  </div>
                  {card.child}
                </div>
              ))}
            </div>

          </div>
        )}

        {/* AUTO-MOD */}
        {active === 'automod' && (() => {
          type FC = AutoMod & { floodControl?: { enabled?: boolean; maxMessages?: number; interval?: number; slowmode?: number; duration?: number } };
          const fc = (config.autoMod as FC).floodControl ?? {};
          const setFc = (patch: object) => setConfig(c => ({ ...c, autoMod: { ...c.autoMod, floodControl: { ...fc, ...patch } } as AutoMod }));
          const exp = (key: string) => expandedRule === key;
          const tog = (key: string) => setExpandedRule(p => p === key ? null : key);
          const activeRules = [
            config.autoMod.wordFilter?.enabled, config.autoMod.antiSpam?.enabled,
            config.autoMod.mentionSpam?.enabled, config.autoMod.antiLink?.enabled,
            config.autoMod.keywordPreset?.enabled, config.autoMod.memberProfile?.enabled,
            config.autoMod.capsFilter?.enabled, fc.enabled,
          ].filter(Boolean).length;
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <ModuleHeader icon={<IconBolt />} accent="#6db83e" title="Auto-Moderação"
                desc="Regras nativas do Discord e filtros do bot, sem sobreposição."
                chip={activeRules > 0 ? `${activeRules} regra${activeRules !== 1 ? 's' : ''} ativa${activeRules !== 1 ? 's' : ''}` : 'inativo'} />
              <div style={{ background: 'rgba(109,184,62,.06)', border: '1px solid rgba(109,184,62,.2)', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 3 }}>Configuracao Rapida</p>
                    <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.5 }}>Ativa as 6 regras nativas do AutoMod com maxima cobertura — +300 palavras bloqueadas de todas as categorias (PT, EN, discriminacao, NSFW e spam).</p>
                  </div>
                  <button disabled={setupStatus === 'loading'} onClick={async () => {
                    setSetupStatus('loading'); setSetupMsg(null);
                    try {
                      const res = await fetch(`/api/guilds/${guildId}/automod/setup`, { method: 'POST' });
                      const data = await res.json().catch(() => ({}));
                      // A config e guardada mesmo quando a sincronizacao com o Discord tem avisos.
                      // Atualiza os toggles sempre que houve gravacao (data.ok ou data.saved).
                      if (data.ok || data.saved) {
                        const cfg = await fetch(`/api/guilds/${guildId}/config`).then(r => r.json());
                        if (cfg?.autoMod) {
                          const freshAM = { ...DEFAULT_AUTOMOD, ...cfg.autoMod };
                          setConfig(c => ({ ...c, autoMod: freshAM }));
                          setSavedSnapshot(s => s ? { ...s, autoMod: freshAM } : s);
                        }
                      }
                      if (res.ok && data.ok) {
                        setSetupStatus('ok');
                      } else {
                        setSetupStatus('err');
                        setSetupMsg(data.reason ?? data.error ?? 'Nao foi possivel ativar. Tenta de novo.');
                      }
                    } catch { setSetupStatus('err'); setSetupMsg('Erro de ligacao. Tenta de novo.'); }
                    setTimeout(() => setSetupStatus('idle'), 6000);
                  }} style={{ flexShrink: 0, padding: '9px 22px', borderRadius: 8, border: 'none', cursor: setupStatus === 'loading' ? 'wait' : 'pointer', fontWeight: 700, fontSize: 13, background: setupStatus === 'ok' ? 'rgba(109,184,62,.15)' : setupStatus === 'err' ? 'rgba(248,113,113,.15)' : 'var(--green)', color: setupStatus === 'ok' ? 'var(--green)' : setupStatus === 'err' ? '#f87171' : '#fff', transition: 'all .2s', minWidth: 148 }}>
                    {setupStatus === 'loading' ? 'A ativar...' : setupStatus === 'ok' ? 'Ativado!' : setupStatus === 'err' ? 'Erro' : 'Ativar tudo'}
                  </button>
                </div>
                {setupMsg && setupStatus === 'err' && (
                  <p style={{ fontSize: 12, color: '#f87171', marginTop: 12, lineHeight: 1.5, background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.2)', borderRadius: 8, padding: '10px 12px' }}>{setupMsg}</p>
                )}
              </div>
              <AMSectionHeader title="Discord Nativo" desc="Aplicadas instantaneamente pelo Discord, sem intervencao do bot." />
              <AMRuleRow ruleKey="wordFilter" title={`Filtro de Palavras${config.autoMod.wordFilter.words.length > 0 ? ` (${config.autoMod.wordFilter.words.length})` : ''}`} desc="Bloqueia mensagens com palavras proibidas. Usa a API AutoMod do Discord (trigger KEYWORD, max 1000 palavras, 60 chars cada)." badge="discord" enabled={config.autoMod.wordFilter.enabled} onToggle={() => { const en = !config.autoMod.wordFilter.enabled; setAMSub('wordFilter', { enabled: en, ...(en && config.autoMod.wordFilter.words.length === 0 ? { words: [...DEFAULT_BAD_WORDS] } : {}) }); }} actionLabels={['bloquear mensagem', 'enviar alerta']} expanded={exp('wordFilter')} onExpand={() => tog('wordFilter')} onSave={() => saveRule('wordFilter')} saving={savingRule === 'wordFilter'} saved={savedRule === 'wordFilter'} saveMsg={savedRule === 'wordFilter' || savingRule === 'wordFilter' ? ruleSaveMsg : null}>
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Templates rapidos</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {WORD_TEMPLATES.map(t => { const newW = t.words.filter(w => !config.autoMod.wordFilter.words.includes(w)); const all = newW.length === 0; return (<button key={t.id} title={t.desc} onClick={() => { if (all) return; setAMSub('wordFilter', { words: [...config.autoMod.wordFilter.words, ...newW] }); }} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, cursor: all ? 'default' : 'pointer', border: all ? '1px solid var(--line)' : '1px solid rgba(109,184,62,.3)', background: all ? 'var(--surface)' : 'rgba(109,184,62,.08)', color: all ? 'var(--text-3)' : 'var(--green)' }}>{t.label}{all ? ' (adicionado)' : ` +${newW.length}`}</button>); })}
                    <button onClick={() => { if (!config.autoMod.wordFilter.words.length) return; if (confirm('Limpar todas as palavras?')) setAMSub('wordFilter', { words: [] }); }} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: '1px solid rgba(248,113,113,.25)', background: 'rgba(248,113,113,.05)', color: '#f87171' }}>Limpar tudo</button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input style={{ ...inputStyle, flex: 1 }} placeholder="Adicionar palavra proibida" value={newWord} onChange={e => setNewWord(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newWord.trim()) { setAMSub('wordFilter', { words: [...config.autoMod.wordFilter.words, newWord.trim().toLowerCase()] }); setNewWord(''); } }} />
                  <button className="btn btn-primary" onClick={() => { if (!newWord.trim()) return; setAMSub('wordFilter', { words: [...config.autoMod.wordFilter.words, newWord.trim().toLowerCase()] }); setNewWord(''); }}>Adicionar</button>
                </div>
                <AMTags items={config.autoMod.wordFilter.words} color="red" empty="Nenhuma palavra adicionada." onRemove={w => setAMSub('wordFilter', { words: config.autoMod.wordFilter.words.filter(x => x !== w) })} />
              </AMRuleRow>
              <AMRuleRow ruleKey="antiSpam" title="Detecao de Spam" desc="Usa o algoritmo de spam interno do Discord (trigger SPAM). Deteta e bloqueia conteudo repetitivo ou suspeito automaticamente." badge="discord" enabled={config.autoMod.antiSpam.enabled} onToggle={() => setAMSub('antiSpam', { enabled: !config.autoMod.antiSpam.enabled })} actionLabels={['bloquear mensagem', 'enviar alerta']} expanded={exp('antiSpam')} onExpand={() => tog('antiSpam')} onSave={() => saveRule('antiSpam')} saving={savingRule === 'antiSpam'} saved={savedRule === 'antiSpam'} saveMsg={savedRule === 'antiSpam' || savingRule === 'antiSpam' ? ruleSaveMsg : null}>
                <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.6 }}>Esta regra nao tem parametros configuraveis — o Discord gere a detecao internamente. So precisas de a ativar. (O trigger SPAM nao suporta timeout, apenas bloquear e alertar.)</p>
              </AMRuleRow>
              <AMRuleRow ruleKey="mentionSpam" title="Anti-Mencoes" desc="Bloqueia mensagens com demasiadas mencoes (trigger MENTION_SPAM). Limite maximo: 50 mencoes (limite da API Discord)." badge="discord" enabled={config.autoMod.mentionSpam.enabled} onToggle={() => setAMSub('mentionSpam', { enabled: !config.autoMod.mentionSpam.enabled })} actionLabels={['bloquear mensagem', 'enviar alerta']} expanded={exp('mentionSpam')} onExpand={() => tog('mentionSpam')} onSave={() => saveRule('mentionSpam')} saving={savingRule === 'mentionSpam'} saved={savedRule === 'mentionSpam'} saveMsg={savedRule === 'mentionSpam' || savingRule === 'mentionSpam' ? ruleSaveMsg : null}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 10 }}>
                  <Field label="Max. mencoes por mensagem"><input type="number" min={2} max={50} style={inputStyle} value={config.autoMod.mentionSpam.maxMentions} onChange={e => setAMSub('mentionSpam', { maxMentions: parseInt(e.target.value) || 5 })} /></Field>
                  <Field label="Acao"><select style={inputStyle} value={config.autoMod.mentionSpam.action} onChange={e => setAMSub('mentionSpam', { action: e.target.value })}><option value="delete">Apagar mensagem</option><option value="timeout">Timeout (10 min)</option><option value="kick">Kick</option><option value="ban">Ban</option></select></Field>
                </div>
              </AMRuleRow>
              <AMRuleRow ruleKey="antiLink" title="Anti-Convites" desc="Bloqueia convites para outros servidores (discord.gg e afins). Gifs e links normais nao sao afetados." badge="discord" enabled={config.autoMod.antiLink.enabled} onToggle={() => setAMSub('antiLink', { enabled: !config.autoMod.antiLink.enabled })} actionLabels={['bloquear mensagem', 'enviar alerta']} expanded={exp('antiLink')} onExpand={() => tog('antiLink')} onSave={() => saveRule('antiLink')} saving={savingRule === 'antiLink'} saved={savedRule === 'antiLink'} saveMsg={savedRule === 'antiLink' || savingRule === 'antiLink' ? ruleSaveMsg : null}>
                <Field label="Dominios permitidos" hint="ex: youtube.com, twitch.tv">
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <input style={{ ...inputStyle, flex: 1 }} placeholder="dominio.com" value={newDomain} onChange={e => setNewDomain(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newDomain.trim()) { setAMSub('antiLink', { whitelist: [...config.autoMod.antiLink.whitelist, newDomain.trim().toLowerCase()] }); setNewDomain(''); } }} />
                    <button className="btn btn-secondary" onClick={() => { if (!newDomain.trim()) return; setAMSub('antiLink', { whitelist: [...config.autoMod.antiLink.whitelist, newDomain.trim().toLowerCase()] }); setNewDomain(''); }}>Permitir</button>
                  </div>
                  <AMTags items={config.autoMod.antiLink.whitelist} color="green" empty="Todos os links sao bloqueados." onRemove={d => setAMSub('antiLink', { whitelist: config.autoMod.antiLink.whitelist.filter(x => x !== d) })} />
                </Field>
              </AMRuleRow>
              <AMRuleRow ruleKey="keywordPreset" title="Palavras Sinalizadas pelo Discord" desc="Usa as listas internas do Discord para bloquear profanidade, conteúdo sexual e slurs. Sempre atualizadas pelo Discord automaticamente." badge="discord" enabled={config.autoMod.keywordPreset?.enabled ?? false} onToggle={() => setConfig(c => ({ ...c, autoMod: { ...c.autoMod, keywordPreset: { enabled: !(c.autoMod.keywordPreset?.enabled ?? false) } } }))} actionLabels={['bloquear mensagem', 'enviar alerta']} expanded={false} onExpand={() => {}} onSave={() => saveRule('keywordPreset')} saving={savingRule === 'keywordPreset'} saved={savedRule === 'keywordPreset'} saveMsg={null}>
                <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.6 }}>Sem configuração adicional — o Discord gere as listas de profanidade, conteúdo sexual e slurs internamente.</p>
              </AMRuleRow>
              <AMRuleRow ruleKey="memberProfile" title={`Filtro em Perfis de Membros${(config.autoMod.memberProfile?.words?.length ?? 0) > 0 ? ` (${config.autoMod.memberProfile.words.length})` : ''}`} desc="Bloqueia nomes de utilizador e nicknames com palavras proibidas (trigger MEMBER_PROFILE). Lista independente do Filtro de Palavras." badge="discord" enabled={config.autoMod.memberProfile?.enabled ?? false} onToggle={() => setConfig(c => ({ ...c, autoMod: { ...c.autoMod, memberProfile: { ...c.autoMod.memberProfile, enabled: !(c.autoMod.memberProfile?.enabled ?? false), ...(!(c.autoMod.memberProfile?.enabled ?? false) && (c.autoMod.memberProfile?.words?.length ?? 0) === 0 ? { words: [...DEFAULT_BAD_WORDS] } : {}) } } }))} actionLabels={['bloquear interações de membros']} expanded={exp('memberProfile')} onExpand={() => tog('memberProfile')} onSave={() => saveRule('memberProfile')} saving={savingRule === 'memberProfile'} saved={savedRule === 'memberProfile'} saveMsg={savedRule === 'memberProfile' || savingRule === 'memberProfile' ? ruleSaveMsg : null}>
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Templates rápidos</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {WORD_TEMPLATES.map(t => { const newW = t.words.filter(w => !(config.autoMod.memberProfile?.words ?? []).includes(w)); const all = newW.length === 0; return (<button key={t.id} title={t.desc} onClick={() => { if (all) return; setConfig(c => ({ ...c, autoMod: { ...c.autoMod, memberProfile: { ...c.autoMod.memberProfile, words: [...(c.autoMod.memberProfile?.words ?? []), ...newW] } } })); }} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, cursor: all ? 'default' : 'pointer', border: all ? '1px solid var(--line)' : '1px solid rgba(109,184,62,.3)', background: all ? 'var(--surface)' : 'rgba(109,184,62,.08)', color: all ? 'var(--text-3)' : 'var(--green)' }}>{t.label}{all ? ' (adicionado)' : ` +${newW.length}`}</button>); })}
                    <button onClick={() => { if (!(config.autoMod.memberProfile?.words?.length)) return; if (confirm('Limpar todas as palavras?')) setConfig(c => ({ ...c, autoMod: { ...c.autoMod, memberProfile: { ...c.autoMod.memberProfile, words: [] } } })); }} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: '1px solid rgba(248,113,113,.25)', background: 'rgba(248,113,113,.05)', color: '#f87171' }}>Limpar tudo</button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input style={{ ...inputStyle, flex: 1 }} placeholder="Adicionar palavra proibida em perfis" value={newProfileWord} onChange={e => setNewProfileWord(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newProfileWord.trim()) { setConfig(c => ({ ...c, autoMod: { ...c.autoMod, memberProfile: { ...c.autoMod.memberProfile, words: [...(c.autoMod.memberProfile?.words ?? []), newProfileWord.trim().toLowerCase()] } } })); setNewProfileWord(''); } }} />
                  <button className="btn btn-primary" onClick={() => { if (!newProfileWord.trim()) return; setConfig(c => ({ ...c, autoMod: { ...c.autoMod, memberProfile: { ...c.autoMod.memberProfile, words: [...(c.autoMod.memberProfile?.words ?? []), newProfileWord.trim().toLowerCase()] } } })); setNewProfileWord(''); }}>Adicionar</button>
                </div>
                <AMTags items={config.autoMod.memberProfile?.words ?? []} color="red" empty="Nenhuma palavra adicionada." onRemove={w => setConfig(c => ({ ...c, autoMod: { ...c.autoMod, memberProfile: { ...c.autoMod.memberProfile, words: (c.autoMod.memberProfile?.words ?? []).filter(x => x !== w) } } }))} />
              </AMRuleRow>
              <AMSectionHeader title="Laguno Bot" desc="Regras processadas pelo bot diretamente no servidor." />
              <AMRuleRow ruleKey="capsFilter" title="Filtro de CAPS" desc="Remove mensagens com excesso de letras maiusculas. Configuravel por percentagem e comprimento minimo." badge="bot" enabled={config.autoMod.capsFilter.enabled} onToggle={() => setAMSub('capsFilter', { enabled: !config.autoMod.capsFilter.enabled })} actionLabels={['apagar mensagem', 'aviso no canal']} expanded={exp('capsFilter')} onExpand={() => tog('capsFilter')} onSave={() => saveRule('capsFilter')} saving={savingRule === 'capsFilter'} saved={savedRule === 'capsFilter'} saveMsg={savedRule === 'capsFilter' || savingRule === 'capsFilter' ? ruleSaveMsg : null}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 10 }}>
                  <Field label="% maxima de maiusculas"><input type="number" min={30} max={100} style={inputStyle} value={config.autoMod.capsFilter.maxPercent} onChange={e => setAMSub('capsFilter', { maxPercent: parseInt(e.target.value) || 70 })} /></Field>
                  <Field label="Comprimento minimo (caract.)"><input type="number" min={5} max={50} style={inputStyle} value={config.autoMod.capsFilter.minLength} onChange={e => setAMSub('capsFilter', { minLength: parseInt(e.target.value) || 10 })} /></Field>
                </div>
              </AMRuleRow>
              <AMRuleRow ruleKey="floodControl" title="Anti-Flood — Slowmode Automatico" desc="Ativa o slowmode num canal quando deteta muitas mensagens em pouco tempo." badge="bot" enabled={!!fc.enabled} onToggle={() => setFc({ enabled: !fc.enabled })} actionLabels={['ativar slowmode no canal', 'notificar canal']} expanded={exp('floodControl')} onExpand={() => tog('floodControl')} onSave={() => saveRule('floodControl')} saving={savingRule === 'floodControl'} saved={savedRule === 'floodControl'} saveMsg={savedRule === 'floodControl' || savingRule === 'floodControl' ? ruleSaveMsg : null}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
                  <Field label="Max. mensagens"><input type="number" min={3} max={30} style={inputStyle} value={fc.maxMessages ?? 8} onChange={e => setFc({ maxMessages: parseInt(e.target.value) || 8 })} /></Field>
                  <Field label="Intervalo (seg)"><input type="number" min={2} max={30} style={inputStyle} value={fc.interval ?? 5} onChange={e => setFc({ interval: parseInt(e.target.value) || 5 })} /></Field>
                  <Field label="Slowmode (seg)"><input type="number" min={1} max={21600} style={inputStyle} value={fc.slowmode ?? 10} onChange={e => setFc({ slowmode: parseInt(e.target.value) || 10 })} /></Field>
                  <Field label="Duracao (seg)"><input type="number" min={10} max={3600} style={inputStyle} value={fc.duration ?? 60} onChange={e => setFc({ duration: parseInt(e.target.value) || 60 })} /></Field>
                </div>
              </AMRuleRow>
              <AMSectionHeader title="Excecoes" desc="Canais e cargos isentos de todas as regras acima." />
              <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 16 }}>
                  <Field label="Canais ignorados">
                    <select style={inputStyle} onChange={e => { if (!e.target.value || config.autoMod.ignoredChannels.includes(e.target.value)) return; setAM('ignoredChannels', [...config.autoMod.ignoredChannels, e.target.value]); e.target.value = ''; }}><option value="">Adicionar canal...</option>{channels.filter(c => !config.autoMod.ignoredChannels.includes(c.id)).map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}</select>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>{config.autoMod.ignoredChannels.map(id => (<span key={id} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 20, padding: '3px 10px', fontSize: 12 }}>#{channels.find(c => c.id === id)?.name ?? id}<button onClick={() => setAM('ignoredChannels', config.autoMod.ignoredChannels.filter(x => x !== id))} aria-label="Remover" style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 0, lineHeight: 0, display: 'flex' }}><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></button></span>))}</div>
                  </Field>
                  <Field label="Cargos isentos">
                    <select style={inputStyle} onChange={e => { if (!e.target.value || config.autoMod.ignoredRoles.includes(e.target.value)) return; setAM('ignoredRoles', [...config.autoMod.ignoredRoles, e.target.value]); e.target.value = ''; }}><option value="">Adicionar cargo...</option>{roles.filter(r => !config.autoMod.ignoredRoles.includes(r.id)).map(r => <option key={r.id} value={r.id}>@{r.name}</option>)}</select>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>{config.autoMod.ignoredRoles.map(id => (<span key={id} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 20, padding: '3px 10px', fontSize: 12 }}>@{roles.find(r => r.id === id)?.name ?? id}<button onClick={() => setAM('ignoredRoles', config.autoMod.ignoredRoles.filter(x => x !== id))} aria-label="Remover" style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 0, lineHeight: 0, display: 'flex' }}><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></button></span>))}</div>
                  </Field>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                  <button onClick={() => saveRule('exceptions')} disabled={savingRule === 'exceptions'} style={{
                    background: savedRule === 'exceptions' ? 'rgba(109,184,62,.15)' : 'var(--green)',
                    color: savedRule === 'exceptions' ? 'var(--green)' : '#fff',
                    border: 'none', borderRadius: 7, padding: '7px 18px', fontSize: 12.5, fontWeight: 600,
                    cursor: savingRule === 'exceptions' ? 'wait' : 'pointer', transition: 'all .2s',
                  }}>
                    {savingRule === 'exceptions' ? 'A guardar...' : savedRule === 'exceptions' ? 'Guardado!' : 'Guardar exceções'}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* BOAS-VINDAS */}
        {active === 'welcome' && (
          <div>
            <ModuleHeader icon={<IconUsers />} accent="#60a5fa" title="Boas-Vindas & Despedidas"
              desc="Mensagens de entrada e saída com variáveis dinâmicas e pré-visualização."
              chip={config.welcome?.enabled || config.goodbye?.enabled ? 'ativo' : 'inativo'} />
            <WelcomeTab welcome={config.welcome} goodbye={config.goodbye} channels={channels} guildName={guildName} guildId={guildId}
              onChange={(key, val) => setConfig(c => ({ ...c, [key]: val }))}
              onSaveWelcome={() => saveFields('welcome-save', ['welcome'])}
              onSaveGoodbye={() => saveFields('goodbye-save', ['goodbye'])}
              onPersistWelcome={(w) => saveOne('welcome-save', { welcome: w as Config['welcome'] })}
              onPersistGoodbye={(g) => saveOne('goodbye-save', { goodbye: g as Config['goodbye'] })} />
          </div>
        )}

        {/* ROLES */}
        {active === 'roles' && (
          <div>
            <ModuleHeader icon={<IconTag />} accent="#a78bfa" title="Roles & Painéis"
              desc="Auto-roles na entrada e painéis de cargos com botões."
              chip={`${config.rolePanels.length} painel${config.rolePanels.length !== 1 ? 'éis' : ''} · ${config.autoroles.length} auto-role${config.autoroles.length !== 1 ? 's' : ''}`} />
            <RolesTab autoroles={config.autoroles} rolePanels={config.rolePanels} roles={roles}
              channels={channels} guildId={guildId}
              onChange={(key, val) => setConfig(c => ({ ...c, [key]: val }))} />
          </div>
        )}

        {/* SORTEIOS */}
        {active === 'giveaways' && (
          <div>
            <ModuleHeader icon={<IconGift />} accent="#f59e0b" title="Sorteios"
              desc="Cria sorteios com prémios, banners, cargos obrigatórios e rerolls." />
            <GiveawayModule guildId={guildId} />
          </div>
        )}

        {/* CONSTRUTOR DE MENSAGENS */}
        {active === 'builder' && (
          <MessageBuilderTab guildId={guildId} channels={channels} roles={roles} />
        )}

        {/* LOGS */}
        {active === 'logs' && (() => {
          const linkedCats = Object.values(config.logs).filter(c => (c as LogCategory)?.channelId).length;
          return (
          <div>
            <ModuleHeader icon={<IconFile />} accent="#fbbf24" title="Logs"
              desc="Configura um canal por categoria e ativa os eventos que queres registar."
              chip={linkedCats > 0 ? `${linkedCats} de ${LOG_CATEGORIES.length} categorias` : 'sem canal'} />

            {LOG_CATEGORIES.map(cat => {
              const catCfg = config.logs[cat.id];
              const activeCount = Object.values(catCfg.events).filter(Boolean).length;
              const totalCount = cat.events.length;
              return (
                <div key={cat.id} style={{ marginBottom: 12, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
                  {/* Category header */}
                  <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}>
                    <span style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: cat.color + '1a', color: cat.color, flexShrink: 0 }}>{cat.icon}</span>
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
                    <SaveBtn id={`logs-${cat.id}`} saving={savingCard} saved={savedCard} onSave={() => saveFields(`logs-${cat.id}`, ['logs'])} />
                  </div>

                  {/* Events grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 0 }}>
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
          );
        })()}

        {/* AVISOS */}
        {active === 'warns' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ModuleHeader icon={<IconWarn />} accent="#facc15" title="Avisos"
              desc="Ações automáticas, expiração e histórico de warns do servidor."
              chip={warns.length > 0 ? `${warns.length} aviso${warns.length !== 1 ? 's' : ''}` : 'sem avisos'} />

            {/* Auto-ação + Expiração lado a lado */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 10 }}>

              <AMCard
                title="Auto-Ação"
                desc="Aplica uma punição automática quando um membro acumula avisos a mais."
                badge="bot"
                cardId="warns-auto"
                enabled={config.warns.autoAction.enabled}
                onToggle={() => setConfig(c => ({ ...c, warns: { ...c.warns, autoAction: { ...c.warns.autoAction, enabled: !c.warns.autoAction.enabled } } }))}
                onSave={() => saveFields('warns-auto', ['warns'])}
                saving={savingCard}
                saved={savedCard}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Field label="Nº de avisos para punir">
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
              </AMCard>

              <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>Expiração de Avisos</p>
                    <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Avisos antigos deixam de contar para o auto-ação após o prazo.</p>
                  </div>
                  <SaveBtn id="warns-expiry" saving={savingCard} saved={savedCard} onSave={() => saveFields('warns-expiry', ['warns'])} />
                </div>
                <select style={inputStyle} value={config.warns.expiryDays}
                  onChange={e => setConfig(c => ({ ...c, warns: { ...c.warns, expiryDays: parseInt(e.target.value) } }))}>
                  <option value={0}>Nunca expirar</option>
                  <option value={7}>7 dias</option>
                  <option value={14}>14 dias</option>
                  <option value={30}>30 dias</option>
                  <option value={60}>60 dias</option>
                  <option value={90}>90 dias</option>
                </select>
              </div>
            </div>

            {/* Histórico */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: warns.length > 0 ? '1px solid var(--line)' : 'none' }}>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 600 }}>Histórico de Avisos</p>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{warns.length === 0 ? 'Nenhum aviso registado' : `${warns.length} aviso${warns.length !== 1 ? 's' : ''} no servidor`}</p>
                </div>
              </div>
              {warns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-3)' }}>O servidor está em paz.</p>
                </div>
              ) : warns.map((w, i, a) => (
                <div key={w._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 20px', borderBottom: i < a.length - 1 ? '1px solid var(--line)' : 'none', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', background: 'rgba(248,113,113,0.10)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', padding: '2px 8px', borderRadius: 5 }}>
                        @{w.userId}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                        {new Date(w.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>· por {w.moderatorId}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-1)' }}>{w.reason}</p>
                  </div>
                  <button onClick={async () => { await fetch(`/api/guilds/${guildId}/warns/${w._id}`, { method: 'DELETE' }); setWarns(ws => ws.filter(x => x._id !== w._id)); }}
                    style={{ background: 'none', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 7, color: '#f87171', cursor: 'pointer', padding: '5px 11px', fontSize: 12, flexShrink: 0 }}>
                    Remover
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Barra de alterações por guardar (estilo Discord) */}
        {dirty && (
          <div className="unsaved-bar">
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
              background: 'var(--elevated)', border: '1px solid var(--line)',
              borderRadius: 12, padding: '10px 12px 10px 18px',
              boxShadow: '0 12px 40px rgba(0,0,0,.55)',
              maxWidth: 720, margin: '0 auto',
            }}>
              <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)' }}>
                Cuidado — tens alterações por guardar!
              </p>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={resetAll} disabled={savingAll} style={{
                  background: 'transparent', border: 'none', borderRadius: 8,
                  padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  color: 'var(--text-2)', textDecoration: 'underline',
                }}>Repor</button>
                <button onClick={saveAll} disabled={savingAll} style={{
                  background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 8,
                  padding: '8px 20px', fontSize: 13, fontWeight: 700,
                  cursor: savingAll ? 'wait' : 'pointer', minWidth: 160, transition: 'opacity .15s',
                  opacity: savingAll ? .7 : 1,
                }}>{savingAll ? 'A guardar...' : 'Guardar alterações'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Toast de confirmação */}
        {saveToast && (
          <div className="save-toast" style={{
            background: 'var(--elevated)', border: '1px solid var(--line)',
            borderLeft: '3px solid var(--green)',
            borderRadius: 10, padding: '11px 16px', fontSize: 13, color: 'var(--text-1)',
            boxShadow: '0 8px 30px rgba(0,0,0,.5)', maxWidth: 380,
          }}>
            {saveToast}
          </div>
        )}

        <style>{`
          .unsaved-bar {
            position: fixed; bottom: 20px; left: 300px; right: 0; z-index: 90;
            padding: 0 24px;
            animation: unsaved-in .22s cubic-bezier(.2,.9,.3,1.2) both;
          }
          .save-toast {
            position: fixed; bottom: 20px; right: 24px; z-index: 95;
            animation: unsaved-in .2s ease both;
          }
          @keyframes unsaved-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
          @media (max-width: 860px) { .unsaved-bar { left: 0; } }
        `}</style>

    </div>
  );
}

