import Anthropic from '@anthropic-ai/sdk';
import { Tier, SpreadType } from '@/lib/tarot/types';
import { Locale } from '@/i18n/locales';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/** The cheap model used for the free tier (and the daily card) by default. */
const CHEAP_MODEL = 'claude-haiku-4-5-20251001';

/** The capable model used for every paid tier, and for the upgraded free locales below. */
const CAPABLE_MODEL = 'claude-sonnet-5-5';

/**
 * Free-tier locales upgraded to the capable model despite being free.
 *
 * Arabic morphology punishes a weak model harder than English or Farsi does:
 * a same-spread, same-cards, same-prompt comparison showed Haiku 4.5 making
 * five clear grammatical errors in ~300 words of Arabic (wrong person
 * agreement, a malformed accusative, an intransitive verb where a transitive
 * one was needed, an awkward coinage, a verbal noun misused after `أن`),
 * while Sonnet 5.5 had zero clear errors in 403 words on the same inputs,
 * including correct feminine agreement on a harder construction the free
 * tier dodged entirely. See
 * `docs/arabic-reading-sample-2026-10-05.md` for both readings and the full
 * analysis. The prompts themselves are sound on both models — this is a
 * model-capability gap, not a prompt defect.
 *
 * REMOVE THIS when a stronger cheap model ships: re-run the same comparison
 * against `docs/arabic-reading-sample-2026-10-05.md`, and if it cleans up on
 * the cheap model, delete this set and the `locale` parameter threaded
 * through `getModel` (and its callers) so Arabic falls back to the cheap
 * model like every other locale. This override is meant to be temporary and
 * deliberately easy to delete.
 */
const UPGRADED_FREE_LOCALES: ReadonlySet<Locale> = new Set<Locale>(['ar']);

/** Model selection based on user tier and (for free) locale. */
function getModel(tier: Tier, locale?: Locale): string {
  if (tier === 'free') {
    return locale && UPGRADED_FREE_LOCALES.has(locale) ? CAPABLE_MODEL : CHEAP_MODEL;
  }
  return CAPABLE_MODEL;
}

/**
 * Lowest thinking setting for a given model.
 *
 * Up-front thinking stays off for every request: thinking shares the
 * max_tokens budget, and the ceilings in getMaxTokens are sized for narrative
 * text alone, so enabling it would truncate long Farsi readings. The
 * parameter differs by *model*, not by tier — this now matters because the
 * free tier can route some locales (see UPGRADED_FREE_LOCALES above) to the
 * capable model while staying on the free tier. Sonnet 5.5 rejects
 * 'disabled' with a 400 and spells this 'between_tools' (valid at 'high'
 * effort or below, which is the default); with no tools in play it returns
 * text only. Haiku 4.5 predates 'between_tools' and rejects it, so it keeps
 * 'disabled'. Keying this on tier instead of model is exactly the mistake
 * that would 400 every Arabic free reading once it's routed to Sonnet.
 */
function getThinking(model: string): Anthropic.ThinkingConfigParam {
  return model === CHEAP_MODEL ? { type: 'disabled' } : { type: 'between_tools' };
}

/**
 * Get max tokens based on tier and spread type.
 *
 * Sized at ~1.3x the worst case for Farsi, which runs ~3.5 tokens per word
 * (vs ~1.3 for English) against the word targets in prompts.ts. These are
 * ceilings, not targets — length is governed by the prompt's word range, and
 * only tokens actually generated are billed.
 */
function getMaxTokens(tier: Tier, spreadType?: SpreadType): number {
  if (tier === 'free') return 800;              // target 150-200 words
  if (spreadType === 'celtic-cross') return 5000; // target 1000-1100 words
  if (spreadType === 'horseshoe') return 3500;    // target 550-750 words
  return 2800;                                    // target 400-600 words
}

export interface InterpretationRequest {
  systemPrompt: string;
  userMessage: string;
  tier: Tier;
  spreadType?: SpreadType;
  locale?: Locale;
}

export interface FollowUpRequest {
  systemPrompt: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  tier: Tier;
  locale?: Locale;
}

/**
 * Stream an initial tarot interpretation.
 * Returns an Anthropic message stream.
 */
export async function streamInterpretation(req: InterpretationRequest) {
  const model = getModel(req.tier, req.locale);
  const maxTokens = getMaxTokens(req.tier, req.spreadType);

  return anthropic.messages.stream({
    model,
    max_tokens: maxTokens,
    thinking: getThinking(model),
    system: req.systemPrompt,
    messages: [{ role: 'user', content: req.userMessage }],
  });
}

/**
 * Stream a follow-up response within a reading conversation.
 */
export async function streamFollowUp(req: FollowUpRequest) {
  const model = getModel(req.tier, req.locale);

  return anthropic.messages.stream({
    model,
    max_tokens: 1200, // target 150-250 words; Farsi needs ~900 (see getMaxTokens)
    thinking: getThinking(model),
    system: req.systemPrompt,
    messages: req.messages,
  });
}

/**
 * Non-streaming completion for simple use cases (e.g. daily card interpretation).
 * Always uses the cheap model for cost efficiency. This does not get the
 * Arabic-locale upgrade above — the daily card is a separate surface and a
 * separate spend decision the owner has not made.
 */
export async function generateCompletion(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 300,
): Promise<string> {
  const response = await anthropic.messages.create({
    model: CHEAP_MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}

export { getModel, getThinking, CHEAP_MODEL, CAPABLE_MODEL };
