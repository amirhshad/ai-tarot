import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free AI Tarot Reading — 3-Card Spread | TarotVeil',
  description:
    'Get a free AI-powered tarot reading. Choose from general, love, career, or yes/no spreads. Narrative interpretation that reads all cards as one story. No signup required.',
  alternates: {
    canonical: 'https://www.tarotveil.com/reading/free',
  },
  openGraph: {
    title: 'Free AI Tarot Reading | TarotVeil',
    description: 'Not generic card meanings — a narrative woven from your entire spread. Choose love, career, yes/no, or general. Crypto-random draws.',
    url: 'https://www.tarotveil.com/reading/free',
    type: 'website',
    images: [
      {
        url: '/og-reading.jpg',
        width: 1200,
        height: 630,
        alt: 'TarotVeil — Free AI Tarot Reading',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Tarot Reading | TarotVeil',
    description: 'Not generic card meanings — a narrative woven from your entire spread.',
    images: ['/og-reading.jpg'],
  },
};

export default function FreeReadingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
