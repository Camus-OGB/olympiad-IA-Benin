import './globals.css';
import '../styles/editor.css';
import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';

// Configuration des polices avec Next/Font
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });

export const metadata: Metadata = {
  title: 'Olympiades IA Bénin - AOAI 2026',
  description: 'Plateforme officielle des Olympiades d\'Intelligence Artificielle du Bénin. Sélection nationale pour l\'African Olympiad in AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${montserrat.variable} scroll-smooth`}>
      <body className="antialiased font-sans text-gray-900 bg-off-white noise-texture">
        {children}
      </body>
    </html>
  );
}