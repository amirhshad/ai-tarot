import { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '@/lib/seo/alternates';

const siteUrl = 'https://www.tarotveil.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('spreadCelticCross');

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    keywords: [
      'celtic cross tarot spread',
      'celtic cross tarot',
      '10 card tarot spread',
      'celtic cross layout',
      'AI tarot reading',
      'celtic cross positions',
      'celtic cross meaning',
    ],
    alternates: buildAlternates('/spreads/celtic-cross'),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      url: `${siteUrl}/spreads/celtic-cross`,
      type: 'article',
    },
  };
}

export default async function CelticCrossSpreadPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('spreadCelticCross');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HowTo',
        name: 'How to Read a Celtic Cross Tarot Spread',
        description:
          'A comprehensive guide to the 10-card Celtic Cross tarot spread — the most detailed and popular tarot layout for in-depth readings.',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Set a clear intention',
            text: 'The Celtic Cross works best with a focused question or situation. Take time to center yourself and clearly define what you want to explore.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Draw ten cards',
            text: 'Cards are laid in the traditional Celtic Cross pattern: a central cross of 6 cards plus a vertical staff of 4 cards on the right.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Read the central cross',
            text: 'The first 6 cards (Present, Challenge, Foundation, Recent Past, Crown, Near Future) form the core of the reading and reveal the immediate dynamics.',
          },
          {
            '@type': 'HowToStep',
            position: 4,
            name: 'Read the staff',
            text: 'The final 4 cards (Self, Environment, Hopes & Fears, Outcome) provide deeper context about internal and external influences shaping the outcome.',
          },
        ],
        totalTime: 'PT10M',
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
            name: 'Celtic Cross',
            item: `${siteUrl}/spreads/celtic-cross`,
          },
        ],
      },
    ],
  };

  const positions = [
    { num: 1, name: t('pos1Name'), desc: t('pos1Desc'), card: 'The Empress', cardSlug: 'the-empress', image: '/cards/major/m03.jpg' },
    { num: 2, name: t('pos2Name'), desc: t('pos2Desc'), card: 'Five of Wands', cardSlug: 'five-of-wands', image: '/cards/minor/wands/w05.jpg' },
    { num: 3, name: t('pos3Name'), desc: t('pos3Desc'), card: 'The High Priestess', cardSlug: 'the-high-priestess', image: '/cards/major/m02.jpg' },
    { num: 4, name: t('pos4Name'), desc: t('pos4Desc'), card: 'Six of Swords', cardSlug: 'six-of-swords', image: '/cards/minor/swords/s06.jpg' },
    { num: 5, name: t('pos5Name'), desc: t('pos5Desc'), card: 'The Sun', cardSlug: 'the-sun', image: '/cards/major/m19.jpg' },
    { num: 6, name: t('pos6Name'), desc: t('pos6Desc'), card: 'Page of Pentacles', cardSlug: 'page-of-pentacles', image: '/cards/minor/pentacles/p11.jpg' },
    { num: 7, name: t('pos7Name'), desc: t('pos7Desc'), card: 'Knight of Cups', cardSlug: 'knight-of-cups', image: '/cards/minor/cups/c12.jpg' },
    { num: 8, name: t('pos8Name'), desc: t('pos8Desc'), card: 'Three of Pentacles', cardSlug: 'three-of-pentacles', image: '/cards/minor/pentacles/p03.jpg' },
    { num: 9, name: t('pos9Name'), desc: t('pos9Desc'), card: 'Nine of Cups', cardSlug: 'nine-of-cups', image: '/cards/minor/cups/c09.jpg' },
    { num: 10, name: t('pos10Name'), desc: t('pos10Desc'), card: 'The World', cardSlug: 'the-world', image: '/cards/major/m21.jpg' },
  ];

  const tips = [t('tip1'), t('tip2'), t('tip3'), t('tip4'), t('tip5'), t('tip6')];

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
          <span className="text-stone-300">{t('breadcrumbCelticCross')}</span>
        </nav>

        {/* Header */}
        <div className="mb-16">
          <p className="text-xs tracking-[0.2em] uppercase text-gold-400/60 mb-2">
            {t('tagline')}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
            {t('pageTitle')}
          </h1>
          <p className="font-body text-lg font-medium text-stone-300 leading-relaxed max-w-3xl mb-6">
            {t('heroDescription')}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/reading/free"
              className="inline-block px-8 py-3 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-sm tracking-wide rounded-sm hover:shadow-[0_0_25px_rgba(212,160,67,0.3)] transition-all"
            >
              {t('tryFreeReading')}
            </Link>
            <span className="text-xs text-stone-500">
              {t('proNote')}{' '}
              <Link href="/#pricing" className="text-gold-400/70 hover:text-gold-400 transition-colors">
                {t('proPlan')}
              </Link>
            </span>
          </div>
        </div>

        {/* Visual Layout */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-semibold text-white mb-6">
            {t('layoutTitle')}
          </h2>
          <div className="p-6 rounded-sm border border-gold-400/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent">
            {/* Simplified visual representation */}
            <div className="grid grid-cols-6 gap-1.5 sm:gap-2 max-w-lg mx-auto mb-4 px-2 sm:px-0">
              {/* Row 1: Crown */}
              <div className="col-start-2 col-span-1 text-center">
                <div className="w-10 h-14 mx-auto rounded bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-[10px] text-gold-400/70 font-display">
                  5
                </div>
                <p className="text-[9px] text-stone-600 mt-1">{t('layoutCrown')}</p>
              </div>
              {/* Row 2: Past + Center + Challenge + Future */}
              <div className="col-start-1 text-center">
                <div className="w-10 h-14 mx-auto rounded bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-[10px] text-gold-400/70 font-display">
                  4
                </div>
                <p className="text-[9px] text-stone-600 mt-1">{t('layoutPast')}</p>
              </div>
              <div className="col-start-2 text-center relative">
                <div className="w-10 h-14 mx-auto rounded bg-gold-400/15 border border-gold-400/30 flex items-center justify-center text-[10px] text-gold-400 font-display">
                  1
                </div>
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-14 h-10 rounded bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-[10px] text-gold-400/70 font-display rotate-90">
                  2
                </div>
                <p className="text-[9px] text-stone-600 mt-1">{t('layoutCenter')}</p>
              </div>
              <div className="col-start-3 text-center">
                <div className="w-10 h-14 mx-auto rounded bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-[10px] text-gold-400/70 font-display">
                  6
                </div>
                <p className="text-[9px] text-stone-600 mt-1">{t('layoutFutureLabel')}</p>
              </div>
              {/* Staff */}
              <div className="col-start-5 text-center">
                <div className="w-10 h-14 mx-auto rounded bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-[10px] text-gold-400/70 font-display">
                  10
                </div>
                <p className="text-[9px] text-stone-600 mt-1">{t('layoutOutcome')}</p>
              </div>
              {/* Row 3: Foundation */}
              <div className="col-start-2 text-center">
                <div className="w-10 h-14 mx-auto rounded bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-[10px] text-gold-400/70 font-display">
                  3
                </div>
                <p className="text-[9px] text-stone-600 mt-1">{t('layoutFoundation')}</p>
              </div>
              <div className="col-start-5 text-center">
                <div className="w-10 h-14 mx-auto rounded bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-[10px] text-gold-400/70 font-display">
                  9
                </div>
                <p className="text-[9px] text-stone-600 mt-1">{t('layoutHopes')}</p>
              </div>
              {/* Staff continued */}
              <div className="col-start-5 text-center">
                <div className="w-10 h-14 mx-auto rounded bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-[10px] text-gold-400/70 font-display">
                  8
                </div>
                <p className="text-[9px] text-stone-600 mt-1">{t('layoutEnviron')}</p>
              </div>
              <div className="col-start-5 text-center">
                <div className="w-10 h-14 mx-auto rounded bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-[10px] text-gold-400/70 font-display">
                  7
                </div>
                <p className="text-[9px] text-stone-600 mt-1">{t('layoutSelf')}</p>
              </div>
            </div>
            <p className="text-center text-xs text-stone-600">
              {t('layoutCaption')}
            </p>
          </div>
        </section>

        {/* All 10 Positions */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-8">
            {t('allPositionsTitle')}
          </h2>

          {/* Cross */}
          <div className="mb-10">
            <h3 className="font-display text-lg font-semibold text-gold-400/70 mb-6 tracking-wide">
              {t('crossSubtitle')}
            </h3>
            <div className="space-y-8">
              {positions.slice(0, 6).map((pos) => (
                <div key={pos.num} className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gold-400/10 text-gold-400 font-display text-sm font-semibold flex items-center justify-center mt-0.5">
                    {pos.num}
                  </span>
                  <div>
                    <h4 className="font-display text-base font-semibold text-white mb-1">
                      {pos.name}
                    </h4>
                    <p className="font-body text-sm font-medium text-stone-400 leading-relaxed">
                      {pos.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Staff */}
          <div>
            <h3 className="font-display text-lg font-semibold text-gold-400/70 mb-6 tracking-wide">
              {t('staffSubtitle')}
            </h3>
            <div className="space-y-8">
              {positions.slice(6).map((pos) => (
                <div key={pos.num} className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gold-400/10 text-gold-400 font-display text-sm font-semibold flex items-center justify-center mt-0.5">
                    {pos.num}
                  </span>
                  <div>
                    <h4 className="font-display text-base font-semibold text-white mb-1">
                      {pos.name}
                    </h4>
                    <p className="font-body text-sm font-medium text-stone-400 leading-relaxed">
                      {pos.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How AI reads it */}
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

        {/* Sample cards grid */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="text-gold-400/50">✦</span> {t('sampleTitle')}
          </h2>
          <p className="font-body text-sm font-medium text-stone-500 mb-6">
            {t('sampleDesc')}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {positions.map((pos) => (
              <Link
                key={pos.num}
                href={`/tarot-card-meanings/${pos.cardSlug}`}
                className="group text-center"
              >
                <div className="relative w-full aspect-[2/3] rounded overflow-hidden border border-gold-400/10 group-hover:border-gold-400/30 transition-all mb-1">
                  <Image
                    src={pos.image}
                    alt={`${pos.card} — ${pos.name} position`}
                    fill
                    sizes="(max-width: 640px) 60px, 80px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-[10px] text-stone-600">{pos.num}. {pos.name}</p>
                <p className="font-display text-[11px] text-stone-400 group-hover:text-gold-400 transition-colors leading-tight">
                  {pos.card}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            {t('tipsTitle')}
          </h2>
          <ul className="space-y-3 font-body text-sm font-medium text-stone-400 leading-relaxed">
            {tips.map((tip, i) => (
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
          </div>
        </section>

        {/* Explore cards CTA */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-semibold text-white mb-4">
            {t('learnTitle')}
          </h2>
          <p className="font-body text-sm font-medium text-stone-400 mb-4">
            {t('learnDesc')}
          </p>
          <Link
            href="/tarot-card-meanings"
            className="text-sm text-gold-400 hover:text-gold-300 transition-colors font-medium"
          >
            {t('learnLink')}
          </Link>
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
