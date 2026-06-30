export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const name = session.user?.name?.split(' ')[0] ?? 'utilizador';

  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', padding: '40px 48px', textAlign: 'center', flexDirection: 'column', gap: 20,
      position: 'relative', overflow: 'hidden',
    }}>

      {/* fig4 — a espreitar da direita */}
      <Image
        src="/fig4.png"
        alt=""
        width={260}
        height={260}
        style={{
          position: 'absolute',
          right: -55,
          bottom: 0,
          pointerEvents: 'none',
          userSelect: 'none',
          transform: 'scaleX(-1)',
        }}
      />

      <div>
        <h1 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.03em', marginBottom: 10 }}>
          Bem-vindo de volta, {name}
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.7, maxWidth: 420, margin: '0 auto' }}>
          Seleciona um servidor na barra lateral para começares a gerir as configurações do Laguno.
        </p>
      </div>

      <p style={{
        marginTop: 8, fontSize: 13, color: 'var(--text-3)',
        fontStyle: 'italic', maxWidth: 380,
        borderLeft: '2px solid rgba(109,184,62,.3)',
        paddingLeft: 14, textAlign: 'left',
        lineHeight: 1.6,
      }}>
        "Estava aqui a vigiar o servidor em silêncio… como sempre."
      </p>
    </div>
  );
}
