import { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '@/lib/seo/alternates';

const siteUrl = 'https://www.tarotveil.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('spreadThreeCard');

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    keywords: [
      'three card tarot spread',
      'three card reading',
      'past present future tarot',
      '3 card tarot spread',
      'AI tarot reading',
      'tarot spread guide',
      'three card tarot layout',
    ],
    alternates: buildAlternates('/spreads/three-card'),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      url: `${siteUrl}/spreads/three-card`,
      type: 'article',
    },
  };
}

export default async function ThreeCardSpreadPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('spreadThreeCard');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HowTo',
        name: 'How to Do a Three-Card Tarot Spread',
        description:
          'A step-by-step guide to the three-card past, present, future tarot spread with AI interpretation.',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Set your intention',
            text: 'Think about the situation or question you want the cards to address. The three-card spread works best with open-ended questions about transitions, decisions, or evolving situations.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Draw three cards',
            text: 'Draw three cards in sequence. The first represents the past, the second the present, and the third the future. On TarotVeil, cards are drawn using cryptographic randomization.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Read the narrative',
            text: 'The three cards form a story arc. The AI reads them together — not as three separate meanings, but as one evolving narrative that connects where you\'ve been to where you\'re heading.',
          },
        ],
        totalTime: 'PT5M',
        tool: [{ '@type': 'HowToTool', name: 'TarotVeil AI Tarot Platform' }],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Spreads',
            item: `${siteUrl}/spreads`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Three-Card Spread',
            item: `${siteUrl}/spreads/three-card`,
          },
        ],
      },
    ],
  };

  const positions = [
    {
      name: t('positionPast'),
      card: 'Eight of Cups',
      cardSlug: 'eight-of-cups',
      cardImage: '/cards/minor/c08.jpg',
      meaning: t('pastMeaning'),
      sample: t('pastSample'),
    },
    {
      name: t('positionPresent'),
      card: 'The Hermit',
      cardSlug: 'the-hermit',
      cardImage: '/cards/major/m09.jpg',
      meaning: t('presentMeaning'),
      sample: t('presentSample'),
    },
    {
      name: t('positionFuture'),
      card: 'Ace of Pentacles',
      cardSlug: 'ace-of-pentacles',
      cardImage: '/cards/minor/p01.jpg',
      meaning: t('futureMeaning'),
      sample: t('futureSample'),
    },
  ];

  const whenTips = [t('whenTip1'), t('whenTip2'), t('whenTip3'), t('whenTip4'), t('whenTip5')];

  const variations = [
    { title: t('varMindBodySpirit'), desc: t('varMindBodySpiritDesc') },
    { title: t('varSituationActionOutcome'), desc: t('varSituationActionOutcomeDesc') },
    { title: t('varYouThemRelationship'), desc: t('varYouThemRelationshipDesc') },
    { title: t('varOptionAOptionBAdvice'), desc: t('varOptionAOptionBAdviceDesc') },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Breadcrumbs */}
        <nav className="text-sm text-stone-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-gold-400 transition-colors">
            {t('breadcrumbHome')}
          </Link>
          <span>/</span>
          <Link href="/spreads" className="hover:text-gold-400 transition-colors">
            {t('breadcrumbSpreads')}
          </Link>
          <span>/</span>
          <span className="text-stone-300">{t('breadcrumbThreeCard')}</span>
        </nav>

        {/* Header */}
        <div className="mb-16">
          <p className="text-xs tracking-[0.2em] uppercase text-gold-400/60 mb-2">
            {t('tagline')}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
            {t('pageTitle')}
          </h1>
          <p className="font-body text-lg font-medium text-stone-300 leading-relaxed max-w-3xl">
            {t('heroDescription')}
          </p>
        </div>

        {/* Visual Layout */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-semibold text-white mb-6">
            {t('layoutTitle')}
          </h2>
          <div className="flex justify-center gap-6 md:gap-10 mb-4">
            {positions.map((pos) => (
              <div key={pos.name} className="text-center">
                <div className="relative w-[90px] h-[150px] md:w-[110px] md:h-[183px] rounded-md overflow-hidden border border-gold-400/15 mx-auto mb-3">
                  <Image
                    src={pos.cardImage}
                    alt={`${pos.card} in ${pos.name} position`}
                    fill
                    sizes="110px"
                    className="object-cover"
                  />
                </div>
                <p className="font-display text-sm font-semibold text-gold-400/70">
                  {pos.name}
                </p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-stone-600">
            {t('layoutCaption')}
          </p>
        </section>

        {/* Position Deep Dives */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-8">
            {t('positionMeaningsTitle')}
          </h2>
          <div className="space-y-10">
            {positions.map((pos, i) => (
              <div key={pos.name}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gold-400/10 text-gold-400 font-display text-sm font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <h3 className="font-display text-xl font-semibold text-white">
                    {pos.name}
                  </h3>
                </div>
                <p className="font-body text-base font-medium text-stone-300 leading-relaxed mb-2 ml-10">
                  {pos.meaning}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-6">
            {t('howAIReadsTitle')}
          </h2>
          <div className="font-body text-base font-medium text-stone-300 leading-relaxed pl-8 border-l border-gold-400/10 space-y-4">
            <p>{t('howAIP1')}</p>
            <p>{t('howAIP2')}</p>
            <p>{t('howAIP3')}</p>
          </div>
        </section>

        {/* Sample Reading */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="text-gold-400/50">✦</span> {t('sampleTitle')}
          </h2>
          <div className="p-6 rounded-sm border border-gold-400/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent space-y-6">
            {positions.map((pos) => (
              <div key={pos.name}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative w-[40px] h-[66px] rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={pos.cardImage}
                      alt={pos.card}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-gold-400/50">
                      {pos.name}
                    </p>
                    <p className="font-display text-sm font-semibold text-white">
                      <Link
                        href={`/tarot-card-meanings/${pos.cardSlug}`}
                        className="hover:text-gold-400 transition-colors"
                      >
                        {pos.card}
                      </Link>
                    </p>
                  </div>
                </div>
                <p className="font-body text-sm font-medium text-stone-300 leading-relaxed italic ml-[52px]">
                  &ldquo;{pos.sample}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* When to use */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            {t('whenToUseTitle')}
          </h2>
          <ul className="space-y-3 font-body text-sm font-medium text-stone-400 leading-relaxed">
            {whenTips.map((tip, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-gold-400/40 flex-shrink-0">&middot;</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Alternative Three-Card Layouts */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            {t('variationsTitle')}
          </h2>
          <p className="font-body text-sm font-medium text-stone-400 mb-4 leading-relaxed">
            {t('variationsIntro')}
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {variations.map((variant) => (
              <div
                key={variant.title}
                className="p-4 rounded-sm border border-gold-400/[0.06] bg-white/[0.01]"
              >
                <h3 className="font-display text-sm font-semibold text-gold-400/70 mb-1">
                  {variant.title}
                </h3>
                <p className="font-body text-sm font-medium text-stone-500 leading-relaxed">
                  {variant.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Spreads */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-semibold text-white mb-4">
            {t('relatedTitle')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/spreads/single-card"
              className="group p-5 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-base font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                {t('relatedSingleCard')}
              </h3>
              <p className="font-body text-sm font-medium text-stone-500">
                {t('relatedSingleCardDesc')}
              </p>
            </Link>
            <Link
              href="/spreads/celtic-cross"
              className="group p-5 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-base font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                {t('relatedCelticCross')}
              </h3>
              <p className="font-body text-sm font-medium text-stone-500">
                {t('relatedCelticCrossDesc')}
              </p>
            </Link>
            <Link
              href="/tarot-card-meanings"
              className="group p-5 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-base font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                {t('relatedCardMeanings')}
              </h3>
              <p className="font-body text-sm font-medium text-stone-500">
                {t('relatedCardMeaningsDesc')}
              </p>
            </Link>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center py-12 border-t border-gold-400/[0.06]">
          <h2 className="font-display text-2xl font-semibold text-white mb-3">
            {t('bottomCtaTitle')}
          </h2>
          <p className="font-body text-base font-medium text-stone-400 mb-6 max-w-md mx-auto">
            {t('bottomCtaDesc')}
          </p>
          <Link
            href="/reading/free"
            className="inline-block px-10 py-3.5 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-base tracking-wide rounded-sm hover:shadow-[0_0_30px_rgba(212,160,67,0.3)] transition-all"
          >
            {t('bottomCtaButton')}
          </Link>
        </section>
      </div>
    </>
  );
}
