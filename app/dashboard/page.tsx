export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getUserGuilds, hasManageGuild, guildIconUrl } from '@/lib/discord';
import { GuildCard } from '@/components/GuildCard';
import clientPromise from '@/lib/mongodb';

async function getBotGuilds(): Promise<Set<string>> {
  try {
    const client = await clientPromise;
    const docs = await client.db().collection('guildconfigs').find({}, { projection: { guildId: 1 } }).toArray();
    return new Set(docs.map((d) => d.guildId as string));
  } catch { return new Set(); }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const [guilds, botGuilds] = await Promise.all([
    getUserGuilds(session.accessToken),
    getBotGuilds(),
  ]);

  const manageable = guilds
    .filter(g => g.owner || hasManageGuild(g.permissions))
    .sort((a, b) => (botGuilds.has(a.id) ? 0 : 1) - (botGuilds.has(b.id) ? 0 : 1) || a.name.localeCompare(b.name));

  const withBot    = manageable.filter(g => botGuilds.has(g.id));
  const withoutBot = manageable.filter(g => !botGuilds.has(g.id));

  return (
    <div style={{ padding: '40px 40px 80px', maxWidth: 900 }}>

      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 10 }}>
          Laguno — Dashboard
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.03em', marginBottom: 6 }}>
          Olá, {session.user.name?.split(' ')[0]}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
          Seleciona um servidor para gerir as suas configurações do Laguno.
        </p>
      </div>

      {/* Active servers */}
      {withBot.length > 0 && (
        <section style={{ marginBottom: 44 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
              Servidores ativos
            </p>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 20,
              background: 'var(--elevated)', border: '1px solid var(--line)', color: 'var(--text-3)',
            }}>{withBot.length}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
            {withBot.map((g, i) => (
              <GuildCard key={g.id} id={g.id} name={g.name} iconUrl={guildIconUrl(g.id, g.icon)} botPresent index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Inactive servers */}
      {withoutBot.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <p style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
              Adicionar Laguno
            </p>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 20,
              background: 'var(--elevated)', border: '1px solid var(--line)', color: 'var(--text-3)',
            }}>{withoutBot.length}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
            {withoutBot.map((g, i) => (
              <GuildCard key={g.id} id={g.id} name={g.name} iconUrl={guildIconUrl(g.id, g.icon)} botPresent={false} index={i} />
            ))}
          </div>
        </section>
      )}

      {manageable.length === 0 && (
        <div className="card fade-up" style={{ padding: '56px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 500, marginBottom: 6 }}>Nenhum servidor encontrado</p>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Não tens servidores onde possas gerir o Laguno.</p>
        </div>
      )}
    </div>
  );
}
