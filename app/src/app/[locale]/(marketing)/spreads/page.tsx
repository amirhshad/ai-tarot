import { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '@/lib/seo/alternates';

const siteUrl = 'https://www.tarotveil.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('spreadsHub');

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    keywords: [
      'tarot spreads',
      'tarot spread guide',
      'AI tarot spread',
      'tarot layouts',
      'three card spread',
      'celtic cross spread',
      'single card tarot',
      'horseshoe tarot spread',
      'seven card spread',
      'decision making tarot',
    ],
    alternates: buildAlternates('/spreads'),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      url: `${siteUrl}/spreads`,
    },
  };
}

export default async function SpreadsIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('spreadsHub');

  const spreads = [
    {
      slug: 'single-card',
      name: t('spreadSingleCard'),
      cardCount: 1,
      difficulty: t('difficultyBeginner'),
      timeEstimate: '2 minutes',
      description: t('spreadSingleCardDesc'),
      image: '/cards/major/m17.jpg',
      tier: 'Free',
    },
    {
      slug: 'three-card',
      name: t('spreadThreeCard'),
      cardCount: 3,
      difficulty: t('difficultyBeginner'),
      timeEstimate: '5 minutes',
      description: t('spreadThreeCardDesc'),
      image: '/cards/major/m01.jpg',
      tier: 'Free',
    },
    {
      slug: 'celtic-cross',
      name: t('spreadCelticCross'),
      cardCount: 10,
      difficulty: t('difficultyIntermediate'),
      timeEstimate: '10 minutes',
      description: t('spreadCelticCrossDesc'),
      image: '/cards/major/m10.jpg',
      tier: 'Pro',
    },
    {
      slug: 'horseshoe',
      name: t('spreadHorseshoe'),
      cardCount: 7,
      difficulty: t('difficultyIntermediate'),
      timeEstimate: '8 minutes',
      description: t('spreadHorseshoeDesc'),
      image: '/cards/major/m07.jpg',
      tier: 'Pro',
    },
  ];

  const faqs = [
    { q: t('faqQ1'), a: t('faqA1') },
    { q: t('faqQ2'), a: t('faqA2') },
    { q: t('faqQ3'), a: t('faqA3') },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Tarot Spreads Guide',
    description:
      'Complete guide to popular tarot spreads with AI-powered interpretations.',
    url: `${siteUrl}/spreads`,
    publisher: { '@type': 'Organization', name: 'TarotVeil' },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Spreads',
          item: `${siteUrl}/spreads`,
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Breadcrumbs */}
        <nav className="text-sm text-stone-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-gold-400 transition-colors">
            {t('breadcrumbHome')}
          </Link>
          <span>/</span>
          <span className="text-stone-300">{t('breadcrumbSpreads')}</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-display text-3xl md:text-5xl font-semibold text-white mb-4">
            {t('pageTitle')}
          </h1>
          <p className="font-body text-lg font-medium text-stone-400 max-w-2xl mx-auto">
            {t('pageSubtitle')}
          </p>
        </div>

        {/* Spread Cards */}
        <div className="grid gap-8">
          {spreads.map((spread) => (
            <Link
              key={spread.slug}
              href={`/spreads/${spread.slug}`}
              className="group flex flex-col sm:flex-row gap-6 p-6 rounded-sm border border-gold-400/[0.08] hover:border-gold-400/20 bg-gradient-to-b from-white/[0.02] to-transparent transition-all duration-300"
            >
              {/* Preview Image */}
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <div className="relative w-[100px] h-[160px] rounded overflow-hidden">
                  <Image
                    src={spread.image}
                    alt={`${spread.name} preview`}
                    fill
                    sizes="100px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="font-display text-xl font-semibold text-white group-hover:text-gold-400 transition-colors">
                    {spread.name}
                  </h2>
                  {spread.tier === 'Pro' && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-gold-400 border border-gold-400/30 rounded-full">
                      Pro
                    </span>
                  )}
                </div>
                <p className="font-body text-base font-medium text-stone-400 mb-4 leading-relaxed">
                  {spread.description}
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-stone-500">
                  <span>
                    <span className="text-stone-400">{spread.cardCount}</span>{' '}
                    {spread.cardCount === 1 ? t('card') : t('cards')}
                  </span>
                  <span>
                    <span className="text-stone-400">{spread.difficulty}</span>{' '}
                    {t('level')}
                  </span>
                  <span>
                    ~<span className="text-stone-400">{spread.timeEstimate}</span>
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden sm:flex items-center text-stone-600 group-hover:text-gold-400 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* FAQ Section */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-semibold text-white mb-8 text-center">
            {t('faqTitle')}
          </h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="p-5 rounded-sm border border-gold-400/[0.06] bg-white/[0.01]"
              >
                <h3 className="font-display text-base font-semibold text-white mb-2">
                  {faq.q}
                </h3>
                <p className="font-body text-sm font-medium text-stone-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center py-12 mt-12 border-t border-gold-400/[0.06]">
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
