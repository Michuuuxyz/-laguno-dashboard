'use client';

import dynamic from 'next/dynamic';

const DotField = dynamic(() => import('@/components/DotField'), { ssr: false });

export function GlobalBackground() {
  return (
    <div aria-hidden style={{ pointerEvents: 'none', position: 'fixed', inset: 0, zIndex: 1 }}>
      <DotField
        dotRadius={1.6}
        dotSpacing={28}
        bulgeStrength={18}
        glowRadius={220}
        sparkle={false}
        waveAmplitude={0}
        cursorRadius={160}
        cursorForce={0}
        bulgeOnly={true}
        gradientFrom="#1a3d20"
        gradientTo="#0d1f10"
        glowColor="transparent"
        style={{ position: 'absolute', inset: 0 }}
      />
    </div>
  );
}
