import Image from 'next/image';

/* ── Primitivas de mock do Discord — partilhadas entre landing e /features ── */

export const mockFont = '"gg sans","Noto Sans",ui-sans-serif,sans-serif';

export const DC = {
  bg:      '#313338',
  surface: '#2b2d31',
  text:    '#dcddde',
  strong:  '#f2f3f5',
  muted:   '#80848e',
  line:    'rgba(255,255,255,0.06)',
  blurple: '#5865f2',
  mention: '#dee0fc',
};

export function MockAvatar({ src, color = DC.blurple, size = 40 }: { src?: string; color?: string; size?: number }) {
  if (src) return <Image src={src} alt="" width={size} height={size} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  return <div style={{ width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0 }} />;
}

export function MockMsg({ avatar, avatarColor, name, bot, time = '14:32', children }: {
  avatar?: string; avatarColor?: string; name: string; bot?: boolean; time?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', fontFamily: mockFont }}>
      <MockAvatar src={avatar} color={avatarColor} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: DC.strong, lineHeight: 1 }}>{name}</span>
          {bot && <span style={{ fontSize: 9.5, fontWeight: 700, background: DC.blurple, color: '#fff', padding: '1px 4px', borderRadius: 3, letterSpacing: '.04em', lineHeight: '14px' }}>APP</span>}
          <span style={{ fontSize: 12, color: DC.muted, lineHeight: 1 }}>Hoje às {time}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

export function MockH2({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 20, fontWeight: 700, color: DC.strong, fontFamily: mockFont, lineHeight: 1.375, margin: '4px 0 2px' }}>{children}</p>;
}
export function MockText({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ fontSize: 15, color: DC.text, fontFamily: mockFont, lineHeight: 1.375, margin: '2px 0', ...style }}>{children}</p>;
}
export function MockSub({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 12, color: DC.muted, fontFamily: mockFont, margin: '2px 0' }}>{children}</p>;
}

export function Mention({ color = DC.blurple, children }: { color?: string; children: React.ReactNode }) {
  const fg = color === DC.blurple ? DC.mention : color;
  return <span style={{ color: fg, background: color + '33', borderRadius: 3, padding: '0 2px', fontWeight: 500 }}>{children}</span>;
}

export function DCContainer({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div style={{ background: DC.surface, borderLeft: `4px solid ${accent}`, borderRadius: '0 4px 4px 0', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {children}
    </div>
  );
}

export function DCSep() {
  return <div style={{ height: 1, background: DC.line, margin: '2px 0' }} />;
}

export function DCBtn({ label, variant = 'secondary' }: { label: string; variant?: 'primary' | 'secondary' }) {
  const v = {
    primary:   { bg: DC.blurple, color: '#fff' },
    secondary: { bg: '#4e5058',  color: '#fff' },
  }[variant];
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', background: v.bg, color: v.color, borderRadius: 3, padding: '1px 16px', height: 32, fontSize: 14, fontWeight: 500, fontFamily: mockFont, userSelect: 'none', flexShrink: 0, cursor: 'default' }}>
      {label}
    </div>
  );
}

export function DCBtnRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 2 }}>{children}</div>;
}

/* Janela de chat completa (frame com nome do canal) */
export function MockWindow({ channel = 'geral', children }: { channel?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: DC.bg, borderRadius: 12, padding: 18, border: '1px solid rgba(0,0,0,.4)', boxShadow: '0 20px 60px rgba(0,0,0,.5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${DC.line}` }}>
        <span style={{ color: DC.muted, fontSize: 15, fontFamily: mockFont }}>#</span>
        <span style={{ fontSize: 13, color: DC.muted, fontFamily: mockFont }}>{channel}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {children}
      </div>
    </div>
  );
}
