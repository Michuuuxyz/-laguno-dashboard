'use client';

import RotatingText from './RotatingText';

// Badge do hero — pílula com o módulo em rotação contínua
const MODULES = [
  'Moderação',
  'Auto-Mod',
  'Boas-Vindas',
  'Self-Roles',
  'Sorteios',
  'Registos',
  'Construtor',
];

export function HeroBadge() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '8px 18px', borderRadius: 999,
      border: '1px solid rgba(109,184,62,.35)',
      background: 'rgba(109,184,62,.06)',
      marginBottom: 26,
    }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', letterSpacing: '.01em' }}>
        Módulos:
      </span>
      <RotatingText
        texts={MODULES}
        rotationInterval={2200}
        staggerDuration={0.02}
        splitBy="characters"
        style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden' }}
      />
    </div>
  );
}
