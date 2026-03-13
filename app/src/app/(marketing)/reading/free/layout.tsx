import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Tarot Reading — 3-Card Spread',
  description:
    'Get a free AI tarot reading now. Three-card past-present-future spread with crypto-random draws and narrative interpretation. No signup required.',
  alternates: {
    canonical: 'https://www.tarotveil.com/reading/free',
  },
};

export default function FreeReadingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
