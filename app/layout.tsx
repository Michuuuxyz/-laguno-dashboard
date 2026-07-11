import type { Metadata } from 'next';
import { Inter, Bricolage_Grotesque, Fredoka } from 'next/font/google';
import { SessionProvider } from '@/components/SessionProvider';
import { PageTransition } from '@/components/PageTransition';
import { LagoaBackground } from '@/components/LagoaBackground';
import './globals.css';

// Self-hosted via next/font — sem @import render-blocking, sem layout shift.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
// Fonte divertida e redonda — a "cara" da marca (navbar, wordmark)
const fredoka = Fredoka({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-fun', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.lagunoapp.xyz'),
  title: {
    default: 'Laguno — O bot em português com personalidade',
    template: '%s | Laguno',
  },
  description: 'O Laguno modera, dá boas-vindas, abre tickets e regista mais de 30 tipos de eventos do teu servidor. 100% em português, configurado num dashboard em dois minutos.',
  alternates: { canonical: '/' },
  keywords: ['laguno', 'laguno bot', 'laguno discord', 'discord bot', 'bot português', 'bot brasileiro', 'moderação discord', 'bot discord portugal', 'bot discord brasil'],
  authors: [{ name: 'Michuu' }],
  creator: 'Michuu',
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    url: 'https://www.lagunoapp.xyz',
    siteName: 'Laguno',
    title: 'Laguno — O bot em português com personalidade',
    description: 'O Laguno modera, dá boas-vindas, abre tickets e regista mais de 30 tipos de eventos do teu servidor. 100% em português, configurado num dashboard em dois minutos.',
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
    description: 'Moderação, logs, boas-vindas, reaction roles e tickets. 100% em português, configurado em dois minutos.',
    images: ['/laguno.png'],
  },
  // Favicon/ícones: geridos pela convenção de ficheiros do Next
  // (app/favicon.ico, app/icon.png, app/apple-icon.png) — dimensões corretas
  // para os motores de busca mostrarem o logo em vez do globo genérico.
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
      '@id': 'https://www.lagunoapp.xyz/#organization',
      name: 'Laguno',
      url: 'https://www.lagunoapp.xyz',
      logo: 'https://www.lagunoapp.xyz/laguno.png',
      description: 'Bot de Discord em português para moderação, logs, boas-vindas e tickets.',
      sameAs: [
        'https://top.gg/bot/706487689519562833',
        'https://discord.ly/laguno',
        'https://discordbotlist.com/bots/706487689519562833',
        'https://discord.gg/tVyHSRjEY9',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.lagunoapp.xyz/#website',
      name: 'Laguno',
      alternateName: 'Laguno Bot',
      url: 'https://www.lagunoapp.xyz',
      inLanguage: 'pt',
      publisher: { '@id': 'https://www.lagunoapp.xyz/#organization' },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Laguno',
      applicationCategory: 'CommunicationApplication',
      operatingSystem: 'Discord',
      url: 'https://www.lagunoapp.xyz',
      description: 'Bot de moderação de Discord 100% em português: ban, kick, warn, auto-moderação, boas-vindas, reaction roles, tickets e logs, tudo configurado num dashboard.',
      inLanguage: 'pt',
      author: { '@id': 'https://www.lagunoapp.xyz/#organization' },
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
    <html lang="pt" className={`${inter.variable} ${bricolage.variable} ${fredoka.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        {/* Moldura global — rabiscos da lagoa só nas laterais, fixos ao ecrã,
            atrás de todo o conteúdo. O centro fica sempre limpo. */}
        <LagoaBackground edges fixed />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <SessionProvider><PageTransition>{children}</PageTransition></SessionProvider>
        </div>
      </body>
    </html>
  );
}
