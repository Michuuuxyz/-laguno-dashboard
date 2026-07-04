import Image from 'next/image';

// Esqueleto mostrado instantaneamente enquanto a lista de servidores carrega.
// Reproduz a estrutura da DashboardShell (topbar 54px + rail 80px + sidebar
// 220px) para não haver "salto" quando os dados reais chegam.
export function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Topbar — logo centrado, como na shell */}
      <div className="dsk-panel" style={{
        height: 54, flexShrink: 0, background: 'var(--surface)', borderBottom: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
      }}>
        <Image src="/laguno.png" alt="Laguno" width={36} height={36} style={{ objectFit: 'contain' }} priority />
        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--text-1)' }}>Laguno</span>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Icon rail */}
        <div className="dsk-panel" style={{
          width: 80, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--line)',
          height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
          paddingTop: 14, paddingBottom: 12, gap: 10,
        }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="lg-pulse" style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--elevated)' }} />
          ))}
        </div>

        {/* Sidebar */}
        <aside className="dsk-panel" style={{
          width: 220, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--line)',
          height: '100%', display: 'flex', flexDirection: 'column', padding: 16, gap: 12,
        }}>
          <div className="lg-pulse" style={{ width: '70%', height: 16, borderRadius: 6, background: 'var(--elevated)' }} />
          <div className="lg-pulse" style={{ width: '45%', height: 11, borderRadius: 6, background: 'var(--elevated)' }} />
          <div style={{ height: 12 }} />
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className="lg-pulse" style={{ width: '90%', height: 30, borderRadius: 7, background: 'var(--elevated)', animationDelay: `${i * 0.08}s` }} />
          ))}
        </aside>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
          <div className="lg-pulse" style={{ width: 240, height: 26, borderRadius: 8, background: 'var(--elevated)', marginBottom: 20 }} />
          <div className="lg-pulse" style={{ width: '100%', maxWidth: 620, height: 120, borderRadius: 12, background: 'var(--elevated)' }} />
        </main>
      </div>

      <style>{`@keyframes lg-pulse-kf{0%,100%{opacity:.55}50%{opacity:1}}.lg-pulse{animation:lg-pulse-kf 1.3s ease-in-out infinite}@media(prefers-reduced-motion:reduce){.lg-pulse{animation:none}}@media(max-width:900px){.dsk-panel{display:none}}`}</style>
    </div>
  );
}
