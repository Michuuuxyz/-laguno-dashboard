import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { getUserGuilds, hasManageGuild } from './discord';

export async function assertGuildAccess(guildId: string): Promise<{ userId: string } | null> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return null;

  const guilds = await getUserGuilds(session.accessToken);
  const guild  = guilds.find(g => g.id === guildId);
  if (!guild) return null;
  if (!guild.owner && !hasManageGuild(guild.permissions)) return null;

  return { userId: (session.user as { id?: string }).id ?? '' };
}
