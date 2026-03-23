# Reading Flow

High-level steps for a complete tarot reading, from initiation to storage.

## Flow

```
1. User initiates → 2. Check limits → 3. Shuffle & draw → 4. Build prompt → 5. Stream interpretation → 6. Store reading → 7. Follow-ups
```

### 1. User Initiates Reading
- User selects spread type (single, three-card, custom)
- Optionally enters a question or topic
- Client sends request to `POST /api/reading`

### 2. Check Limits (Server-Side)
- Authenticate user via Supabase session
- Look up user tier from `profiles` table
- Check `usage` table for free-tier rate limits
- If over limit → return 429 with clear message
- Select AI model based on tier (Haiku for free, Sonnet for paid)

### 3. Shuffle & Draw (Client-Side)
- Use Web Crypto API (`crypto.getRandomValues()`) for randomness
- Fisher-Yates shuffle algorithm on the full 78-card deck
- Draw cards for the selected spread
- Determine orientation (upright/reversed) per card
- Send card data to server with the reading request

### 4. Build Prompt (Server-Side)
- Assemble system prompt with: persona, tone rules, language, word target
- Assemble user prompt with: cards, positions, orientations, spread type, user question
- Reference `directives/prompt-engineering.md` for narrative rules
- Apply cultural adaptation notes for non-English readings

### 5. Stream Interpretation
- Call Claude API with streaming enabled
- Stream tokens to client via Server-Sent Events or similar
- Handle errors gracefully (API timeout, rate limit, model error)
- If streaming fails mid-way, provide a fallback or retry once

### 6. Store Reading
- Save to `readings` table: spread type, cards JSON, full interpretation, model used
- Update `usage` table counters for free-tier users
- Reading is now accessible in history

### 7. Follow-ups (If Allowed)
- User sends follow-up question to `POST /api/reading/[id]/follow-up`
- Server checks follow-up count against tier limit
- Build follow-up prompt with full context: original cards, interpretation, prior messages
- Stream response, save to `follow_ups` table
- Repeat until limit reached

## Error Handling

| Error | Response |
|-------|----------|
| Over rate limit | 429 — "You've reached your daily/weekly limit" |
| Auth failure | 401 — redirect to login |
| AI API error | 500 — "Reading unavailable, please try again" + log |
| Invalid spread | 400 — "Invalid spread type" |

## Key Files

- `app/src/lib/tarot/shuffle.ts` — Crypto shuffle logic
- `app/src/lib/tarot/deck.ts` — Card definitions
- `app/src/lib/tarot/spreads.ts` — Spread type definitions
- `app/src/lib/ai/prompts.ts` — Prompt construction
- `app/src/lib/ai/streaming.ts` — Streaming response handler
- `app/src/lib/ai/client.ts` — Claude API client
