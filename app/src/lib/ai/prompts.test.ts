import { describe, it, expect } from 'vitest';
import { LOCALES, type Locale } from '@/i18n/locales';
import { SPREADS } from '@/lib/tarot/spreads';
import { DECK } from '@/lib/tarot/deck';
import {
  buildInterpretationPrompt,
  buildFollowUpPrompt,
  buildQuestionMessage,
  buildExtraCardContext,
  FORBIDDEN_PATTERNS_AR,
  type ReadingTopic,
} from './prompts';
import type { DrawnCard, SpreadDefinition } from '@/lib/tarot/types';

function drawFor(spread: SpreadDefinition): DrawnCard[] {
  return spread.positions.map((position, i) => ({
    card: DECK[i],
    position,
    reversed: i % 2 === 1,
  }));
}

const TOPICS: ReadingTopic[] = [null, 'love', 'yes-or-no', 'career'];

describe('every locale renders every prompt', () => {
  for (const locale of LOCALES as readonly Locale[]) {
    it(`builds interpretation prompts for ${locale} across all spreads, tiers and topics`, () => {
      for (const spread of Object.values(SPREADS)) {
        for (const tier of ['free', 'pro'] as const) {
          for (const topic of TOPICS) {
            const { systemPrompt, userMessage } = buildInterpretationPrompt({
              spread, cards: drawFor(spread), language: locale, tier, topic,
            });
            expect(systemPrompt.length, `${spread.type}.${locale}.${tier}`).toBeGreaterThan(200);
            expect(userMessage.trim()).not.toBe('');
            expect(systemPrompt).not.toContain('undefined');
            expect(userMessage).not.toContain('undefined');
          }
        }
      }
    });

    it(`builds follow-up, question and extra-card prompts for ${locale}`, () => {
      const spread = SPREADS['three-card'];
      const followUp = buildFollowUpPrompt({
        spread, cards: drawFor(spread), interpretation: 'X', language: locale,
      });
      expect(followUp).not.toContain('undefined');
      expect(buildQuestionMessage({ question: 'Q?', language: locale })).not.toBe('');
      expect(
        buildExtraCardContext({ card: DECK[10], reversed: true, language: locale, originalCardIds: [] }),
      ).not.toContain('undefined');
    });
  }
});

describe('Arabic prompts are actually Arabic', () => {
  const spread = SPREADS['celtic-cross'];

  /**
   * Checks EVERY rendered surface, not just the system prompt. The orientation
   * words and keyword joiner are interpolated into the *user message*, so a
   * Farsi value copied into an `ar` table slot would not show up in
   * systemPrompt at all.
   */
  it('contains no Latin prose and no Persian-only letters, on every surface', () => {
    const PERSIAN_ONLY = /[\u067E\u0686\u0698\u06AF\u06A9\u06CC]/; // پ چ ژ گ ک ی
    const cards = drawFor(spread);

    const surfaces: [string, string][] = [];
    for (const topic of TOPICS) {
      const { systemPrompt, userMessage } = buildInterpretationPrompt({
        spread, cards, language: 'ar', tier: 'pro', topic,
      });
      surfaces.push([`system.${topic ?? 'none'}`, systemPrompt]);
      surfaces.push([`user.${topic ?? 'none'}`, userMessage]);
    }
    surfaces.push(['followup', buildFollowUpPrompt({
      spread, cards, interpretation: 'X', language: 'ar',
    })]);
    surfaces.push(['question', buildQuestionMessage({ question: 'س؟', language: 'ar' })]);
    for (const wasInOriginal of [false, true]) {
      surfaces.push([`extra.${wasInOriginal}`, buildExtraCardContext({
        card: DECK[10], reversed: true, language: 'ar',
        originalCardIds: wasInOriginal ? [DECK[10].id] : [],
      })]);
    }

    for (const [label, text] of surfaces) {
      expect(text, `${label} uses Persian letters`).not.toMatch(PERSIAN_ONLY);
      // No run of 4+ Latin letters: the register must not fall back to English.
      expect(text.replace(/TarotVeil/g, ''), `${label} has Latin prose`).not.toMatch(/[A-Za-z]{4,}/);
    }
  });

  it('avoids deterministic prediction verbs', () => {
    const { systemPrompt } = buildInterpretationPrompt({
      spread, cards: drawFor(spread), language: 'ar', tier: 'pro', topic: null,
    });
    // These appear only inside the safety block as things to avoid, so assert
    // on the instruction's presence rather than on raw absence.
    expect(systemPrompt).toContain('تدعوك البطاقات');
  });

  it('gives region-neutral crisis guidance with no phone number', () => {
    const { systemPrompt } = buildInterpretationPrompt({
      spread, cards: drawFor(spread), language: 'ar', tier: 'pro', topic: null,
    });
    expect(systemPrompt).toMatch(/الطوارئ/);

    // Scope the digit check to the crisis sentence. The prompt legitimately
    // carries a word-range ("1000-1100"), so asserting over the whole string
    // would fail a correct implementation.
    const crisisSentence = systemPrompt
      .split(/[\n.؟!]/)
      .find((line) => /الطوارئ/.test(line));
    expect(crisisSentence, 'crisis sentence not found').toBeDefined();
    expect(crisisSentence).not.toMatch(/\d/);
  });
});

describe('FORBIDDEN_PATTERNS_AR', () => {
  it('is non-empty and every entry is labelled', () => {
    expect(FORBIDDEN_PATTERNS_AR.length).toBeGreaterThan(4);
    for (const { label, pattern } of FORBIDDEN_PATTERNS_AR) {
      expect(label.trim()).not.toBe('');
      expect(pattern).toBeInstanceOf(RegExp);
    }
  });

  it('flags the constructions it targets', () => {
    const bad = [
      'ستجد الحب قريبًا',
      'السؤال الحقيقي هو ما تريده فعلًا',
      'جزء منك يعرف الجواب بالفعل',
      'وهذا أمر طبيعي تمامًا',
      'يا له من سؤال جميل',
    ];
    for (const sample of bad) {
      const hit = FORBIDDEN_PATTERNS_AR.some(({ pattern }) => pattern.test(sample));
      expect(hit, `expected a pattern to flag: ${sample}`).toBe(true);
    }
  });

  it('does not flag ordinary reflective Arabic', () => {
    const good = [
      'تدعوك البطاقات إلى أن تتأمّل في ما يجري حولك.',
      'تشير هذه الطاقة إلى مرحلة من الهدوء بعد اضطراب.',
      'قد تجد في هذا الموقف فرصةً لم تلتفت إليها.',
    ];
    for (const sample of good) {
      const flagged = FORBIDDEN_PATTERNS_AR.filter(({ pattern }) => pattern.test(sample));
      expect(flagged.map((f) => f.label), sample).toEqual([]);
    }
  });
});
