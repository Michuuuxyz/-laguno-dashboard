'use client';

import Image from 'next/image';
import Link from 'next/link';
import { guildFallbackColor } from '@/lib/discord';

interface Props { id: string; name: string; iconUrl: string | null; botPresent: boolean; index?: number; }

const ArrowIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

export function GuildCard({ id, name, iconUrl, botPresent, index = 0 }: Props) {
  const invite = `https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&scope=bot+applications.commands&permissions=8&guild_id=${id}`;

  const inner = (
    <div className="fade-up" style={{
      background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12,
      padding: '20px 16px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center',
      cursor: 'pointer', transition: 'border-color .15s, background .15s',
      animationDelay: `${index * 0.04}s`, opacity: botPresent ? 1 : 0.65,
    }}
      onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = 'var(--line-hover)'; d.style.background = 'var(--elevated)'; d.style.opacity = '1'; }}
      onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = 'var(--line)'; d.style.background = 'var(--card)'; d.style.opacity = botPresent ? '1' : '0.65'; }}
    >
      {/* Icon */}
      {iconUrl ? (
        <Image src={iconUrl} alt={name} width={50} height={50}
          style={{ borderRadius: '50%', border: '1px solid var(--line)', marginBottom: 12, flexShrink: 0 }}
          unoptimized={iconUrl.endsWith('.gif')} />
      ) : (
        <div style={{
          width: 50, height: 50, borderRadius: '50%', marginBottom: 12,
          background: 'var(--elevated)', border: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-2)', fontSize: 18, fontWeight: 700,
        }}>
          {name.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Name */}
      <p style={{
        fontWeight: 600, fontSize: 13, textAlign: 'center', color: 'var(--text-1)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        width: '100%', marginBottom: 14, lineHeight: 1.4,
      }}>
        {name}
      </p>

      {/* CTA */}
      <div style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '6px 0', borderRadius: 7,
        background: 'var(--elevated)', border: '1px solid var(--line)',
        color: 'var(--text-2)', fontSize: 12.5, fontWeight: 500,
      }}>
        {botPresent ? <><span>Gerir</span><ArrowIcon /></> : <><PlusIcon /><span>Adicionar</span></>}
      </div>
    </div>
  );

  if (!botPresent) return <a href={invite} target="_blank" rel="noreferrer" style={{ display: 'block', textDecoration: 'none' }}>{inner}</a>;
  return <Link href={`/dashboard/${id}`} style={{ display: 'block', textDecoration: 'none' }}>{inner}</Link>;
}
