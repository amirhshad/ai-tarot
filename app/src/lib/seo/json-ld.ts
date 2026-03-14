import { RichCardContent } from './types';

const SITE_URL = 'https://www.tarotveil.com';
const BRAND = 'TarotVeil';

function suitToSubHub(arcana: string, suit: string | null): { name: string; slug: string } | null {
  if (arcana === 'major') return { name: 'Major Arcana', slug: 'major-arcana' };
  if (!suit) return null;
  const suitMap: Record<string, string> = {
    wands: 'Suit of Wands',
    cups: 'Suit of Cups',
    swords: 'Suit of Swords',
    pentacles: 'Suit of Pentacles',
  };
  return { name: suitMap[suit] || suit, slug: `suit-of-${suit}` };
}

export function buildCardJsonLd(card: RichCardContent, imageUrl: string) {
  const pageUrl = `${SITE_URL}/tarot-card-meanings/${card.slug}`;
  const subHub = suitToSubHub(card.arcana, card.suit);

  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Tarot Card Meanings', item: `${SITE_URL}/tarot-card-meanings` },
  ];

  if (subHub) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: subHub.name,
      item: `${SITE_URL}/tarot-card-meanings/${subHub.slug}`,
    });
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 4,
      name: card.name,
      item: pageUrl,
    });
  } else {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: card.name,
      item: pageUrl,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: card.metaTitle,
        description: card.metaDescription,
        image: imageUrl,
        author: { '@type': 'Organization', name: BRAND, url: SITE_URL },
        publisher: {
          '@type': 'Organization',
          name: BRAND,
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
        },
        mainEntityOfPage: pageUrl,
        datePublished: '2026-03-14',
        dateModified: '2026-03-14',
      },
      {
        '@type': 'FAQPage',
        mainEntity: card.faq.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems,
      },
    ],
  };
}

export function buildHubJsonLd(
  title: string,
  url: string,
  breadcrumbs: { name: string; url: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: title,
        url,
        publisher: { '@type': 'Organization', name: BRAND, url: SITE_URL },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: crumb.name,
          item: crumb.url,
        })),
      },
    ],
  };
}
