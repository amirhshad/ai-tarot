import { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { DECK } from '@/lib/tarot/deck';
import { cardToSlug } from '@/lib/tarot/slugs';
import { buildHubJsonLd } from '@/lib/seo/json-ld';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildAlternates } from '@/lib/seo/alternates';
import Disclaimer from '@/components/seo/Disclaimer';

const siteUrl = 'https://www.tarotveil.com';

interface SubHubConfig {
  slug: string;
  filter: (card: (typeof DECK)[0]) => boolean;
}

export const SUB_HUB_CONFIGS: Record<string, SubHubConfig> = {
  'major-arcana': {
    slug: 'major-arcana',
    filter: c => c.arcana === 'major',
  },
  'suit-of-wands': {
    slug: 'suit-of-wands',
    filter: c => c.suit === 'wands',
  },
  'suit-of-cups': {
    slug: 'suit-of-cups',
    filter: c => c.suit === 'cups',
  },
  'suit-of-swords': {
    slug: 'suit-of-swords',
    filter: c => c.suit === 'swords',
  },
  'suit-of-pentacles': {
    slug: 'suit-of-pentacles',
    filter: c => c.suit === 'pentacles',
  },
};

export async function generateSubHubMetadata(configKey: string, locale: string): Promise<Metadata> {
  setRequestLocale(locale);
  const t = await getTranslations('subHubConfigs');
  const config = SUB_HUB_CONFIGS[configKey];
  const title = t(`${configKey}.title`);
  const description = t(`${configKey}.description`);

  return {
    title,
    description,
    alternates: buildAlternates(`/tarot-card-meanings/${config.slug}`),
    openGraph: {
      title,
      description,
      url: `${siteUrl}/tarot-card-meanings/${config.slug}`,
    },
  };
}

export default async function SubHubPage({ configKey, locale }: { configKey: string; locale: string }) {
  setRequestLocale(locale);

  const t = await getTranslations('subHub');
  const tConfig = await getTranslations('subHubConfigs');
  const tCommon = await getTranslations('common');

  const config = SUB_HUB_CONFIGS[configKey];
  const heading = tConfig(`${configKey}.heading`);
  const intro = tConfig(`${configKey}.intro`);

  const cards = DECK.filter(config.filter)
    .sort((a, b) => a.number - b.number)
    .map(c => ({
      name: c.name,
      slug: cardToSlug(c),
      image: c.image,
    }));

  const pageUrl = `${siteUrl}/tarot-card-meanings/${config.slug}`;
  const jsonLd = buildHubJsonLd(heading, pageUrl, [
    { name: tCommon('home'), url: siteUrl },
    { name: t('tarotCardMeanings'), url: `${siteUrl}/tarot-card-meanings` },
    { name: heading, url: pageUrl },
  ], locale);

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
          <Link href="/tarot-card-meanings" className="hover:text-gold-400 transition-colors">{t('tarotCardMeanings')}</Link>
          <span>/</span>
          <span className="text-stone-300">{heading}</span>
        </nav>

        {/* Header */}
        <div className="mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
            {heading}
          </h1>
          <p className="font-body text-base font-medium text-stone-400 max-w-3xl leading-relaxed">
            {intro}
          </p>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-16">
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
          <Disclaimer />
        </section>
      </div>
    </>
  );
}
