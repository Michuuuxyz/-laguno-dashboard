import clientPromise from '@/lib/mongodb';

const DISCORD_API = 'https://discord.com/api/v10';
const BOT_TOKEN   = (process.env.DISCORD_TOKEN ?? process.env.DISCORD_BOT_TOKEN)!;

/**
 * Vai buscar o avatar do utilizador diretamente ao Discord — fiável, ao
 * contrário do avatar_url do payload do top.gg que nem sempre vem.
 * Devolve sempre um URL (avatar custom ou avatar por defeito do Discord).
 */
export async function fetchAvatarUrl(userId: string): Promise<string | undefined> {
  try {
    const res = await fetch(`${DISCORD_API}/users/${userId}`, {
      headers: { Authorization: `Bot ${BOT_TOKEN}` },
    });
    if (!res.ok) return undefined;
    const u = await res.json() as { avatar?: string | null };
    if (u.avatar) {
      const ext = u.avatar.startsWith('a_') ? 'gif' : 'png';
      return `https://cdn.discordapp.com/avatars/${userId}/${u.avatar}.${ext}?size=256`;
    }
    // Avatar por defeito (novo esquema baseado no ID)
    let idx = 0;
    try { idx = Number((BigInt(userId) / BigInt(4194304)) % BigInt(6)); } catch { idx = 0; }
    return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
  } catch {
    return undefined;
  }
}

/**
 * Agenda o lembrete de voto (12h30) para o utilizador, a menos que ele tenha
 * optado por NÃO receber (via botões do bot). O bot (voteReminderManager) faz
 * o poll da coleção 'votereminders' e envia a DM quando chega a hora.
 */
export async function scheduleVoteReminder(userId: string): Promise<void> {
  try {
    const client = await clientPromise;
    const db = client.db('laguno');

    const pref = await db.collection('votepreferences').findOne({ userId });
    if (pref?.optIn === false) return; // respeitou o "não me avises"

    const now      = new Date();
    const remindAt = new Date(now.getTime() + 12.5 * 60 * 60 * 1000); // 12h30m

    await db.collection('votereminders').updateOne(
      { userId, reminded: false },
      { $set: { userId, votedAt: now, remindAt, reminded: false } },
      { upsert: true },
    );
  } catch (err) {
    console.error('[voteReminder] Falha ao agendar:', userId, err);
  }
}
