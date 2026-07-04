import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getUserGuilds, hasManageGuild } from '@/lib/discord';
import { GuildSettings } from '@/components/GuildSettings';

interface Props { params: Promise<{ guildId: string }>; searchParams: Promise<{ tab?: string }> }

export default async function GuildPage({ params, searchParams }: Props) {
  const { guildId } = await params;
  const { tab } = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const guilds = await getUserGuilds(session.accessToken);
  const guild = guilds.find(g => g.id === guildId);
  if (!guild || (!guild.owner && !hasManageGuild(guild.permissions))) redirect('/dashboard');

  return (
    <div style={{ padding: 'clamp(18px,4vw,32px) clamp(14px,4vw,40px) 80px' }}>
      <GuildSettings key={guildId} guildId={guildId} guildName={guild.name} initialTab={tab ?? 'overview'} />
    </div>
  );
}
