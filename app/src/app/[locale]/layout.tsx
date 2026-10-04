import type { Metadata } from 'next';
import { Inter, Cinzel, Vazirmatn, Amiri, Noto_Naskh_Arabic } from 'next/font/google';
import { hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import PostHogProvider from '@/components/analytics/PostHogProvider';
import IntlProvider from '@/components/i18n/IntlProvider';
import { toLocale, isRtl, brandForTitle, type Locale } from '@/i18n/locales';

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

/** Display face for Arabic — Cinzel has no Arabic glyphs. */
const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-amiri',
  display: 'swap',
});

/** Body face for Arabic. Vazirmatn is Persian-optimised and stays on /fa. */
const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-naskh',
  display: 'swap',
});

const siteUrl = 'https://www.tarotveil.com';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const current = toLocale(locale);

  const titles: Record<Locale, string> = {
    en: 'TarotVeil — AI-Powered Tarot Readings That Tell Your Story',
    fa: 'تاروت‌ویل — فال تاروت آنلاین با تفسیر روایی هوش مصنوعی',
    ar: 'TarotVeil — قراءة التاروت بالذكاء الاصطناعي تحكي حكايتك',
  };

  const shortTitles: Record<Locale, string> = {
    en: 'TarotVeil — AI-Powered Tarot Readings',
    fa: 'تاروت‌ویل — فال تاروت با هوش مصنوعی',
    ar: 'TarotVeil — تاروت بالذكاء الاصطناعي',
  };

  const descriptions: Record<Locale, string> = {
    en: 'AI-powered tarot readings that weave your cards into one narrative story. Crypto-random draws, follow-up conversations, and multi-language support.',
    fa: 'فال تاروت آنلاین رایگان با تفسیر روایی هوش مصنوعی. کشیدن کارت تصادفی رمزنگاری شده، سؤالات بعدی و پشتیبانی چند زبانه.',
    ar: 'قراءة تاروت بالذكاء الاصطناعي تنسج بطاقاتك في حكاية واحدة. سحبٌ عشوائي مُعمّى، وأسئلة متابعة، ودعم لعدة لغات.',
  };

  const ogDescriptions: Record<Locale, string> = {
    en: 'AI-powered narrative tarot readings with conversational depth. Crypto-random cards, multi-language support. Start your free reading today.',
    fa: 'فال تاروت آنلاین رایگان با تفسیر روایی هوش مصنوعی. کارت‌ها را بکشید و داستان خود را کشف کنید.',
    ar: 'قراءة تاروت روائية بالذكاء الاصطناعي. سحبٌ عشوائي مُعمّى ودعم لعدة لغات. ابدأ قراءتك المجانية الآن.',
  };

  const twitterDescriptions: Record<Locale, string> = {
    en: 'Narrative tarot readings powered by AI. Not generic card meanings — a story woven from your entire spread.',
    fa: 'فال تاروت روایی با هوش مصنوعی. نه معانی جداگانه — داستانی از کل کارت‌های شما.',
    ar: 'قراءة تاروت روائية بالذكاء الاصطناعي. ليست معاني منفصلة بل حكاية واحدة تنسجها كل بطاقاتك.',
  };

  const keywords: Record<Locale, string[]> = {
    en: ['tarot reading', 'AI tarot', 'online tarot', 'tarot card reading', 'free tarot reading', 'narrative tarot', 'tarot spread', 'three card tarot', 'celtic cross tarot', 'tarot interpretation'],
    fa: ['فال تاروت', 'فال تاروت آنلاین', 'فال تاروت رایگان', 'معنی کارت تاروت', 'تاروت با هوش مصنوعی', 'فال تاروت عشق', 'فال تاروت بله یا خیر', 'تاروت روزانه', 'fal tarot', 'tarot farsi'],
    ar: ['قراءة التاروت', 'تاروت مجاني', 'قراءة التاروت أونلاين', 'معاني بطاقات التاروت', 'تاروت بالذكاء الاصطناعي', 'تاروت الحب', 'تاروت نعم أو لا', 'تاروت يومي', 'انتشار التاروت', 'تفسير التاروت'],
  };

  const openGraphLocales: Record<Locale, string> = {
    en: 'en_US',
    fa: 'fa_IR',
    ar: 'ar_AR',
  };

  const pageUrl = current === 'en' ? siteUrl : `${siteUrl}/${current}`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: titles[current],
      // The Latin wordmark is bidi-isolated so the separator does not jump in
      // RTL rendering; Farsi's brand is already RTL script and is left
      // byte-identical (see brandForTitle).
      template: `%s | ${brandForTitle(current)}`,
    },
    description: descriptions[current],
    keywords: keywords[current],
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
      locale: openGraphLocales[current],
      url: pageUrl,
      siteName: 'TarotVeil',
      title: titles[current],
      description: ogDescriptions[current],
    },
    twitter: {
      card: 'summary_large_image',
      title: shortTitles[current],
      description: twitterDescriptions[current],
    },
    category: 'entertainment',
  };
}

/** JSON-LD structured data — locale-aware */
function buildJsonLd(locale: string) {
  const current = toLocale(locale);
  const pageUrl = current === 'en' ? siteUrl : `${siteUrl}/${current}`;

  const siteDescriptions: Record<Locale, string> = {
    en: 'AI-powered narrative tarot readings with conversational depth.',
    fa: 'فال تاروت آنلاین با تفسیر روایی هوش مصنوعی — داستانی از کل کارت‌های شما.',
    ar: 'قراءة تاروت روائية بالذكاء الاصطناعي — حكاية تنسجها بطاقاتك كلّها.',
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: pageUrl,
        name: 'TarotVeil',
        description: siteDescriptions[current],
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: current,
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
            description: '3 credits per day for single, three-card and horseshoe readings with AI interpretation',
          },
          {
            '@type': 'Offer',
            price: '8.99',
            priceCurrency: 'USD',
            name: 'Pro',
            description: '120 credits per month, all spreads, deep narrative interpretation, 2 free follow-ups per reading',
          },
          {
            '@type': 'Offer',
            price: '19.99',
            priceCurrency: 'USD',
            name: 'Premium',
            description: '350 credits per month, everything in Pro plus custom spreads and trend analysis',
          },
        ],
      },
    ],
  };
}

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
  const current = toLocale(locale);
  const dir = isRtl(current) ? 'rtl' : 'ltr';

  // Per-locale font loading: /ar must not ship Vazirmatn and /fa must not ship
  // Amiri or Noto Naskh.
  const localeFonts: Record<Locale, string> = {
    en: '',
    fa: vazirmatn.variable,
    ar: `${amiri.variable} ${notoNaskhArabic.variable}`,
  };
  const fontClasses = `${inter.variable} ${cinzel.variable} ${localeFonts[current]}`;

  return (
    <html lang={current} dir={dir} className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(locale)) }}
        />
      </head>
      <body className={`${fontClasses} antialiased min-h-screen flex flex-col`}>
        <IntlProvider locale={locale} messages={messages}>
          <PostHogProvider>
            {children}
          </PostHogProvider>
        </IntlProvider>
      </body>
    </html>
  );
}
