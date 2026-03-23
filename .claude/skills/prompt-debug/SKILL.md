# Prompt Debug

Use this skill when improving, debugging, or evaluating tarot interpretation prompts. Helps analyze prompt quality and suggest improvements without burning API credits.

## When to Use

- A reading feels generic, repetitive, or off-tone
- Prompt changes need evaluation before deploying
- User reports quality issues with interpretations
- Adding support for a new spread type or language

## Steps

### 1. Analyze Current Prompt
Read the prompt template in `app/src/lib/ai/prompts.ts` and identify:
- **System prompt** — What persona/rules does the AI follow?
- **User prompt construction** — How are cards, positions, and context assembled?
- **Variable injection** — What dynamic data goes in? (cards, spread type, language, user question)

### 2. Check Against Standards
Reference `directives/prompt-engineering.md` and the reading-quality-check skill:
- Does the prompt enforce narrative cohesion?
- Does it handle reversals explicitly?
- Does it prevent deterministic language?
- Does it adapt tone for the target language?
- Are token limits guided (e.g., "respond in approximately 400 words")?

### 3. Dry-Run Analysis
Without calling the API, evaluate the constructed prompt:
- Assemble a sample prompt with real card data (e.g., The Tower reversed, Three of Cups, The Star)
- Walk through what a good response would look like
- Identify gaps: would the current prompt produce that response?
- Check: does the prompt give the AI enough context to weave a narrative?

### 4. Suggest Improvements
Propose specific, minimal changes:
- Exact line edits to the prompt template
- Before/after comparison of the relevant section
- Expected impact on output quality

### 5. Test Plan
After changes, recommend:
- 2-3 test cases (different spreads, languages, with/without reversals)
- What to look for in each test output
- Whether a paid API call is justified or if dry-run analysis is sufficient

## Key Files
- `app/src/lib/ai/prompts.ts` — Prompt templates
- `app/src/lib/ai/client.ts` — API client configuration
- `app/src/lib/ai/streaming.ts` — Response streaming
- `directives/prompt-engineering.md` — Narrative and tone rules
