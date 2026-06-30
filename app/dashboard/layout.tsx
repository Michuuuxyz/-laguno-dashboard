import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getUserGuilds, hasManageGuild } from '@/lib/discord';
import { DashboardShell } from '@/components/DashboardShell';
import { Suspense } from 'react';
import clientPromise from '@/lib/mongodb';

async function getBotGuildIds(): Promise<Set<string>> {
  try {
    const client = await clientPromise;
    const docs = await client.db().collection('guildconfigs').find({}, { projection: { guildId: 1 } }).toArray();
    return new Set(docs.map((d) => d.guildId as string));
  } catch { return new Set(); }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const [guilds, botIds] = await Promise.all([
    getUserGuilds(session.accessToken),
    getBotGuildIds(),
  ]);

  const activeGuilds = guilds
    .filter(g => (g.owner || hasManageGuild(g.permissions)) && botIds.has(g.id))
    .map(g => ({ id: g.id, name: g.name, icon: g.icon }));

  const guildMap: Record<string, { id: string; name: string; icon: string | null }> = {};
  for (const g of activeGuilds) guildMap[g.id] = g;

  return (
    <Suspense>
      <DashboardShell user={session.user} activeGuilds={activeGuilds} guildMap={guildMap}>
        {children}
      </DashboardShell>
    </Suspense>
  );
}
