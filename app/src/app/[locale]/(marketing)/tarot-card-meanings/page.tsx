import { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { DECK } from '@/lib/tarot/deck';
import { cardToSlug } from '@/lib/tarot/slugs';
import { buildHubJsonLd } from '@/lib/seo/json-ld';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '@/lib/seo/alternates';

const siteUrl = 'https://www.tarotveil.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('cardHub');

  const title = `${t('pageTitle')} — Complete Guide to All 78 Cards | TarotVeil`;
  const description = t('pageDescription');

  return {
    title,
    description,
    alternates: buildAlternates('/tarot-card-meanings'),
    openGraph: {
      title,
      description,
      url: `${siteUrl}/tarot-card-meanings`,
    },
  };
}

const SECTION_KEYS = [
  {
    key: 'major',
    titleKey: 'majorArcanaTitle' as const,
    descKey: 'majorArcanaDesc' as const,
    slug: 'major-arcana',
    filter: (c: (typeof DECK)[0]) => c.arcana === 'major',
  },
  {
    key: 'wands',
    titleKey: 'suitOfWandsTitle' as const,
    descKey: 'suitOfWandsDesc' as const,
    slug: 'suit-of-wands',
    filter: (c: (typeof DECK)[0]) => c.suit === 'wands',
  },
  {
    key: 'cups',
    titleKey: 'suitOfCupsTitle' as const,
    descKey: 'suitOfCupsDesc' as const,
    slug: 'suit-of-cups',
    filter: (c: (typeof DECK)[0]) => c.suit === 'cups',
  },
  {
    key: 'swords',
    titleKey: 'suitOfSwordsTitle' as const,
    descKey: 'suitOfSwordsDesc' as const,
    slug: 'suit-of-swords',
    filter: (c: (typeof DECK)[0]) => c.suit === 'swords',
  },
  {
    key: 'pentacles',
    titleKey: 'suitOfPentaclesTitle' as const,
    descKey: 'suitOfPentaclesDesc' as const,
    slug: 'suit-of-pentacles',
    filter: (c: (typeof DECK)[0]) => c.suit === 'pentacles',
  },
];

function CardGrid({ cards }: { cards: { name: string; slug: string; image: string }[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {cards.map(card => (
        <Link
          key={card.slug}
          href={`/tarot-card-meanings/${card.slug}`}
          className="group p-3 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 bg-gradient-to-b from-white/[0.01] to-transparent transition-all duration-300 text-center"
        >
          <div className="relative w-[90px] h-[150px] mx-auto mb-3 rounded overflow-hidden">
            <Image
              src={card.image}
              alt={`${card.name} tarot card`}
              fill
              sizes="90px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <p className="font-display text-sm font-medium text-stone-300 group-hover:text-gold-400 transition-colors leading-tight">
            {card.name}
          </p>
        </Link>
      ))}
    </div>
  );
}

export default async function TarotCardMeaningsHub({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('cardHub');
  const tCommon = await getTranslations('common');

  const jsonLd = buildHubJsonLd(
    `${t('pageTitle')} — Complete Guide to All 78 Cards`,
    `${siteUrl}/tarot-card-meanings`,
    [
      { name: tCommon('home'), url: siteUrl },
      { name: t('pageTitle'), url: `${siteUrl}/tarot-card-meanings` },
    ],
    locale,
  );

  const faqItems = [
    { q: t('faqQ1'), a: t('faqA1') },
    { q: t('faqQ2'), a: t('faqA2') },
    { q: t('faqQ3'), a: t('faqA3') },
    { q: t('faqQ4'), a: t('faqA4') },
    { q: t('faqQ5'), a: t('faqA5') },
    { q: t('faqQ6'), a: t('faqA6') },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Breadcrumbs */}
        <nav className="text-sm text-stone-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-gold-400 transition-colors">{tCommon('home')}</Link>
          <span>/</span>
          <span className="text-stone-300">{t('pageTitle')}</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-display text-3xl md:text-5xl font-semibold text-white mb-4">
            {t('pageTitle')}
          </h1>
          <p className="font-body text-lg font-medium text-stone-400 max-w-2xl mx-auto">
            {t('pageDescription')}
          </p>
        </div>

        {/* Sections */}
        {SECTION_KEYS.map(section => {
          const cards = DECK.filter(section.filter)
            .sort((a, b) => a.number - b.number)
            .map(c => ({ name: c.name, slug: cardToSlug(c), image: c.image }));

          return (
            <section key={section.key} className="mb-16" id={section.slug}>
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-white mb-1">{t(section.titleKey)}</h2>
                  <p className="font-body text-sm font-medium text-stone-500">{t(section.descKey)}</p>
                </div>
                <Link
                  href={`/tarot-card-meanings/${section.slug}`}
                  className="text-sm text-gold-400/70 hover:text-gold-400 transition-colors whitespace-nowrap"
                >
                  {tCommon('viewAll')}
                </Link>
              </div>
              <CardGrid cards={cards} />
            </section>
          );
        })}

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-semibold text-white mb-6">
            {t('faqTitle')}
          </h2>
          <div className="space-y-3">
            {faqItems.map(faq => (
              <details key={faq.q} className="group border border-gold-400/[0.06] rounded-sm">
                <summary className="px-5 py-4 cursor-pointer font-display text-sm font-medium text-stone-300 group-open:text-gold-400 transition-colors">
                  {faq.q}
                </summary>
                <div className="px-5 pb-4 font-body text-sm font-medium text-stone-400 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12 border-t border-gold-400/[0.06]">
          <h2 className="font-display text-2xl font-semibold text-white mb-3">
            {t('ctaTitle')}
          </h2>
          <p className="font-body text-base font-medium text-stone-400 mb-6 max-w-md mx-auto">
            {t('ctaDescription')}
          </p>
          <Link
            href="/reading/free"
            className="inline-block px-10 py-3.5 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-base tracking-wide rounded-sm hover:shadow-[0_0_30px_rgba(212,160,67,0.3)] transition-all"
          >
            {t('ctaButton')}
          </Link>
        </section>
      </div>
    </>
  );
}
