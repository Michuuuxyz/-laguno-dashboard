/* Fundo de rabiscos da lagoa — a assinatura visual do site.
   Padrão subtil com coisas do Laguno: zzz, os olhos na água, um ticket e um
   /ban. Desenhado como MÁSCARA sobre uma cor (var(--doodle)), para se adaptar
   ao tema (claro/escuro). Com `animated` deriva devagar; com `edges` aparece
   só nas laterais; com `fixed` serve de moldura global presa ao ecrã.
   Puramente decorativo (aria-hidden), atrás do conteúdo. */

// Tile 170×150 com as formas a preto (opacas) — serve de máscara. A cor final
// vem de var(--doodle); a máscara só decide ONDE ela aparece.
const MASK_TILE =
  "<svg xmlns='http://www.w3.org/2000/svg' width='170' height='150'>" +
  "<text x='14' y='34' font-size='16' fill='#000' font-family='monospace'>zzz</text>" +
  "<g fill='none' stroke='#000' stroke-width='1.5'>" +
  "<circle cx='102' cy='26' r='5'/><circle cx='116' cy='26' r='5'/>" +
  "<path d='M92 38 Q109 46 126 38'/>" +
  "<path d='M24 88 h24 v15 h-24 z'/><path d='M24 95.5 h24'/>" +
  "<path d='M96 100 q9 -13 18 0 q-9 13 -18 0'/>" +
  "</g>" +
  "<text x='56' y='136' font-size='12' fill='#000' font-family='monospace'>/ban</text>" +
  "</svg>";

const MASK_URL = `url("data:image/svg+xml,${encodeURIComponent(MASK_TILE)}")`;
// Gradiente que revela só as laterais (centro transparente = escondido)
const EDGE = 'linear-gradient(to right, #000 0%, transparent 22%, transparent 78%, #000 100%)';

export function LagoaBackground({ animated = false, edges = false, fixed = false }: { animated?: boolean; edges?: boolean; fixed?: boolean }) {
  const maskImage = edges ? `${MASK_URL}, ${EDGE}` : MASK_URL;
  const maskSize = edges ? '170px 150px, 100% 100%' : '170px 150px';
  const maskRepeat = edges ? 'repeat, no-repeat' : 'repeat';

  const style: React.CSSProperties = {
    position: fixed ? 'fixed' : 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
    backgroundColor: 'var(--doodle)',
    maskImage, WebkitMaskImage: maskImage,
    maskSize, WebkitMaskSize: maskSize,
    maskRepeat, WebkitMaskRepeat: maskRepeat,
    ...(edges ? { maskComposite: 'intersect', WebkitMaskComposite: 'source-in' } : {}),
  };

  return (
    <div aria-hidden className={animated ? 'lagoa-drift' : undefined} style={style}>
      {animated && (
        <style>{`
          .lagoa-drift { animation: lagoa-drift 60s linear infinite; }
          @keyframes lagoa-drift {
            from { -webkit-mask-position: 0 0; mask-position: 0 0; }
            to   { -webkit-mask-position: -170px -150px; mask-position: -170px -150px; }
          }
          @media (prefers-reduced-motion: reduce) {
            .lagoa-drift { animation: none !important; }
          }
        `}</style>
      )}
    </div>
  );
}
