import { describe, it, expect } from 'vitest';
import { LOCALES } from '@/i18n/locales';
import { DECK } from './deck';
import { cardName, cardKeywords } from './localized';

describe('DECK integrity', () => {
  it('holds 78 cards with unique ids', () => {
    expect(DECK).toHaveLength(78);
    expect(new Set(DECK.map((c) => c.id)).size).toBe(78);
  });
});

// Review Focus 5: an English card name inside an Arabic prompt is the failure
// this guards. tsc catches an absent key; these catch empty or untranslated.
describe('every card is complete in every locale', () => {
  for (const locale of LOCALES) {
    it(`has a non-empty name for all 78 cards in ${locale}`, () => {
      for (const card of DECK) {
        expect(cardName(card, locale).trim(), `${card.name}.name.${locale}`).not.toBe('');
      }
    });

    it(`has exactly 4 non-empty keywords for all 78 cards in ${locale}`, () => {
      for (const card of DECK) {
        const keywords = cardKeywords(card, locale);
        expect(keywords, `${card.name}.keywords.${locale}`).toHaveLength(4);
        for (const keyword of keywords) {
          expect(keyword.trim(), `${card.name}.keywords.${locale}`).not.toBe('');
        }
      }
    });
  }

  /**
   * The Arabic Unicode block U+0600-U+06FF contains the Persian-only letters
   * too, so "is in the Arabic block" does not prove "is Arabic". Assert the
   * absence of Persian-specific forms as well — otherwise pasting the Farsi
   * column into the ar slot would pass.
   */
  it('uses Arabic script, not Persian, for every Arabic name and keyword', () => {
    const PERSIAN_ONLY = /[پچژگکی]/; // پ چ ژ گ ک ی
    for (const card of DECK) {
      const name = cardName(card, 'ar');
      expect(name, card.name).toMatch(/[؀-ۿ]/);
      expect(name, `${card.name} uses Persian letters`).not.toMatch(PERSIAN_ONLY);
      for (const keyword of cardKeywords(card, 'ar')) {
        expect(keyword, `${card.name} keyword`).toMatch(/[؀-ۿ]/);
        expect(keyword, `${card.name} keyword uses Persian letters`).not.toMatch(PERSIAN_ONLY);
      }
    }
  });

  it('never reuses a Farsi string as the Arabic one', () => {
    for (const card of DECK) {
      expect(cardName(card, 'ar'), card.name).not.toBe(cardName(card, 'fa'));
      expect(cardKeywords(card, 'ar'), card.name).not.toEqual(cardKeywords(card, 'fa'));
    }
  });

  it('never reuses the English name as the Arabic name', () => {
    for (const card of DECK) {
      expect(cardName(card, 'ar')).not.toBe(card.name);
    }
  });

  it('gives every card a distinct Arabic name', () => {
    const names = DECK.map((c) => cardName(c, 'ar'));
    const duplicates = names.filter((n, i) => names.indexOf(n) !== i);
    expect(duplicates, `duplicate Arabic names: ${duplicates.join(', ')}`).toHaveLength(0);
  });
});

describe('Arabic minor-arcana naming scheme', () => {
  const SUITS = { wands: 'العصي', cups: 'الكؤوس', swords: 'السيوف', pentacles: 'الدنانير' };

  it('ends every minor card name with its suit noun', () => {
    for (const card of DECK) {
      if (card.arcana !== 'minor' || !card.suit) continue;
      const suit = SUITS[card.suit];
      expect(cardName(card, 'ar'), `${card.name} should end with ${suit}`).toContain(suit);
    }
  });

  it('uses the bare آس form for aces and من for numbered ranks', () => {
    const ace = DECK.find((c) => c.name === 'Ace of Wands')!;
    expect(cardName(ace, 'ar')).toBe('آس العصي');
    const three = DECK.find((c) => c.name === 'Three of Swords')!;
    expect(cardName(three, 'ar')).toBe('ثلاثة من السيوف');
    const queen = DECK.find((c) => c.name === 'Queen of Cups')!;
    expect(cardName(queen, 'ar')).toBe('ملكة الكؤوس');
  });
});

describe('Farsi minor-arcana naming scheme', () => {
  // Persian does not pluralize the noun after a numeral: "پنج شمشیر", never
  // "پنج شمشیرها". The plural suit survives only where no numeral precedes it
  // (آس / شاه / ملکه / شوالیه / شاهزاده), where it names the suit itself.
  const COUNTED = { wands: 'چوب‌دست', cups: 'جام', swords: 'شمشیر', pentacles: 'سکه' };
  const NUMERALS = ['دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نُه', 'ده'];

  const numbered = DECK.filter(
    (c) => c.arcana === 'minor' && c.suit && /^(Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten) of /.test(c.name),
  );

  it('covers all 36 numbered minor cards', () => {
    expect(numbered).toHaveLength(36);
  });

  it('never pluralizes the suit noun after a numeral', () => {
    for (const card of numbered) {
      const fa = cardName(card, 'fa');
      const [numeral, ...rest] = fa.split(' ');
      expect(NUMERALS, `${card.name} → "${fa}" starts with an unknown numeral`).toContain(numeral);
      expect(rest.join(' '), `${card.name} → "${fa}" should use the singular suit`).toBe(
        COUNTED[card.suit!],
      );
    }
  });

  it("writes nine with its zamme so it cannot be read as the negation 'نه'", () => {
    const nines = DECK.filter((c) => /^Nine of /.test(c.name));
    expect(nines).toHaveLength(4);
    for (const card of nines) {
      expect(cardName(card, 'fa'), `${card.name} must use نُه, not bare نه`).toMatch(/^نُه /);
    }
  });

  it('keeps the High Priestess distinct from the Hierophant by more than one letter', () => {
    const priestess = cardName(DECK.find((c) => c.name === 'The High Priestess')!, 'fa');
    const hierophant = cardName(DECK.find((c) => c.name === 'The Hierophant')!, 'fa');
    expect(priestess).toBe('کاهنه بزرگ');
    expect(hierophant).toBe('کاهن اعظم');
    // The old pair was کاهنه اعظم / کاهن اعظم — one ه apart, and the model
    // blended the two archetypes under a single name.
    expect(priestess.replace('کاهنه ', '')).not.toBe(hierophant.replace('کاهن ', ''));
  });
});
