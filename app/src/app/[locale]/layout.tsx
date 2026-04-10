import type { Metadata } from 'next';
import { Inter, Cinzel, Vazirmatn } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cinzel',
});

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  variable: '--font-vazirmatn',
  display: 'swap',
});

const siteUrl = 'https://www.tarotveil.com';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = locale === 'fa' ? 'rtl' : 'ltr';
  const fontClasses = `${inter.variable} ${cinzel.variable} ${locale === 'fa' ? vazirmatn.variable : ''}`;

  return (
    <html lang={locale} dir={dir} className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${fontClasses} antialiased min-h-screen flex flex-col`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
