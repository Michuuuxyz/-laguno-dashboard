/* Fundo de rabiscos da lagoa — a assinatura visual partilhada por todas as
   páginas. Padrão subtil com coisas do Laguno: zzz, os olhos na água, um
   ticket e um /ban. Puramente decorativo (aria-hidden), atrás do conteúdo. */
export function LagoaBackground() {
  return (
    <svg aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
      <defs>
        <pattern id="lagoa-doodles" width="170" height="150" patternUnits="userSpaceOnUse">
          <text x="14" y="34" fontSize="16" fill="rgba(146,196,156,.07)" fontFamily="monospace">zzz</text>
          <g fill="none" stroke="rgba(146,196,156,.07)" strokeWidth="1.5">
            <circle cx="102" cy="26" r="5" /><circle cx="116" cy="26" r="5" />
            <path d="M92 38 Q109 46 126 38" />
            <path d="M24 88 h24 v15 h-24 z" /><path d="M24 95.5 h24" />
            <path d="M96 100 q9 -13 18 0 q-9 13 -18 0" />
          </g>
          <text x="56" y="136" fontSize="12" fill="rgba(146,196,156,.06)" fontFamily="monospace">/ban</text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#lagoa-doodles)" />
    </svg>
  );
}
