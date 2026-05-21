import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'L\'Artisan - Premium Artisanal Bakery & Patisserie',
  description: 'Experience the art of authentic, slow-fermented sourdough, specialty rustic breads, and premium patisserie. Baked daily with heirloom grains.',
  keywords: ['bakery', 'sourdough', 'artisanal', 'specialty bread', 'focaccia', 'pastry', 'organic bread'],
  openGraph: {
    title: 'L\'Artisan - Premium Artisanal Bakery',
    description: 'Baked daily with heirloom grains. Experience genuine slow-fermented bread.',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased bg-bakery-cream text-bakery-charcoal">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
