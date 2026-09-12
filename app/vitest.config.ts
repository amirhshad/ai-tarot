import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/**
 * Tests cover pure logic only — the modules where a bug is silent and
 * consequential (randomness, quotas, indexed URLs, spread invariants).
 *
 * API routes and components are deliberately out of scope: they need DB and
 * Stripe mocking, which is a lot of scaffolding for thin handlers. Revisit if
 * route logic grows past validation and delegation.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
