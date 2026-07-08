'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-reveal leve: mostra os filhos com um fade+slide quando entram na
 * viewport. Sem bibliotecas — só IntersectionObserver + as classes .reveal/.in
 * do globals.css. Respeita prefers-reduced-motion (o CSS força visível).
 */
export function Reveal({
  children, delay = 0, style, className = '',
}: {
  children: React.ReactNode; delay?: number; style?: React.CSSProperties; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Se já está visível à partida (acima da dobra), mostra logo sem observar.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) { setShown(true); return; }

    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } },
      { threshold: 0.06, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? 'in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}
