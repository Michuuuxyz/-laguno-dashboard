'use client';

import { useMemo, useState } from 'react';

/* ── Dados dos comandos — espelham 1:1 os slash commands do bot ── */

type Cat = 'moderacao' | 'utilidade' | 'geral';

interface Opt { n: string; req?: boolean }
interface Cmd {
  name: string;
  desc: string;
  cat: Cat;
  perm?: string;      // permissão do Discord exigida (default_member_permissions)
  opts?: Opt[];       // opções do comando
  subs?: string[];    // subcomandos
}

const COMMANDS: Cmd[] = [
  // ── Moderação ──
  { name: 'ban',      cat: 'moderacao', desc: 'Bane um membro do servidor.', perm: 'Banir Membros', opts: [{ n: 'utilizador', req: true }, { n: 'motivo' }, { n: 'dias' }] },
  { name: 'tempban',  cat: 'moderacao', desc: 'Bane temporariamente — o membro é desbanido automaticamente no fim.', perm: 'Banir Membros', opts: [{ n: 'utilizador', req: true }, { n: 'duração', req: true }, { n: 'motivo' }, { n: 'dias' }] },
  { name: 'unban',    cat: 'moderacao', desc: 'Levanta o ban de um utilizador.', perm: 'Banir Membros', opts: [{ n: 'id', req: true }, { n: 'motivo' }] },
  { name: 'kick',     cat: 'moderacao', desc: 'Expulsa um membro do servidor.', perm: 'Expulsar Membros', opts: [{ n: 'utilizador', req: true }, { n: 'motivo' }] },
  { name: 'timeout',  cat: 'moderacao', desc: 'Coloca um membro em silêncio temporário (60s a 7 dias).', perm: 'Moderar Membros', opts: [{ n: 'utilizador', req: true }, { n: 'duração', req: true }, { n: 'motivo' }] },
  { name: 'mute',     cat: 'moderacao', desc: 'Silencia um membro usando o cargo de mute configurado no dashboard.', perm: 'Moderar Membros', opts: [{ n: 'utilizador', req: true }, { n: 'motivo' }] },
  { name: 'unmute',   cat: 'moderacao', desc: 'Remove o silêncio de um membro.', perm: 'Moderar Membros', opts: [{ n: 'utilizador', req: true }, { n: 'motivo' }] },
  { name: 'warn',     cat: 'moderacao', desc: 'Gere os avisos de um membro — adiciona, lista, remove um específico ou limpa todos.', perm: 'Moderar Membros', subs: ['add', 'list', 'remove', 'clear'] },
  { name: 'purge',    cat: 'moderacao', desc: 'Apaga mensagens do canal em massa. Podes filtrar por utilizador.', perm: 'Gerir Mensagens', opts: [{ n: 'quantidade', req: true }, { n: 'utilizador' }] },
  { name: 'lock',     cat: 'moderacao', desc: 'Bloqueia o canal — impede membros de enviar mensagens.', perm: 'Gerir Canais', opts: [{ n: 'motivo' }] },
  { name: 'unlock',   cat: 'moderacao', desc: 'Desbloqueia o canal — os membros voltam a poder falar.', perm: 'Gerir Canais' },
  { name: 'slowmode', cat: 'moderacao', desc: 'Define o slowmode do canal (0 para desativar, máx. 6 horas).', perm: 'Gerir Canais', opts: [{ n: 'segundos', req: true }] },
  // ── Utilidade ──
  { name: 'avatar',     cat: 'utilidade', desc: 'Mostra o avatar de um utilizador em alta resolução.', opts: [{ n: 'utilizador' }] },
  { name: 'userinfo',   cat: 'utilidade', desc: 'Mostra informação sobre um membro — conta, cargos, datas.', opts: [{ n: 'utilizador' }] },
  { name: 'serverinfo', cat: 'utilidade', desc: 'Mostra informação sobre o servidor — membros, canais, boosts.', opts: [{ n: 'id' }] },
  { name: 'roleinfo',   cat: 'utilidade', desc: 'Mostra informação sobre um cargo — cor, permissões, membros.', opts: [{ n: 'cargo', req: true }] },
  { name: 'addemoji',   cat: 'utilidade', desc: 'Adiciona um emoji ao servidor a partir de outro emoji ou de um link de imagem.', perm: 'Gerir Expressões', opts: [{ n: 'emoji', req: true }, { n: 'nome' }] },
  // ── Geral ──
  { name: 'ajuda', cat: 'geral', desc: 'Mostra tudo o que o Laguno sabe fazer — que é bastante.' },
  { name: 'sobre', cat: 'geral', desc: 'O que é o Laguno? Boa pergunta. Tens uns minutos?' },
  { name: 'info',  cat: 'geral', desc: 'Espia o teu próprio servidor como se não soubesses onde vives.' },
  { name: 'ping',  cat: 'geral', desc: 'Testa se o bot ainda está vivo. (Spoiler: está.)' },
  { name: 'roles', cat: 'geral', desc: 'Envia um painel de self-roles criado no dashboard para o canal.', perm: 'Gerir Cargos', subs: ['panel'], opts: [{ n: 'id', req: true }] },
];

const CATS: { id: Cat | 'todos'; label: string }[] = [
  { id: 'todos',     label: 'Todos' },
  { id: 'moderacao', label: 'Moderação' },
  { id: 'utilidade', label: 'Utilidade' },
  { id: 'geral',     label: 'Geral' },
];

const CAT_COLOR: Record<Cat, string> = {
  moderacao: '#f87171',
  utilidade: '#60a5fa',
  geral:     '#6db83e',
};
const CAT_LABEL: Record<Cat, string> = {
  moderacao: 'Moderação',
  utilidade: 'Utilidade',
  geral:     'Geral',
};

/* Normaliza para pesquisa sem acentos */
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function CommandsExplorer() {
  const [query, setQuery] = useState('');
  const [cat, setCat]     = useState<Cat | 'todos'>('todos');

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    return COMMANDS.filter(c => {
      if (cat !== 'todos' && c.cat !== cat) return false;
      if (!q) return true;
      return norm(c.name).includes(q) || norm(c.desc).includes(q) || (c.subs ?? []).some(s => norm(s).includes(q));
    });
  }, [query, cat]);

  return (
    <div>
      {/* Pesquisa — estilizada como um input de slash command */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12,
        padding: '4px 18px', marginBottom: 18,
        transition: 'border-color .15s',
      }}
        onFocusCapture={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(109,184,62,.5)'; }}
        onBlurCapture={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--line)'; }}
      >
        <span className="display" style={{ fontSize: 26, fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>/</span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Procura um comando... (ex: ban, avisos, slowmode)"
          aria-label="Procurar comandos"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text-1)', fontSize: 15.5, padding: '13px 0',
            fontFamily: 'inherit',
          }}
        />
        {query && (
          <button onClick={() => setQuery('')} aria-label="Limpar pesquisa" style={{
            background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer',
            fontSize: 16, lineHeight: 1, padding: 4,
          }}>✕</button>
        )}
      </div>

      {/* Filtros por categoria */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        {CATS.map(c => {
          const active = cat === c.id;
          const count = c.id === 'todos' ? COMMANDS.length : COMMANDS.filter(x => x.cat === c.id).length;
          return (
            <button key={c.id} onClick={() => setCat(c.id)} style={{
              padding: '6px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all .15s',
              border: active ? '1px solid rgba(109,184,62,.5)' : '1px solid var(--line)',
              background: active ? 'rgba(109,184,62,.12)' : 'transparent',
              color: active ? 'var(--green)' : 'var(--text-2)',
            }}>
              {c.label} <span style={{ opacity: .55, fontWeight: 500 }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Grelha de comandos */}
      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {filtered.map(c => (
            <div key={c.name} style={{
              background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12,
              padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10,
              transition: 'border-color .15s, transform .15s',
            }}
              onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = 'var(--line-hover, rgba(255,255,255,.16))'; d.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = 'var(--line)'; d.style.transform = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <code style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--green)', letterSpacing: '-.01em' }}>
                  /{c.name}
                </code>
                <span style={{
                  fontSize: 10.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase',
                  color: CAT_COLOR[c.cat], opacity: .85, flexShrink: 0,
                }}>
                  {CAT_LABEL[c.cat]}
                </span>
              </div>

              <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6, flex: 1 }}>{c.desc}</p>

              {(c.subs || c.opts || c.perm) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                  {c.subs?.map(s => (
                    <code key={s} style={{
                      fontSize: 11.5, padding: '2px 9px', borderRadius: 5,
                      background: 'rgba(109,184,62,.1)', color: 'var(--green)',
                    }}>{s}</code>
                  ))}
                  {c.opts?.map(o => (
                    <code key={o.n} style={{
                      fontSize: 11.5, padding: '2px 9px', borderRadius: 5,
                      background: 'var(--elevated)', color: 'var(--text-3)',
                      border: '1px solid var(--line)',
                    }} title={o.req ? 'Obrigatório' : 'Opcional'}>
                      {o.n}{o.req ? '' : '?'}
                    </code>
                  ))}
                  {c.perm && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 99, marginLeft: 'auto',
                      border: '1px solid rgba(248,113,113,.25)', color: '#f87171', whiteSpace: 'nowrap',
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      {c.perm}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '64px 20px', border: '1px dashed var(--line)', borderRadius: 14 }}>
          <span style={{ display: 'inline-flex', width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--line)', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', marginBottom: 14 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 6 }}>
            Nenhum comando com «{query}».
          </p>
          <p style={{ fontSize: 13.5, color: 'var(--text-3)' }}>
            Ou ainda não existe... ou escreveste mal. Aposto na segunda.
          </p>
        </div>
      )}
    </div>
  );
}
