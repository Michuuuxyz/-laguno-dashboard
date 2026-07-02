/* Fonte única das palavras de AutoMod — usada pela dashboard e pelo "Ativar tudo".
 * Cada array corresponde a uma template mostrada em GuildSettings. */

export const WORD_TEMPLATE_WORDS = {
  pt_basico: [
    'merda','caralho','porra','foda','fodase','foda-se','puta','putaria','cu','cuzão',
    'buceta','piroca','pau','rola','bosta','cuzinho','boceta','xota','xana','pentelho',
    'culhão','carai','cacete','vsf','fdp','puta merda','puta que pariu','vai se foder',
    'filho da puta','filha da puta','arrombado','arrombada','desgraçado','desgraçada',
    'miserável','safado','safada','canalha','sacanagem','punheta','cagalhão','boquete',
    'gozar','gozo','trolha','cona','caralha','raios','carago','merda de','vai à merda',
    'fodido','fodida','fudido','fudida','porra de','que se foda','que merda','sua mãe',
    'tua mãe','vai tomar no cu','toma no cu','vai se fuder','fuder','fuderão','puta vida',
  ],
  pt_insultos: [
    'idiota','imbecil','retardado','retardada','cretino','cretina','babaca','otário','otaria',
    'corno','cornudo','cornuda','prostituta','vagabundo','vagabunda','lixo','inútil','burro',
    'burra','animal','palhaço','estúpido','estúpida','parvo','parva','tolo','tola','bêbado',
    'drogado','viado','viadinho','viada','traveco','paneleiro','bicha','bocó','atrasado',
    'atrasada','ignorante','maldito','maldita','desgraça','podre','nojento','nojenta',
    'canalha','safado','safada','mentiroso','mentirosa','ladrão','ladra','louco','louca',
    'psicopata','infeliz','miserável','coitado','sem vergonha','vergonha','ridículo',
  ],
  en_basico: [
    'fuck','shit','bitch','asshole','bastard','cunt','whore','slut','dick','cock',
    'pussy','ass','faggot','retard','idiot','moron','dumbass','motherfucker','fucker',
    'bullshit','jackass','prick','twat','wanker','crap','damn','hell','bloody hell',
    'fuckoff','fuck off','shut up','son of a bitch','piece of shit','go to hell',
    'screw you','asshat','dipshit','numbnuts','shithead','fuckwit','arsehole','arse',
    'bollocks','tosser','wankface','shitface','douchebag','douche','jerkoff','jerk',
  ],
  discriminacao: [
    'nigga','nigger','negro','preto sujo','macaco','macaca','nazi','hitler','fascista',
    'judeu sujo','árabe sujo','terrorista','islamofobia','racista','xenófobo','homofóbico',
    'transfóbico','lésbica','maricão','travesti','ftm','mtf','refugo','imigrante sujo',
    'foda-se os pretos','morte aos gays','gay de merda','bicha do caralho','viado do cu',
    'chink','gook','spic','wetback','towelhead','sandnigger','cracker','honky','kike',
    'dyke','tranny','shemale','rape','rapar','aborto','holocausto','câmara de gás',
    'kkk','ku klux','white power','heil hitler','88','1488','escravo','escrava',
  ],
  nsfw: [
    'pornografia','porno','porn','xxx','sexo','sex','oral','anal','vaginal','ejacular',
    'ejaculação','orgasmo','masturbação','masturbar','vibrador','dildo','fetiche','bdsm',
    'nude','nudes','pelado','pelada','nu','nua','seios','peito','mamilo','escrotum',
    'testículos','pénis','penis','vagina','ânus','anus','clitóris','clitoris','cama',
    'foder','fodendo','transando','trepar','transar','gozar no','mamar','mamar no',
    'chupar','sugar','handjob','blowjob','creampie','cum','cumshot','jizz','sperm',
    'semen','lick','licking','fingering','fingerfuck','deepthroat','gangbang','threesome',
    'orgia','onlyfans','stripper','escort','prostituição','puteiro','bordel','cafetão',
  ],
  spam_scam: [
    'free nitro','nitro grátis','clica aqui','click here','ganhe dinheiro','earn money',
    'crypto','bitcoin grátis','free bitcoin','nft grátis','free nft','win prize',
    'ganha prémio','you won','ganhou','congratulations','parabéns você foi selecionado',
    'robux grátis','free robux','v-bucks grátis','free vbucks','paypal grátis',
    'trabalho em casa','trabalho online','renda extra','ganhe r$','earn $','make money',
    'buy followers','compra seguidores','boost server','servidor boost grátis',
    'discord server','join my server','entra no meu servidor','promo','promoção',
  ],
} as const;

/** Todas as palavras de todas as templates, sem duplicados — "máxima AutoMod". */
export const ALL_TEMPLATE_WORDS: string[] = Array.from(
  new Set(Object.values(WORD_TEMPLATE_WORDS).flat())
);
