import type { Metadata } from 'next';
import { SessionProvider } from '@/components/SessionProvider';
import { PageTransition } from '@/components/PageTransition';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://lagunoapp.xyz'),
  title: {
    default: 'Laguno — O bot em português com personalidade',
    template: '%s | Laguno',
  },
  description: 'Moderação com personalidade, logs automáticos, boas-vindas, self-roles e sorteios. Configurado em dois minutos, a correr sem ti.',
  alternates: { canonical: '/' },
  keywords: ['laguno', 'laguno bot', 'laguno discord', 'discord bot', 'bot português', 'bot brasileiro', 'moderação discord', 'bot discord portugal', 'bot discord brasil'],
  authors: [{ name: 'Michuu' }],
  creator: 'Michuu',
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    url: 'https://lagunoapp.xyz',
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

// Dados estruturados — diz aos motores de busca que a marca é "Laguno" (não "laguna"),
// que é o site oficial e liga às listagens de autoridade (top.gg, discordbotlist).
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://lagunoapp.xyz/#organization',
      name: 'Laguno',
      url: 'https://lagunoapp.xyz',
      logo: 'https://lagunoapp.xyz/laguno.png',
      description: 'Bot de moderação de Discord em português, com personalidade.',
      sameAs: [
        'https://top.gg/bot/706487689519562833',
        'https://discord.ly/laguno',
        'https://discordbotlist.com/bots/706487689519562833',
        'https://discord.gg/tVyHSRjEY9',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://lagunoapp.xyz/#website',
      name: 'Laguno',
      alternateName: 'Laguno Bot',
      url: 'https://lagunoapp.xyz',
      inLanguage: 'pt',
      publisher: { '@id': 'https://lagunoapp.xyz/#organization' },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Laguno',
      applicationCategory: 'CommunicationApplication',
      operatingSystem: 'Discord',
      url: 'https://lagunoapp.xyz',
      description: 'Bot de moderação de Discord 100% em português: ban, kick, warn, auto-moderação, boas-vindas, self-roles, sorteios e logs. Configurado num dashboard, com personalidade.',
      inLanguage: 'pt',
      author: { '@id': 'https://lagunoapp.xyz/#organization' },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      sameAs: [
        'https://top.gg/bot/706487689519562833',
        'https://discord.ly/laguno',
        'https://discordbotlist.com/bots/706487689519562833',
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <SessionProvider><PageTransition>{children}</PageTransition></SessionProvider>
      </body>
    </html>
  );
}
