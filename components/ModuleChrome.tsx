'use client';

import { useRef } from 'react';
import Image from 'next/image';

/* Chrome partilhado dos módulos da dashboard: cabeçalho com tipografia
   display, mascote 3D e o conjunto de ícones duotone. Extraído do
   GuildSettings para poder ser usado por qualquer separador. */

/* Módulos: ícones duotone (preenchidos, duas tonalidades da cor de destaque) */
export const IconShield  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2l7.5 2.9a1 1 0 0 1 .6 1v5.4c0 4.9-3.3 8.4-7.8 9.9a1 1 0 0 1-.6 0C7.2 19.9 3.9 16.4 3.9 11.5V6.1a1 1 0 0 1 .6-1z" opacity=".35"/><path d="M10.6 13.2l-1.7-1.7-1.5 1.5 3.2 3.2 5.3-5.3-1.5-1.5z"/></svg>;
export const IconBolt    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 2.2 3.6 14a.7.7 0 0 0 .5 1.1H9l-1 6.3a.6.6 0 0 0 1.1.4L20.4 10a.7.7 0 0 0-.5-1.1H15z" opacity=".35"/><path d="M13.5 2.2 3.6 14a.7.7 0 0 0 .5 1.1H9z"/></svg>;
export const IconUsers   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="16" cy="8" r="3" opacity=".35"/><path d="M11.5 20.5a5 5 0 0 1 9.5-2.2.9.9 0 0 1-.8 1.3h-8.2a.6.6 0 0 1-.5-.9z" opacity=".35"/><circle cx="9" cy="8" r="3.7"/><path d="M3 20.6a6 6 0 0 1 12 0 .8.8 0 0 1-.8.8H3.8a.8.8 0 0 1-.8-.8z"/></svg>;
export const IconTag     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.7 3.4A2 2 0 0 0 10.3 3H5.4a2 2 0 0 0-2 2v4.9a2 2 0 0 0 .6 1.4l8 8a2 2 0 0 0 2.8 0l4.9-4.9a2 2 0 0 0 0-2.8z" opacity=".35"/><circle cx="7.7" cy="7.7" r="1.9"/></svg>;
export const IconFile    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h7.2L19 8.8V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" opacity=".35"/><path d="M13 3v5a1 1 0 0 0 1 1h5" opacity=".55"/><rect x="8" y="12" width="8" height="1.9" rx=".95"/><rect x="8" y="15.6" width="8" height="1.9" rx=".95"/></svg>;
export const IconWarn    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10.3 3.6 1.9 18a1.6 1.6 0 0 0 1.4 2.4h17.4a1.6 1.6 0 0 0 1.4-2.4L13.7 3.6a1.6 1.6 0 0 0-2.8 0z" opacity=".35"/><rect x="11" y="8.5" width="2" height="5.5" rx="1"/><circle cx="12" cy="17" r="1.3"/></svg>;
export const IconSettings= () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="5.1" width="18" height="2.8" rx="1.4" opacity=".35"/><rect x="3" y="16.1" width="18" height="2.8" rx="1.4" opacity=".35"/><circle cx="9" cy="6.5" r="3.1"/><circle cx="15" cy="17.5" r="3.1"/></svg>;
export const IconTicket  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 8.5A2 2 0 0 1 5 6.5h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z" opacity=".35"/><rect x="8.6" y="6.5" width="2" height="12" rx="1"/></svg>;

/* ── Cabeçalho unificado de módulo ── */
/* Mascote em "modo fantástico": entra com pop, flutua, tem um brilho verde por
   baixo e inclina-se em 3D a seguir o rato (perspective + rotateX/rotateY).
   O float anima a propriedade `translate` para não lutar com o `transform`
   do tilt — compõem-se. Respeita prefers-reduced-motion. */
export function Mascot3D({ src }: { src: string }) {
  const inner = useRef<HTMLDivElement>(null);
  return (
    <div
      className="mh-mascot"
      style={{ position: 'absolute', right: 14, bottom: -4, zIndex: 1, perspective: '480px' }}
      onMouseMove={e => {
        const el = inner.current; if (!el) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `rotateY(${(x * 30).toFixed(1)}deg) rotateX(${(-y * 24).toFixed(1)}deg) scale(1.08)`;
      }}
      onMouseLeave={() => { const el = inner.current; if (el) el.style.transform = ''; }}
    >
      <div className="mh-glow" aria-hidden />
      <div ref={inner} className="mh-inner">
        <Image src={src} alt="" width={132} height={92} style={{ objectFit: 'contain', height: 92, width: 'auto' }} />
      </div>
      <style>{`
        .mh-inner {
          transition: transform .16s ease-out;
          transform-style: preserve-3d; will-change: transform;
          filter: drop-shadow(0 12px 20px rgba(0,0,0,.55));
          animation: mh-pop .65s cubic-bezier(.34,1.56,.64,1) backwards, mh-float 4.5s ease-in-out .65s infinite;
        }
        .mh-glow {
          position: absolute; left: 8%; right: 8%; bottom: -4px; height: 58%;
          background: radial-gradient(55% 65% at 50% 85%, rgba(109,184,62,.4), transparent 70%);
          filter: blur(12px); pointer-events: none;
          animation: mh-glow 4.5s ease-in-out infinite;
        }
        @keyframes mh-pop   { from { opacity: 0; transform: translateY(18px) scale(.5) rotate(-8deg); } to { opacity: 1; transform: none; } }
        @keyframes mh-float { 0%, 100% { translate: 0 0; } 50% { translate: 0 -5px; } }
        @keyframes mh-glow  { 0%, 100% { opacity: .8; } 50% { opacity: .35; } }
        @media (max-width: 720px) { .mh-mascot { display: none; } }
        @media (prefers-reduced-motion: reduce) { .mh-inner, .mh-glow { animation: none !important; } }
      `}</style>
    </div>
  );
}

export function ModuleHeader({ icon, accent, title, desc, chip, mascot }: {
  icon: React.ReactNode; accent: string; title: string; desc: string; chip?: string; mascot?: string;
}) {
  accent = '#6db83e'; // paleta unificada — o verde da marca em todos os módulos
  // Tipografia forte: título display grande, com a última palavra em verde
  const words = title.trim().split(' ');
  const last  = words.pop() ?? '';
  const head  = words.join(' ');
  return (
    // minHeight reserva o espaço do mascote (92px) — sem isto ele estoura
    // acima do cabeçalho e fica cortado no topo da página.
    <div style={{ position: 'relative', borderBottom: '1px solid var(--line)', paddingBottom: 14, marginBottom: 18, minHeight: mascot ? 104 : undefined, display: 'flex', alignItems: 'center' }}>
      {/* Mascote do módulo — pousado na linha divisória, em modo 3D */}
      {mascot && <Mascot3D src={`/mascote/${mascot}.webp`} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', paddingRight: mascot ? 150 : 0 }}>
        <span style={{
          width: 42, height: 42, borderRadius: 11, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: accent + '16', border: `1px solid ${accent}30`, color: accent,
        }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h2 className="display" style={{ fontSize: 'clamp(22px,3vw,28px)', fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1.05 }}>
              {head ? `${head} ` : ''}<span style={{ color: accent }}>{last}</span>
            </h2>
            {chip && (
              <span style={{
                fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', padding: '2px 9px', borderRadius: 20,
                background: accent + '14', color: accent, border: `1px solid ${accent}30`, whiteSpace: 'nowrap',
              }}>{chip}</span>
            )}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>{desc}</p>
        </div>
      </div>
    </div>
  );
}
