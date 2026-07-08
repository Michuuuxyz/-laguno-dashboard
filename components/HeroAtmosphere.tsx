// Atmosfera do hero — a lagoa à noite. Brilho verde bioluminescente + partículas
// a subir devagar, como plâncton luminoso à tona. Só CSS/transform (leve, GPU),
// posições deterministas (sem hydration mismatch) e respeita reduced-motion.

const PARTICLES = Array.from({ length: 16 }, (_, i) => {
  const left = (i * 61 + 7) % 100;          // espalhadas sem aleatoriedade
  const size = 2 + (i % 3);                  // 2–4px
  const delay = (i * 0.9) % 9;               // arranques desfasados
  const dur = 9 + (i % 5) * 1.6;             // 9–15s
  const drift = (i % 2 ? 1 : -1) * (6 + (i % 4) * 4);
  return { left, size, delay, dur, drift, key: i };
});

export function HeroAtmosphere() {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {/* Brilho bioluminescente central */}
      <div style={{
        position: 'absolute', left: '50%', top: '44%', transform: 'translate(-50%,-50%)',
        width: 'min(820px, 96vw)', height: 'min(560px, 66vh)',
        background: 'radial-gradient(ellipse at center, rgba(109,184,62,.15), rgba(109,184,62,.045) 42%, transparent 70%)',
        filter: 'blur(8px)',
      }} />
      {/* Fundo mais escuro em baixo — profundidade da água */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: '45%',
        background: 'linear-gradient(to bottom, transparent, rgba(6,14,8,.35))',
      }} />

      {/* Partículas a subir */}
      {PARTICLES.map(p => (
        <span key={p.key} style={{
          position: 'absolute', left: `${p.left}%`, bottom: '-8px',
          width: p.size, height: p.size, borderRadius: '50%',
          background: 'var(--green)',
          boxShadow: '0 0 8px rgba(109,184,62,.7)',
          ['--drift' as string]: `${p.drift}px`,
          animation: `hero-rise ${p.dur}s ease-in-out ${p.delay}s infinite`,
          opacity: 0,
        } as React.CSSProperties} />
      ))}

      <style>{`
        @keyframes hero-rise {
          0%   { transform: translateY(0) translateX(0);        opacity: 0; }
          12%  { opacity: .6; }
          85%  { opacity: .5; }
          100% { transform: translateY(-70vh) translateX(var(--drift)); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-hidden] span { animation: none !important; opacity: 0 !important; }
        }
      `}</style>
    </div>
  );
}
