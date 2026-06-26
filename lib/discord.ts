const DISCORD_API = 'https://discord.com/api/v10';
const CDN = 'https://cdn.discordapp.com';

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  global_name: string | null;
}

export async function getUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getDiscordUser(accessToken: string): Promise<DiscordUser | null> {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  return res.json();
}

export function hasManageGuild(permissions: string): boolean {
  const MANAGE_GUILD = BigInt(0x20);
  return (BigInt(permissions) & MANAGE_GUILD) !== BigInt(0);
}

// Ícone real do servidor — webp com size 128
export function guildIconUrl(id: string, icon: string | null): string | null {
  if (!icon) return null;
  const ext = icon.startsWith('a_') ? 'gif' : 'webp';
  return `${CDN}/icons/${id}/${icon}.${ext}?size=128`;
}

// Avatar real do utilizador — webp com size 128, suporte a GIF para nitro
export function userAvatarUrl(userId: string, avatar: string | null): string {
  if (!avatar) {
    // Avatar padrão do Discord baseado no ID
    const index = (BigInt(userId) >> BigInt(22)) % BigInt(6);
    return `${CDN}/embed/avatars/${index}.png`;
  }
  const ext = avatar.startsWith('a_') ? 'gif' : 'webp';
  return `${CDN}/avatars/${userId}/${avatar}.${ext}?size=128`;
}

// Cor de fallback para servidores sem ícone (baseada no ID)
export function guildFallbackColor(id: string): string {
  const colors = ['#4caf82', '#2d8a60', '#1f6a47', '#3a9e70', '#56c494'];
  const index = Number(BigInt(id) % BigInt(colors.length));
  return colors[index];
}
