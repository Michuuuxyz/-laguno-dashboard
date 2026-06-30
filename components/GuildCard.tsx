'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Props { id: string; name: string; iconUrl: string | null; botPresent: boolean; index?: number; }

export function GuildCard({ id, name, iconUrl, botPresent, index = 0 }: Props) {
  const invite = `https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&scope=bot+applications.commands&permissions=1102129391846&guild_id=${id}`;

  const initial = name.replace(/[^a-zA-Z0-9]/g, '').charAt(0).toUpperCase() || name.charAt(0).toUpperCase();

  const inner = (
    <div className="fade-up" style={{
      background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14,
      padding: '24px 14px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
      cursor: 'pointer', transition: 'border-color .15s, background .15s, transform .15s, box-shadow .15s',
      animationDelay: `${index * 0.04}s`,
      opacity: botPresent ? 1 : 0.55,
      position: 'relative', overflow: 'hidden',
    }}
      onMouseEnter={e => {
        const d = e.currentTarget as HTMLDivElement;
        d.style.borderColor = botPresent ? 'rgba(109,184,62,.35)' : 'var(--line-hover)';
        d.style.background = 'var(--elevated)';
        d.style.transform = 'translateY(-2px)';
        d.style.boxShadow = botPresent ? '0 8px 24px rgba(109,184,62,.08)' : '0 8px 24px rgba(0,0,0,.2)';
        d.style.opacity = '1';
      }}
      onMouseLeave={e => {
        const d = e.currentTarget as HTMLDivElement;
        d.style.borderColor = 'var(--line)';
        d.style.background = 'var(--card)';
        d.style.transform = 'none';
        d.style.boxShadow = 'none';
        d.style.opacity = botPresent ? '1' : '0.55';
      }}
    >
      {/* Active dot */}
      {botPresent && (
        <span style={{
          position: 'absolute', top: 10, right: 10,
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--green)',
          boxShadow: '0 0 6px rgba(109,184,62,.6)',
        }} />
      )}

      {/* Icon */}
      {iconUrl ? (
        <Image src={iconUrl} alt={name} width={72} height={72}
          style={{ borderRadius: '50%', border: '2px solid var(--line)', marginBottom: 14, flexShrink: 0, objectFit: 'cover' }}
          unoptimized={iconUrl.endsWith('.gif')} />
      ) : (
        <div style={{
          width: 72, height: 72, borderRadius: '50%', marginBottom: 14, flexShrink: 0,
          background: 'var(--elevated)', border: '2px solid var(--line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-2)', fontSize: 24, fontWeight: 700,
        }}>
          {initial}
        </div>
      )}

      {/* Name */}
      <p style={{
        fontWeight: 600, fontSize: 13, textAlign: 'center', color: 'var(--text-1)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        width: '100%', marginBottom: 14, lineHeight: 1.4, letterSpacing: '-.01em',
      }}>
        {name}
      </p>

      {/* CTA */}
      <div style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '7px 0', borderRadius: 8,
        background: botPresent ? 'rgba(109,184,62,.1)' : 'var(--elevated)',
        border: botPresent ? '1px solid rgba(109,184,62,.2)' : '1px solid var(--line)',
        color: botPresent ? 'var(--green)' : 'var(--text-2)',
        fontSize: 12.5, fontWeight: 600,
      }}>
        {botPresent ? 'Gerir' : '+ Adicionar'}
      </div>
    </div>
  );

  if (!botPresent) return <a href={invite} target="_blank" rel="noreferrer" style={{ display: 'block', textDecoration: 'none' }}>{inner}</a>;
  return <Link href={`/dashboard/${id}`} style={{ display: 'block', textDecoration: 'none' }}>{inner}</Link>;
}
