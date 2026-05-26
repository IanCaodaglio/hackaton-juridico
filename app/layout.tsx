import type { Metadata } from 'next';
import { EB_Garamond, Lato } from 'next/font/google';
import './globals.css';

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ARBOR — Inteligência patrimonial para o futuro jurídico',
  description:
    'Plataforma de simulação patrimonial e sucessória para gestores de wealth management.',
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="pt-BR" className={`${ebGaramond.variable} ${lato.variable}`}>
      <body className="min-h-dvh bg-arbor-bg text-arbor-text font-sans antialiased">
        <Header />
        <div className="pt-14">{children}</div>
        <Footer />
      </body>
    </html>
  );
}

function Header(): JSX.Element {
  return (
    <header className="fixed top-0 inset-x-0 z-40 h-14 border-b border-arbor-border bg-arbor-surface/90 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        {/* Wordmark */}
        <a href="/dashboard" className="flex items-center gap-2 cursor-pointer">
          <span className="font-serif text-xl font-semibold tracking-widest text-arbor-text">
            ARBOR
          </span>
          <span className="hidden sm:block text-xs text-arbor-subtle font-sans tracking-wide">
            Wealth Planning
          </span>
        </a>

        {/* Nav */}
        <nav className="flex items-center gap-6 text-sm text-arbor-subtle">
          <a href="/dashboard" className="hover:text-arbor-text transition-colors duration-150 cursor-pointer">
            Dashboard
          </a>
          <a href="/simulacao" className="hover:text-arbor-text transition-colors duration-150 cursor-pointer">
            Nova Simulação
          </a>
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-arbor-border text-arbor-subtle text-xs">
            <span className="h-6 w-6 rounded-full bg-arbor-surface2 border border-arbor-border flex items-center justify-center text-xs font-medium text-arbor-text">
              J
            </span>
            <span>João Silva · BTG Wealth</span>
          </div>
        </nav>
      </div>
    </header>
  );
}

function Footer(): JSX.Element {
  return (
    <footer className="border-t border-arbor-border bg-arbor-surface mt-16 py-4 px-6 text-center text-xs text-arbor-subtle no-print">
      ARBOR é ferramenta de apoio exclusiva para profissionais habilitados. Não constitui consultoria jurídica, fiscal ou financeira. © {new Date().getFullYear()} ARBOR Wealth Planning.
    </footer>
  );
}
