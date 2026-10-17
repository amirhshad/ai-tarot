# Prompt Engineering — Tarot Interpretations

## Narrative Rules

1. **Weave, don't list.** All cards in a spread form one cohesive narrative. Never describe cards one-by-one then summarize. The reading should feel like a story being told.

2. **Honor card positions.** In a three-card spread (Past/Present/Future), the narrative should flow through time. In custom spreads, each position's meaning shapes how that card is interpreted.

3. **Integrate reversals.** Reversed cards represent blocked energy, internalized qualities, delays, or resistance — not simply "the opposite." Weave reversal meaning into the story naturally.

4. **Close with empowerment.** Every reading should end with agency — what the querent can reflect on, consider, or do. Even difficult readings should leave the person feeling empowered, not helpless.

## Tone Guidelines

- **Empathetic and warm** — like a wise, caring friend
- **Reflective, not prescriptive** — "this invites you to consider…" not "you must…"
- **Non-alarmist for difficult cards** — Death = transformation, Tower = necessary upheaval, Ten of Swords = release and new beginning
- **No fortune-telling language** — avoid "you will…", "expect…", "this predicts…"
- **No assumptions** — about gender, relationships, religion, health, or life circumstances
- **Symbolic richness** — reference the visual symbolism of each card when it adds depth

## Cultural Depth (Multi-Language)

### Farsi
- Draw on Persian literary tradition (Rumi, Hafez, Khayyam) for metaphor and resonance
- Use culturally meaningful symbols — the garden, the mirror, the journey, the beloved
- Maintain the reflective, poetic register that Persian speakers expect from spiritual content
- RTL formatting must be preserved

#### Card naming (Farsi)

Card names are prompt input, so a bad name becomes a bad reading. Two rules,
both enforced by `deck.test.ts` → "Farsi minor-arcana naming scheme":

- **No plural noun after a numeral.** `پنج شمشیر`, never `پنج شمشیرها`. The
  plural suit survives only where no numeral precedes it — `شاه شمشیرها`,
  `آس جام‌ها` — where it reads as the name of the suit itself.
- **Nine carries its zamme: `نُه`.** Bare `نه` is also the word for *no*, so
  `نه جام` inside running prose reads as "no cups". A premium three-card
  reading once closed on `نه جام‌ها می‌تواند راست بایستد` — "then no cups can
  stand upright" — which is the opposite of what it meant.

Names that differ by one letter are a model hazard, not just a typo risk. The
High Priestess and the Hierophant were `کاهنه اعظم` / `کاهن اعظم`. In the
reading that prompted this section the Hierophant was drawn, and the model
named it correctly — then spent half a paragraph on the High Priestess's
archetype ("نگهبان دانستن‌هایی که با زبان گفته نمی‌شوند"), discarding the
keywords it had been handed (`حکمت معنوی، سنت، همنوایی، آموزش`) in favour of
the neighbour's (`شهود`, `ناخودآگاه`). The failure was semantic, not
orthographic: one letter of distance was enough to let the meanings bleed.

Two mitigations, both in place. She is now `کاهنه بزرگ`, matching `fa.json` —
keep every pair of Farsi card names distinct by a whole word. And the prompt
now requires each card's meaning to be built from the keywords supplied for
that card, never substituted from memory or borrowed from another card. The
keywords are the grounding; a correct name over imported meanings still
produces an incoherent paragraph.

Orientation vocabulary is fixed at `ایستاده` / `معکوس` — the labels the card
pages already use. The prompt forbids inventing `وارونه` or `راست‌ایستاده`,
and forbids using `ایستاده` for a card's *placement*, since "در جایگاه آینده
ایستاده ولی وارونه است" reads as self-contradictory.

### Arabic
- Respect the literary and spiritual register appropriate to the audience
- Use culturally resonant metaphors — the desert, the oasis, light and guidance
- Maintain warmth and dignity in tone
- RTL formatting must be preserved

### English
- Default literary register — accessible but not dumbed down
- Reference card imagery and traditional tarot symbolism freely

## Token Length Targets

| Context | Target Words |
|---------|-------------|
| Single card (free) | 150–300 |
| Three-card spread (paid) | 400–700 |
| Custom spread (premium) | Proportional to positions |
| Follow-up response | 100–200 |

Include approximate word guidance in the system prompt to the AI model (e.g., "Respond in approximately 500 words").

## Prompt Structure

A well-formed interpretation prompt should include:
1. **System prompt** — persona, tone rules, language, word target
2. **Cards drawn** — name, position, orientation (upright/reversed)
3. **Spread type** — what each position means
4. **User's question** — if provided (optional)
5. **Language** — target language and cultural adaptation notes
