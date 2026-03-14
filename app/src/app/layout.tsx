import type { Metadata } from 'next';
import { Inter, Cinzel } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cinzel',
});

const siteUrl = 'https://www.tarotveil.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'TarotVeil — AI-Powered Tarot Readings That Tell Your Story',
    template: '%s | TarotVeil',
  },
  description:
    'AI-powered tarot readings that weave your cards into one narrative story. Crypto-random draws, follow-up conversations, and multi-language support.',
  keywords: [
    'tarot reading',
    'AI tarot',
    'online tarot',
    'tarot card reading',
    'free tarot reading',
    'narrative tarot',
    'tarot spread',
    'three card tarot',
    'celtic cross tarot',
    'tarot interpretation',
    'psychic reading',
    'fortune telling',
    'divination',
    'tarot cards online',
  ],
  authors: [{ name: 'TarotVeil' }],
  creator: 'TarotVeil',
  publisher: 'TarotVeil',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'en': siteUrl,
      'fa': siteUrl,
      'x-default': siteUrl,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'TarotVeil',
    title: 'TarotVeil — AI-Powered Tarot Readings That Tell Your Story',
    description:
      'AI-powered narrative tarot readings with conversational depth. Crypto-random cards, multi-language support. Start your free reading today.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TarotVeil — AI-Powered Tarot Readings',
    description:
      'Narrative tarot readings powered by AI. Not generic card meanings — a story woven from your entire spread.',
  },
  category: 'entertainment',
};

// JSON-LD structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'TarotVeil',
      description: 'AI-powered narrative tarot readings with conversational depth.',
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: ['en', 'fa'],
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'TarotVeil',
      url: siteUrl,
      description:
        'TarotVeil offers AI-powered tarot readings that weave all your cards into one cohesive narrative story.',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'TarotVeil',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web',
      url: siteUrl,
      description:
        'AI-powered tarot reading platform with narrative interpretations, crypto-random card draws, and conversational follow-ups.',
      offers: [
        {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          name: 'Free',
          description: 'Single and three-card readings with AI interpretation',
        },
        {
          '@type': 'Offer',
          price: '7.99',
          priceCurrency: 'USD',
          name: 'Pro',
          description: 'Unlimited readings, deep narrative interpretation, 5 follow-up questions',
        },
        {
          '@type': 'Offer',
          price: '14.99',
          priceCurrency: 'USD',
          name: 'Premium',
          description: 'Everything in Pro plus custom spreads, 10 follow-ups, and trend analysis',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How does AI tarot reading work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'TarotVeil uses cryptographically random card draws (Fisher-Yates shuffle with crypto.getRandomValues) combined with advanced AI to read all your cards together as one cohesive narrative — not isolated per-card templates.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are the tarot cards truly random?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. We use the Web Crypto API with a Fisher-Yates shuffle algorithm, providing cryptographic-grade randomness that is verifiable, fair, and truly random.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I ask follow-up questions about my reading?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Pro users get 5 follow-up questions per reading, and Premium users get 10. The AI maintains full context of your reading for deeper exploration.',
          },
        },
        {
          '@type': 'Question',
          name: 'What languages does TarotVeil support?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'TarotVeil currently supports English and Farsi, with Arabic coming soon. Readings are culturally native, not just translated.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is there a free plan?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The free plan includes 1 single-card reading per day and 1 three-card reading per week with a short AI interpretation.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${cinzel.variable} antialiased min-h-screen flex flex-col`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
