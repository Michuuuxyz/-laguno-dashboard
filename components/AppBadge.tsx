// Selo "✓ APP" (app verificada) — usado em todas as previews estilo Discord.
// Igual ao badge real do Discord: visto branco + APP sobre blurple.
export function AppBadge({ scale = 1 }: { scale?: number }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3 * scale,
      fontSize: 9.5 * scale, fontWeight: 700, lineHeight: 1.4,
      background: '#5865f2', color: '#fff',
      padding: `${1 * scale}px ${4 * scale}px`, borderRadius: 3 * scale,
      verticalAlign: 'middle', whiteSpace: 'nowrap',
    }}>
      <svg width={8 * scale} height={8 * scale} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <polyline points="20 6 9 17 4 12" />
      </svg>
      APP
    </span>
  );
}
