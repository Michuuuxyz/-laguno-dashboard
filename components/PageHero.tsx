import { HeroMascot } from './HeroMascot';

/* Cabeçalho partilhado das páginas internas: mascote com tilt 3D à direita +
   eyebrow/título/texto à esquerda. Os rabiscos da lagoa vêm da moldura global
   do layout (laterais), por isso o hero não os repete. */
export function PageHero({ eyebrow, title, titleAccent, desc, mascot, mascotAlt = 'Laguno' }: {
  eyebrow: string;
  title: string;
  titleAccent?: string;
  desc: string;
  mascot: string;
  mascotAlt?: string;
}) {
  return (
    <section style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="ph-grid" style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: 1050, margin: '0 auto',
        padding: 'clamp(40px,7vh,80px) clamp(20px,4vw,56px) clamp(28px,4vh,48px)',
        display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,34%)',
        gap: 'clamp(20px,3vw,48px)', alignItems: 'center',
      }}>
        <div className="ph-text">
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 14 }}>
            {eyebrow}
          </p>
          <h1 className="display" style={{ fontSize: 'clamp(38px,6vw,72px)', fontWeight: 800, letterSpacing: '-.04em', lineHeight: 0.98 }}>
            {title}{titleAccent ? <> <span style={{ color: 'var(--green)' }}>{titleAccent}</span></> : null}
          </h1>
          <p style={{ fontSize: 'clamp(15px,1.7vw,17px)', color: 'var(--text-2)', lineHeight: 1.75, maxWidth: 480, marginTop: 18 }}>
            {desc}
          </p>
        </div>
        <div className="ph-mascot" style={{ textAlign: 'center' }}>
          <HeroMascot src={mascot} alt={mascotAlt} size="clamp(180px,24vw,300px)" />
        </div>
      </div>
      <style>{`
        @media (max-width: 760px) {
          .ph-grid { grid-template-columns: 1fr !important; text-align: center; }
          .ph-text { order: 2; display: flex; flex-direction: column; align-items: center; }
          .ph-mascot { order: 1; }
        }
      `}</style>
    </section>
  );
}
