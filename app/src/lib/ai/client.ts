import Anthropic from '@anthropic-ai/sdk';
import { Tier, SpreadType } from '@/lib/tarot/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/** Model selection based on user tier */
function getModel(tier: Tier): string {
  if (tier === 'free') {
    return 'claude-haiku-4-5-20251001';
  }
  return 'claude-sonnet-5';
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
}

export interface FollowUpRequest {
  systemPrompt: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  tier: Tier;
}

/**
 * Stream an initial tarot interpretation.
 * Returns an Anthropic message stream.
 */
export async function streamInterpretation(req: InterpretationRequest) {
  const model = getModel(req.tier);
  const maxTokens = getMaxTokens(req.tier, req.spreadType);

  return anthropic.messages.stream({
    model,
    max_tokens: maxTokens,
    // Sonnet 5 runs adaptive thinking when this is omitted, and thinking shares
    // the max_tokens budget — which would truncate long Farsi readings.
    thinking: { type: 'disabled' },
    system: req.systemPrompt,
    messages: [{ role: 'user', content: req.userMessage }],
  });
}

/**
 * Stream a follow-up response within a reading conversation.
 */
export async function streamFollowUp(req: FollowUpRequest) {
  const model = getModel(req.tier);

  return anthropic.messages.stream({
    model,
    max_tokens: 1200, // target 150-250 words; Farsi needs ~900 (see getMaxTokens)
    thinking: { type: 'disabled' },
    system: req.systemPrompt,
    messages: req.messages,
  });
}

/**
 * Non-streaming completion for simple use cases (e.g. daily card interpretation).
 * Always uses Haiku for cost efficiency.
 */
export async function generateCompletion(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 300,
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}

export { getModel };
