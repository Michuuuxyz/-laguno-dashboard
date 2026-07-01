import type { Metadata } from 'next';
import { SessionProvider } from '@/components/SessionProvider';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.lagunoapp.xyz'),
  title: {
    default: 'Laguno — O bot em português com personalidade',
    template: '%s | Laguno',
  },
  description: 'Moderação com personalidade, logs automáticos, boas-vindas, self-roles e sorteios. Configurado em dois minutos, a correr sem ti.',
  keywords: ['discord bot', 'bot português', 'bot brasileiro', 'moderação discord', 'laguno', 'bot discord portugal', 'bot discord brasil'],
  authors: [{ name: 'Michuu' }],
  creator: 'Michuu',
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    url: 'https://www.lagunoapp.xyz',
    siteName: 'Laguno',
    title: 'Laguno — O bot em português com personalidade',
    description: 'Moderação com personalidade, logs automáticos, boas-vindas, self-roles e sorteios. Configurado em dois minutos, a correr sem ti.',
    images: [
      {
        url: '/laguno.png',
        width: 512,
        height: 512,
        alt: 'Laguno Bot',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Laguno — O bot em português com personalidade',
    description: 'Moderação com personalidade, logs automáticos, boas-vindas, self-roles e sorteios.',
    images: ['/laguno.png'],
  },
  icons: {
    icon: '/laguno.png',
    shortcut: '/laguno.png',
    apple: '/laguno.png',
  },
  verification: {
    google: 'rBfbA1oSkEOg7n8ZwyK9IvOVv3tgCeYM5Bx1BKo_Z_g',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
