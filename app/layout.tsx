import type { Metadata } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const serif = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Sucessio — Planejamento Patrimonial e Sucessório',
  description:
    'Ferramenta de apoio a profissionais de wealth management em reuniões ' +
    'de planejamento sucessório com clientes de alto patrimônio.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${serif.variable}`}>
      <body className="min-h-screen bg-canvas text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
