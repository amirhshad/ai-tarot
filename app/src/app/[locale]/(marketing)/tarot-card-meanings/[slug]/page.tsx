import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getAllCardContent, getCardContent } from '@/lib/db/card-queries';
import { DECK } from '@/lib/tarot/deck';
import { cardToSlug } from '@/lib/tarot/slugs';
import { buildCardJsonLd } from '@/lib/seo/json-ld';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import cardContentJson from '@/data/card-content.json';

const siteUrl = 'https://www.tarotveil.com';

type FallbackCard = {
  id: number; name: string; slug: string; arcana: string;
  suit: string | null; number: number; keywords: string[];
  upright: string; reversed: string; inReading: string; summary: string;
};
const fallbackContent = cardContentJson as Record<string, FallbackCard>;

export async function generateStaticParams() {
  try {
    const slugs = await getAllCardSlugsFromDb();
    if (slugs.length > 0) return slugs.map(slug => ({ slug }));
  } catch { /* fall through to DECK */ }
  return DECK.map(c => ({ slug: cardToSlug(c) }));
}

async function getAllCardSlugsFromDb() {
  const cards = await getAllCardContent();
  return cards.map(c => c.slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const card = await getCardContent(slug, locale);
  if (card) {
    return {
      title: card.metaTitle,
      description: card.metaDescription,
      alternates: { canonical: `${siteUrl}/tarot-card-meanings/${card.slug}` },
      openGraph: {
        title: card.metaTitle,
        description: card.metaDescription,
        url: `${siteUrl}/tarot-card-meanings/${card.slug}`,
        type: 'article',
        images: [`${siteUrl}/api/og/card/${card.slug}`],
      },
      twitter: {
        card: 'summary_large_image',
        title: card.metaTitle,
        description: card.metaDescription,
        images: [`${siteUrl}/api/og/card/${card.slug}`],
      },
    };
  }

  // Fallback to JSON
  const fb = fallbackContent[slug];
  if (!fb) return {};
  const article = /^the /i.test(fb.name) ? '' : 'the ';
  const title = `${fb.name} Tarot Meaning — Upright & Reversed`;
  const description = `What does ${article}${fb.name} mean? Upright & reversed meanings for love, career, feelings, and yes-or-no readings. Free AI tarot reading included.`;
  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/tarot-card-meanings/${fb.slug}` },
    openGraph: { title, description, url: `${siteUrl}/tarot-card-meanings/${fb.slug}`, type: 'article' },
  };
}

function suitSubHub(arcana: string, suit: string | null) {
  if (arcana === 'major') return { name: 'Major Arcana', slug: 'major-arcana' };
  if (!suit) return null;
  const map: Record<string, string> = { wands: 'Suit of Wands', cups: 'Suit of Cups', swords: 'Suit of Swords', pentacles: 'Suit of Pentacles' };
  return { name: map[suit] || suit, slug: `suit-of-${suit}` };
}

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split('\n\n').filter(Boolean).map((p, i) => (
        <p key={i} className="mb-4 last:mb-0">{p.replace(/\n/g, ' ')}</p>
      ))}
    </>
  );
}

export default async function CardMeaningPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('cardDetail');
  const tc = await getTranslations('common');

  const card = await getCardContent(slug, locale);
  const deckCard = DECK.find(c => cardToSlug(c) === slug);

  // If no DB content, render fallback from JSON
  if (!card) {
    const fb = fallbackContent[slug];
    if (!fb || !deckCard) notFound();
    return <FallbackCardPage card={fb} deckCard={deckCard} t={t} tc={tc} />;
  }

  if (!deckCard) notFound();

  const subHub = suitSubHub(card.arcana, card.suit);
  const jsonLd = buildCardJsonLd(card, `${siteUrl}${deckCard.image}`);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Breadcrumbs */}
        <nav className="text-sm text-stone-500 mb-8 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-gold-400 transition-colors">{tc('home')}</Link>
          <span>/</span>
          <Link href="/tarot-card-meanings" className="hover:text-gold-400 transition-colors">{t('tarotCardMeanings')}</Link>
          {subHub && (
            <>
              <span>/</span>
              <Link href={`/tarot-card-meanings/${subHub.slug}`} className="hover:text-gold-400 transition-colors">{subHub.name}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-stone-300">{card.name}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-10 mb-12">
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="relative w-[220px] h-[370px] rounded-md overflow-hidden border border-gold-400/20">
              <Image
                src={deckCard.image}
                alt={t('cardImageAlt', { cardName: card.name })}
                fill
                sizes="220px"
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="flex-1">
            <p className="text-xs tracking-[0.2em] uppercase text-gold-400/60 mb-2">
              {card.arcana === 'major' ? `${t('majorArcana')} · ${card.number}` : `${t('minorArcana')} · ${subHub?.name}`}
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
              {t('h2Meaning', { cardName: card.name })}
            </h1>
            <p className="font-body text-lg font-medium text-stone-300 leading-relaxed mb-6">
              {card.featuredSnippet}
            </p>

            {/* Keywords */}
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider text-stone-500 mb-2">{t('upright')}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {card.uprightKeywords.map(kw => (
                  <span key={kw} className="px-3 py-1 text-xs font-medium text-gold-400/70 border border-gold-400/15 rounded-full bg-gold-400/[0.03]">
                    {kw}
                  </span>
                ))}
              </div>
              <p className="text-xs uppercase tracking-wider text-stone-500 mb-2">{t('reversed')}</p>
              <div className="flex flex-wrap gap-2">
                {card.reversedKeywords.map(kw => (
                  <span key={kw} className="px-3 py-1 text-xs font-medium text-stone-500 border border-stone-700 rounded-full">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/reading/free"
              className="inline-block px-8 py-3 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-sm tracking-wide rounded-sm hover:shadow-[0_0_25px_rgba(212,160,67,0.3)] transition-all"
            >
              {t('getFreeAiReading')}
            </Link>
          </div>
        </div>

        {/* Table of Contents */}
        <nav className="mb-12 p-4 border border-gold-400/[0.06] rounded-sm">
          <p className="font-display text-xs uppercase tracking-wider text-stone-500 mb-3">{t('onThisPage')}</p>
          <ul className="grid grid-cols-2 gap-1.5 text-sm">
            {[
              { id: 'upright', label: t('tocUpright') },
              { id: 'reversed', label: t('tocReversed') },
              { id: 'love', label: t('tocLove') },
              { id: 'career', label: t('tocCareer') },
              ...(card.asFeelings ? [{ id: 'feelings', label: t('tocFeelings') }] : []),
              ...(card.howSomeoneSeesYou ? [{ id: 'how-seen', label: t('tocHowSeen') }] : []),
              ...(card.advice ? [{ id: 'advice', label: t('tocAdvice') }] : []),
              { id: 'yes-or-no', label: t('tocYesOrNo') },
              { id: 'combinations', label: t('tocCombinations') },
              { id: 'faq', label: t('tocFaq') },
            ].map(item => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="text-stone-400 hover:text-gold-400 transition-colors">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Upright Meaning */}
        <section id="upright" className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="text-gold-400/50">↑</span> {t('h2Upright', { cardName: card.name })}
          </h2>
          <div className="font-body text-base font-medium text-stone-300 leading-relaxed pl-8 border-l border-gold-400/10">
            <Paragraphs text={card.uprightMeaning} />
          </div>
        </section>

        {/* Reversed Meaning */}
        <section id="reversed" className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="text-gold-400/50">↓</span> {t('h2Reversed', { cardName: card.name })}
          </h2>
          <div className="font-body text-base font-medium text-stone-300 leading-relaxed pl-8 border-l border-gold-400/10">
            <Paragraphs text={card.reversedMeaning} />
          </div>
        </section>

        {/* Love & Relationships */}
        <section id="love" className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="text-gold-400/50">♥</span> {t('h2Love', { cardName: card.name })}
          </h2>
          <div className="font-body text-base font-medium text-stone-300 leading-relaxed pl-8 border-l border-gold-400/10">
            <Paragraphs text={card.loveRelationships} />
          </div>
        </section>

        {/* Career & Finances */}
        <section id="career" className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="text-gold-400/50">◆</span> {t('h2Career', { cardName: card.name })}
          </h2>
          <div className="font-body text-base font-medium text-stone-300 leading-relaxed pl-8 border-l border-gold-400/10">
            <Paragraphs text={card.careerFinances} />
          </div>
        </section>

        {/* As Feelings */}
        {card.asFeelings && (
          <section id="feelings" className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="text-gold-400/50">✦</span> {t('h2Feelings', { cardName: card.name })}
            </h2>
            <div className="font-body text-base font-medium text-stone-300 leading-relaxed pl-8 border-l border-gold-400/10">
              <Paragraphs text={card.asFeelings} />
            </div>
          </section>
        )}

        {/* How Someone Sees You */}
        {card.howSomeoneSeesYou && (
          <section id="how-seen" className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="text-gold-400/50">◇</span> {t('h2HowSeen', { cardName: card.name })}
            </h2>
            <div className="font-body text-base font-medium text-stone-300 leading-relaxed pl-8 border-l border-gold-400/10">
              <Paragraphs text={card.howSomeoneSeesYou} />
            </div>
          </section>
        )}

        {/* Advice */}
        {card.advice && (
          <section id="advice" className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="text-gold-400/50">→</span> {t('h2Advice', { cardName: card.name })}
            </h2>
            <div className="font-body text-base font-medium text-stone-300 leading-relaxed pl-8 border-l border-gold-400/10">
              <Paragraphs text={card.advice} />
            </div>
          </section>
        )}

        {/* Yes or No */}
        <section id="yes-or-no" className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="text-gold-400/50">?</span> {t('h2YesOrNo', { cardName: card.name })}
          </h2>
          <div className="pl-8 border-l border-gold-400/10">
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-display font-semibold mb-3 ${
              card.yesOrNoVerdict === 'yes' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              card.yesOrNoVerdict === 'no' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {card.yesOrNoVerdict.charAt(0).toUpperCase() + card.yesOrNoVerdict.slice(1)}
            </span>
            <div className="font-body text-base font-medium text-stone-300 leading-relaxed">
              <Paragraphs text={card.yesOrNo} />
            </div>
          </div>
        </section>

        {/* Combinations */}
        <section id="combinations" className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            {t('h2Combinations')}
          </h2>
          <div className="space-y-3">
            {card.combinations.map(combo => (
              <div key={combo.slug} className="p-4 border border-gold-400/[0.06] rounded-sm">
                <Link
                  href={`/tarot-card-meanings/${combo.slug}`}
                  className="font-display text-sm font-medium text-gold-400 hover:text-gold-300 transition-colors"
                >
                  {combo.name}
                </Link>
                <p className="font-body text-sm font-medium text-stone-400 mt-1">{combo.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            {t('h2Faq')}
          </h2>
          <div className="space-y-3">
            {card.faq.map(item => (
              <details key={item.question} className="group border border-gold-400/[0.06] rounded-sm">
                <summary className="px-5 py-4 cursor-pointer font-display text-sm font-medium text-stone-300 group-open:text-gold-400 transition-colors">
                  {item.question}
                </summary>
                <div className="px-5 pb-4 font-body text-sm font-medium text-stone-400 leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-12 p-8 rounded-sm border border-gold-400/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent text-center">
          <h2 className="font-display text-xl font-semibold text-white mb-3">
            {t('ctaTitle', { cardName: card.name })}
          </h2>
          <p className="font-body text-base font-medium text-stone-400 mb-6 max-w-md mx-auto">
            {t('ctaDescription', { cardName: card.name })}
          </p>
          <Link
            href="/reading/free"
            className="inline-block px-10 py-3.5 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-base tracking-wide rounded-sm hover:shadow-[0_0_30px_rgba(212,160,67,0.3)] transition-all"
          >
            {t('ctaButton')}
          </Link>
        </section>

        {/* Related Cards */}
        {card.relatedCards.length > 0 && (
          <section>
            <h2 className="font-display text-xl font-semibold text-white mb-6">{t('relatedCards')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {card.relatedCards.map(relSlug => {
                const relDeck = DECK.find(c => cardToSlug(c) === relSlug);
                if (!relDeck) return null;
                return (
                  <Link
                    key={relSlug}
                    href={`/tarot-card-meanings/${relSlug}`}
                    className="group p-4 rounded-sm border border-gold-400/[0.08] hover:border-gold-400/20 transition-all text-center"
                  >
                    <div className="relative w-[80px] h-[130px] mx-auto mb-3 rounded overflow-hidden">
                      <Image
                        src={relDeck.image}
                        alt={relDeck.name}
                        fill
                        sizes="80px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="font-display text-sm text-stone-300 group-hover:text-gold-400 transition-colors">
                      {relDeck.name}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

// Fallback component using existing JSON data when DB content isn't available yet
function FallbackCardPage({ card, deckCard, t, tc }: { card: FallbackCard; deckCard: (typeof DECK)[0]; t: Awaited<ReturnType<typeof getTranslations<'cardDetail'>>>; tc: Awaited<ReturnType<typeof getTranslations<'common'>>> }) {
  const subHub = suitSubHub(card.arcana, card.suit);
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <nav className="text-sm text-stone-500 mb-8 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-gold-400 transition-colors">{tc('home')}</Link>
        <span>/</span>
        <Link href="/tarot-card-meanings" className="hover:text-gold-400 transition-colors">{t('tarotCardMeanings')}</Link>
        {subHub && (
          <>
            <span>/</span>
            <Link href={`/tarot-card-meanings/${subHub.slug}`} className="hover:text-gold-400 transition-colors">{subHub.name}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-stone-300">{card.name}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-10 mb-16">
        <div className="flex-shrink-0 mx-auto md:mx-0">
          <div className="relative w-[220px] h-[370px] rounded-md overflow-hidden border border-gold-400/20">
            <Image src={deckCard.image} alt={t('cardImageAlt', { cardName: card.name })} fill sizes="220px" className="object-cover" priority />
          </div>
        </div>
        <div className="flex-1">
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
            {t('h2Meaning', { cardName: card.name })}
          </h1>
          <p className="font-body text-lg font-medium text-stone-300 leading-relaxed mb-6">{card.summary}</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {card.keywords.map(kw => (
              <span key={kw} className="px-3 py-1 text-xs font-medium text-gold-400/70 border border-gold-400/15 rounded-full bg-gold-400/[0.03]">{kw}</span>
            ))}
          </div>
          <Link href="/reading/free" className="inline-block px-8 py-3 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-sm tracking-wide rounded-sm hover:shadow-[0_0_25px_rgba(212,160,67,0.3)] transition-all">
            {t('getFreeAiReading')}
          </Link>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold text-white mb-4 flex items-center gap-3">
          <span className="text-gold-400/50">↑</span> {t('tocUpright')}
        </h2>
        <div className="font-body text-base font-medium text-stone-300 leading-relaxed pl-8 border-l border-gold-400/10">{card.upright}</div>
      </section>

      <section className="mb-12">
        <h2 className="font-display text-2xl font-semibold text-white mb-4 flex items-center gap-3">
          <span className="text-gold-400/50">↓</span> {t('tocReversed')}
        </h2>
        <div className="font-body text-base font-medium text-stone-300 leading-relaxed pl-8 border-l border-gold-400/10">{card.reversed}</div>
      </section>

      <section className="mb-16 p-8 rounded-sm border border-gold-400/[0.08] bg-gradient-to-b from-white/[0.02] to-transparent text-center">
        <h2 className="font-display text-xl font-semibold text-white mb-3">{t('fallbackCtaTitle', { cardName: card.name })}</h2>
        <p className="font-body text-base font-medium text-stone-400 mb-6 max-w-md mx-auto">
          {t('fallbackCtaDescription', { cardName: card.name })}
        </p>
        <Link href="/reading/free" className="inline-block px-10 py-3.5 bg-gradient-to-b from-gold-400 to-gold-600 text-black font-display font-semibold text-base tracking-wide rounded-sm hover:shadow-[0_0_30px_rgba(212,160,67,0.3)] transition-all">
          {t('ctaButton')}
        </Link>
      </section>
    </div>
  );
}
