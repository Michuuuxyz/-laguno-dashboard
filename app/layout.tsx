import type { Metadata } from 'next';
import { SessionProvider } from '@/components/SessionProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Laguno — Dashboard',
  description: 'Painel de controlo do Laguno Bot',
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
