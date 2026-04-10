import { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '@/lib/seo/alternates';

const siteUrl = 'https://www.tarotveil.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('spreadHorseshoe');

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    keywords: [
      'horseshoe tarot spread',
      'seven card tarot spread',
      '7 card spread',
      'decision making tarot',
      'horseshoe spread meaning',
      'AI tarot reading',
      'tarot spread guide',
      'what should I do tarot',
    ],
    alternates: buildAlternates('/spreads/horseshoe'),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      url: `${siteUrl}/spreads/horseshoe`,
      type: 'article',
    },
  };
}

export default async function HorseshoeSpreadPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('spreadHorseshoe');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HowTo',
        name: 'How to Do a Horseshoe Tarot Spread',
        description:
          'A step-by-step guide to the 7-card horseshoe tarot spread for decision-making and path-forward questions.',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Focus on your decision',
            text: 'Think about the choice or situation you need guidance on. The horseshoe spread works best with "What should I do?" and path-forward questions.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Draw seven cards',
            text: 'Draw seven cards in sequence. They form a horseshoe arc: past influences, present situation, hidden factors, your approach, obstacles, external influences, and likely outcome.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Read the narrative arc',
            text: 'The seven cards tell a progression story — from what shaped this moment to where your path leads. The AI weaves all seven positions into one cohesive narrative.',
          },
        ],
        totalTime: 'PT8M',
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
            name: 'Horseshoe Spread',
            item: `${siteUrl}/spreads/horseshoe`,
          },
        ],
      },
    ],
  };

  const positions = [
    { name: t('pos1Name'), card: 'Six of Swords', cardSlug: 'six-of-swords', cardImage: '/cards/minor/swords/s06.jpg', meaning: t('pos1Meaning'), sample: t('pos1Sample') },
    { name: t('pos2Name'), card: 'Two of Wands', cardSlug: 'two-of-wands', cardImage: '/cards/minor/wands/w02.jpg', meaning: t('pos2Meaning'), sample: t('pos2Sample') },
    { name: t('pos3Name'), card: 'The Moon', cardSlug: 'the-moon', cardImage: '/cards/major/m18.jpg', meaning: t('pos3Meaning'), sample: t('pos3Sample') },
    { name: t('pos4Name'), card: 'Knight of Pentacles', cardSlug: 'knight-of-pentacles', cardImage: '/cards/minor/pentacles/p12.jpg', meaning: t('pos4Meaning'), sample: t('pos4Sample') },
    { name: t('pos5Name'), card: 'Five of Cups', cardSlug: 'five-of-cups', cardImage: '/cards/minor/cups/c05.jpg', meaning: t('pos5Meaning'), sample: t('pos5Sample') },
    { name: t('pos6Name'), card: 'The Emperor', cardSlug: 'the-emperor', cardImage: '/cards/major/m04.jpg', meaning: t('pos6Meaning'), sample: t('pos6Sample') },
    { name: t('pos7Name'), card: 'The Chariot', cardSlug: 'the-chariot', cardImage: '/cards/major/m07.jpg', meaning: t('pos7Meaning'), sample: t('pos7Sample') },
  ];

  const whenTips = [t('whenTip1'), t('whenTip2'), t('whenTip3'), t('whenTip4'), t('whenTip5'), t('whenTip6')];

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
          <span className="text-stone-300">{t('breadcrumbHorseshoe')}</span>
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
          <div className="relative mx-auto mb-4" style={{ maxWidth: 600 }}>
            {/* Horseshoe arc */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {/* Top row: positions 0 and 6 (wide apart) */}
              <div className="w-full flex justify-between px-4 md:px-12 mb-2">
                {[positions[0], positions[6]].map((pos) => (
                  <div key={pos.name} className="text-center">
                    <div className="relative w-[70px] h-[116px] md:w-[90px] md:h-[150px] rounded-md overflow-hidden border border-gold-400/15 mx-auto mb-2">
                      <Image
                        src={pos.cardImage}
                        alt={`${pos.card} in ${pos.name} position`}
                        fill
                        sizes="90px"
                        className="object-cover"
                      />
                    </div>
                    <p className="font-display text-[10px] md:text-xs font-semibold text-gold-400/70">
                      {pos.name}
                    </p>
                  </div>
                ))}
              </div>
              {/* Middle row: positions 1 and 5 */}
              <div className="w-full flex justify-between px-10 md:px-20 mb-2">
                {[positions[1], positions[5]].map((pos) => (
                  <div key={pos.name} className="text-center">
                    <div className="relative w-[70px] h-[116px] md:w-[90px] md:h-[150px] rounded-md overflow-hidden border border-gold-400/15 mx-auto mb-2">
                      <Image
                        src={pos.cardImage}
                        alt={`${pos.card} in ${pos.name} position`}
                        fill
                        sizes="90px"
                        className="object-cover"
                      />
                    </div>
                    <p className="font-display text-[10px] md:text-xs font-semibold text-gold-400/70">
                      {pos.name}
                    </p>
                  </div>
                ))}
              </div>
              {/* Bottom row: positions 2, 3, 4 */}
              <div className="w-full flex justify-center gap-3 md:gap-6">
                {[positions[2], positions[3], positions[4]].map((pos) => (
                  <div key={pos.name} className="text-center">
                    <div className="relative w-[70px] h-[116px] md:w-[90px] md:h-[150px] rounded-md overflow-hidden border border-gold-400/15 mx-auto mb-2">
                      <Image
                        src={pos.cardImage}
                        alt={`${pos.card} in ${pos.name} position`}
                        fill
                        sizes="90px"
                        className="object-cover"
                      />
                    </div>
                    <p className="font-display text-[10px] md:text-xs font-semibold text-gold-400/70">
                      {pos.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
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
            {t('howAITitle')}
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

        {/* Related Spreads */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-semibold text-white mb-4">
            {t('relatedTitle')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/spreads/three-card"
              className="group p-5 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-base font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                {t('relatedThreeCard')}
              </h3>
              <p className="font-body text-sm font-medium text-stone-500">
                {t('relatedThreeCardDesc')}
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
            href="/reading/new"
            className="inline-block px-10 py-3.5 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-base tracking-wide rounded-sm hover:shadow-[0_0_30px_rgba(212,160,67,0.3)] transition-all"
          >
            {t('bottomCtaButton')}
          </Link>
        </section>
      </div>
    </>
  );
}
