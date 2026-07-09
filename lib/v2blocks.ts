// Modelo do editor por blocos (Components V2) — partilhado entre o editor,
// a rota de teste e o bot (cópia em bot/src/lib/v2blocks.ts).
// Fase 1: texto, separador, galeria, linha de botões (só links) e container.

export interface V2Text      { id: string; type: 'text'; content: string }
export interface V2Separator { id: string; type: 'separator'; divider: boolean; spacing: 1 | 2 }
export interface V2Gallery   { id: string; type: 'gallery'; urls: string[] }
export interface V2LinkButton { id: string; label: string; emoji?: string; url: string }
export interface V2ButtonRow { id: string; type: 'buttons'; buttons: V2LinkButton[] }
export interface V2Container { id: string; type: 'container'; accentColor?: string; blocks: V2Inner[] }
export type V2Inner = V2Text | V2Separator | V2Gallery | V2ButtonRow;
export type V2Block = V2Inner | V2Container;

export const bid = () => Math.random().toString(36).slice(2, 8);

const isUrl = (u?: string) => /^https?:\/\//i.test((u ?? '').trim());

/** Converte os blocos para o JSON da API do Discord (Components V2).
 *  `parse` substitui as variáveis ({user}, {count}, …) nos textos e labels.
 *  Aplica limites em todos os campos — nunca confiar no que vem da BD. */
export function blocksToApi(blocks: V2Block[], parse: (s: string) => string): Record<string, unknown>[] {
  const one = (b: V2Inner): Record<string, unknown> | null => {
    if (b.type === 'text') {
      const c = parse(b.content || '').slice(0, 2000);
      return c.trim() ? { type: 10, content: c } : null;
    }
    if (b.type === 'separator') {
      return { type: 14, divider: b.divider !== false, spacing: b.spacing === 2 ? 2 : 1 };
    }
    if (b.type === 'gallery') {
      const items = (b.urls || []).filter(isUrl).slice(0, 10).map(u => ({ media: { url: u.trim().slice(0, 500) } }));
      return items.length ? { type: 12, items } : null;
    }
    // linha de botões — só botões de link (style 5), não precisam de handler no bot
    const btns = (b.buttons || [])
      .filter(x => x.label?.trim() && isUrl(x.url))
      .slice(0, 5)
      .map(x => {
        const btn: Record<string, unknown> = { type: 2, style: 5, label: parse(x.label).slice(0, 80), url: x.url.trim().slice(0, 500) };
        const e = (x.emoji ?? '').trim();
        if (e) {
          const m = e.match(/^<(a)?:(\w+):(\d+)>$/);
          btn.emoji = m ? { name: m[2], id: m[3], animated: !!m[1] } : { name: e };
        }
        return btn;
      });
    return btns.length ? { type: 1, components: btns } : null;
  };

  return (blocks || []).slice(0, 15).map(b => {
    if (b.type === 'container') {
      const inner = (b.blocks || []).slice(0, 12).map(one).filter(Boolean);
      if (!inner.length) return null;
      const out: Record<string, unknown> = { type: 17, components: inner };
      const n = parseInt((b.accentColor || '').replace('#', ''), 16);
      if (!isNaN(n)) out.accent_color = n;
      return out;
    }
    return one(b);
  }).filter(Boolean) as Record<string, unknown>[];
}

/** Converte a config antiga (container fixo) em blocos — migração suave. */
export function legacyToBlocks(cfg: { message?: string; accentColor?: string; bannerUrl?: string; footer?: string }): V2Block[] {
  const inner: V2Inner[] = [];
  if (cfg.bannerUrl?.trim()) inner.push({ id: bid(), type: 'gallery', urls: [cfg.bannerUrl.trim()] });
  inner.push({ id: bid(), type: 'text', content: cfg.message || 'Bem-vindo, {user}!' });
  if (cfg.footer?.trim()) {
    inner.push({ id: bid(), type: 'separator', divider: true, spacing: 1 });
    inner.push({ id: bid(), type: 'text', content: `-# ${cfg.footer.trim()}` });
  }
  return [{ id: bid(), type: 'container', accentColor: cfg.accentColor || '#6db83e', blocks: inner }];
}
