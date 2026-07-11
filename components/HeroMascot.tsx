'use client';

import Image from 'next/image';
import { useRef } from 'react';

/* Mascote grande do hero, em "modo fantástico": entra com pop, flutua devagar,
   tem um brilho verde por baixo e inclina-se em 3D a seguir o rato — o mesmo
   efeito dos mascotes dos módulos, mas em tamanho de destaque.
   O float anima `translate` para não lutar com o `transform` do tilt. */
export function HeroMascot({ src, alt, size = 'clamp(250px,34vw,420px)' }: {
  src: string; alt: string; size?: string;
}) {
  const inner = useRef<HTMLDivElement>(null);
  return (
    <div
      className="hm-wrap"
      style={{ position: 'relative', perspective: '900px', display: 'inline-block' }}
      onMouseMove={e => {
        const el = inner.current; if (!el) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `rotateY(${(x * 22).toFixed(1)}deg) rotateX(${(-y * 18).toFixed(1)}deg) scale(1.03)`;
      }}
      onMouseLeave={() => { const el = inner.current; if (el) el.style.transform = ''; }}
    >
      <div className="hm-glow" aria-hidden />
      <div ref={inner} className="hm-inner">
        <Image src={src} alt={alt} width={394} height={560} priority
          style={{ height: size, width: 'auto', maxWidth: '100%', objectFit: 'contain', display: 'block' }} />
      </div>
      <style>{`
        .hm-inner {
          transition: transform .18s ease-out;
          transform-style: preserve-3d; will-change: transform;
          filter: drop-shadow(0 26px 50px rgba(0,0,0,.55));
          animation: hm-pop .8s cubic-bezier(.34,1.56,.64,1) backwards, hm-float 5s ease-in-out .8s infinite;
        }
        .hm-glow {
          position: absolute; left: 6%; right: 6%; bottom: -6%; height: 55%;
          background: radial-gradient(52% 62% at 50% 88%, rgba(109,184,62,.42), transparent 72%);
          filter: blur(20px); pointer-events: none;
          animation: hm-glowpulse 5s ease-in-out infinite;
        }
        @keyframes hm-pop   { from { opacity: 0; transform: translateY(28px) scale(.6) rotate(-6deg); } to { opacity: 1; transform: none; } }
        @keyframes hm-float { 0%, 100% { translate: 0 0; } 50% { translate: 0 -10px; } }
        @keyframes hm-glowpulse { 0%, 100% { opacity: .85; } 50% { opacity: .4; } }
        @media (prefers-reduced-motion: reduce) { .hm-inner, .hm-glow { animation: none !important; } }
      `}</style>
    </div>
  );
}
