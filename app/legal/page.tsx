import Link from 'next/link';
import Image from 'next/image';

const UPDATED = '22 de junho de 2026';

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
      background: active ? 'rgba(62,207,142,.1)' : 'transparent',
      color: active ? 'var(--green)' : 'var(--text-3)',
      border: `1px solid ${active ? 'rgba(62,207,142,.25)' : 'transparent'}`,
      transition: 'all .15s',
    }}>{children}</a>
  );
}

export default function LegalPage({ searchParams }: { searchParams: { tab?: string } }) {
  const tab = searchParams.tab === 'privacy' ? 'privacy' : 'terms';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      {/* Navbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(13,13,15,.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #3ecf8e 40%, transparent)' }} />
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
            <Link href="/#features" className="nav-link">Funcionalidades</Link>
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
              <p>Ao adicionar o Laguno ao teu servidor Discord ou ao utilizar o dashboard em laguno.app, aceitas ficar vinculado a estes Termos de Serviço. Se não concordares com algum dos termos, não deves utilizar o serviço.</p>
              <p>Estes termos aplicam-se a todos os utilizadores, administradores de servidores e qualquer pessoa que interaja com o Laguno.</p>
            </Section>

            <Section title="2. Descrição do Serviço">
              <p>O Laguno é um bot para Discord que oferece funcionalidades de moderação, auto-moderação, boas-vindas, logs de eventos, gestão de cargos e dashboard web de configuração.</p>
              <p>O serviço é fornecido gratuitamente e pode ser alterado, suspenso ou descontinuado a qualquer momento, com ou sem aviso prévio.</p>
            </Section>

            <Section title="3. Uso Aceitável">
              <p>Concordas em não utilizar o Laguno para:</p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Violar os <a href="https://discord.com/terms" target="_blank" rel="noreferrer" style={{ color: 'var(--green)' }}>Termos de Serviço do Discord</a> ou as suas Diretrizes da Comunidade.</li>
                <li>Assediar, ameaçar ou causar dano a outros utilizadores.</li>
                <li>Distribuir conteúdo ilegal, spam ou malware.</li>
                <li>Tentar aceder, modificar ou interferir com a infraestrutura do serviço.</li>
                <li>Utilizar o bot de forma automatizada para contornar limitações ou para fins não previstos.</li>
              </ul>
            </Section>

            <Section title="4. Responsabilidade dos Administradores">
              <p>Ao adicionar o Laguno a um servidor, o administrador é responsável pela configuração e pelo uso que a sua comunidade faz do bot. O Laguno não se responsabiliza por ações de moderação incorretas resultantes de configurações inadequadas.</p>
              <p>Os administradores devem garantir que o uso do bot está em conformidade com as leis aplicáveis e com as políticas do Discord.</p>
            </Section>

            <Section title="5. Disponibilidade do Serviço">
              <p>O Laguno é disponibilizado sem garantias de uptime contínuo. Podem ocorrer interrupções para manutenção, atualizações ou por razões técnicas fora do nosso controlo.</p>
              <p>Não nos responsabilizamos por qualquer perda resultante da indisponibilidade temporária do serviço.</p>
            </Section>

            <Section title="6. Alterações aos Termos">
              <p>Reservamo-nos o direito de atualizar estes termos a qualquer momento. Alterações significativas serão comunicadas através dos canais oficiais do Laguno. O uso continuado do serviço após alterações constitui aceitação dos novos termos.</p>
            </Section>

            <Section title="7. Contacto">
              <p>Para questões relacionadas com estes termos, podes entrar em contacto através do servidor oficial do Discord do Laguno.</p>
            </Section>
          </div>
        )}

        {tab === 'privacy' && (
          <div>
            <Section title="1. Dados que Recolhemos">
              <p>O Laguno recolhe e armazena apenas os dados estritamente necessários ao funcionamento das suas funcionalidades:</p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li><strong style={{ color: 'var(--text-1)' }}>IDs de servidor (guild)</strong> — para associar configurações a cada servidor.</li>
                <li><strong style={{ color: 'var(--text-1)' }}>IDs de canais e cargos</strong> — para saber onde enviar mensagens e que cargos atribuir.</li>
                <li><strong style={{ color: 'var(--text-1)' }}>IDs de utilizadores</strong> — para registar avisos (warns) e ações de moderação.</li>
                <li><strong style={{ color: 'var(--text-1)' }}>Configurações de servidor</strong> — as preferências que os administradores definem no dashboard.</li>
              </ul>
              <p>Não recolhemos conteúdo de mensagens privadas, passwords, dados de pagamento, nem qualquer informação pessoal fora do contexto de uso do bot no Discord.</p>
            </Section>

            <Section title="2. Como Usamos os Dados">
              <p>Os dados recolhidos são usados exclusivamente para:</p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Fornecer as funcionalidades do Laguno (moderação, boas-vindas, logs, roles).</li>
                <li>Guardar as configurações de cada servidor entre sessões.</li>
                <li>Autenticar administradores de servidor no dashboard via Discord OAuth2.</li>
              </ul>
              <p>Não vendemos, partilhamos nem cedemos os teus dados a terceiros para fins comerciais.</p>
            </Section>

            <Section title="3. Autenticação no Dashboard">
              <p>O dashboard utiliza o Discord OAuth2 para autenticação. Ao iniciar sessão, o Discord partilha connosco o teu nome de utilizador, avatar e lista de servidores onde tens permissões de administrador.</p>
              <p>Estes dados são usados apenas para apresentar a interface e verificar permissões. Não são armazenados de forma permanente — a sessão expira automaticamente.</p>
            </Section>

            <Section title="4. Retenção de Dados">
              <p>As configurações de servidor são mantidas enquanto o Laguno estiver no servidor. Ao remover o bot, podes solicitar a eliminação dos dados associados ao teu servidor.</p>
              <p>Os registos de moderação (warns) são mantidos até o administrador os eliminar manualmente através do dashboard ou dos comandos do bot.</p>
            </Section>

            <Section title="5. Segurança">
              <p>Os dados são armazenados numa base de dados MongoDB com acesso restrito. A comunicação entre o dashboard e o bot é feita através de uma API interna autenticada por chave secreta.</p>
              <p>Tomamos medidas razoáveis para proteger os dados, mas nenhum sistema é 100% seguro. Notificamos os utilizadores em caso de violações de segurança relevantes.</p>
            </Section>

            <Section title="6. Os Teus Direitos">
              <p>Tens o direito de solicitar:</p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Acesso aos dados armazenados relativos ao teu servidor.</li>
                <li>Correção de dados incorretos.</li>
                <li>Eliminação de todos os dados associados ao teu servidor.</li>
              </ul>
              <p>Para exercer estes direitos, entra em contacto através do servidor oficial do Laguno no Discord.</p>
            </Section>

            <Section title="7. Alterações a esta Política">
              <p>Esta política pode ser atualizada para refletir mudanças nas funcionalidades ou requisitos legais. A data de última atualização está sempre visível no topo desta página.</p>
            </Section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--line)',
        padding: '18px clamp(16px,4vw,64px)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--line)' }}>
            <Image src="/laguno.png" alt="" width={20} height={20} style={{ objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>Laguno</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/legal?tab=terms"   style={{ fontSize: 12, color: tab === 'terms'   ? 'var(--green)' : 'var(--text-3)', textDecoration: 'none' }}>Termos</Link>
          <Link href="/legal?tab=privacy" style={{ fontSize: 12, color: tab === 'privacy' ? 'var(--green)' : 'var(--text-3)', textDecoration: 'none' }}>Privacidade</Link>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
            by <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>Michuu</span>
            <span style={{ margin: '0 6px' }}>·</span>
            © 2026
          </span>
        </div>
      </footer>
    </div>
  );
}
