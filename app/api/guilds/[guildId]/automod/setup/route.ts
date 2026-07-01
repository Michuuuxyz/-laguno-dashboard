import { NextRequest, NextResponse } from 'next/server';
import { assertGuildAccess } from '@/lib/guildAuth';
import { syncAutoModRules } from '@/lib/discordAutoMod';
import { MongoClient } from 'mongodb';

const PT_BASICO = [
  'merda','caralho','porra','foda','fodase','foda-se','puta','putaria','cu','cuzão',
  'buceta','piroca','pau','rola','bosta','cuzinho','boceta','xota','xana','pentelho',
  'culhão','carai','cacete','vsf','fdp','filho da puta','filha da puta','arrombado',
  'arrombada','desgraçado','desgraçada','miserável','safado','safada','canalha',
  'sacanagem','punheta','boquete','trolha','cona','fodido','fodida','vai à merda',
];
const PT_INSULTOS = [
  'idiota','imbecil','retardado','retardada','cretino','cretina','babaca','otário',
  'otaria','corno','cornudo','cornuda','lixo','inútil','burro','burra','palhaço',
  'estúpido','estúpida','parvo','parva','ignorante','maldito','maldita','ridículo',
];
const EN_BASICO = [
  'fuck','shit','bitch','asshole','bastard','cunt','whore','slut','dick','cock',
  'pussy','faggot','retard','idiot','moron','dumbass','motherfucker','bullshit',
  'jackass','prick','twat','wanker','douchebag','jerk',
];
const DISCRIMINACAO = [
  'nigga','nigger','nazi','hitler','fascista','racista','xenófobo','homofóbico',
  'transfóbico','maricão','chink','gook','spic','wetback','kike','dyke','tranny',
  'white power','heil hitler','kkk','ku klux',
];
const SCAM = [
  'free nitro','nitro grátis','clica aqui','click here','ganhe dinheiro',
  'crypto grátis','free bitcoin','nft grátis','robux grátis','free robux',
  'v-bucks grátis','discord server boost grátis',
];

const DEFAULT_WORDS = [...PT_BASICO, ...PT_INSULTOS, ...EN_BASICO, ...DISCRIMINACAO, ...SCAM];

export async function POST(_: NextRequest, { params }: { params: { guildId: string } }) {
  if (!await assertGuildAccess(params.guildId))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const autoMod = {
    antiSpam:      { enabled: true, maxMessages: 5, interval: 5, action: 'timeout' },
    wordFilter:    { enabled: true, words: DEFAULT_WORDS },
    antiLink:      { enabled: false, whitelist: [] },
    capsFilter:    { enabled: true, maxPercent: 70, minLength: 10 },
    mentionSpam:   { enabled: true, maxMentions: 5, action: 'timeout' },
    floodControl:  { enabled: true, maxMessages: 8, interval: 5, slowmode: 10, duration: 60 },
    keywordPreset: { enabled: true },
    memberProfile: { enabled: true },
    ignoredRoles: [],
    ignoredChannels: [],
  };

  // Guarda no MongoDB
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  try {
    const db = client.db('laguno');
    await db.collection('guildconfigs').updateOne(
      { guildId: params.guildId },
      { $set: { autoMod, guildId: params.guildId, updatedAt: new Date() } },
      { upsert: true }
    );

    // Ler logChannelId para passar ao syncAutoMod
    const cfg = await db.collection('guildconfigs').findOne({ guildId: params.guildId });
    const alertChannelId =
      (cfg?.logs as { moderation?: { channelId?: string } })?.moderation?.channelId
      ?? (cfg?.logChannelId as string | null)
      ?? null;

    // Invalida cache do bot
    fetch(`${process.env.BOT_API_URL}/cache/invalidate/${params.guildId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.BOT_API_SECRET}` },
    }).catch(() => null);

    // Sincroniza com Discord AutoMod nativo
    const sync = await syncAutoModRules(params.guildId, autoMod, alertChannelId);

    if (sync.error === 'no_token') {
      return NextResponse.json({ ok: false, saved: true, reason: 'O bot não está configurado para AutoMod nativo (DISCORD_TOKEN em falta). As regras do bot ficam ativas, mas as nativas do Discord não foram criadas.' }, { status: 502 });
    }
    if (sync.error === 'list_failed') {
      return NextResponse.json({ ok: false, saved: true, reason: 'O Laguno não conseguiu criar as regras no Discord. Confirma que o bot está no servidor e tem a permissão "Gerir Servidor".' }, { status: 502 });
    }
    if (!sync.ok) {
      return NextResponse.json({ ok: false, saved: true, reason: `Algumas regras não foram criadas no Discord: ${sync.failures.join('; ')}` }, { status: 502 });
    }

    return NextResponse.json({ ok: true, words: DEFAULT_WORDS.length });
  } catch (err) {
    console.error('[automod/setup]', params.guildId, err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  } finally {
    await client.close();
  }
}
