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
