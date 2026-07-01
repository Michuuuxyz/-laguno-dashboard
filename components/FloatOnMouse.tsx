'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  strength?: number; // quanto se move (px) — default 12
  style?: React.CSSProperties;
  className?: string;
}

export function FloatOnMouse({ children, strength = 12, style, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cx = 0, cy = 0;
    let tx = 0, ty = 0;
    let raf: number;

    function onMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      // Normaliza pela distância do centro do ecrã
      const maxDist = Math.max(window.innerWidth, window.innerHeight) / 2;
      tx = (dx / maxDist) * strength;
      ty = (dy / maxDist) * strength;
    }

    function loop() {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      if (el) el.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <div ref={ref} style={{ willChange: 'transform', ...style }} className={className}>
      {children}
    </div>
  );
}
