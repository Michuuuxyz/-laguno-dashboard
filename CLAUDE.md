# Laguno Dashboard — Regras para Claude

## Stack
- Next.js 15 App Router (React 19), TypeScript, CSS-in-JS (inline styles)
- Nota Next 15: `params`/`searchParams` são `Promise` — fazer `await params` em pages e route handlers
- Auth: NextAuth.js com Discord OAuth (scopes: `identify`, `guilds`)
- DB: MongoDB direto via `mongodb` driver (não Mongoose) — coleção `laguno`, documento `guildconfigs`
- Hosted em Vercel — deploy automático ao fazer `git push origin master` (não usar `vercel deploy` manualmente)
- URL de produção: `https://www.lagunoapp.xyz`

## Estrutura
```
app/
  layout.tsx          — metadata global, metadataBase = https://www.lagunoapp.xyz
  page.tsx            — landing page (pública)
  docs/page.tsx       — documentação (pública)
  features/page.tsx   — funcionalidades (pública)
  sobre/page.tsx      — sobre o criador — Server Component async, busca perfil Discord real
  login/page.tsx      — página de login Discord
  legal/page.tsx      — termos e privacidade
  dashboard/
    page.tsx          — lista de servidores do utilizador
    [guildId]/page.tsx — config de um servidor (carrega GuildSettings)
  api/
    auth/[...nextauth]/route.ts
    guilds/[guildId]/config/route.ts   — GET/POST config do servidor
    guilds/[guildId]/channels/route.ts — lista de canais de texto
    guilds/[guildId]/roles/route.ts    — lista de cargos
    guilds/[guildId]/warns/route.ts    — warns do servidor
    guilds/[guildId]/welcome/test/route.ts — envia mensagem de teste de boas-vindas
    giveaways/[guildId]/route.ts
    giveaways/[guildId]/[giveawayId]/route.ts
    giveaways/[guildId]/[giveawayId]/reroll/route.ts
    stats/route.ts
    vote/route.ts
components/
  GuildSettings.tsx   — componente principal do dashboard (client, tabs)
  WelcomeTab.tsx      — configuração de boas-vindas/despedidas com preview
  RolesTab.tsx        — painéis de cargos (estilo 'buttons' ou 'menu' dropdown por painel; guardado em rolePanels[].style)
  modules/GiveawayModule.tsx
lib/
  auth.ts             — NextAuth options
  discord.ts          — getUserGuilds(), hasManageGuild()
  mongodb.ts          — ligação MongoDB
  discordAutoMod.ts   — syncAutoModRules() — sincroniza AutoMod nativo do Discord
  hooks/useStats.ts
```

## Autenticação
- Toda a API e o dashboard requerem sessão NextAuth
- Verificar sempre: `const session = await getServerSession(authOptions); if (!session) return 401`
- O utilizador tem permissão no servidor se `guild.owner || hasManageGuild(guild.permissions)`
- `session.user.id` = Discord ID do utilizador

## Base de dados
- Ligação direta via `mongodb` driver (não Mongoose)
- Coleção: `guildconfigs` na DB `laguno`
- Usar sempre o singleton `clientPromise` de `lib/mongodb.ts` — NUNCA fechar o cliente (`client.close()`), a ligação é partilhada entre invocações serverless
- Após guardar config, invalidar cache do bot **via MongoDB** (a Discloud não expõe HTTP do bot):
  ```ts
  await db.collection('cacheinvalidations').insertOne({ guildId, createdAt: new Date() });
  ```
  O bot (managerBridge) consome estes docs a cada 10s. Stats do bot: ler coleção `botstatus` (doc `_id: 'laguno'`, heartbeat de 30s; offline = doc >90s).

## Comunicação com o bot — via MongoDB (não HTTP!)
- A Discloud não expõe HTTP de apps TYPE=bot; a ponte é a BD partilhada (managerBridge no bot)
- `botstatus` (doc `_id: 'laguno'`) — heartbeat de stats do bot a cada 30s; `/api/stats` e a landing leem daqui (offline = doc >90s)
- `cacheinvalidations` — o dashboard insere `{ guildId, createdAt }` ao guardar config; o bot aplica em ≤10s
- Canais/cargos/mensagens de teste: o dashboard fala DIRETAMENTE com a API do Discord (Bot token), não com o bot
- `BOT_API_URL`/`BOT_API_SECRET` já não são usados pelo dashboard

## AutoMod nativo do Discord
- `lib/discordAutoMod.ts` → `syncAutoModRules()` — chamado em `config/route.ts` após guardar
- Cria/atualiza/apaga regras AutoMod do Discord com prefixo `Laguno:`
- Regras geridas: `Laguno: Filtro de Palavras`, `Laguno: Anti-Spam`, `Laguno: Anti-Menções`, `Laguno: Anti-Link`
- O bot **também** implementa estas regras em código (automod/index.ts) — dupla proteção

## Estilo e UI
- Zero dependências de UI externas — tudo inline styles
- Variáveis CSS disponíveis:
  - `--bg`, `--card`, `--elevated`, `--surface` — fundos
  - `--text-1`, `--text-2`, `--text-3` — texto (1=primário, 3=subtexto)
  - `--line` — borders
  - `--green` = `#6db83e` — cor de destaque do Laguno
- Componentes 'use client' para interatividade, Server Components para data fetching
- Não usar `dangerouslySetInnerHTML` em client components — causa hydration errors
- Todos os inputs seguem o padrão `inputStyle`: `{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, ... }`

## GuildSettings.tsx (componente principal do dashboard)
- Carrega config via `GET /api/guilds/:guildId/config`
- Guarda via `POST /api/guilds/:guildId/config` com debounce ou botão Guardar
- Tabs disponíveis: `overview`, `settings`, `welcome`, `roles`, `automod`, `logs`, `warns`, `moderation`, `giveaways`
- Cada tab é um componente separado recebendo `config` + callbacks

## Páginas públicas
- `app/sobre/page.tsx` — Server Component async — busca perfil Discord de Michu (ID: `349527593634234370`) via API com `revalidate: 3600`
- `app/sitemap.xml/route.ts` — gera o sitemap com URLs www (force-static, revalidate 1 dia) — não usar `public/sitemap.xml`
- `app/robots.ts` — permite `/`, bloqueia `/dashboard` e `/api`

## Variáveis de ambiente necessárias (Vercel)
```
DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET
DISCORD_TOKEN          — token do bot (para API Discord e buscar perfil)
NEXTAUTH_SECRET
NEXTAUTH_URL=https://www.lagunoapp.xyz
MONGODB_URI
BOT_API_URL            — URL da API interna do bot
BOT_API_SECRET         — segredo Bearer para autenticar no bot
```

## Regras
- Nunca expor `DISCORD_TOKEN`, `DISCORD_CLIENT_SECRET`, `MONGODB_URI`, `BOT_API_SECRET` no cliente
- Toda a lógica sensível fica em Server Components ou Route Handlers (`/api/`)
- Deploy = commit + `git push origin master` (Vercel constrói sozinha); nunca fazer push sem `npx tsc --noEmit` e `npx next build --no-lint` passarem
- `metadataBase` e `openGraph.url` usam sempre `https://www.lagunoapp.xyz` (com www)
- `app/sitemap.xml/route.ts` é a única fonte de sitemap — nunca criar `public/sitemap.xml`
