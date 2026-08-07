/**
 * Smoke test: end-to-end paid-tier three-card reading through the real
 * prompt builder + streaming client. Spends API credits — run deliberately.
 *
 *   set -a && . ./.env.local && set +a
 *   npx tsx scripts/smoke-paid-reading.mts [en|fa] [three-card|horseshoe|celtic-cross|single]
 *
 * Checks stop_reason — anything other than `end_turn` means the interpretation
 * was cut off and max_tokens in src/lib/ai/client.ts needs raising.
 */
import { buildInterpretationPrompt } from '../src/lib/ai/prompts';
import { streamInterpretation, getModel } from '../src/lib/ai/client';
import { getSpread } from '../src/lib/tarot/spreads';
import { getCardById } from '../src/lib/tarot/deck';
import type { DrawnCard, SpreadType } from '../src/lib/tarot/types';

const language = (process.argv[2] === 'en' ? 'en' : 'fa') as 'en' | 'fa';
const tier = 'premium' as const;

const spreadType = (process.argv[3] ?? 'three-card') as SpreadType;
const spread = getSpread(spreadType)!;
// Deterministic card set so runs are comparable across models.
const cards: DrawnCard[] = spread.positions.map((position, i) => ({
  card: getCardById([0, 13, 19, 6, 10, 16, 21, 1, 9, 17][i % 10])!,
  reversed: i % 3 === 1,
  position,
}));

const { systemPrompt, userMessage } = buildInterpretationPrompt({
  spread, cards, language, tier, topic: 'love',
});

console.log(`model=${getModel(tier)} tier=${tier} spread=${spreadType} lang=${language}\n---`);

const t0 = Date.now();
// SMOKE_MODEL overrides the tier-selected model, for A/B comparison only.
let stream;
if (process.env.SMOKE_MODEL) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  stream = new Anthropic().messages.stream({
    model: process.env.SMOKE_MODEL,
    max_tokens: Number(process.env.SMOKE_MAX_TOKENS ?? 1500),
    thinking: { type: 'disabled' },
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });
} else {
  stream = await streamInterpretation({ systemPrompt, userMessage, tier, spreadType });
}
stream.on('text', (d) => process.stdout.write(d));

const msg = await stream.finalMessage();
const text = msg.content.filter((b) => b.type === 'text').map((b: any) => b.text).join('');

console.log('\n---');
console.log(`model returned : ${msg.model}`);
console.log(`stop_reason    : ${msg.stop_reason}`);
console.log(`output tokens  : ${msg.usage.output_tokens}`);
console.log(`input tokens   : ${msg.usage.input_tokens}`);
console.log(`words          : ${text.trim().split(/\s+/).length}`);
console.log(`elapsed        : ${((Date.now() - t0) / 1000).toFixed(1)}s`);
console.log(`ends cleanly   : ${/[.!?،。»"']\s*$/.test(text.trim()) ? 'yes' : 'NO — likely truncated'}`);
if (msg.stop_reason === 'max_tokens') console.log('\n*** TRUNCATED: hit max_tokens ***');
