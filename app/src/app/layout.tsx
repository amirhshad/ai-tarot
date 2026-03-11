import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'AI Tarot — Narrative Tarot Readings Powered by AI',
  description:
    'Experience tarot like never before. AI-powered narrative readings that weave all your cards into one cohesive story with conversational follow-ups.',
  openGraph: {
    title: 'AI Tarot — Narrative Tarot Readings Powered by AI',
    description:
      'AI-powered narrative tarot readings with conversational depth. Crypto-random cards, multi-language support.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
