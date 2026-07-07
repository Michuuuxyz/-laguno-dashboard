import Link from 'next/link';
import Image from 'next/image';

/* Footer único do site — usado em todas as páginas públicas. */
export function SiteFooter() {
  return (
    <footer style={{
      borderTop: '1px solid var(--line)',
      padding: '18px clamp(20px,4vw,56px)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      flexWrap: 'wrap', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--line)' }}>
          <Image src="/laguno.png" alt="" width={20} height={20} style={{ objectFit: 'cover' }} />
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>Laguno</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <Link href="/features"          className="footer-link">Funcionalidades</Link>
        <Link href="/comandos"          className="footer-link">Comandos</Link>
        <Link href="/docs"              className="footer-link">Documentação</Link>
        <Link href="/sobre"             className="footer-link">Sobre</Link>
        <Link href="/legal?tab=terms"   className="footer-link">Termos</Link>
        <Link href="/legal?tab=privacy" className="footer-link">Privacidade</Link>
        {/* Listagens — backlinks para o Laguno aparecer melhor nas pesquisas */}
        <a href="https://top.gg/bot/706487689519562833" target="_blank" rel="noreferrer" className="footer-link">top.gg</a>
        <a href="https://discord.ly/laguno" target="_blank" rel="noreferrer" className="footer-link">discord.ly</a>
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
          by <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>Michuu</span>
          <span style={{ margin: '0 6px' }}>·</span>© 2026
        </span>
      </div>
    </footer>
  );
}
