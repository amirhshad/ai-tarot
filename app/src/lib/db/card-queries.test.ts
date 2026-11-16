import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@libsql/client', () => ({
  createClient: () => ({
    execute: async () => {
      throw new Error('ConnectionFailed("Unable to open connection to local database data/tarot.db: 14")');
    },
    executeMultiple: async () => {
      throw new Error('ConnectionFailed("Unable to open connection to local database data/tarot.db: 14")');
    },
  }),
}));

const ORIGINAL = process.env.TURSO_DATABASE_URL;

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.TURSO_DATABASE_URL;
  else process.env.TURSO_DATABASE_URL = ORIGINAL;
  vi.resetModules();
});

describe('card content when the database cannot be opened', () => {
  it('returns no rows, so pages use bundled JSON, when Turso is unset', async () => {
    delete process.env.TURSO_DATABASE_URL;
    vi.resetModules();
    const { getAllCardContent, getCardContent } = await import('./card-queries');
    await expect(getAllCardContent('en')).resolves.toEqual([]);
    await expect(getCardContent('the-fool', 'en')).resolves.toBeNull();
  });

  it('still throws when a Turso URL is configured', async () => {
    process.env.TURSO_DATABASE_URL = 'libsql://example.turso.io';
    vi.resetModules();
    const { getAllCardContent } = await import('./card-queries');
    await expect(getAllCardContent('fa')).rejects.toThrow(/ConnectionFailed/);
  });
});
