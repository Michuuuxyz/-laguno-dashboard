import type { Metadata } from 'next';

// A página /docs é um client component e não pode exportar metadata —
// este layout fornece a SEO da secção.
export const metadata: Metadata = {
  title: 'Documentação',
  description: 'Guias de configuração do Laguno: adicionar o bot, dashboard, boas-vindas, auto-mod, reaction roles, tickets e comandos. Tudo em português.',
  alternates: { canonical: '/docs' },
  keywords: ['documentação laguno', 'como configurar laguno', 'setup bot discord', 'configurar bot discord português', 'guia bot discord', 'laguno dashboard'],
  openGraph: {
    title: 'Documentação | Laguno',
    description: 'Guias de configuração do Laguno, passo a passo e em português.',
    url: 'https://www.lagunoapp.xyz/docs',
  },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
