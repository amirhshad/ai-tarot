# Self-Anneal

Use this skill after any fix, user correction, or unexpected behavior. It turns errors into system improvements.

## When to Trigger

- After fixing a bug or error
- After receiving user correction or feedback
- After discovering an undocumented constraint or edge case
- After a failed build, test, or deployment

## Steps

### 1. Verify the Fix
- Confirm the fix works (run build, test, or manual check)
- Confirm no regressions were introduced
- If the fix uses paid API tokens/credits, ask the user before testing

### 2. Identify What Was Missing
Ask yourself:
- Was there a directive that should have prevented this? → Update it
- Was there a local CLAUDE.md that should have warned about this? → Update it
- Is this a pattern that could recur? → Add to `docs/lessons.md`
- Was there a missing check in the reading flow? → Update `directives/reading-flow.md`

### 3. Propose Updates
Suggest concrete, minimal updates to the most relevant file(s):

- **Directive update** — 1-2 line addition to the relevant `directives/*.md`
- **Lesson learned** — Append to `docs/lessons.md` with format:
  ```
  ## [Date] — Brief title
  **What happened:** one sentence
  **Root cause:** one sentence
  **Prevention:** what was added/changed to prevent recurrence
  ```
- **Local safety update** — If relevant, update the domain's `CLAUDE.md`

### 4. Propose Commit Message
Format: `fix: [what was fixed] + update [directive/lesson]`

Example: `fix: handle reversed card edge case in prompt + update prompt-engineering directive`

## Principle

Every error makes the system stronger — but only if the learning is captured. Don't just fix and move on.
