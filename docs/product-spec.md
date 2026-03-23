# Product Specification

## AI Tarot Platform

An AI-powered conversational tarot reading platform with narrative-driven interpretations, conversational follow-ups, crypto-random card draws, and multi-language support.

## Five Competitive Pillars

1. **Narrative Interpretation** — AI reads all cards together as one cohesive story (not card-by-card bullet points)
2. **Conversational Follow-up** — 5–10 follow-up questions per reading with full context retained
3. **Crypto-Random Cards** — Fisher-Yates shuffle with `crypto.getRandomValues()`, verifiable randomness
4. **Context-Aware Readings** — Interpretations reference real-world context when relevant
5. **Multi-Language Native** — English + Farsi (cultural depth, not translation) + Arabic

## Pricing Tiers

| Feature | Free | Pro ($7.99/mo) | Premium ($14.99/mo) |
|---------|------|----------------|---------------------|
| Readings/Day | 1 single + 1 three-card/week | Unlimited | Unlimited + custom spreads |
| AI Model | Haiku 4.5 (short summary) | Sonnet 4 (deep narrative) | Sonnet 4 (deep narrative) |
| Follow-ups | 0 | 5 per reading | 10 per reading |
| Languages | English only | English + Farsi | English + Farsi + Arabic |
| History | Last 5 readings | Full + search | Full + trend analysis |

## Model Selection Logic

- **Free tier** → Claude Haiku 4.5: fast, cost-effective, shorter interpretations
- **Pro / Premium** → Claude Sonnet 4: deep narrative, longer interpretations, cultural nuance

The model choice is determined by the user's subscription tier at the time of the reading. Prefer to check this server-side, never trust the client to select the model.

## Feature Details

### Reading Types
- **Single card** — Quick daily insight
- **Three-card spread** — Past / Present / Future (or custom positions)
- **Custom spreads** — Premium only, user-defined positions

### Follow-up Conversations
- Each reading can have follow-up questions that maintain the full context of the original reading
- Follow-up limits are enforced per-reading, not per-day
- The AI retains all previous cards, interpretation, and conversation history

### Language Support
- English: default, full feature set
- Farsi: RTL layout, culturally adapted interpretations (not mere translations)
- Arabic: Premium only, RTL, cultural depth
