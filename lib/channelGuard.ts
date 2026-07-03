const DISCORD_API = 'https://discord.com/api/v10';
const BOT_TOKEN = process.env.DISCORD_TOKEN ?? process.env.DISCORD_BOT_TOKEN;

/**
 * Confirma que um canal pertence mesmo à guild indicada.
 *
 * Sem isto, um gestor de um servidor podia passar o channelId de um canal de
 * OUTRO servidor (qualquer um onde o bot esteja) e fazer o bot enviar lá — as
 * rotas de envio só validavam o acesso à guild do URL, não o destino real.
 */
export async function channelBelongsToGuild(channelId: string, guildId: string): Promise<boolean> {
  if (!BOT_TOKEN || !channelId || !guildId) return false;
  try {
    const res = await fetch(`${DISCORD_API}/channels/${channelId}`, {
      headers: { Authorization: `Bot ${BOT_TOKEN}` },
      cache: 'no-store',
    });
    if (!res.ok) return false;
    const ch = await res.json() as { guild_id?: string };
    return ch.guild_id === guildId;
  } catch {
    return false;
  }
}
