/**
 * Maps card slugs to Pinglish (Latin-script Persian) search variants.
 * These help capture diaspora users searching in Latin script.
 */

const MAJOR_ARCANA_PINGLISH: Record<string, string> = {
  'the-fool': 'kart ahmagh, kart abلeh, the fool tarot farsi',
  'the-magician': 'kart jadoogar, kart kimiyagar, the magician tarot farsi',
  'the-high-priestess': 'kart pap banoo, kart kahene, the high priestess tarot farsi',
  'the-empress': 'kart malakeh, kart shahbanoo, the empress tarot farsi',
  'the-emperor': 'kart emperor, kart shah, kart padshah, the emperor tarot farsi',
  'the-hierophant': 'kart kahen aazam, kart pap, the hierophant tarot farsi',
  'the-lovers': 'kart asheghaan, kart asheg, the lovers tarot farsi',
  'the-chariot': 'kart arabeh, kart kaleskeh, the chariot tarot farsi',
  'strength': 'kart ghodrat, kart esteghaamat, strength tarot farsi',
  'the-hermit': 'kart zahed, kart darvish, the hermit tarot farsi',
  'wheel-of-fortune': 'kart charkh eghbaal, kart charkh falak, wheel of fortune tarot farsi',
  'justice': 'kart edaalat, kart mizaan, justice tarot farsi',
  'the-hanged-man': 'kart mard be daar aavizkhteh, the hanged man tarot farsi',
  'death': 'kart marg, kart entehaa, death tarot farsi',
  'temperance': 'kart etedaal, kart miaaneh ravi, temperance tarot farsi',
  'the-devil': 'kart sheytaan, kart ahrimaan, the devil tarot farsi',
  'the-tower': 'kart borj, the tower tarot farsi',
  'the-star': 'kart setaareh, the star tarot farsi',
  'the-moon': 'kart maah, the moon tarot farsi',
  'the-sun': 'kart khorshid, the sun tarot farsi',
  'judgement': 'kart ghezaavat, kart rastakhiz, judgement tarot farsi',
  'the-world': 'kart jahaan, kart giti, the world tarot farsi',
};

const SUIT_NAMES_PINGLISH: Record<string, string> = {
  wands: 'choobdast',
  cups: 'jaam',
  swords: 'shamshir',
  pentacles: 'sekkeh',
};

const COURT_NAMES_PINGLISH: Record<string, string> = {
  king: 'shah',
  queen: 'malakeh',
  knight: 'shovalyeh',
  page: 'nobaалeh',
};

const NUMBER_NAMES_PINGLISH: Record<string, string> = {
  ace: 'aas',
  two: 'do',
  three: 'seh',
  four: 'chahaar',
  five: 'panj',
  six: 'shesh',
  seven: 'haft',
  eight: 'hasht',
  nine: 'noh',
  ten: 'dah',
};

/**
 * Generate Pinglish search variants for a card slug.
 * Returns a comma-separated string of Latin-script Persian search terms.
 */
export function getPinglishVariants(slug: string): string {
  // Check major arcana first
  if (MAJOR_ARCANA_PINGLISH[slug]) {
    return `fal tarot, maani ${MAJOR_ARCANA_PINGLISH[slug]}`;
  }

  // Parse minor arcana slug: "ace-of-cups", "king-of-swords", etc.
  const match = slug.match(/^(ace|two|three|four|five|six|seven|eight|nine|ten|king|queen|knight|page)-of-(wands|cups|swords|pentacles)$/);
  if (!match) return `fal tarot, ${slug} tarot farsi`;

  const [, rank, suit] = match;
  const suitPinglish = SUIT_NAMES_PINGLISH[suit] || suit;
  const rankPinglish = COURT_NAMES_PINGLISH[rank] || NUMBER_NAMES_PINGLISH[rank] || rank;

  return `fal tarot, kart ${rankPinglish} ${suitPinglish}, ${rank} of ${suit} tarot farsi, maani kart ${rankPinglish} ${suitPinglish} dar tarot`;
}
