import Anthropic from '@anthropic-ai/sdk';
import { Tier } from '@/lib/tarot/types';

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

/** Get max tokens based on tier */
function getMaxTokens(tier: Tier): number {
  if (tier === 'free') return 512;
  return 1500;
}

export interface InterpretationRequest {
  systemPrompt: string;
  userMessage: string;
  tier: Tier;
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
  const maxTokens = getMaxTokens(req.tier);

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

export { getModel };
