import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CORTE — O Primeiro Quizbowl em Português',
  description: 'O primeiro jogo acadêmico de Quizbowl totalmente em português, com motor piramidal, história do Brasil e juiz nativo de respostas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
