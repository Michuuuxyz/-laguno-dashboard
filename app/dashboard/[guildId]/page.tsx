import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getUserGuilds, hasManageGuild } from '@/lib/discord';
import { GuildSettings } from '@/components/GuildSettings';

interface Props { params: { guildId: string }; searchParams: { tab?: string } }

export default async function GuildPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const guilds = await getUserGuilds(session.accessToken);
  const guild = guilds.find(g => g.id === params.guildId);
  if (!guild || (!guild.owner && !hasManageGuild(guild.permissions))) redirect('/dashboard');

  return (
    <div style={{ padding: 'clamp(18px,4vw,32px) clamp(14px,4vw,40px) 80px' }}>
      <GuildSettings key={params.guildId} guildId={params.guildId} guildName={guild.name} initialTab={searchParams.tab ?? 'overview'} />
    </div>
  );
}
