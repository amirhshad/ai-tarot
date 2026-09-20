# Product Specification

## AI Tarot Platform

An AI-powered conversational tarot reading platform with narrative-driven interpretations, conversational follow-ups, crypto-random card draws, and multi-language support.

## Five Competitive Pillars

1. **Narrative Interpretation** — AI reads all cards together as one cohesive story (not card-by-card bullet points)
2. **Conversational Follow-up** — 2 free follow-up questions per reading on paid tiers, then 1 credit each, with full context retained
3. **Crypto-Random Cards** — Fisher-Yates shuffle with `crypto.getRandomValues()`, verifiable randomness
4. **Context-Aware Readings** — Interpretations reference real-world context when relevant
5. **Multi-Language Native** — English + Farsi (cultural depth, not translation) + Arabic

## Pricing Tiers

| Feature | Free | Pro ($8.99/mo) | Premium ($19.99/mo) |
|---------|------|----------------|---------------------|
| Credits | 3/day | 120/month | 350/month |
| AI Model | Haiku 4.5 (short summary) | Sonnet 5 (deep narrative) | Sonnet 5 (deep narrative) |
| Follow-ups | None | 2 free per reading, then 1 credit | 2 free per reading, then 1 credit |
| Languages | English only | English + Farsi | English + Farsi + Arabic |
| History | Last 5 readings | Full + search | Full + trend analysis |

Credits do not roll over. Costs per action are in
`directives/core-business-rules.md`.

## Model Selection Logic

- **Free tier** → Claude Haiku 4.5: fast, cost-effective, shorter interpretations
- **Pro / Premium** → Claude Sonnet 5: deep narrative, longer interpretations, cultural nuance

The model choice is determined by the user's subscription tier at the time of the reading. Prefer to check this server-side, never trust the client to select the model.

## Feature Details

### Reading Types
- **Single card** — Quick daily insight
- **Three-card spread** — Past / Present / Future (or custom positions)
- **Custom spreads** — Premium only, user-defined positions

### Follow-up Conversations
- Each reading can have follow-up questions that maintain the full context of the original reading
- Paid tiers get 2 free follow-ups per reading; beyond that, each follow-up costs 1 credit and is bounded by the user's balance, not by a per-reading cap. Free tier gets none.
- The AI retains all previous cards, interpretation, and conversation history

### Language Support
- English: default, full feature set
- Farsi: RTL layout, culturally adapted interpretations (not mere translations)
- Arabic: Premium only, RTL, cultural depth
