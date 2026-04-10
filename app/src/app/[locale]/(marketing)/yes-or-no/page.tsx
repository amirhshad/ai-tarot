import { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '@/lib/seo/alternates';

const siteUrl = 'https://www.tarotveil.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('yesOrNo');

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    keywords: [
      'yes or no tarot',
      'yes no tarot reading',
      'tarot yes or no',
      'free yes no tarot',
      'AI tarot yes or no',
      'one card yes no',
      'tarot answer',
    ],
    alternates: buildAlternates('/yes-or-no'),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      url: `${siteUrl}/yes-or-no`,
      type: 'article',
    },
  };
}

const yesCards = [
  { name: 'The Sun', slug: 'the-sun', image: '/cards/major/m19.jpg' },
  { name: 'The World', slug: 'the-world', image: '/cards/major/m21.jpg' },
  { name: 'Ace of Cups', slug: 'ace-of-cups', image: '/cards/minor/c01.jpg' },
  { name: 'The Star', slug: 'the-star', image: '/cards/major/m17.jpg' },
];

const noCards = [
  { name: 'The Tower', slug: 'the-tower', image: '/cards/major/m16.jpg' },
  { name: 'Five of Cups', slug: 'five-of-cups', image: '/cards/minor/c05.jpg' },
  { name: 'Ten of Swords', slug: 'ten-of-swords', image: '/cards/minor/s10.jpg' },
  { name: 'The Devil', slug: 'the-devil', image: '/cards/major/m15.jpg' },
];

export default async function YesOrNoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('yesOrNo');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HowTo',
        name: 'How to Do a Yes or No Tarot Reading',
        description:
          'A simple guide to using tarot cards for yes or no answers with AI-powered interpretation.',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Frame a clear yes/no question',
            text: 'Think of a specific question that can be answered with yes or no. The clearer the question, the clearer the answer. Avoid compound questions.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Draw one card',
            text: 'Pull a single tarot card. On TarotVeil, your card is drawn using cryptographic randomization for a truly unbiased result.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Read the answer',
            text: 'Upright cards generally lean toward yes, reversed cards toward no. But the AI interpretation adds nuance, explaining conditions, timing, and what the card is really telling you.',
          },
        ],
        totalTime: 'PT2M',
        tool: [{ '@type': 'HowToTool', name: 'TarotVeil AI Tarot Platform' }],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Yes or No Tarot',
            item: `${siteUrl}/yes-or-no`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How accurate is yes or no tarot?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes or no tarot is best understood as a decision-making tool rather than a prediction method. It surfaces your subconscious leanings and highlights factors you may not have considered. The accuracy depends on the clarity of your question.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I ask the same yes or no question twice?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Most tarot practitioners advise against re-drawing. The first card is the message. If you feel uncertain, use a follow-up question to explore the nuance rather than re-asking the same question.',
            },
          },
          {
            '@type': 'Question',
            name: 'What does a reversed card mean in yes/no tarot?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Reversed cards generally lean toward no, but with important nuance. A reversed card often means not yet, not in this way, or there is something to address first. Our AI interpretation explains the specific context.',
            },
          },
        ],
      },
    ],
  };

  const steps = [
    { step: '1', title: t('step1Title'), desc: t('step1Desc') },
    { step: '2', title: t('step2Title'), desc: t('step2Desc') },
    { step: '3', title: t('step3Title'), desc: t('step3Desc') },
  ];

  const tips = [t('tip1'), t('tip2'), t('tip3'), t('tip4'), t('tip5')];

  const faqs = [
    { q: t('faqQ1'), a: t('faqA1') },
    { q: t('faqQ2'), a: t('faqA2') },
    { q: t('faqQ3'), a: t('faqA3') },
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
          <span className="text-stone-300">{t('breadcrumbYesOrNo')}</span>
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
          <Link
            href="/reading/free?topic=yes-or-no"
            className="inline-block px-8 py-3 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-sm tracking-wide rounded-sm hover:shadow-[0_0_25px_rgba(212,160,67,0.3)] transition-all"
          >
            {t('ctaButton')}
          </Link>
        </div>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-6">
            {t('howItWorksTitle')}
          </h2>
          <div className="space-y-6 pl-8 border-l border-gold-400/10">
            {steps.map((item) => (
              <div key={item.step}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gold-400/10 text-gold-400 font-display text-sm font-semibold flex items-center justify-center">
                    {item.step}
                  </span>
                  <h3 className="font-display text-base font-semibold text-white">
                    {item.title}
                  </h3>
                </div>
                <p className="font-body text-sm font-medium text-stone-400 leading-relaxed ml-10">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Yes vs No Cards */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-6">
            {t('yesNoTitle')}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Yes Cards */}
            <div className="p-5 rounded-sm border border-gold-400/[0.08] bg-white/[0.01]">
              <h3 className="font-display text-lg font-semibold text-white mb-1">
                {t('yesCardsTitle')}
              </h3>
              <p className="font-body text-xs text-stone-500 mb-4">
                {t('yesCardsDesc')}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {yesCards.map((card) => (
                  <Link
                    key={card.slug}
                    href={`/tarot-card-meanings/${card.slug}`}
                    className="group text-center"
                  >
                    <div className="relative w-full aspect-[2/3] rounded overflow-hidden border border-gold-400/10 group-hover:border-gold-400/30 transition-all mb-1">
                      <Image
                        src={card.image}
                        alt={card.name}
                        fill
                        sizes="70px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="text-[10px] text-stone-500 group-hover:text-gold-400 transition-colors">
                      {card.name}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* No Cards */}
            <div className="p-5 rounded-sm border border-gold-400/[0.08] bg-white/[0.01]">
              <h3 className="font-display text-lg font-semibold text-white mb-1">
                {t('noCardsTitle')}
              </h3>
              <p className="font-body text-xs text-stone-500 mb-4">
                {t('noCardsDesc')}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {noCards.map((card) => (
                  <Link
                    key={card.slug}
                    href={`/tarot-card-meanings/${card.slug}`}
                    className="group text-center"
                  >
                    <div className="relative w-full aspect-[2/3] rounded overflow-hidden border border-gold-400/10 group-hover:border-gold-400/30 transition-all mb-1">
                      <Image
                        src={card.image}
                        alt={card.name}
                        fill
                        sizes="70px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="text-[10px] text-stone-500 group-hover:text-gold-400 transition-colors">
                      {card.name}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <p className="font-body text-xs text-stone-600 mt-4 text-center">
            {t('yesNoNote')}
          </p>
        </section>

        {/* The Nuance */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            {t('beyondTitle')}
          </h2>
          <div className="font-body text-base font-medium text-stone-300 leading-relaxed pl-8 border-l border-gold-400/10 space-y-4">
            <p>{t('beyondP1')}</p>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <strong className="text-stone-300">{t('beyondYesBut')}</strong> — {t('beyondYesButDesc')}
              </li>
              <li>
                <strong className="text-stone-300">{t('beyondNotYet')}</strong> — {t('beyondNotYetDesc')}
              </li>
              <li>
                <strong className="text-stone-300">{t('beyondNoBecause')}</strong> — {t('beyondNoBecauseDesc')}
              </li>
              <li>
                <strong className="text-stone-300">{t('beyondWrongQuestion')}</strong> — {t('beyondWrongQuestionDesc')}
              </li>
            </ul>
            <p>{t('beyondP2')}</p>
          </div>
        </section>

        {/* Sample Reading */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="text-gold-400/50">&#10022;</span> {t('sampleTitle')}
          </h2>
          <div className="p-6 rounded-sm border border-gold-400/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent">
            <p className="text-xs text-stone-500 mb-4">
              {t('sampleQuestion')}
            </p>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-[60px] h-[100px] rounded overflow-hidden flex-shrink-0">
                <Image
                  src="/cards/major/m11.jpg"
                  alt="Justice tarot card"
                  fill
                  sizes="60px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs tracking-[0.15em] uppercase text-gold-400/50 mb-1">
                  {t('sampleCardDrawn')}
                </p>
                <p className="font-display text-lg font-semibold text-white">
                  <Link
                    href="/tarot-card-meanings/justice"
                    className="hover:text-gold-400 transition-colors"
                  >
                    {t('sampleCardName')}
                  </Link>{' '}
                  <span className="text-stone-500 font-normal">&middot; {t('sampleUpright')}</span>
                </p>
              </div>
            </div>
            <div className="font-body text-sm font-medium text-stone-300 leading-relaxed italic">
              <p>&ldquo;{t('sampleText')}&rdquo;</p>
            </div>
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

        {/* Related */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-semibold text-white mb-4">
            {t('relatedTitle')}
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/spreads/single-card"
              className="group p-4 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-sm font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                {t('relatedSingleCard')}
              </h3>
              <p className="font-body text-xs font-medium text-stone-500">
                {t('relatedSingleCardDesc')}
              </p>
            </Link>
            <Link
              href="/love-tarot"
              className="group p-4 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-sm font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                {t('relatedLoveTarot')}
              </h3>
              <p className="font-body text-xs font-medium text-stone-500">
                {t('relatedLoveTarotDesc')}
              </p>
            </Link>
            <Link
              href="/tarot-card-meanings"
              className="group p-4 rounded-sm border border-gold-400/[0.06] hover:border-gold-400/20 transition-all"
            >
              <h3 className="font-display text-sm font-semibold text-white group-hover:text-gold-400 transition-colors mb-1">
                {t('relatedCardMeanings')}
              </h3>
              <p className="font-body text-xs font-medium text-stone-500">
                {t('relatedCardMeaningsDesc')}
              </p>
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-6">
            {t('faqTitle')}
          </h2>
          <div className="space-y-4">
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
        <section className="text-center py-12 border-t border-gold-400/[0.06]">
          <h2 className="font-display text-2xl font-semibold text-white mb-3">
            {t('bottomCtaTitle')}
          </h2>
          <p className="font-body text-base font-medium text-stone-400 mb-6 max-w-md mx-auto">
            {t('bottomCtaDesc')}
          </p>
          <Link
            href="/reading/free?topic=yes-or-no"
            className="inline-block px-10 py-3.5 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-base tracking-wide rounded-sm hover:shadow-[0_0_30px_rgba(212,160,67,0.3)] transition-all"
          >
            {t('bottomCtaButton')}
          </Link>
        </section>
      </div>
    </>
  );
}
