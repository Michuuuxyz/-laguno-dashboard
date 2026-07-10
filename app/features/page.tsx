import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { SiteFooter } from '@/components/SiteFooter';
import { ScrollReveal } from '@/components/ScrollReveal';

export const metadata: Metadata = {
  title: 'Funcionalidades',
  description: 'Moderação com humor próprio, boas-vindas com cartão, mais de 30 eventos de log, reaction roles e tickets. Tudo o que o Laguno faz pelo teu servidor.',
  alternates: { canonical: '/features' },
  keywords: ['laguno funcionalidades', 'bot discord moderação', 'auto-mod discord', 'boas-vindas discord', 'reaction roles discord', 'tickets discord', 'logs discord', 'bot discord português'],
  openGraph: {
    title: 'Funcionalidades | Laguno',
    description: 'Moderação com humor próprio, boas-vindas com cartão, mais de 30 eventos de log, reaction roles e tickets. Tudo o que o Laguno faz pelo teu servidor.',
    url: 'https://www.lagunoapp.xyz/features',
  },
};

const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
const INVITE    = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=bot+applications.commands&permissions=1102666262758`;

/* ── Ícones clássicos de linha ── */
const ic = (p: React.ReactNode) => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{p}</svg>
);
const FEAT_ICONS = {
  moderacao:   ic(<><path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z"/><path d="M9.5 12l1.8 1.8L15 10"/></>),
  boasvindas:  ic(<><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="9" cy="7" r="3.2"/><path d="M17 11l2 2 4-4"/></>),
  logs:        ic(<><path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5M8.5 13h7M8.5 16.5h7M8.5 9.5h3"/></>),
  selfroles:   ic(<><path d="M20.6 13.4L13 21a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 2.6 12l.4-6a2 2 0 0 1 2-2l6-.4a2 2 0 0 1 1.6.6l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="8.5" r="1.4"/></>),
  builder:     ic(<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>),
};

/* ── Discord mock — primitivas partilhadas ── */
import {
  DC, mockFont as font, MockMsg, MockH2, MockText, MockSub,
  Mention, DCContainer, DCSep, DCBtn, DCBtnRow,
} from '@/components/DiscordMock';

function FeatureSection({ id, accent, tag, title, desc, mock, icon, reverse = false }: {
  id: string; accent: string; tag: string; title: string; desc: string;
  mock: React.ReactNode; icon: React.ReactNode; reverse?: boolean;
}) {
  return (
    <section id={id} style={{
      maxWidth: 1100, margin: '0 auto',
      padding: 'clamp(56px,8vh,96px) clamp(20px,4vw,56px)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'clamp(32px,5vw,72px)',
      alignItems: 'center',
      direction: reverse ? 'rtl' : 'ltr',
    }} className="feat-section">
      <ScrollReveal style={{ direction: 'ltr' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: accent + '18', border: `1px solid ${accent}33`, color: accent,
          }}>
            {icon}
          </span>
          <p style={{ fontSize: 10.5, fontWeight: 700, color: accent, letterSpacing: '.1em', textTransform: 'uppercase' }}>
            {tag}
          </p>
        </div>
        <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 700, letterSpacing: '-.03em', lineHeight: 1.15, marginBottom: 16, whiteSpace: 'pre-line' }}>
          {title}
        </h2>
        <p style={{ fontSize: 15.5, color: 'var(--text-2)', lineHeight: 1.8 }}>
          {desc}
        </p>
      </ScrollReveal>
      <ScrollReveal delay={0.12} style={{ direction: 'ltr', background: DC.bg, borderRadius: 12, padding: 18, border: '1px solid rgba(0,0,0,.4)', boxShadow: '0 20px 60px rgba(0,0,0,.5)' }}>
        {mock}
      </ScrollReveal>
    </section>
  );
}


export default function Features() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* ── PAGE HEADER ── */}
      <ScrollReveal style={{ textAlign: 'center', padding: 'clamp(64px,10vh,100px) clamp(20px,4vw,56px) 0', maxWidth: 640, margin: '0 auto' }}>
        <h1 className="display" style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.1, marginBottom: 20 }}>
          Funcionalidades
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-2)', lineHeight: 1.75 }}>
          Moderação que muda de humor, boas-vindas com cartão, mais de 30 eventos de log, reaction roles e tickets.
          Configuras no dashboard e ele trata do resto.
        </p>
      </ScrollReveal>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(20px,4vw,56px)' }}>
        <div style={{ height: 1, background: 'var(--line)', marginTop: 'clamp(48px,7vh,80px)' }} />
      </div>

      {/* ── MODERAÇÃO ── */}
      <FeatureSection
        id="moderacao"
        accent="#ef4444"
        icon={FEAT_ICONS.moderacao}
        tag="Moderação"
        title={`Ban, kick, aviso.\nNunca com a mesma frase.`}
        desc="O Laguno tem um motor de estados de espírito: stressado, sonolento, entediado, animado ou feliz. As mensagens de moderação mudam de tom conforme o humor. O resultado é sempre o mesmo. A frase, nunca."
        mock={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <MockMsg avatarColor="#4e5058" name="Admin" time="14:31">
              <MockText><Mention>/warn</Mention>{' '}<Mention color="#7c9fd4">@spammer</Mention>{' '}<span style={{ color: DC.muted }}>flood no chat</span></MockText>
            </MockMsg>
            <MockMsg avatar="/laguno.png" name="Laguno" bot time="14:31">
              <MockH2>CHEGA <Mention color="#7c9fd4">@spammer</Mention>!</MockH2>
              <MockText>Já estou à beira do limite — <strong>flood no chat</strong>?! Aviso <strong>#2</strong>. Mais um e NÃO respondo de mim.</MockText>
            </MockMsg>
            <MockMsg avatar="/laguno.png" name="Laguno" bot time="14:52">
              <MockText><span style={{ color: DC.muted }}><em>(modo sonolento)</em></span></MockText>
              <MockText>Zzz... <Mention color="#7c9fd4">@spammer</Mention> aviso <strong>#3</strong>... já estou quase a dormir e ainda apareces...</MockText>
            </MockMsg>
          </div>
        }
      />


      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(20px,4vw,56px)' }}>
        <div style={{ height: 1, background: 'var(--line)' }} />
      </div>

      {/* ── BOAS-VINDAS ── */}
      <FeatureSection
        id="boasvindas"
        accent="var(--green)"
        icon={FEAT_ICONS.boasvindas}
        tag="Boas-vindas"
        title={`A entrada de cada membro,\ntratada como deve ser.`}
        desc="Mensagem personalizada no canal de boas-vindas, DM privada opcional, e auto-delete configurável. Usas variáveis como {mention}, {username} ou {server} para personalizar ao máximo."
        mock={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 1, background: DC.line }} />
              <span style={{ fontSize: 11, color: DC.muted, fontFamily: font, whiteSpace: 'nowrap' }}>Michu entrou no servidor</span>
              <div style={{ flex: 1, height: 1, background: DC.line }} />
            </div>
            <MockMsg avatar="/laguno.png" name="Laguno" bot time="14:32">
              <DCContainer accent="var(--green)">
                <MockText><strong>Já estava à espera.</strong></MockText>
                <MockText>Olá <Mention color="#7c9fd4">@Michu</Mention>. Já vi o histórico do servidor. Não vou dizer nada. Bem-vindo.</MockText>
                <DCSep />
                <DCBtnRow>
                  <DCBtn label="Ver regras" />
                  <DCBtn label="Escolher cargos" variant="primary" />
                </DCBtnRow>
              </DCContainer>
            </MockMsg>
          </div>
        }
        reverse
      />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(20px,4vw,56px)' }}>
        <div style={{ height: 1, background: 'var(--line)' }} />
      </div>

      {/* ── LOGS ── */}
      <FeatureSection
        id="logs"
        accent="#fee75c"
        icon={FEAT_ICONS.logs}
        tag="Registos"
        title={`Nada acontece\nsem ficar registado.`}
        desc="Bans, kicks, mensagens editadas e apagadas, entradas e saídas, alterações de cargos: mais de 30 tipos de eventos, num canal que tu escolhes no dashboard. Podes filtrar o que registar e onde."
        mock={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <MockMsg avatar="/laguno.png" name="Laguno" bot time="14:33">
              <MockH2>BAN</MockH2>
              <MockText><span style={{ color: DC.muted }}>Utilizador </span><Mention color="#7c9fd4">spammer#0001</Mention></MockText>
              <MockText><span style={{ color: DC.muted }}>Moderador </span><Mention color="#6db83e">Admin#1234</Mention></MockText>
              <MockText><span style={{ color: DC.muted }}>Motivo </span>Flood repetido</MockText>
              <DCSep />
              <MockSub>Laguno Logs · 14:33</MockSub>
            </MockMsg>
            <MockMsg avatar="/laguno.png" name="Laguno" bot time="14:41">
              <MockH2>Mensagem Editada</MockH2>
              <MockText><span style={{ color: DC.muted }}>Autor </span><Mention color="#7c9fd4">utilizador#5678</Mention></MockText>
              <MockText>
                <span style={{ color: DC.muted, textDecoration: 'line-through' }}>ola malta</span>
                <span style={{ color: DC.muted }}> → </span>
                <span style={{ color: 'var(--green)' }}>olá malta!</span>
              </MockText>
              <DCSep />
              <MockSub>Laguno Logs · 14:41</MockSub>
            </MockMsg>
          </div>
        }
      />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(20px,4vw,56px)' }}>
        <div style={{ height: 1, background: 'var(--line)' }} />
      </div>

      {/* ── SELF-ROLES ── */}
      <FeatureSection
        id="selfroles"
        accent="#5865f2"
        icon={FEAT_ICONS.selfroles}
        tag="Self-roles"
        title={`Os membros escolhem.\nTu não fazes nada.`}
        desc="Crias painéis com botões no dashboard e cada botão dá ou remove um cargo. Os membros clicam sozinhos, sem pedir nada ao admin. Podes ter vários painéis para categorias diferentes."
        mock={
          <MockMsg avatar="/laguno.png" name="Laguno" bot time="09:00">
            <DCContainer accent="#5865f2">
              <div>
                <MockText><strong>Escolhe os teus cargos.</strong></MockText>
                <MockText>Clica para adicionar ou remover. Simples assim.</MockText>
              </div>
              <DCSep />
              <DCBtnRow>
                <DCBtn label="Gamer" />
                <DCBtn label="Música" />
                <DCBtn label="Anúncios" />
                <DCBtn label="Arte" />
              </DCBtnRow>
            </DCContainer>
          </MockMsg>
        }
        reverse
      />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(20px,4vw,56px)' }}>
        <div style={{ height: 1, background: 'var(--line)' }} />
      </div>

      {/* ── CONSTRUTOR DE MENSAGENS ── */}
      <FeatureSection
        id="builder"
        accent="#6db83e"
        icon={FEAT_ICONS.builder}
        tag="Construtor de Mensagens"
        title={`Mensagens com botões.\nSem escrever código.`}
        desc="Monta mensagens ricas no dashboard com blocos (texto, imagem, separador e botões) na ordem que quiseres. Cada botão faz o que decidires: responde com uma mensagem (privada ou pública), dá um cargo, ou abre um link. Tudo em Components V2, com a tua cor."
        mock={
          <MockMsg avatar="/laguno.png" name="Laguno" bot time="17:20">
            <DCContainer accent="#6db83e">
              <div>
                <MockH2>Central de Suporte</MockH2>
                <MockText>Precisas de ajuda? Escolhe uma opção abaixo.</MockText>
              </div>
              <DCSep />
              <DCBtnRow>
                <DCBtn label="📖 Regras" variant="primary" />
                <DCBtn label="🎫 Abrir ticket" />
                <DCBtn label="🔗 Site" />
              </DCBtnRow>
            </DCContainer>
          </MockMsg>
        }
        reverse
      />

      {/* ── CTA ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(20px,4vw,56px) clamp(80px,12vh,120px)' }}>
        <ScrollReveal style={{ borderTop: '1px solid var(--line)', paddingTop: 'clamp(40px,6vh,64px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(18px,2.5vw,24px)', fontWeight: 700, letterSpacing: '-.03em', marginBottom: 6 }}>
              Pronto para experimentar?
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
              Dois minutos de configuração. Depois podes fingir que geres tudo tu.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href={INVITE} target="_blank" rel="noreferrer" className="nav-cta-green" style={{ fontSize: 14, padding: '.65rem 1.5rem' }}>
              Adicionar agora
            </a>
            <Link href="/dashboard" className="nav-cta-outline" style={{ fontSize: 14, padding: '.65rem 1.5rem' }}>
              Abrir dashboard
            </Link>
          </div>
        </ScrollReveal>
      </div>

      <SiteFooter />

      <style>{`
        @media (max-width: 760px) {
          .feat-section { grid-template-columns: 1fr !important; direction: ltr !important; }
          .mood-grid    { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
