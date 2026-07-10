'use client';

/* Primitivas partilhadas da dashboard — um único Toggle e um único conjunto
   de estilos de formulário para todos os módulos. Antes disto havia 3 cópias
   do Toggle e 9 variações do estilo de input espalhadas pelos componentes. */

export function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} role="switch" aria-checked={on} style={{
      width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
      background: on ? 'var(--green)' : 'var(--elevated)',
      position: 'relative', transition: 'background .18s', flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 3, left: on ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        transition: 'left .18s', display: 'block', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

/* Campo de texto padrão */
export const input: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--line)',
  borderRadius: 8, padding: '8px 12px', color: 'var(--text-1)',
  fontSize: 13.5, width: '100%', outline: 'none',
};

/* Variante compacta (editores densos: canvas, blocos V2) */
export const inputSm: React.CSSProperties = {
  ...input, borderRadius: 7, padding: '7px 10px', fontSize: 13,
};

/* Rótulo de campo em maiúsculas pequenas */
export const lbl: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
  textTransform: 'uppercase', letterSpacing: '.04em', display: 'block', marginBottom: 6,
};

/* Variante compacta do rótulo */
export const lblSm: React.CSSProperties = {
  ...lbl, fontSize: 10.5, fontWeight: 700, letterSpacing: '.05em', marginBottom: 4,
};

/* Cartão de secção */
export const card: React.CSSProperties = {
  background: 'var(--card)', border: '1px solid var(--line)',
  borderRadius: 12, padding: '16px 18px',
};

/* Botão-ícone pequeno (subir/descer/apagar em listas) */
export const mini: React.CSSProperties = {
  width: 24, height: 24, borderRadius: 6, border: '1px solid var(--line)',
  background: 'var(--card)', color: 'var(--text-2)', cursor: 'pointer', fontSize: 11,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
};
