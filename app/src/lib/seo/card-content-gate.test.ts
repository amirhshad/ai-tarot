import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * A behavioural test of one route cannot pin "every card-meaning route is
 * gated" — it can only prove that the one route it drives is gated. This
 * reads the seven route files as text and asserts each one calls
 * `assertCardContentLocale`, the single implementation of the Phase 2 gate.
 *
 * The seven paths are named explicitly rather than globbed so that renaming
 * or deleting one of them fails here loudly — `readFileSync` throws — instead
 * of a glob quietly matching fewer files and still passing.
 *
 * What this does NOT catch: an eighth card route added later is not in the
 * list, so it is never read and this test stays green however ungated it is.
 * Adding a card-meaning route means adding it here too.
 */
const APP_DIR = fileURLToPath(new URL('../../app', import.meta.url));

const GATED_ROUTE_FILES = [
  '[locale]/(marketing)/tarot-card-meanings/page.tsx',
  '[locale]/(marketing)/tarot-card-meanings/[slug]/page.tsx',
  '[locale]/(marketing)/tarot-card-meanings/major-arcana/page.tsx',
  '[locale]/(marketing)/tarot-card-meanings/suit-of-cups/page.tsx',
  '[locale]/(marketing)/tarot-card-meanings/suit-of-swords/page.tsx',
  '[locale]/(marketing)/tarot-card-meanings/suit-of-wands/page.tsx',
  '[locale]/(marketing)/tarot-card-meanings/suit-of-pentacles/page.tsx',
];

describe('every card-meaning route calls the Phase 2 gate', () => {
  for (const relativePath of GATED_ROUTE_FILES) {
    it(`${relativePath} calls assertCardContentLocale`, () => {
      const source = readFileSync(`${APP_DIR}/${relativePath}`, 'utf-8');
      expect(source).toMatch(/\bassertCardContentLocale\s*\(/);
    });
  }
});
