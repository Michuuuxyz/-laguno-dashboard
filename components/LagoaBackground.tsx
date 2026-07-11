/* Fundo de rabiscos da lagoa — a assinatura visual do topo das páginas.
   Padrão subtil com coisas do Laguno: zzz, os olhos na água, um ticket e um
   /ban. Com `animated`, o padrão deriva devagar na diagonal (estilo Loritta).
   Puramente decorativo (aria-hidden), atrás do conteúdo. */

// Tile 170×150 desenhado uma vez e repetido via background-image (data URI),
// para poder animar a posição de forma contínua e sem cortes.
const TILE =
  "<svg xmlns='http://www.w3.org/2000/svg' width='170' height='150'>" +
  "<text x='14' y='34' font-size='16' fill='rgba(146,196,156,0.07)' font-family='monospace'>zzz</text>" +
  "<g fill='none' stroke='rgba(146,196,156,0.07)' stroke-width='1.5'>" +
  "<circle cx='102' cy='26' r='5'/><circle cx='116' cy='26' r='5'/>" +
  "<path d='M92 38 Q109 46 126 38'/>" +
  "<path d='M24 88 h24 v15 h-24 z'/><path d='M24 95.5 h24'/>" +
  "<path d='M96 100 q9 -13 18 0 q-9 13 -18 0'/>" +
  "</g>" +
  "<text x='56' y='136' font-size='12' fill='rgba(146,196,156,0.06)' font-family='monospace'>/ban</text>" +
  "</svg>";

const DOODLE_URL = `url("data:image/svg+xml,${encodeURIComponent(TILE)}")`;

export function LagoaBackground({ animated = false, edges = false, fixed = false }: { animated?: boolean; edges?: boolean; fixed?: boolean }) {
  // `edges` mostra os rabiscos só nas laterais (esquerda/direita) e limpa o
  // centro, para emoldurar o conteúdo sem ficarem por trás do texto.
  // `fixed` fixa a moldura ao ecrã — usada no layout como fundo global.
  const mask = edges
    ? 'linear-gradient(to right, #000 0%, transparent 22%, transparent 78%, #000 100%)'
    : undefined;
  return (
    <div
      aria-hidden
      className={animated ? 'lagoa-drift' : undefined}
      style={{
        position: fixed ? 'fixed' : 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: DOODLE_URL, backgroundSize: '170px 150px',
        ...(mask ? { maskImage: mask, WebkitMaskImage: mask } : {}),
      }}
    >
      {animated && (
        <style>{`
          .lagoa-drift { animation: lagoa-drift 60s linear infinite; }
          @keyframes lagoa-drift {
            from { background-position: 0 0; }
            to   { background-position: -170px -150px; }
          }
          @media (prefers-reduced-motion: reduce) {
            .lagoa-drift { animation: none !important; }
          }
        `}</style>
      )}
    </div>
  );
}
