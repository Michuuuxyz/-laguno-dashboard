const DISCORD_API = 'https://discord.com/api/v10';

// Trigger types — https://docs.discord.com/developers/resources/auto-moderation
const TRIGGER = { KEYWORD: 1, KEYWORD_PRESET: 2, SPAM: 3, MEMBER_PROFILE: 4, MENTION_SPAM: 5 } as const;
const ACTION  = { BLOCK: 1, ALERT: 2, TIMEOUT: 3 } as const;
const PRESET  = { PROFANITY: 1, SEXUAL_CONTENT: 2, SLURS: 3 } as const;

const INVITE_PATTERNS = ['discord.gg/*', 'discord.com/invite/*', 'dsc.gg/*', 'discord.io/*'];

// Limites impostos pela API do Discord
const MAX_KEYWORD_LEN = 60;
const MAX_KEYWORDS    = 1000;
const MAX_ALLOWLIST   = 100;
const MAX_MENTIONS    = 50;

// Nomes únicos por regra (a deduplicação é feita por nome, não por trigger_type,
// porque "Filtro de Palavras" e "Anti-Link" partilham o mesmo trigger KEYWORD)
const RULE = {
  WORD:    'Laguno: Filtro de Palavras',
  SPAM:    'Laguno: Anti-Spam',
  MENTION: 'Laguno: Anti-Menções',
  LINK:    'Laguno: Anti-Link',
  PRESET:  'Laguno: Palavras Sinalizadas',
  PROFILE: 'Laguno: Perfis de Membros',
} as const;

interface Rule { id: string; name: string; trigger_type: number; }

interface AutoMod {
  wordFilter:    { enabled: boolean; words: string[] };
  antiSpam:      { enabled: boolean; action: string };
  mentionSpam:   { enabled: boolean; maxMentions: number; action: string };
  antiLink:      { enabled: boolean; whitelist: string[] };
  keywordPreset: { enabled: boolean };
  memberProfile: { enabled: boolean; words: string[] };
  ignoredRoles:    string[];
  ignoredChannels: string[];
}

export interface SyncResult {
  ok: boolean;
  /** 'no_token' quando falta DISCORD_TOKEN; 'list_failed' quando o bot não consegue ler regras
   *  (normalmente falta a permissão Gerir Servidor ou o bot não está no servidor) */
  error?: 'no_token' | 'list_failed';
  /** mensagens de erro de cada regra que falhou ao criar/atualizar */
  failures: string[];
}

async function listRules(guildId: string, token: string): Promise<Rule[]> {
  const res = await fetch(`${DISCORD_API}/guilds/${guildId}/auto-moderation/rules`, {
    headers: { Authorization: `Bot ${token}` },
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`list ${res.status} ${err}`);
  }
  return res.json();
}

/** Devolve true se a regra foi criada/atualizada com sucesso. */
async function upsertRule(guildId: string, token: string, existingId: string | null, body: object): Promise<{ ok: boolean; error?: string }> {
  const url = existingId
    ? `${DISCORD_API}/guilds/${guildId}/auto-moderation/rules/${existingId}`
    : `${DISCORD_API}/guilds/${guildId}/auto-moderation/rules`;

  const res = await fetch(url, {
    method: existingId ? 'PATCH' : 'POST',
    headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = `${(body as { name?: string }).name ?? 'regra'}: ${res.status} ${JSON.stringify(err)}`;
    console.error('[syncAutoMod] Falha ao criar/atualizar regra:', guildId, msg);
    return { ok: false, error: msg };
  }
  return { ok: true };
}

async function deleteRule(guildId: string, ruleId: string, token: string) {
  await fetch(`${DISCORD_API}/guilds/${guildId}/auto-moderation/rules/${ruleId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bot ${token}` },
  }).catch(err => console.error('[syncAutoMod] Falha ao apagar regra:', guildId, err));
}

/** Limpa, deduplica e valida palavras para os limites da API do Discord. */
function sanitizeKeywords(words: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of words) {
    const w = raw.trim().toLowerCase();
    if (!w || w.length > MAX_KEYWORD_LEN) continue; // o Discord rejeita a regra inteira se 1 keyword passar 60 chars
    if (seen.has(w)) continue;
    seen.add(w);
    out.push(w);
    if (out.length >= MAX_KEYWORDS) break;
  }
  return out;
}

export async function syncAutoModRules(
  guildId: string,
  autoMod: AutoMod,
  alertChannelId: string | null,
): Promise<SyncResult> {
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.error('[syncAutoMod] DISCORD_TOKEN em falta — AutoMod nativo não pode ser sincronizado.');
    return { ok: false, error: 'no_token', failures: [] };
  }

  let existing: Rule[] = [];
  try {
    existing = await listRules(guildId, token);
  } catch (err) {
    console.error('[syncAutoMod] Erro ao listar regras (falta permissão Gerir Servidor?):', guildId, err);
    return { ok: false, error: 'list_failed', failures: [] };
  }

  const mine  = existing.filter(r =>  r.name.startsWith('Laguno:'));
  const other = existing.filter(r => !r.name.startsWith('Laguno:'));
  const byName = (name: string) => mine.find(r => r.name === name) ?? null;

  // Para regras não-Laguno com trigger types que gerimos (KEYWORD_PRESET, MEMBER_PROFILE),
  // fazemos PATCH para as renomear e tomar conta delas — mais fiável do que apagar
  // porque algumas são regras de sistema que o Discord não permite eliminar.
  const MANAGED_TRIGGERS = new Set<number>([
    TRIGGER.KEYWORD_PRESET,
    TRIGGER.MEMBER_PROFILE,
  ]);
  for (const r of other) {
    if (MANAGED_TRIGGERS.has(r.trigger_type)) {
      const newName = r.trigger_type === TRIGGER.MEMBER_PROFILE ? RULE.PROFILE : RULE.PRESET;
      console.log(`[syncAutoMod] A tomar conta da regra "${r.name}" → "${newName}"`);
      const res = await fetch(`${DISCORD_API}/guilds/${guildId}/auto-moderation/rules/${r.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      if (res.ok) {
        // Adiciona à lista "mine" com o novo nome para o upsert abaixo a encontrar
        mine.push({ id: r.id, name: newName, trigger_type: r.trigger_type });
      } else {
        // Se não conseguiu fazer patch, tenta apagar
        await deleteRule(guildId, r.id, token);
      }
    }
  }

  const exemptRoles    = autoMod.ignoredRoles    ?? [];
  const exemptChannels = autoMod.ignoredChannels ?? [];
  const failures: string[] = [];

  function actions(timeoutSecs?: number) {
    const list: object[] = [{ type: ACTION.BLOCK }];
    if (alertChannelId) list.push({ type: ACTION.ALERT, metadata: { channel_id: alertChannelId } });
    if (timeoutSecs)    list.push({ type: ACTION.TIMEOUT, metadata: { duration_seconds: timeoutSecs } });
    return list;
  }

  async function apply(existingId: string | null, body: object) {
    const r = await upsertRule(guildId, token!, existingId, body);
    if (!r.ok && r.error) failures.push(r.error);
  }

  // ── Filtro de Palavras (KEYWORD, identificado por nome) ─────────────────────
  const wordRule = byName(RULE.WORD);
  const keywords = sanitizeKeywords(autoMod.wordFilter.words ?? []);
  if (autoMod.wordFilter.enabled && keywords.length > 0) {
    await apply(wordRule?.id ?? null, {
      name:             RULE.WORD,
      event_type:       1,
      trigger_type:     TRIGGER.KEYWORD,
      trigger_metadata: { keyword_filter: keywords },
      actions:          actions(),
      enabled:          true,
      exempt_roles:     exemptRoles,
      exempt_channels:  exemptChannels,
    });
  } else if (wordRule) {
    await deleteRule(guildId, wordRule.id, token);
  }

  // ── Anti-Spam (SPAM) ────────────────────────────────────────────────────────
  // Nota: o trigger SPAM NÃO aceita a ação TIMEOUT (tipo 3) — só BLOCK e ALERT.
  const spamRule = byName(RULE.SPAM);
  if (autoMod.antiSpam.enabled) {
    await apply(spamRule?.id ?? null, {
      name:             RULE.SPAM,
      event_type:       1,
      trigger_type:     TRIGGER.SPAM,
      trigger_metadata: {},
      actions:          actions(),
      enabled:          true,
      exempt_roles:     exemptRoles,
      exempt_channels:  exemptChannels,
    });
  } else if (spamRule) {
    await deleteRule(guildId, spamRule.id, token);
  }

  // ── Anti-Menções (MENTION_SPAM) ─────────────────────────────────────────────
  const mentionRule = byName(RULE.MENTION);
  if (autoMod.mentionSpam.enabled) {
    const limit = Math.min(Math.max(autoMod.mentionSpam.maxMentions || 5, 1), MAX_MENTIONS);
    const timeoutSecs = autoMod.mentionSpam.action === 'timeout' ? 600 : undefined;
    await apply(mentionRule?.id ?? null, {
      name:             RULE.MENTION,
      event_type:       1,
      trigger_type:     TRIGGER.MENTION_SPAM,
      trigger_metadata: { mention_total_limit: limit },
      actions:          actions(timeoutSecs),
      enabled:          true,
      exempt_roles:     exemptRoles,
      exempt_channels:  exemptChannels,
    });
  } else if (mentionRule) {
    await deleteRule(guildId, mentionRule.id, token);
  }

  // ── Palavras Sinalizadas (KEYWORD_PRESET — profanity + slurs) ──────────────
  const presetRule = byName(RULE.PRESET);
  if (autoMod.keywordPreset?.enabled) {
    await apply(presetRule?.id ?? null, {
      name:             RULE.PRESET,
      event_type:       1,
      trigger_type:     TRIGGER.KEYWORD_PRESET,
      trigger_metadata: { presets: [PRESET.PROFANITY, PRESET.SEXUAL_CONTENT, PRESET.SLURS] },
      actions:          actions(),
      enabled:          true,
      exempt_roles:     exemptRoles,
      exempt_channels:  exemptChannels,
    });
  } else if (presetRule) {
    await deleteRule(guildId, presetRule.id, token);
  }

  // ── Perfis de Membros (MEMBER_PROFILE — palavras em nomes/nicknames) ────────
  const profileRule = byName(RULE.PROFILE);
  const profileKeywords = sanitizeKeywords(autoMod.memberProfile?.words ?? []);
  if (autoMod.memberProfile?.enabled && profileKeywords.length > 0) {
    await apply(profileRule?.id ?? null, {
      name:             RULE.PROFILE,
      event_type:       1,
      trigger_type:     TRIGGER.MEMBER_PROFILE,
      trigger_metadata: { keyword_filter: profileKeywords },
      actions:          [{ type: ACTION.BLOCK }],
      enabled:          true,
      exempt_roles:     exemptRoles,
    });
  } else if (profileRule) {
    await deleteRule(guildId, profileRule.id, token);
  }

  // ── Anti-Link (KEYWORD, identificado por nome — não colide com o Filtro) ────
  const linkRule = byName(RULE.LINK);
  if (autoMod.antiLink?.enabled) {
    const whitelist = (autoMod.antiLink.whitelist ?? [])
      .map(d => d.trim().toLowerCase().replace(/^https?:\/\//, ''))
      .filter(d => d.length > 0 && d.length <= MAX_KEYWORD_LEN);
    const allowList = whitelist.length > 0
      ? Array.from(new Set(whitelist.map(d => `*${d}*`))).slice(0, MAX_ALLOWLIST)
      : undefined;
    await apply(linkRule?.id ?? null, {
      name:             RULE.LINK,
      event_type:       1,
      trigger_type:     TRIGGER.KEYWORD,
      trigger_metadata: {
        keyword_filter: ['http://*', 'https://*', ...INVITE_PATTERNS],
        ...(allowList ? { allow_list: allowList } : {}),
      },
      actions:         actions(),
      enabled:         true,
      exempt_roles:    exemptRoles,
      exempt_channels: exemptChannels,
    });
  } else if (linkRule) {
    await deleteRule(guildId, linkRule.id, token);
  }

  return { ok: failures.length === 0, failures };
}
