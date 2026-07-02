import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Legal',
  description: 'Termos de Serviço e Política de Privacidade do Laguno Bot.',
  openGraph: {
    title: 'Legal | Laguno',
    description: 'Termos de Serviço e Política de Privacidade do Laguno Bot.',
    url: 'https://lagunoapp.xyz/legal',
  },
  robots: {
    index: false,
  },
};


const UPDATED = '28 de junho de 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 'clamp(16px,2vw,20px)', fontWeight: 700, letterSpacing: '-.02em', marginBottom: 16, color: 'var(--text-1)' }}>
        {title}
      </h2>
      <div style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </section>
  );
}

function Tab({ active, href, children }: { active: boolean; href: string; children: React.ReactNode }) {
  return (
    <a href={href} style={{
      padding: '8px 20px', borderRadius: 8, fontSize: 13.5, fontWeight: 500, textDecoration: 'none',
      background: active ? 'rgba(109,184,62,.1)' : 'transparent',
      color: active ? 'var(--green)' : 'var(--text-3)',
      border: `1px solid ${active ? 'rgba(109,184,62,.25)' : 'transparent'}`,
      transition: 'all .15s',
    }}>{children}</a>
  );
}

export default function LegalPage({ searchParams }: { searchParams: { tab?: string } }) {
  const tab = searchParams.tab === 'privacy' ? 'privacy' : 'terms';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh' }}>
      {/* Navbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(13,13,15,.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #6db83e 40%, transparent)' }} />
        <div style={{
          height: 54, display: 'flex', alignItems: 'center',
          padding: '0 clamp(16px,4vw,64px)', gap: 32,
          maxWidth: 1200, margin: '0 auto', width: '100%',
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--line)' }}>
              <Image src="/laguno.png" alt="" width={24} height={24} style={{ objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>Laguno</span>
          </Link>
          <nav style={{ display: 'flex', gap: 4, flex: 1, justifyContent: 'center' }}>
            <Link href="/features" className="nav-link">Funcionalidades</Link>
          </nav>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link href="/dashboard" className="nav-cta-outline">Dashboard</Link>
          </div>
        </div>
      </header>

      {/* Page header */}
      <div style={{
        borderBottom: '1px solid var(--line)',
        padding: 'clamp(40px,6vh,72px) clamp(16px,4vw,64px) 0',
        maxWidth: 860, margin: '0 auto', width: '100%',
      }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 12 }}>Legal</p>
        <h1 style={{ fontSize: 'clamp(22px,3vw,36px)', fontWeight: 700, letterSpacing: '-.03em', marginBottom: 8 }}>
          {tab === 'terms' ? 'Termos de Serviço' : 'Política de Privacidade'}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 24 }}>Última atualização: {UPDATED}</p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: -1 }}>
          <Tab active={tab === 'terms'}   href="/legal?tab=terms">Termos de Serviço</Tab>
          <Tab active={tab === 'privacy'} href="/legal?tab=privacy">Política de Privacidade</Tab>
        </div>
      </div>

      {/* Content */}
      <main style={{
        maxWidth: 860, margin: '0 auto', width: '100%',
        padding: 'clamp(36px,5vh,64px) clamp(16px,4vw,64px)',
        flex: 1,
      }}>

        {tab === 'terms' && (
          <div>
            <Section title="1. Aceitação dos Termos">
              <p>Ao adicionar o Laguno ao teu servidor Discord ou ao utilizar o dashboard, aceitas ficar vinculado a estes Termos de Serviço. Se não concordares com qualquer parte destes termos, não deves utilizar o serviço.</p>
              <p>Estes termos aplicam-se a todos os utilizadores, administradores de servidores e qualquer pessoa que interaja com o Laguno, diretamente ou através de um servidor onde o bot esteja presente.</p>
              <p>A utilização do serviço por parte de menores de 13 anos não é permitida, em conformidade com os Termos de Serviço do Discord. Menores entre 13 e 18 anos devem ter autorização de um encarregado de educação.</p>
            </Section>

            <Section title="2. Descrição do Serviço">
              <p>O Laguno é um bot para Discord desenvolvido de forma independente que oferece funcionalidades de moderação, auto-moderação, boas-vindas personalizadas, logs de eventos, gestão de self-roles, sorteios e um dashboard web de configuração.</p>
              <p>O serviço é fornecido gratuitamente e sem garantias. Reservamo-nos o direito de alterar, suspender, limitar ou descontinuar qualquer funcionalidade a qualquer momento, com ou sem aviso prévio.</p>
              <p>O Laguno não é afiliado, patrocinado nem endossado pela Discord Inc. Discord é uma marca registada da Discord Inc.</p>
            </Section>

            <Section title="3. Uso Aceitável">
              <p>Concordas em não utilizar o Laguno para:</p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Violar os <a href="https://discord.com/terms" target="_blank" rel="noreferrer" style={{ color: 'var(--green)' }}>Termos de Serviço do Discord</a> ou as suas Diretrizes da Comunidade.</li>
                <li>Assediar, intimidar, ameaçar ou causar dano a outros utilizadores.</li>
                <li>Distribuir conteúdo ilegal, spam, malware ou desinformação.</li>
                <li>Tentar aceder, explorar, modificar ou interferir com a infraestrutura, base de dados ou API interna do serviço.</li>
                <li>Utilizar o bot de forma automatizada para contornar limitações técnicas ou para fins não previstos.</li>
                <li>Fazer engenharia reversa, copiar ou redistribuir qualquer parte do código ou lógica do Laguno sem autorização.</li>
                <li>Qualquer atividade que viole leis locais, nacionais ou internacionais aplicáveis.</li>
              </ul>
              <p>A violação destas regras pode resultar na remoção imediata do bot do teu servidor e no bloqueio permanente do acesso ao serviço.</p>
            </Section>

            <Section title="4. Responsabilidade dos Administradores de Servidor">
              <p>Ao adicionar o Laguno a um servidor Discord, o administrador responsável assume a obrigação de garantir que a utilização do bot está em conformidade com estas condições, com as políticas do Discord e com a legislação aplicável.</p>
              <p>O Laguno não se responsabiliza por ações de moderação incorretas, banimentos indevidos ou qualquer consequência resultante de configurações inadequadas definidas pelos administradores.</p>
              <p>Os administradores são responsáveis por informar os membros do servidor sobre a presença e as funcionalidades do bot, incluindo a recolha de dados necessária ao seu funcionamento.</p>
            </Section>

            <Section title="5. Propriedade Intelectual">
              <p>Todo o código, design, marca, nome "Laguno" e demais elementos do serviço são propriedade exclusiva do seu criador. É proibida a reprodução, distribuição, modificação ou utilização comercial sem autorização expressa e por escrito.</p>
              <p>Os utilizadores não adquirem qualquer direito de propriedade sobre o serviço ou os seus componentes pelo facto de o utilizarem.</p>
            </Section>

            <Section title="6. Isenção de Garantias e Limitação de Responsabilidade">
              <p>O Laguno é disponibilizado "tal como está" ("as is"), sem qualquer garantia expressa ou implícita de funcionamento ininterrupto, ausência de erros ou adequação a um fim específico.</p>
              <p>Em nenhuma circunstância o criador do Laguno será responsável por danos diretos, indiretos, incidentais ou consequentes resultantes do uso ou da impossibilidade de uso do serviço, incluindo mas não limitado a perda de dados, perda de receita ou danos reputacionais.</p>
            </Section>

            <Section title="7. Disponibilidade do Serviço">
              <p>O Laguno é disponibilizado sem garantias de uptime contínuo. Podem ocorrer interrupções para manutenção, atualizações, migração de infraestrutura ou por razões técnicas fora do nosso controlo.</p>
              <p>Não nos responsabilizamos por qualquer perda resultante da indisponibilidade temporária ou permanente do serviço.</p>
            </Section>

            <Section title="8. Suspensão e Encerramento">
              <p>Reservamo-nos o direito de suspender ou encerrar o acesso ao serviço, a qualquer servidor ou utilizador, sem aviso prévio, em caso de violação destes termos ou por qualquer outra razão que consideremos justificada.</p>
              <p>Em caso de encerramento do serviço, faremos os possíveis para avisar com antecedência razoável através dos canais oficiais.</p>
            </Section>

            <Section title="9. Lei Aplicável">
              <p>Estes termos são regidos pela legislação portuguesa e pela legislação da União Europeia aplicável, nomeadamente o Regulamento Geral sobre a Proteção de Dados (RGPD — Regulamento UE 2016/679). Qualquer litígio envolvendo utilizadores em Portugal ou na União Europeia será submetido à jurisdição dos tribunais competentes em Portugal.</p>
              <p>Para utilizadores localizados no Brasil, o serviço cumpre também os requisitos da Lei Geral de Proteção de Dados Pessoais (LGPD — Lei n.º 13.709/2018). Litígios envolvendo utilizadores brasileiros poderão ser submetidos à jurisdição dos tribunais competentes no Brasil.</p>
              <p>Na medida em que existam conflitos entre as legislações aplicáveis, será aplicada a lei mais protetora dos direitos do titular dos dados.</p>
            </Section>

            <Section title="10. Alterações aos Termos">
              <p>Reservamo-nos o direito de atualizar estes termos a qualquer momento. A data de última atualização está sempre visível no topo desta página. Alterações significativas serão comunicadas através dos canais oficiais do Laguno. O uso continuado do serviço após a publicação de alterações constitui aceitação dos novos termos.</p>
            </Section>

            <Section title="11. Contacto">
              <p>Para questões relacionadas com estes termos, podes entrar em contacto através do servidor oficial do Laguno no Discord ou por e-mail: <a href="mailto:r.amarelinho@gmail.com" style={{ color: 'var(--green)' }}>r.amarelinho@gmail.com</a>.</p>
            </Section>
          </div>
        )}

        {tab === 'privacy' && (
          <div>
            <Section title="1. Responsável pelo Tratamento de Dados">
              <p>O responsável pelo tratamento dos dados pessoais recolhidos pelo Laguno é o seu criador individual, com contacto disponível em <a href="mailto:r.amarelinho@gmail.com" style={{ color: 'var(--green)' }}>r.amarelinho@gmail.com</a>.</p>
              <p>Esta política aplica-se ao bot Laguno no Discord e ao respetivo dashboard web. Está em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD — Regulamento UE 2016/679).</p>
            </Section>

            <Section title="2. Dados que Recolhemos">
              <p>O Laguno recolhe e armazena apenas os dados estritamente necessários ao funcionamento das suas funcionalidades:</p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li><strong style={{ color: 'var(--text-1)' }}>IDs de servidor (guild)</strong> — para associar configurações e registos a cada servidor.</li>
                <li><strong style={{ color: 'var(--text-1)' }}>IDs de canais e cargos</strong> — para saber onde enviar mensagens e que cargos atribuir automaticamente.</li>
                <li><strong style={{ color: 'var(--text-1)' }}>IDs de utilizadores</strong> — para registar avisos (warns) e ações de moderação aplicadas a membros.</li>
                <li><strong style={{ color: 'var(--text-1)' }}>Configurações de servidor</strong> — as preferências que os administradores definem no dashboard (canais de log, mensagens de boas-vindas, etc.).</li>
                <li><strong style={{ color: 'var(--text-1)' }}>Dados de sessão OAuth2</strong> — nome de utilizador Discord, avatar e lista de servidores administrados, obtidos temporariamente no momento do login no dashboard.</li>
              </ul>
              <p>Não recolhemos, lemos nem armazenamos: conteúdo de mensagens (públicas ou privadas), passwords, dados de pagamento, endereços de e-mail, localização geográfica, nem qualquer outra informação pessoal fora do contexto descrito acima.</p>
            </Section>

            <Section title="3. Base Legal para o Tratamento (RGPD / LGPD)">
              <p>O tratamento dos dados recolhidos assenta nas seguintes bases legais:</p>
              <p style={{ fontWeight: 600, color: 'var(--text-1)' }}>Para utilizadores na União Europeia — RGPD (Regulamento UE 2016/679):</p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li><strong style={{ color: 'var(--text-1)' }}>Execução de contrato</strong> (art. 6.º, n.º 1, al. b)) — os IDs de servidor, canais, cargos e utilizadores são necessários para prestar o serviço solicitado pelo administrador ao adicionar o bot.</li>
                <li><strong style={{ color: 'var(--text-1)' }}>Interesses legítimos</strong> (art. 6.º, n.º 1, al. f)) — os dados de autenticação OAuth2 são tratados com base no interesse legítimo de verificar que o utilizador tem permissões para gerir o servidor no dashboard.</li>
              </ul>
              <p style={{ fontWeight: 600, color: 'var(--text-1)' }}>Para utilizadores no Brasil — LGPD (Lei n.º 13.709/2018):</p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li><strong style={{ color: 'var(--text-1)' }}>Execução de contrato</strong> (art. 7.º, V) — tratamento necessário à execução do contrato de prestação do serviço do bot.</li>
                <li><strong style={{ color: 'var(--text-1)' }}>Legítimo interesse</strong> (art. 7.º, IX) — autenticação OAuth2 e segurança da plataforma, com respeito pelos direitos e liberdades fundamentais do titular.</li>
              </ul>
            </Section>

            <Section title="4. Como Usamos os Dados">
              <p>Os dados recolhidos são usados exclusivamente para:</p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Fornecer as funcionalidades do Laguno (moderação, boas-vindas, logs, self-roles, sorteios).</li>
                <li>Guardar as configurações de cada servidor entre sessões.</li>
                <li>Autenticar administradores de servidor no dashboard via Discord OAuth2.</li>
                <li>Manter registos de ações de moderação (warns, bans) para consulta posterior pelos administradores.</li>
              </ul>
              <p>Não vendemos, partilhamos nem cedemos os teus dados a terceiros para fins comerciais ou publicitários.</p>
            </Section>

            <Section title="5. Autenticação no Dashboard">
              <p>O dashboard utiliza o protocolo Discord OAuth2 para autenticação. Ao iniciar sessão, o Discord partilha connosco o teu ID de utilizador, nome de utilizador, avatar e a lista de servidores onde tens permissões de administrador.</p>
              <p>Estes dados são utilizados exclusivamente para apresentar a interface correta e verificar se tens permissão para gerir determinado servidor. Não são armazenados de forma permanente na nossa base de dados — a sessão é mantida em memória e expira automaticamente após o logout ou após um período de inatividade.</p>
            </Section>

            <Section title="6. Subprocessadores e Infraestrutura">
              <p>Para prestar o serviço, recorremos aos seguintes fornecedores de infraestrutura, que podem processar dados no âmbito das suas funções:</p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li><strong style={{ color: 'var(--text-1)' }}>MongoDB Atlas</strong> — base de dados onde são armazenadas as configurações e registos de moderação. Os dados podem estar alojados em servidores na Europa ou nos EUA com salvaguardas adequadas (SCCs).</li>
                <li><strong style={{ color: 'var(--text-1)' }}>Vercel</strong> — plataforma de alojamento do dashboard web. Pode registar logs técnicos de acesso (IP, user-agent) para fins de segurança e diagnóstico.</li>
                <li><strong style={{ color: 'var(--text-1)' }}>Discloud</strong> — plataforma de alojamento do bot Discord.</li>
                <li><strong style={{ color: 'var(--text-1)' }}>Discord Inc.</strong> — plataforma sobre a qual o bot opera. Os dados partilhados pelo Discord via API estão sujeitos à <a href="https://discord.com/privacy" target="_blank" rel="noreferrer" style={{ color: 'var(--green)' }}>Política de Privacidade do Discord</a>.</li>
              </ul>
            </Section>

            <Section title="7. Retenção de Dados">
              <p>As configurações de servidor são mantidas enquanto o Laguno permanecer no servidor. Ao remover o bot, os dados de configuração ficam em estado inativo e podem ser solicitados para eliminação.</p>
              <p>Os registos de moderação (warns) são mantidos indefinidamente até o administrador os eliminar manualmente através do dashboard ou dos comandos do bot.</p>
              <p>Os dados de sessão OAuth2 não são persistidos — são descartados automaticamente no final da sessão.</p>
            </Section>

            <Section title="8. Transferências Internacionais de Dados">
              <p>Alguns dos nossos subprocessadores (nomeadamente MongoDB Atlas e Vercel) podem armazenar ou processar dados fora do Espaço Económico Europeu (EEE) ou do Brasil. Nestas situações, as transferências são protegidas por mecanismos adequados:</p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li><strong style={{ color: 'var(--text-1)' }}>Para utilizadores da UE</strong> — Cláusulas Contratuais-Tipo (SCCs) aprovadas pela Comissão Europeia, nos termos do RGPD.</li>
                <li><strong style={{ color: 'var(--text-1)' }}>Para utilizadores do Brasil</strong> — transferências realizadas em conformidade com o art. 33.º da LGPD, com garantias adequadas de proteção equivalente à prevista na lei brasileira.</li>
              </ul>
            </Section>

            <Section title="9. Segurança">
              <p>Os dados são armazenados numa base de dados MongoDB com acesso restrito por credenciais e regras de rede. A comunicação entre o dashboard e o bot é realizada através de uma API interna autenticada por chave secreta.</p>
              <p>Tomamos medidas técnicas e organizativas razoáveis para proteger os dados contra acesso não autorizado, perda ou destruição. No entanto, nenhum sistema é 100% seguro. Em caso de violação de segurança com impacto nos teus dados, serás notificado nos termos legais aplicáveis.</p>
            </Section>

            <Section title="10. Os Teus Direitos (RGPD / LGPD)">
              <p>Enquanto titular de dados, tens os seguintes direitos — garantidos tanto pelo RGPD (UE) como pela LGPD (Brasil):</p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li><strong style={{ color: 'var(--text-1)' }}>Acesso</strong> — solicitar uma cópia dos dados que temos armazenados relativos ao teu servidor ou utilizador.</li>
                <li><strong style={{ color: 'var(--text-1)' }}>Retificação</strong> — corrigir dados incorretos ou desatualizados.</li>
                <li><strong style={{ color: 'var(--text-1)' }}>Apagamento / Eliminação</strong> — solicitar a eliminação de todos os dados associados ao teu servidor (RGPD: art. 17.º; LGPD: art. 18.º, VI).</li>
                <li><strong style={{ color: 'var(--text-1)' }}>Limitação do tratamento</strong> — solicitar que o tratamento dos teus dados seja restringido em determinadas circunstâncias.</li>
                <li><strong style={{ color: 'var(--text-1)' }}>Portabilidade</strong> — receber os teus dados num formato estruturado e legível por máquina.</li>
                <li><strong style={{ color: 'var(--text-1)' }}>Oposição / Revogação do consentimento</strong> — opor-te ao tratamento ou revogar o consentimento a qualquer momento, sem prejuízo do tratamento efetuado até essa data.</li>
                <li><strong style={{ color: 'var(--text-1)' }}>Informação sobre partilha</strong> — saber com que entidades os teus dados são partilhados (LGPD: art. 18.º, VII).</li>
              </ul>
              <p>Para exercer qualquer destes direitos, entra em contacto por e-mail: <a href="mailto:r.amarelinho@gmail.com" style={{ color: 'var(--green)' }}>r.amarelinho@gmail.com</a>. Responderemos no prazo de 30 dias (RGPD) / 15 dias úteis (LGPD).</p>
              <p><strong style={{ color: 'var(--text-1)' }}>Utilizadores na União Europeia</strong> — podem apresentar reclamação à autoridade de controlo competente: <a href="https://www.cnpd.pt" target="_blank" rel="noreferrer" style={{ color: 'var(--green)' }}>CNPD — Comissão Nacional de Proteção de Dados (Portugal)</a>.</p>
              <p><strong style={{ color: 'var(--text-1)' }}>Utilizadores no Brasil</strong> — podem apresentar reclamação à: <a href="https://www.gov.br/anpd" target="_blank" rel="noreferrer" style={{ color: 'var(--green)' }}>ANPD — Autoridade Nacional de Proteção de Dados</a>.</p>
            </Section>

            <Section title="11. Menores">
              <p>O serviço não é dirigido a menores de 13 anos. Não recolhemos intencionalmente dados de crianças. Se tomares conhecimento de que um menor forneceu dados sem autorização, entra em contacto connosco para que possamos proceder à sua eliminação imediata.</p>
            </Section>

            <Section title="12. Cookies e Armazenamento Local">
              <p>O dashboard pode utilizar cookies de sessão estritamente necessários para manter o estado de autenticação durante a navegação. Não utilizamos cookies de rastreamento, publicidade ou análise de terceiros.</p>
            </Section>

            <Section title="13. Alterações a esta Política">
              <p>Esta política pode ser atualizada para refletir mudanças nas funcionalidades do serviço, na infraestrutura utilizada ou em requisitos legais. A data de última atualização está sempre visível no topo desta página. Alterações significativas serão comunicadas através dos canais oficiais do Laguno.</p>
            </Section>
          </div>
        )}
      </main>

      {/* Footer */}
      <SiteFooter />
      </div>
    </div>
  );
}
