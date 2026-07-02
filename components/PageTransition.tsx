'use client';

// Sem animação de transição — navegação instantânea, sem flash entre páginas.
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
