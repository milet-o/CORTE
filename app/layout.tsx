import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'corte. — O Primeiro Quizbowl em Português',
  description: 'O jogo de cortar o narrador no momento certo. Pergunta diária e modo ilimitado com acervo do Brasil e do mundo.',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased selection:bg-[#f2b84b] selection:text-[#1d1714]">
        {children}
      </body>
    </html>
  );
}
