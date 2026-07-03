import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getUserGuilds, hasManageGuild, type DiscordGuild } from '@/lib/discord';
import { DashboardShell } from '@/components/DashboardShell';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { Suspense } from 'react';
import clientPromise from '@/lib/mongodb';

// Verifica quais dos servidores do utilizador têm o bot — só consulta esses IDs
// (lookup indexado por guildId), em vez de carregar TODA a coleção guildconfigs.
async function getBotGuildIds(ids: string[]): Promise<Set<string>> {
  if (ids.length === 0) return new Set();
  try {
    const client = await clientPromise;
    const docs = await client.db().collection('guildconfigs')
      .find({ guildId: { $in: ids } }, { projection: { guildId: 1 } }).toArray();
    return new Set(docs.map((d) => d.guildId as string));
  } catch { return new Set(); }
}

// Busca os servidores e renderiza a shell. Isolado num componente para que o
// Suspense mostre o esqueleto instantaneamente enquanto isto faz stream.
async function DashboardShellWithGuilds({
  session, children,
}: {
  session: { accessToken: string; user: { name?: string | null; image?: string | null } };
  children: React.ReactNode;
}) {
  const guilds = await getUserGuilds(session.accessToken);
  const manageable = guilds.filter((g: DiscordGuild) => g.owner || hasManageGuild(g.permissions));
  const botIds = await getBotGuildIds(manageable.map(g => g.id));

  const activeGuilds = manageable
    .filter(g => botIds.has(g.id))
    .map(g => ({ id: g.id, name: g.name, icon: g.icon }));

  const guildMap: Record<string, { id: string; name: string; icon: string | null }> = {};
  for (const g of activeGuilds) guildMap[g.id] = g;

  return (
    <DashboardShell user={session.user} activeGuilds={activeGuilds} guildMap={guildMap}>
      {children}
    </DashboardShell>
  );
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Sessão vem do cookie (rápido) — só isto bloqueia antes de mostrar o esqueleto.
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardShellWithGuilds session={session}>
        {children}
      </DashboardShellWithGuilds>
    </Suspense>
  );
}
