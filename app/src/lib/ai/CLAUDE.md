# AI / Prompt Generation — Local Rules

## Before editing files here, read:
- `directives/prompt-engineering.md` — Narrative rules, tone, cultural depth
- `directives/reading-flow.md` — Steps 4-5 (prompt building & streaming)

## Rules

1. **Model selection is server-side only.** Check user tier from `profiles` table. Free → Haiku 4.5, Paid → Sonnet 5. Never accept model choice from the client.

2. **No deterministic language in prompts.** System prompts must instruct the AI to avoid "you will…", "expect…", "this predicts…". Use reflective framing.

3. **Always include word-count guidance** in the system prompt to control token usage. See `directives/prompt-engineering.md` for targets per spread type.

4. **Handle reversals explicitly.** The prompt must tell the AI which cards are reversed and how to interpret them (blocked energy, not "opposite meaning").

5. **Stream responses.** Use streaming for all interpretation calls. Handle mid-stream failures gracefully — log the error, provide a user-friendly fallback.

6. **Protect API keys.** The Anthropic API key lives in environment variables. Never log it, expose it to the client, or include it in error messages.

7. **Cultural adaptation.** For Farsi/Arabic readings, include cultural context notes in the prompt — not just the target language. See `directives/prompt-engineering.md` for specifics. Per-language rule blocks are **not translations of each other** — each targets the failure modes of its own language.

8. **Prompt text is frozen.** After any edit to `prompts.ts`, run `node execution/prompt-freeze.mjs`. It fails if a rendered prompt changed. If the change was intended, re-freeze with `--update` and commit the snapshot in the same commit, so the diff shows the voice change as deliberate. Never re-freeze to make a red gate go away.

## Key files
- `client.ts` — API client setup, model selection
- `prompts.ts` — System and user prompt templates
- `streaming.ts` — SSE streaming handler
