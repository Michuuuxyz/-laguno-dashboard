'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

/* ─────────────────────────────── NAV STRUCTURE ─── */
const NAV = [
  { id: 'introduction', label: 'Introdução', group: null },
  {
    id: 'getting-started', label: 'Começar', group: true,
    items: [
      { id: 'add-laguno',   label: 'Adicionar o Laguno' },
      { id: 'dashboard',    label: 'Dashboard Setup' },
      { id: 'faq',          label: 'Perguntas Frequentes' },
      { id: 'commands',     label: 'Comandos' },
      { id: 'variables',    label: 'Variáveis' },
    ],
  },
  {
    id: 'modules', label: 'Módulos', group: true,
    items: [
      { id: 'moderation',   label: 'Moderação' },
      { id: 'welcome',      label: 'Boas-vindas & Despedida' },
      { id: 'logs',         label: 'Registos (Logs)' },
      { id: 'automod',      label: 'Auto-Moderação' },
      { id: 'self-roles',   label: 'Self-Roles' },
      { id: 'giveaways',    label: 'Sorteios' },
      { id: 'builder',      label: 'Construtor de Mensagens' },
      { id: 'tickets',      label: 'Tickets' },
    ],
  },
] as const;

type PageId =
  | 'introduction' | 'add-laguno' | 'dashboard' | 'faq'
  | 'commands' | 'variables' | 'moderation' | 'welcome'
  | 'logs' | 'automod' | 'self-roles' | 'giveaways' | 'builder' | 'tickets';

/* ─────────────────────────────── SMALL ATOMS ─── */
const G = '#6db83e';
const dic = (p: React.ReactNode) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{p}</svg>
);

function Tag({ children, color = G }: { children: string; color?: string }) {
  return (
    <span style={{ fontSize: 10.5, fontWeight: 700, color, background: color + '18', border: `1px solid ${color}30`, borderRadius: 4, padding: '1px 7px', whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

function Cmd({ slash, perm, desc, opts }: {
  slash: string; perm: string; desc: string;
  opts?: { n: string; type: string; req?: boolean; info: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}>
      <div
        onClick={() => opts && setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', cursor: opts ? 'pointer' : 'default', flexWrap: 'wrap' }}
      >
        <code style={{ fontFamily: '"Fira Code",monospace', fontSize: 13, fontWeight: 700, color: G, background: G + '12', border: `1px solid ${G}28`, borderRadius: 5, padding: '2px 9px', flexShrink: 0 }}>
          /{slash}
        </code>
        <span style={{ fontSize: 13.5, color: 'var(--text-2)', flex: 1, minWidth: 0 }}>{desc}</span>
        <Tag color="#94a3b8">{perm}</Tag>
        {opts && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" style={{ flexShrink: 0, transition: 'transform .18s', transform: open ? 'rotate(180deg)' : 'none' }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        )}
      </div>
      {open && opts && (
        <div style={{ borderTop: '1px solid var(--line)', background: 'var(--surface)', padding: '10px 16px 12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ color: 'var(--text-3)', textAlign: 'left' }}>
                <th style={{ paddingBottom: 6, fontWeight: 600, width: 140 }}>Parâmetro</th>
                <th style={{ paddingBottom: 6, fontWeight: 600, width: 80 }}>Tipo</th>
                <th style={{ paddingBottom: 6, fontWeight: 600, width: 70 }}>Req.</th>
                <th style={{ paddingBottom: 6, fontWeight: 600 }}>Descrição</th>
              </tr>
            </thead>
            <tbody>
              {opts.map(o => (
                <tr key={o.n} style={{ borderTop: '1px solid var(--line)' }}>
                  <td style={{ padding: '6px 0', color: G, fontFamily: '"Fira Code",monospace', fontSize: 12 }}>{o.n}</td>
                  <td style={{ padding: '6px 0', color: 'var(--text-3)' }}>{o.type}</td>
                  <td style={{ padding: '6px 0' }}>{o.req ? <span style={{ color: '#ef4444', fontWeight: 700 }}>Sim</span> : <span style={{ color: 'var(--text-3)' }}>Não</span>}</td>
                  <td style={{ padding: '6px 0', color: 'var(--text-2)' }}>{o.info}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Note({ type = 'info', children }: { type?: 'info' | 'warn' | 'tip'; children: React.ReactNode }) {
  const cfg = {
    info: { c: '#5865f2', bg: '#5865f210', label: 'Nota' },
    warn: { c: '#f59e0b', bg: '#f59e0b10', label: 'Atenção' },
    tip:  { c: G,        bg: G + '10',    label: 'Dica' },
  }[type];
  return (
    <div style={{ background: cfg.bg, borderLeft: `3px solid ${cfg.c}`, borderRadius: '0 6px 6px 0', padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: cfg.c, flexShrink: 0, marginTop: 2 }}>{cfg.label}</span>
      <span style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65 }}>{children}</span>
    </div>
  );
}

function Steps({ items }: { items: React.ReactNode[] }) {
  return (
    <div style={{ position: 'relative', marginBottom: 20 }}>
      <div style={{ position: 'absolute', left: 11, top: 24, bottom: 0, width: 1, background: 'var(--line)' }} />
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 16, position: 'relative' }}>
          <div style={{ width: 23, height: 23, borderRadius: '50%', background: G + '18', border: `1.5px solid ${G}`, color: G, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, zIndex: 1 }}>
            {i + 1}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, paddingTop: 2 }}>{item}</div>
        </div>
      ))}
    </div>
  );
}

function PropRow({ label, desc }: { label: string; desc: string }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '9px 0', borderBottom: '1px solid var(--line)', alignItems: 'flex-start', fontSize: 13.5 }}>
      <span style={{ color: G, fontWeight: 600, minWidth: 190, flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>{desc}</span>
    </div>
  );
}

function H1({ children }: { children: React.ReactNode }) {
  return <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-.03em', color: 'var(--text-1)', marginBottom: 12, lineHeight: 1.2 }}>{children}</h1>;
}
function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--text-1)', marginBottom: 10, marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--line)' }}>{children}</h2>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8, marginTop: 20 }}>{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 14 }}>{children}</p>;
}

/* ─────────────────────────────── PAGE CONTENT ─── */
function Content({ page }: { page: PageId }) {
  switch (page) {

    /* ── INTRODUÇÃO ── */
    case 'introduction': return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: G, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Documentação</p>
          <H1>Bem-vindo ao Laguno</H1>
          <P>O <strong style={{ color: 'var(--text-1)' }}>Laguno</strong> é um bot para Discord em português para toda a comunidade lusófona. Oferece moderação com personalidade, logs automáticos, boas-vindas, auto-moderação, self-roles e sorteios — tudo configurado num dashboard web sem escrever uma linha de código.</P>
          <P>Esta documentação cobre todos os módulos e comandos. Navega pela barra lateral para encontrar o que precisas.</P>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 12, marginBottom: 28 }}>
          {[
            { v: '/ (slash)', l: 'Prefixo' },
            { v: 'Português', l: 'Idioma' },
            { v: '30+', l: 'Comandos' },
            { v: '6', l: 'Módulos' },
          ].map(s => (
            <div key={s.l} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, padding: '14px 18px', textAlign: 'center' }}>
              <p style={{ fontSize: 17, fontWeight: 700, color: G, marginBottom: 4 }}>{s.v}</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em' }}>{s.l}</p>
            </div>
          ))}
        </div>
        <H2>Módulos disponíveis</H2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          {[
            { l: 'Moderação', d: 'Warn, ban, kick, mute, timeout, purge, lock e mais.' },
            { l: 'Boas-vindas', d: 'Mensagens automáticas de entrada e despedida.' },
            { l: 'Registos', d: 'Logs completos de moderação, membros, canais e voz.' },
            { l: 'Auto-Moderação', d: '6 regras nativas do Discord + filtro de CAPS e anti-flood.' },
            { l: 'Self-Roles', d: 'Painéis de botões para membros escolherem cargos.' },
            { l: 'Sorteios', d: 'Criação e gestão de giveaways pelo dashboard.' },
            { l: 'Construtor de Mensagens', d: 'Mensagens com botões interativos (Components V2).' },
          ].map(m => (
            <div key={m.l} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, padding: '12px 16px' }}>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>{m.l}</p>
              <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.5 }}>{m.d}</p>
            </div>
          ))}
        </div>
        <Note type="tip">O Laguno nunca responde a outros bots — imune a loops por design.</Note>
      </div>
    );

    /* ── ADICIONAR ── */
    case 'add-laguno': return (
      <div>
        <H1>Adicionar o Laguno</H1>
        <P>Adicionar o Laguno ao teu servidor leva menos de um minuto. Precisas de permissão de <strong style={{ color: 'var(--text-1)' }}>Administrador</strong> no servidor.</P>
        <Steps items={[
          <span key={1}>Acede a <span style={{ color: G }}>lagunoapp.xyz</span> e clica em <strong style={{ color: 'var(--text-1)' }}>Adicionar ao Servidor</strong>.</span>,
          <span key={2}>Faz login com a tua conta Discord se ainda não estiveres autenticado.</span>,
          <span key={3}>Seleciona o servidor onde queres instalar o Laguno.</span>,
          <span key={4}>Aceita as permissões pedidas. O bot precisa de moderar membros, gerir mensagens e aceder a canais.</span>,
          <span key={5}>Clica em <strong style={{ color: 'var(--text-1)' }}>Autorizar</strong>. O Laguno entra no servidor instantaneamente.</span>,
          <span key={6}>Corre <code style={{ color: G }}>/sobre</code> para confirmar que está online e a funcionar.</span>,
        ]} />
        <Note type="warn">Sem permissão de Administrador não consegues adicionar o bot. Pede ao dono do servidor se necessário.</Note>
        <H2>Permissões necessárias</H2>
        <P>O Laguno pede as seguintes permissões ao ser adicionado:</P>
        <div style={{ marginBottom: 16 }}>
          {[
            ['Banir Membros', 'Para executar o comando /ban.'],
            ['Expulsar Membros', 'Para executar o comando /kick.'],
            ['Moderar Membros', 'Para aplicar timeouts e mutes.'],
            ['Gerir Mensagens', 'Para o comando /purge e filtros do bot.'],
            ['Gerir Servidor', 'Para criar as regras nativas de AutoMod no Discord.'],
            ['Gerir Expressões', 'Para o comando /addemoji.'],
            ['Gerir Canais', 'Para /lock, /unlock e /slowmode.'],
            ['Ler e Enviar Mensagens', 'Para responder a comandos e enviar logs.'],
            ['Gerir Cargos', 'Para atribuir e remover cargos (self-roles e mute).'],
          ].map(([p, d]) => <PropRow key={p} label={p} desc={d} />)}
        </div>
        <Note type="tip">O Laguno não guarda o conteúdo das mensagens — só regista metadados para os logs (autor, canal, timestamp).</Note>
      </div>
    );

    /* ── DASHBOARD ── */
    case 'dashboard': return (
      <div>
        <H1>Dashboard Setup</H1>
        <P>O dashboard é onde configuras todos os módulos do Laguno. Não precisas de usar comandos de configuração — tudo é feito graficamente.</P>
        <Steps items={[
          <span key={1}>Acede a <span style={{ color: G }}>lagunoapp.xyz/dashboard</span>.</span>,
          <span key={2}>Clica em <strong style={{ color: 'var(--text-1)' }}>Entrar com Discord</strong> e autoriza o acesso.</span>,
          <span key={3}>Seleciona o servidor que queres configurar na lista.</span>,
          <span key={4}>Navega pelos módulos no menu lateral (Moderação, Boas-vindas, Logs, etc.).</span>,
          <span key={5}>Faz as alterações que precisas e clica em <strong style={{ color: 'var(--text-1)' }}>Guardar</strong>.</span>,
        ]} />
        <Note type="warn">Só membros com permissão de <strong>Gerir Servidor</strong> conseguem aceder às configurações do servidor no dashboard.</Note>
        <H2>Acesso ao servidor</H2>
        <P>Ao entrar no dashboard, vês apenas os servidores onde tens permissão de Gerir Servidor <strong style={{ color: 'var(--text-1)' }}>e</strong> onde o Laguno já foi adicionado. Servidores sem o bot aparecem na lista mas com a opção de o adicionar.</P>
        <H2>Guardar alterações</H2>
        <P>Cada módulo tem o seu próprio botão Guardar. As alterações entram em vigor imediatamente depois de guardares — sem necessidade de reiniciar o bot.</P>
        <Note type="tip">Podes ter o dashboard aberto em múltiplos servidores ao mesmo tempo em separadores diferentes.</Note>
      </div>
    );

    /* ── FAQ ── */
    case 'faq': return (
      <div>
        <H1>Perguntas Frequentes</H1>
        {[
          { q: 'O Laguno é gratuito?', a: 'Sim, completamente gratuito. Não há planos premium, funcionalidades pagas nem anúncios.' },
          { q: 'O bot responde a outros bots?', a: 'Não. O Laguno ignora todas as mensagens e interações de outros bots para evitar loops e exploits.' },
          { q: 'O bot está offline no meu servidor.', a: 'Verifica se o Laguno tem permissão para ver e enviar mensagens no canal onde estás a usar os comandos. Se o problema persistir, abre um ticket no servidor de suporte.' },
          { q: 'Posso usar em vários servidores?', a: 'Sim. Podes adicionar o Laguno a quantos servidores quiseres. Cada servidor tem configurações independentes no dashboard.' },
          { q: 'Como reporto um bug ou peço uma funcionalidade?', a: 'Usa o comando /ajuda dentro do Discord para aceder ao servidor de suporte, onde podes abrir um ticket.' },
          { q: 'O Laguno guarda o conteúdo das minhas mensagens?', a: 'Não. O bot só guarda metadados para logs (quem enviou, em que canal, quando) — nunca o conteúdo das mensagens.' },
          { q: 'Preciso de dar permissão de Administrador ao bot?', a: 'Não é necessário. O Laguno pede apenas as permissões específicas de que precisa para funcionar.' },
          { q: 'O dashboard funciona em mobile?', a: 'Sim, o dashboard é responsivo e funciona em telemóvel, mas a experiência é melhor em desktop.' },
        ].map(({ q, a }) => (
          <div key={q} style={{ borderBottom: '1px solid var(--line)', padding: '14px 0' }}>
            <p style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-1)', marginBottom: 5 }}>{q}</p>
            <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.7 }}>{a}</p>
          </div>
        ))}
      </div>
    );

    /* ── COMANDOS ── */
    case 'commands': return (
      <div>
        <H1>Comandos</H1>
        <P>O Laguno usa exclusivamente <strong style={{ color: 'var(--text-1)' }}>slash commands</strong> (<code style={{ color: G }}>/</code>). Não existe prefixo de texto. Clica num comando para ver os parâmetros detalhados.</P>
        <Note type="info">Os parâmetros marcados como <span style={{ color: '#ef4444', fontWeight: 700 }}>Sim</span> na coluna Req. são obrigatórios. Os restantes são opcionais.</Note>

        <H2>Moderação</H2>
        <Cmd slash="warn add" perm="Moderar Membros" desc="Avisa um membro com um motivo. Os avisos acumulam e podem disparar ações automáticas."
          opts={[
            { n: 'utilizador', type: 'Membro', req: true,  info: 'O membro a avisar.' },
            { n: 'motivo',     type: 'Texto',  req: true,  info: 'Motivo do aviso.' },
          ]} />
        <Cmd slash="warn list" perm="Moderar Membros" desc="Lista todos os avisos de um membro com data, motivo e ID."
          opts={[{ n: 'utilizador', type: 'Membro', req: true, info: 'O membro a consultar.' }]} />
        <Cmd slash="warn remove" perm="Moderar Membros" desc="Remove um aviso específico pelo número."
          opts={[
            { n: 'utilizador', type: 'Membro',  req: true, info: 'O membro.' },
            { n: 'numero',     type: 'Número',  req: true, info: 'Número do aviso (ver /warn list).' },
          ]} />
        <Cmd slash="warn clear" perm="Moderar Membros" desc="Remove todos os avisos de um membro de uma vez."
          opts={[{ n: 'utilizador', type: 'Membro', req: true, info: 'O membro.' }]} />
        <Cmd slash="ban" perm="Banir Membros" desc="Bane um membro permanentemente. Podes apagar dias de mensagens e indicar URL de apelo."
          opts={[
            { n: 'utilizador', type: 'Membro',  req: true,  info: 'O membro a banir.' },
            { n: 'motivo',     type: 'Texto',   req: false, info: 'Motivo do ban.' },
            { n: 'dias',       type: 'Número',  req: false, info: 'Dias de mensagens a apagar (0–7).' },
          ]} />
        <Cmd slash="unban" perm="Banir Membros" desc="Remove o ban de um utilizador pelo ID do Discord."
          opts={[
            { n: 'id',     type: 'Texto', req: true,  info: 'ID do utilizador banido.' },
            { n: 'motivo', type: 'Texto', req: false, info: 'Motivo do unban.' },
          ]} />
        <Cmd slash="tempban" perm="Banir Membros" desc="Bane um membro temporariamente — é desbanido automaticamente ao fim da duração escolhida."
          opts={[
            { n: 'utilizador', type: 'Membro',  req: true,  info: 'O membro a banir.' },
            { n: 'duracao',    type: 'Escolha', req: true,  info: '1h, 6h, 12h, 1d, 3d, 7d, 14d ou 30d.' },
            { n: 'motivo',     type: 'Texto',   req: false, info: 'Motivo do ban.' },
            { n: 'dias',       type: 'Número',  req: false, info: 'Dias de mensagens a apagar (0–7).' },
          ]} />
        <Cmd slash="kick" perm="Expulsar Membros" desc="Expulsa um membro do servidor. O membro pode voltar a entrar com um novo convite."
          opts={[
            { n: 'utilizador', type: 'Membro', req: true,  info: 'O membro a expulsar.' },
            { n: 'motivo',     type: 'Texto',  req: false, info: 'Motivo.' },
          ]} />
        <Cmd slash="mute" perm="Moderar Membros" desc="Atribui o cargo de mute ao membro. O cargo deve ser configurado no dashboard."
          opts={[
            { n: 'utilizador', type: 'Membro', req: true,  info: 'O membro a silenciar.' },
            { n: 'motivo',     type: 'Texto',  req: false, info: 'Motivo.' },
          ]} />
        <Cmd slash="unmute" perm="Moderar Membros" desc="Remove o cargo de mute de um membro."
          opts={[
            { n: 'utilizador', type: 'Membro', req: true,  info: 'O membro.' },
            { n: 'motivo',     type: 'Texto',  req: false, info: 'Motivo.' },
          ]} />
        <Cmd slash="timeout" perm="Moderar Membros" desc="Aplica um timeout nativo do Discord ao membro pelo período escolhido."
          opts={[
            { n: 'utilizador', type: 'Membro', req: true,  info: 'O membro.' },
            { n: 'duracao',    type: 'Escolha', req: true, info: '60s · 5m · 10m · 30m · 1h · 6h · 12h · 1d · 3d · 7d' },
            { n: 'motivo',     type: 'Texto',  req: false, info: 'Motivo.' },
          ]} />
        <Cmd slash="purge" perm="Gerir Mensagens" desc="Apaga em massa até 100 mensagens. Podes filtrar para apagar só de um utilizador."
          opts={[
            { n: 'quantidade', type: 'Número', req: true,  info: 'Número de mensagens (1–100).' },
            { n: 'utilizador', type: 'Membro', req: false, info: 'Apagar só mensagens deste utilizador.' },
          ]} />
        <Cmd slash="lock" perm="Gerir Canais" desc="Bloqueia o canal atual — membros não conseguem enviar mensagens."
          opts={[{ n: 'motivo', type: 'Texto', req: false, info: 'Motivo do bloqueio.' }]} />
        <Cmd slash="unlock" perm="Gerir Canais" desc="Desbloqueia um canal previamente bloqueado." />
        <Cmd slash="slowmode" perm="Gerir Canais" desc="Define o intervalo de slowmode do canal atual."
          opts={[{ n: 'segundos', type: 'Número', req: true, info: 'Intervalo em segundos. 0 para desativar. Máx: 21600.' }]} />

        <H2>Utilidade</H2>
        <Cmd slash="userinfo" perm="Qualquer membro" desc="Mostra informação detalhada sobre um membro: data de criação, entrada no servidor, cargos, etc."
          opts={[{ n: 'utilizador', type: 'Membro', req: false, info: 'Omite para ver o teu próprio perfil.' }]} />
        <Cmd slash="avatar" perm="Qualquer membro" desc="Mostra o avatar de um utilizador em resolução máxima."
          opts={[{ n: 'utilizador', type: 'Membro', req: false, info: 'Omite para ver o teu próprio avatar.' }]} />
        <Cmd slash="banner" perm="Qualquer membro" desc="Mostra o banner de perfil de um utilizador em resolução máxima. Também disponível por clique direito num membro → Apps → Avatar e Banner."
          opts={[{ n: 'utilizador', type: 'Membro', req: false, info: 'Omite para ver o teu próprio banner.' }]} />
        <Cmd slash="lembrete" perm="Qualquer membro" desc="O Laguno avisa-te por DM quando chegar a hora. Máximo de 5 lembretes ativos, de 1 minuto a 30 dias. Também disponível por clique direito numa mensagem → Apps → Lembra-me disto (recebes o link direto da mensagem)."
          opts={[
            { n: 'tempo',    type: 'Texto', req: true, info: 'Formato livre: 10m, 2h, 1d, 1h30m.' },
            { n: 'mensagem', type: 'Texto', req: true, info: 'O que queres que o Laguno te lembre (até 500 caracteres).' },
          ]} />
        <Cmd slash="serverinfo" perm="Qualquer membro" desc="Mostra informação sobre o servidor: membros, cargos, canais, nível de verificação, data de criação. Podes indicar o ID de outro servidor (info limitada se o Laguno não estiver lá)."
          opts={[{ n: 'id', type: 'Texto', req: false, info: 'ID de outro servidor. Omite para o servidor atual.' }]} />
        <Cmd slash="roleinfo" perm="Qualquer membro" desc="Mostra detalhes de um cargo: cor, permissões, membros e data de criação."
          opts={[{ n: 'cargo', type: 'Cargo', req: true, info: 'O cargo a inspecionar.' }]} />
        <Cmd slash="addemoji" perm="Gerir Expressões" desc="Adiciona um emoji ao servidor a partir de outro emoji custom ou de um link de imagem (png, jpg, gif ou webp, até 256 KB)."
          opts={[
            { n: 'emoji', type: 'Texto', req: true,  info: 'Um emoji custom (ex: :nome:) ou um link de imagem.' },
            { n: 'nome',  type: 'Texto', req: false, info: 'Nome do emoji (2–32 caracteres). Omite para usar o nome original.' },
          ]} />
        <Cmd slash="info" perm="Qualquer membro" desc="Informação resumida sobre o servidor." />

        <H2>Self-Roles</H2>
        <Cmd slash="roles panel" perm="Gerir Servidor" desc="Envia um painel de self-roles para o canal atual — em botões ou menu dropdown, conforme o estilo escolhido no dashboard."
          opts={[{ n: 'id', type: 'Texto', req: true, info: 'ID do painel criado no dashboard.' }]} />
        <Cmd slash="roles list" perm="Gerir Servidor" desc="Lista todos os painéis de self-roles configurados no servidor." />

        <H2>Geral</H2>
        <Cmd slash="sobre" perm="Qualquer membro" desc="Mostra informação sobre o Laguno: versão, servidores, uptime e uma frase aleatória com humor." />
        <Cmd slash="ajuda" perm="Qualquer membro" desc="Lista todos os comandos disponíveis com descrição." />
        <Cmd slash="ping" perm="Qualquer membro" desc="Mostra a latência do bot e da API do Discord em milissegundos." />
        <Cmd slash="vote" perm="Qualquer membro" desc="Vota no Laguno nas listas de bots — botões diretos para o top.gg e o discordbotlist, e o estado do teu lembrete de voto." />
      </div>
    );

    /* ── VARIÁVEIS ── */
    case 'variables': return (
      <div>
        <H1>Variáveis</H1>
        <P>As variáveis são marcadores que o Laguno substitui automaticamente pelo valor real quando envia uma mensagem. Podes usá-las nas mensagens de boas-vindas e despedida.</P>
        <H2>Variáveis de membro</H2>
        <div style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
          {[
            ['{mention}',     'Menciona o membro com @.',         '@Michu'],
            ['{username}',    'Nome do utilizador sem @.',        'Michu'],
            ['{tag}',         'Nome + discriminador.',            'Michu#0001'],
            ['{id}',          'ID único do utilizador.',          '123456789012345678'],
            ['{avatarUrl}',   'URL do avatar do membro.',         'https://cdn.discord...'],
          ].map(([v, d, ex], i, arr) => (
            <div key={v} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 160px', gap: 12, padding: '10px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none', fontSize: 13, alignItems: 'center' }}>
              <code style={{ color: G, fontFamily: '"Fira Code",monospace' }}>{v}</code>
              <span style={{ color: 'var(--text-2)' }}>{d}</span>
              <span style={{ color: 'var(--text-3)', fontStyle: 'italic', fontSize: 12 }}>{ex}</span>
            </div>
          ))}
        </div>
        <H2>Variáveis do servidor</H2>
        <div style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
          {[
            ['{server}',      'Nome do servidor.',                'O Meu Servidor'],
            ['{membercount}', 'Número total de membros.',         '1234'],
            ['{serverIcon}',  'URL do ícone do servidor.',        'https://cdn.discord...'],
          ].map(([v, d, ex], i, arr) => (
            <div key={v} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 160px', gap: 12, padding: '10px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none', fontSize: 13, alignItems: 'center' }}>
              <code style={{ color: G, fontFamily: '"Fira Code",monospace' }}>{v}</code>
              <span style={{ color: 'var(--text-2)' }}>{d}</span>
              <span style={{ color: 'var(--text-3)', fontStyle: 'italic', fontSize: 12 }}>{ex}</span>
            </div>
          ))}
        </div>
        <H2>Formatação Markdown</H2>
        <P>Nas mensagens de boas-vindas e despedida podes usar formatação Markdown do Discord:</P>
        <div style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
          {[
            ['**texto**',       'Negrito'],
            ['*texto*',         'Itálico'],
            ['__texto__',       'Sublinhado'],
            ['~~texto~~',       'Rasurado'],
            ['`texto`',         'Código inline'],
            ['> texto',         'Citação'],
          ].map(([s, d], i, arr) => (
            <div key={s} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 12, padding: '9px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none', fontSize: 13 }}>
              <code style={{ color: G, fontFamily: '"Fira Code",monospace' }}>{s}</code>
              <span style={{ color: 'var(--text-2)' }}>{d}</span>
            </div>
          ))}
        </div>
        <Note type="tip">Exemplo: <code style={{ color: G }}>Olá {'{mention}'}! Bem-vindo ao **{'{server}'}**. Já somos **{'{membercount}'}** membros!</code></Note>
      </div>
    );

    /* ── MODERAÇÃO ── */
    case 'moderation': return (
      <div>
        <H1>Moderação</H1>
        <P>O módulo de moderação do Laguno inclui um sistema completo de avisos com histórico, ações automáticas configuráveis e um motor de humor único que muda o tom de cada punição.</P>

        <H2>Motor de Humor</H2>
        <P>O Laguno tem 5 estados de espírito que rodam automaticamente. As mensagens de moderação mudam de tom consoante o estado — o resultado da ação é sempre o mesmo, só a frase é diferente.</P>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: 10, marginBottom: 20 }}>
          {[
            { name: 'Stressado', color: '#ef4444', q: '"CHEGA. Aviso registado."' },
            { name: 'Sonolento', color: '#818cf8', q: '"zzz... aviso... zzz..."' },
            { name: 'Entediado', color: '#94a3b8', q: '"ok. feito. alguém me quer?"' },
            { name: 'Animado',   color: '#fbbf24', q: '"KICK DADO! energia total!"' },
            { name: 'Feliz',     color: G,         q: '"Tratado com carinho. Ish."' },
          ].map(m => (
            <div key={m.name} style={{ background: 'var(--surface)', border: `1px solid ${m.color}25`, borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, marginBottom: 8 }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: m.color, marginBottom: 5 }}>{m.name}</p>
              <p style={{ fontSize: 11.5, color: 'var(--text-3)', fontStyle: 'italic', lineHeight: 1.4 }}>{m.q}</p>
            </div>
          ))}
        </div>

        <H2>Sistema de Avisos</H2>
        <P>Os avisos acumulam por utilizador e ficam guardados na base de dados. Podes listar, remover ou limpar todos com os subcomandos de <code style={{ color: G }}>/warn</code>.</P>
        <H3>Ações automáticas</H3>
        <P>No dashboard, em <strong style={{ color: 'var(--text-1)' }}>Moderação → Ações automáticas</strong>, podes definir que ao atingir X avisos o bot executa automaticamente uma punição:</P>
        <div style={{ marginBottom: 16 }}>
          {[
            ['Mute automático', 'Atribui o cargo de mute ao atingir o limite de avisos.'],
            ['Kick automático', 'Expulsa o membro ao atingir o limite.'],
            ['Ban automático',  'Bane permanentemente ao atingir o limite.'],
          ].map(([l, d]) => <PropRow key={l} label={l} desc={d} />)}
        </div>

        <H2>Configurações no Dashboard</H2>
        <div style={{ marginBottom: 16 }}>
          {[
            ['DM ao punir',       'Envia mensagem privada ao membro com o motivo da punição.'],
            ['Motivo obrigatório','Obriga moderadores a indicar sempre um motivo.'],
            ['Cargo de mute',     'Cargo atribuído pelo /mute. Configura aqui o cargo correto.'],
            ['Limiar de avisos',  'Número de avisos que dispara a ação automática.'],
            ['Ação no limiar',    'O que acontece ao atingir o limiar: mute, kick ou ban.'],
            ['URL de apelo',      'Link enviado ao membro banido para contestar a decisão.'],
          ].map(([l, d]) => <PropRow key={l} label={l} desc={d} />)}
        </div>
        <Note type="warn">Para o /mute funcionar, o cargo de mute deve ter a permissão "Enviar Mensagens" negada em todos os canais.</Note>
      </div>
    );

    /* ── BOAS-VINDAS ── */
    case 'welcome': return (
      <div>
        <H1>Boas-vindas & Despedida</H1>
        <P>Envia mensagens automáticas personalizadas quando um membro entra ou sai do servidor. Suporta variáveis, formatação Markdown, DM privada e auto-delete.</P>

        <H2>Configuração</H2>
        <Steps items={[
          <span key={1}>No dashboard, vai a <strong style={{ color: 'var(--text-1)' }}>Boas-vindas</strong>.</span>,
          <span key={2}>Ativa o módulo e seleciona o canal de boas-vindas.</span>,
          <span key={3}>Escreve a mensagem usando as variáveis disponíveis (ver <span style={{ color: G }}>Variáveis</span>).</span>,
          <span key={4}>Repete para a despedida se quiseres. Podem ser canais diferentes.</span>,
          <span key={5}>Clica em <strong style={{ color: 'var(--text-1)' }}>Guardar</strong>.</span>,
        ]} />

        <H2>Configurações disponíveis</H2>
        <div style={{ marginBottom: 16 }}>
          {[
            ['Canal de boas-vindas', 'Canal onde a mensagem de entrada é publicada.'],
            ['Mensagem de entrada',  'Texto com variáveis enviado quando alguém entra.'],
            ['Banner',               'Imagem no topo do container (png, jpg ou gif).'],
            ['Avatar do membro',     'Mostra a foto de quem entra como thumbnail ao lado do texto.'],
            ['Rodapé',               'Linha pequena no fundo, separada por divisória. Aceita variáveis.'],
            ['Cor de destaque',      'Cor da barra lateral do container.'],
            ['Canal de despedida',   'Canal onde a mensagem de saída é publicada. Pode ser diferente.'],
            ['Mensagem de despedida','Texto enviado quando um membro sai ou é expulso.'],
            ['DM de boas-vindas',    'Envia adicionalmente uma mensagem privada ao membro quando entra.'],
            ['Auto-delete',          'Apaga a mensagem de boas-vindas após N segundos.'],
          ].map(([l, d]) => <PropRow key={l} label={l} desc={d} />)}
        </div>
        <Note type="tip">Usa <code style={{ color: G }}>{'{mention}'}</code> para mencionar o membro e <code style={{ color: G }}>{'{membercount}'}</code> para mostrar o número de membros atual.</Note>
        <Note type="info">Consulta a secção <strong>Variáveis</strong> para a lista completa de marcadores disponíveis.</Note>
      </div>
    );

    /* ── LOGS ── */
    case 'logs': return (
      <div>
        <H1>Registos (Logs)</H1>
        <P>O módulo de logs regista automaticamente eventos do servidor num ou mais canais à tua escolha. Podes escolher exatamente quais eventos registar e onde.</P>

        <H2>Configuração</H2>
        <Steps items={[
          <span key={1}>No dashboard, vai a <strong style={{ color: 'var(--text-1)' }}>Registos</strong>.</span>,
          <span key={2}>Seleciona o canal de logs (podes ter canais diferentes por categoria).</span>,
          <span key={3}>Ativa ou desativa cada evento individualmente.</span>,
          <span key={4}>Clica em <strong style={{ color: 'var(--text-1)' }}>Guardar</strong>.</span>,
        ]} />

        <H2>Categorias de eventos</H2>
        {[
          { label: 'Moderação', color: '#f87171', icon: dic(<><path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z"/><path d="M9.5 12l1.8 1.8L15 10"/></>), events: ['Purge', 'Ban', 'Unban', 'Kick', 'Warn', 'Warn removido', 'Timeout', 'Timeout removido'] },
          { label: 'Mensagens', color: '#60a5fa', icon: dic(<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>), events: ['Mensagem eliminada', 'Mensagem editada', 'Bulk delete', 'Mensagem fixada'] },
          { label: 'Membros',   color: '#4ade80', icon: dic(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="3.2"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></>), events: ['Entrada', 'Saída', 'Atualização de nick/avatar', 'Boost', 'Boost terminado'] },
          { label: 'Canais',    color: '#fbbf24', icon: dic(<path d="M3 7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>), events: ['Canal criado', 'Canal eliminado', 'Canal editado'] },
          { label: 'Cargos',    color: '#a78bfa', icon: dic(<><path d="M20.6 13.4L13 21a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 2.6 12l.4-6a2 2 0 0 1 2-2l6-.4a2 2 0 0 1 1.6.6l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="8.5" r="1.3"/></>), events: ['Cargo criado', 'Cargo eliminado', 'Cargo editado', 'Cargo atribuído', 'Cargo removido'] },
          { label: 'Voz',       color: '#f472b6', icon: dic(<><path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14"/></>), events: ['Entrou em voz', 'Saiu de voz', 'Movido entre canais', 'Mute/unmute'] },
          { label: 'Servidor',  color: '#94a3b8', icon: dic(<><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M22 12h-3M5 12H2"/></>), events: ['Servidor editado', 'Emoji criado', 'Emoji eliminado', 'Invite criado'] },
        ].map(cat => (
          <div key={cat.label} style={{ marginBottom: 16 }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>
              <span style={{ display: 'inline-flex', width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center', background: cat.color + '1a', color: cat.color }}>{cat.icon}</span>
              {cat.label}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {cat.events.map(e => (
                <div key={e} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-2)', padding: '6px 12px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: G, flexShrink: 0 }} />
                  {e}
                </div>
              ))}
            </div>
          </div>
        ))}
        <Note type="tip">Podes ter um canal só para logs de moderação e outro para logs de membros — mantém o servidor organizado.</Note>
      </div>
    );

    /* ── AUTOMOD ── */
    case 'automod': return (
      <div>
        <H1>Auto-Moderação</H1>
        <P>O AutoMod filtra mensagens automaticamente, sem precisar de moderadores online. O Laguno usa <strong style={{ color: 'var(--text-1)' }}>dois motores</strong> que trabalham em conjunto — cada regra tem um só dono, sem duplicação.</P>

        <Note type="tip">Carrega em <strong style={{ color: 'var(--text-1)' }}>Ativar tudo</strong> no dashboard para configurar as 6 regras nativas de uma vez, com máxima cobertura de palavras (mais de 300, de todas as categorias).</Note>

        <H2>Regras nativas do Discord</H2>
        <P>Aplicadas instantaneamente pela API de AutoMod do Discord, sem passar pelo bot. Rápidas e fiáveis.</P>
        {[
          { t: 'Filtro de palavras',        c: '#ef4444', d: 'Bloqueia mensagens com palavras da lista negra. Inclui 6 templates (PT básico, insultos, inglês, discriminação, NSFW, spam/scam) que adicionas com um clique. Até 1000 palavras.' },
          { t: 'Anti-Convites',             c: '#f59e0b', d: 'Bloqueia convites para outros servidores (discord.gg, discord.com/invite e afins). Gifs e links normais NÃO são afetados. Podes permitir domínios específicos.' },
          { t: 'Anti-spam',                 c: '#5865f2', d: 'Deteta e remove mensagens repetidas enviadas em sequência pelo mesmo utilizador.' },
          { t: 'Anti-menções',              c: '#3b82f6', d: 'Bloqueia mensagens que excedam um número máximo de menções, evitando ataques de menção em massa.' },
          { t: 'Palavras sinalizadas',      c: '#a855f7', d: 'Usa as listas de conteúdo do próprio Discord (profanidade, conteúdo sexual e insultos) — mantidas e atualizadas pelo Discord.' },
          { t: 'Perfis de membros',         c: '#ec4899', d: 'Impede que membros usem palavras proibidas no nome ou apelido (nickname).' },
        ].map(f => (
          <div key={f.t} style={{ borderLeft: `3px solid ${f.c}`, padding: '12px 16px', background: 'var(--surface)', borderRadius: '0 8px 8px 0', marginBottom: 10 }}>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 5 }}>{f.t}</p>
            <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65 }}>{f.d}</p>
          </div>
        ))}

        <H2>Regras do Laguno</H2>
        <P>Processadas pelo bot — fazem o que a API do Discord não consegue.</P>
        {[
          { t: 'Filtro de CAPS',            c: '#14b8a6', d: 'Remove mensagens com excesso de maiúsculas. Configurável por percentagem e comprimento mínimo.' },
          { t: 'Anti-flood (auto-slowmode)',c: '#6db83e', d: 'Ativa slowmode automaticamente num canal quando deteta muitas mensagens em pouco tempo. Remove-o sozinho ao fim de um período.' },
        ].map(f => (
          <div key={f.t} style={{ borderLeft: `3px solid ${f.c}`, padding: '12px 16px', background: 'var(--surface)', borderRadius: '0 8px 8px 0', marginBottom: 10 }}>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 5 }}>{f.t}</p>
            <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65 }}>{f.d}</p>
          </div>
        ))}

        <H2>Exceções</H2>
        <P>Podes definir canais e cargos que ficam completamente isentos de todos os filtros do AutoMod. Útil para canais de staff ou cargos de moderadores.</P>
        <div style={{ marginBottom: 16 }}>
          {[
            ['Canais isentos', 'Mensagens nestes canais não são filtradas.'],
            ['Cargos isentos', 'Membros com estes cargos não são afetados por nenhum filtro.'],
          ].map(([l, d]) => <PropRow key={l} label={l} desc={d} />)}
        </div>
        <Note type="warn">O cargo mais alto na hierarquia do Laguno fica automaticamente isento do AutoMod para evitar falsos positivos.</Note>
      </div>
    );

    /* ── SELF-ROLES ── */
    case 'self-roles': return (
      <div>
        <H1>Self-Roles</H1>
        <P>Cria painéis que permitem aos membros escolherem e removerem os seus próprios cargos — sem pedir a um moderador, sem tickets, sem espera. Cada painel pode usar botões ou um menu dropdown de seleção múltipla.</P>

        <H2>Como criar um painel</H2>
        <Steps items={[
          <span key={1}>No dashboard, vai a <strong style={{ color: 'var(--text-1)' }}>Self-Roles</strong> e clica em <strong style={{ color: 'var(--text-1)' }}>Criar painel</strong>.</span>,
          <span key={2}>Define o título e a descrição do painel (texto que aparece acima dos botões).</span>,
          <span key={3}>Adiciona os cargos que queres incluir. Podes personalizar o nome e emoji de cada botão.</span>,
          <span key={4}>Clica em <strong style={{ color: 'var(--text-1)' }}>Guardar</strong>. O painel fica com um ID único.</span>,
          <span key={5}>Num canal do servidor, usa <code style={{ color: G }}>/roles panel id:[ID]</code> para publicar o painel.</span>,
        ]} />

        <H2>Configurações do painel</H2>
        <div style={{ marginBottom: 16 }}>
          {[
            ['Título',       'Título mostrado no topo do painel.'],
            ['Descrição',    'Texto explicativo abaixo do título.'],
            ['Estilo',       'Botões (um por cargo) ou menu dropdown — no menu, o membro marca os cargos que quer e o Laguno adiciona os marcados e remove os desmarcados (máx. 25 cargos).'],
            ['Cor de destaque', 'Cor da barra lateral do container do painel.'],
            ['Banner',       'Imagem opcional no topo do painel.'],
            ['Cargos',       'Lista de cargos com nome e emoji personalizáveis.'],
          ].map(([l, d]) => <PropRow key={l} label={l} desc={d} />)}
        </div>
        <Note type="warn">O Laguno precisa de ter o seu cargo acima dos cargos que vai atribuir na hierarquia do servidor. Caso contrário, não consegue atribuir o cargo.</Note>
        <Note type="tip">Podes ter múltiplos painéis em canais diferentes — por exemplo, um para jogos, outro para idiomas, outro para notificações.</Note>
      </div>
    );

    /* ── SORTEIOS ── */
    case 'giveaways': return (
      <div>
        <H1>Sorteios</H1>
        <P>Cria e gere sorteios diretamente pelo dashboard. O Laguno publica o anúncio, gere as participações e sorteia automaticamente quando o tempo terminar.</P>

        <H2>Como criar um sorteio</H2>
        <Steps items={[
          <span key={1}>No dashboard, vai a <strong style={{ color: 'var(--text-1)' }}>Sorteios</strong> e clica em <strong style={{ color: 'var(--text-1)' }}>Criar sorteio</strong>.</span>,
          <span key={2}>Define o prémio, o canal de publicação, a duração e o número de vencedores.</span>,
          <span key={3}>Clica em <strong style={{ color: 'var(--text-1)' }}>Iniciar</strong>. O Laguno publica o anúncio com um botão de participação.</span>,
          <span key={4}>Os membros clicam no botão para participar. O Laguno gere as inscrições automaticamente.</span>,
          <span key={5}>Quando o tempo terminar, o bot sorteia e anuncia os vencedores no mesmo canal.</span>,
        ]} />

        <H2>Opções do sorteio</H2>
        <div style={{ marginBottom: 16 }}>
          {[
            ['Prémio',          'O que está a ser sorteado.'],
            ['Canal',           'Canal onde o anúncio é publicado.'],
            ['Duração',         'Quanto tempo o sorteio fica aberto.'],
            ['Nº de vencedores','Quantos membros são sorteados.'],
          ].map(([l, d]) => <PropRow key={l} label={l} desc={d} />)}
        </div>

        <H2>Re-roll</H2>
        <P>Se um vencedor não reclamar o prémio, podes fazer re-roll no dashboard para sortear um novo vencedor sem criar um sorteio novo.</P>
        <Note type="info">Os sorteios ficam guardados no histórico do dashboard mesmo depois de terminarem — podes consultar participantes e vencedores anteriores.</Note>
      </div>
    );

    /* ── CONSTRUTOR DE MENSAGENS ── */
    case 'builder': return (
      <div>
        <H1>Construtor de Mensagens</H1>
        <P>Cria mensagens ricas com <strong style={{ color: 'var(--text-1)' }}>botões interativos</strong>, direto do dashboard, e envia-as para qualquer canal. Usa os <strong style={{ color: 'var(--text-1)' }}>Components V2</strong> do Discord — tudo dentro de um container com a tua cor.</P>

        <H2>Como funciona</H2>
        <Steps items={[
          <span key={1}>No dashboard, vai a <strong style={{ color: 'var(--text-1)' }}>Construtor</strong>.</span>,
          <span key={2}>Escolhe a cor de destaque e o canal de destino. Opcionalmente, define o <strong style={{ color: 'var(--text-1)' }}>nome e avatar do remetente</strong> — a mensagem sai com essa identidade em vez do Laguno.</span>,
          <span key={3}>Adiciona blocos na ordem que quiseres: <strong style={{ color: 'var(--text-1)' }}>Texto, Imagem, Separador</strong> ou <strong style={{ color: 'var(--text-1)' }}>Botões</strong>.</span>,
          <span key={4}>Reordena os blocos com as setas e vê a pré-visualização em tempo real.</span>,
          <span key={5}>Clica em <strong style={{ color: 'var(--text-1)' }}>Enviar</strong>. A mensagem é publicada no canal escolhido.</span>,
        ]} />

        <H2>Blocos disponíveis</H2>
        <div style={{ marginBottom: 16 }}>
          {[
            ['Texto',     'Markdown livre — ## título, **negrito**, `código`, -# rodapé. Quantos quiseres. Cada bloco de texto pode ter um acessório à direita: uma imagem pequena ou um botão.'],
            ['Imagem',    'Uma imagem por URL, colocada onde quiseres (topo, meio, fim).'],
            ['Separador', 'Linha divisória ou espaço em branco para organizar a mensagem.'],
            ['Botões',    'Uma linha de até 5 botões. Cada botão tem a sua ação (ver abaixo).'],
          ].map(([l, d]) => <PropRow key={l} label={l} desc={d} />)}
        </div>

        <H2>Remetente personalizado</H2>
        <P>Preenche o nome e/ou o avatar do remetente e a mensagem é enviada com essa identidade — perfeito para anúncios com marca própria. O Laguno usa um webhook criado por ele no canal, por isso os botões continuam a funcionar normalmente. Requer que o bot tenha a permissão <strong style={{ color: 'var(--text-1)' }}>Gerir Webhooks</strong> no canal. O Discord não permite nomes com «discord» ou «clyde».</P>

        <H2>Ações dos botões</H2>
        <P>Cada botão que adicionas pode fazer uma de três coisas ao ser clicado:</P>
        {[
          { t: 'Enviar mensagem', c: '#6db83e', d: 'O bot responde com uma mensagem tua — privada (só quem clica vê) ou pública no canal. Perfeito para FAQ, regras, info ou suporte.' },
          { t: 'Dar / tirar cargo', c: '#a855f7', d: 'Alterna um cargo no membro que clica — como os self-roles, mas dentro de qualquer mensagem.' },
          { t: 'Abrir link', c: '#5865f2', d: 'Botão que abre um URL externo (site, servidor de suporte, etc.). Tem de ser um link https:// válido.' },
        ].map(f => (
          <div key={f.t} style={{ borderLeft: `3px solid ${f.c}`, padding: '12px 16px', background: 'var(--surface)', borderRadius: '0 8px 8px 0', marginBottom: 10 }}>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 5 }}>{f.t}</p>
            <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65 }}>{f.d}</p>
          </div>
        ))}
        <Note type="tip">Cada botão pode ter uma cor (azul, cinza, verde ou vermelho) e um emoji. Podes ter várias linhas de botões na mesma mensagem.</Note>
        <Note type="warn">Para os botões de cargo funcionarem, o Laguno precisa de ter o seu cargo acima dos cargos que vai atribuir na hierarquia do servidor.</Note>
      </div>
    );

    /* ── TICKETS ── */
    case 'tickets': return (
      <div>
        <H1>Tickets</H1>
        <P>Um sistema de suporte completo: os membros clicam num botão de um painel e abre-se um espaço <strong style={{ color: 'var(--text-1)' }}>privado</strong> entre eles e a tua equipa. Cada painel é montado no dashboard, com pré-visualização em direto, e ao fechar gera um <strong style={{ color: 'var(--text-1)' }}>transcript em HTML</strong>.</P>

        <H2>Configuração inicial</H2>
        <Steps items={[
          <span key={1}>No dashboard, vai a <strong style={{ color: 'var(--text-1)' }}>Tickets</strong> e ativa o sistema.</span>,
          <span key={2}>Escolhe os <strong style={{ color: 'var(--text-1)' }}>cargos de suporte</strong> (quem vê e gere os tickets), a <strong style={{ color: 'var(--text-1)' }}>categoria</strong> onde os canais são criados e o <strong style={{ color: 'var(--text-1)' }}>canal de transcripts</strong>.</span>,
          <span key={3}>Define o <strong style={{ color: 'var(--text-1)' }}>formato por defeito</strong> (canal privado ou thread privada), o limite de tickets por membro e o nome do canal.</span>,
          <span key={4}>Cria um <strong style={{ color: 'var(--text-1)' }}>painel</strong>, adiciona categorias/botões e clica em <strong style={{ color: 'var(--text-1)' }}>Guardar tudo</strong>.</span>,
          <span key={5}>Escolhe o canal e clica em <strong style={{ color: 'var(--text-1)' }}>Enviar painel</strong>. Os membros já podem abrir tickets.</span>,
        ]} />

        <H2>Opções gerais</H2>
        <div style={{ marginBottom: 16 }}>
          {[
            ['Formato',           'Canal privado (dentro de uma categoria) ou thread privada. Configurável por painel ou por categoria.'],
            ['Cargos de suporte', 'Cargos que veem todos os tickets, podem reivindicar, fechar e gerir membros.'],
            ['Categoria',         'Onde os canais de ticket são criados (para o formato "canal").'],
            ['Canal base',        'Canal onde as threads são criadas (para o formato "thread").'],
            ['Transcripts',       'Canal onde o histórico HTML é publicado ao fechar cada ticket.'],
            ['Limite por membro', 'Quantos tickets abertos cada membro pode ter ao mesmo tempo.'],
          ].map(([l, d]) => <PropRow key={l} label={l} desc={d} />)}
        </div>

        <H2>Painéis e categorias</H2>
        <P>Cada <strong style={{ color: 'var(--text-1)' }}>painel</strong> é a mensagem com botões que os membros veem. Tem título, descrição, cor e banner opcional. Dentro do painel, cada <strong style={{ color: 'var(--text-1)' }}>categoria</strong> é um botão — e pode ter tudo à sua medida:</P>
        <div style={{ marginBottom: 16 }}>
          {[
            ['Texto, emoji e cor',      'A aparência do botão no painel.'],
            ['Mensagem de abertura',    'O que aparece dentro do ticket quando é aberto.'],
            ['Formato',                 'Canal ou thread — pode diferir do formato por defeito.'],
            ['Formulário',              'Até 5 perguntas (curtas ou longas) que o membro responde antes de o ticket abrir. A staff recebe logo o contexto.'],
          ].map(([l, d]) => <PropRow key={l} label={l} desc={d} />)}
        </div>
        <Note type="tip">O construtor tem pré-visualização em direto — vês o painel exatamente como vai ficar no Discord enquanto o editas.</Note>

        <H2>Dentro de um ticket</H2>
        <P>Quando um ticket abre, o Laguno publica uma mensagem com botões de controlo (personalizáveis no dashboard):</P>
        {[
          { t: 'Reivindicar', c: '#3ba55d', d: 'A staff assume o ticket. Podes desativar este botão ou mudar o seu texto e emoji.' },
          { t: 'Fechar', c: '#ed4245', d: 'Pede um motivo e fecha o ticket. Gera o transcript, envia-o ao canal de transcripts e por DM ao membro, e apaga/arquiva o canal.' },
        ].map(f => (
          <div key={f.t} style={{ borderLeft: `3px solid ${f.c}`, padding: '12px 16px', background: 'var(--surface)', borderRadius: '0 8px 8px 0', marginBottom: 10 }}>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 5 }}>{f.t}</p>
            <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65 }}>{f.d}</p>
          </div>
        ))}

        <H2>Comandos dentro do ticket</H2>
        <div style={{ marginBottom: 16 }}>
          {[
            ['/ticket add',      'Adiciona um membro ao ticket.'],
            ['/ticket remove',   'Remove um membro do ticket.'],
            ['/ticket renomear', 'Muda o nome do canal do ticket.'],
            ['/ticket fechar',   'Fecha o ticket (staff ou o próprio dono).'],
          ].map(([l, d]) => <PropRow key={l} label={l} desc={d} />)}
        </div>

        <Note type="warn">O Laguno precisa da permissão <strong style={{ color: 'var(--text-1)' }}>Gerir Canais</strong> para criar e apagar os tickets, e do seu cargo acima na hierarquia para gerir as permissões.</Note>
      </div>
    );

    default: return null;
  }
}

/* ─────────────────────────────── MAIN ─── */
export default function DocsPage() {
  const [page, setPage] = useState<PageId>('introduction');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ 'getting-started': true, modules: true });
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeLabel = (() => {
    for (const n of NAV) {
      if (n.id === page) return n.label;
      if ('items' in n) for (const i of n.items) if (i.id === page) return i.label;
    }
    return '';
  })();

  const go = (id: PageId) => { setPage(id); setMobileOpen(false); window.scrollTo(0, 0); };

  const toggleGroup = (id: string) => setOpenGroups(p => ({ ...p, [id]: !p[id] }));

  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 0' }}>
      {/* Logo */}
      <div style={{ padding: '0 16px 20px', borderBottom: '1px solid var(--line)', marginBottom: 10 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
            <Image src="/laguno.png" alt="" width={26} height={26} style={{ objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>Laguno Docs</span>
        </Link>

      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        {NAV.map(section => {
          if (!('items' in section)) {
            return (
              <button
                key={section.id}
                onClick={() => go(section.id as PageId)}
                style={{ width: '100%', textAlign: 'left', padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 500, background: page === section.id ? G + '15' : 'transparent', color: page === section.id ? G : 'var(--text-2)', transition: 'all .15s', marginBottom: 2 }}
              >
                {section.label}
              </button>
            );
          }
          return (
            <div key={section.id} style={{ marginBottom: 4 }}>
              <button
                onClick={() => toggleGroup(section.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: G, background: 'transparent' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    {section.id === 'getting-started'
                      ? <><path d="M5 13l4 4L19 7"/><path d="M4 20v-3"/></>
                      : <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>}
                  </svg>
                  {section.label}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transition: 'transform .18s', transform: openGroups[section.id] ? 'rotate(180deg)' : 'none' }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {openGroups[section.id] && section.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => go(item.id as PageId)}
                  style={{ width: '100%', textAlign: 'left', padding: '5px 10px 5px 22px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, background: page === item.id ? G + '15' : 'transparent', color: page === item.id ? G : 'var(--text-2)', fontWeight: page === item.id ? 600 : 400, transition: 'all .15s', display: 'block', marginBottom: 1 }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          );
        })}
      </div>

      <div style={{ padding: '16px 16px 0', borderTop: '1px solid var(--line)', marginTop: 10 }}>
        <Link href="/" style={{ fontSize: 12, color: 'var(--text-3)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Voltar ao site
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>

      {/* Top bar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,13,15,.92)', backdropFilter: 'blur(14px)', borderBottom: '1px solid var(--line)', height: 50, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12 }}>
        <button onClick={() => setMobileOpen(p => !p)} className="docs-ham" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', overflow: 'hidden' }}>
            <Image src="/laguno.png" alt="" width={20} height={20} style={{ objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)' }}>Laguno Docs</span>
        </Link>
        <span style={{ color: 'var(--text-3)', fontSize: 13 }}>›</span>
        <span style={{ fontSize: 13, color: G, fontWeight: 500 }}>{activeLabel}</span>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar desktop */}
        <aside className="docs-sb" style={{ width: 220, flexShrink: 0, borderRight: '1px solid var(--line)', position: 'sticky', top: 50, height: 'calc(100vh - 50px)', overflowY: 'auto' }}>
          {sidebar}
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.5)' }} onClick={() => setMobileOpen(false)}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 250, background: 'var(--bg)', borderRight: '1px solid var(--line)' }} onClick={e => e.stopPropagation()}>
              {sidebar}
            </div>
          </div>
        )}

        {/* Content */}
        <main style={{ flex: 1, minWidth: 0, padding: 'clamp(28px,4vh,48px) clamp(20px,4vw,64px)', maxWidth: 820 }}>
          <Content page={page} />
          <div style={{ marginTop: 48, paddingTop: 20, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-3)' }}>
            <span>Laguno Docs · 2026</span>
            <Link href="/" style={{ color: G, textDecoration: 'none' }}>← Voltar ao site</Link>
          </div>
        </main>
      </div>

      <style>{`
        .docs-sb  { display: flex !important; flex-direction: column; }
        .docs-ham { display: none !important; }
        @media (max-width: 720px) {
          .docs-sb  { display: none !important; }
          .docs-ham { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
