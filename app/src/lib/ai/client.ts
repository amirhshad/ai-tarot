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
  return 'claude-sonnet-4-20250514';
}

/** Get max tokens based on tier and spread type */
function getMaxTokens(tier: Tier, spreadType?: SpreadType): number {
  if (tier === 'free') return 512;
  // Celtic Cross (10 cards) needs extra room — Farsi text uses 2-2.5x more tokens than English
  if (spreadType === 'celtic-cross') return 3000;
  return 1500;
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
    max_tokens: 800,
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
