/**
 * Deterministic fixture matrix for the prompt freeze gate.
 *
 * We freeze the *rendered* prompts rather than the raw string constants. That
 * is strictly stronger: it catches a changed constant, a reordered assembly, a
 * block dropped from one language but not the other, and a broken conditional
 * (e.g. the multi-card STRUCTURE block leaking into a single-card reading).
 *
 * Everything here must stay deterministic — no dates, no randomness, no
 * shuffling. Cards are taken from the real DECK by position so that a change
 * to a card's Farsi name or a spread's position labels also trips the gate,
 * since both flow into the prompt.
 *
 * Run `node execution/prompt-freeze.mjs` to verify, `--update` to re-freeze.
 */
import {
  buildInterpretationPrompt,
  buildFollowUpPrompt,
  buildQuestionMessage,
  buildExtraCardContext,
  type ReadingTopic,
} from '@/lib/ai/prompts';
import { SPREADS } from '@/lib/tarot/spreads';
import { DECK } from '@/lib/tarot/deck';
import type { DrawnCard, SpreadDefinition, Tier } from '@/lib/tarot/types';

const LANGUAGES: ('en' | 'fa')[] = ['en', 'fa'];
const TIERS: Tier[] = ['free', 'pro'];
const TOPICS: ReadingTopic[] = [null, 'love', 'yes-or-no', 'career'];

/** Deterministic draw: first N cards of the deck, every other one reversed. */
function drawFor(spread: SpreadDefinition): DrawnCard[] {
  return spread.positions.map((position, i) => ({
    card: DECK[i],
    position,
    reversed: i % 2 === 1,
  }));
}

export interface Frozen {
  key: string;
  text: string;
}

export function collect(): Frozen[] {
  const out: Frozen[] = [];
  const spreads = Object.values(SPREADS).sort((a, b) => a.type.localeCompare(b.type));

  for (const spread of spreads) {
    const cards = drawFor(spread);
    for (const language of LANGUAGES) {
      for (const tier of TIERS) {
        for (const topic of TOPICS) {
          const { systemPrompt, userMessage } = buildInterpretationPrompt({
            spread,
            cards,
            language,
            tier,
            topic,
          });
          const suffix = `${spread.type}.${language}.${tier}.${topic ?? 'none'}`;
          out.push({ key: `interpretation.system.${suffix}`, text: systemPrompt });
          out.push({ key: `interpretation.user.${suffix}`, text: userMessage });
        }
      }
    }
  }

  // Follow-up prompts: the path where voice drift is worst.
  const threeCard = SPREADS['three-card'];
  const followCards = drawFor(threeCard);
  for (const language of LANGUAGES) {
    for (const withExtra of [false, true]) {
      const extraCardContext = withExtra
        ? buildExtraCardContext({ card: DECK[10], reversed: true, language, originalCardIds: [] })
        : undefined;
      out.push({
        key: `followup.${language}.${withExtra ? 'extra-card' : 'plain'}`,
        text: buildFollowUpPrompt({
          spread: threeCard,
          cards: followCards,
          interpretation: 'FROZEN_INTERPRETATION_PLACEHOLDER',
          language,
          extraCardContext,
        }),
      });
    }
  }

  for (const language of LANGUAGES) {
    out.push({
      key: `question.${language}`,
      text: buildQuestionMessage({ question: 'Should I take the offer?', language }),
    });
    for (const wasInOriginal of [false, true]) {
      out.push({
        key: `extra-card.${language}.${wasInOriginal ? 'repeat' : 'new'}`,
        text: buildExtraCardContext({
          card: DECK[10],
          reversed: false,
          language,
          originalCardIds: wasInOriginal ? [DECK[10].id] : [],
        }),
      });
    }
  }

  return out;
}
