import { describe, expect, it } from 'vitest';
import robots from './robots';

describe('robots', () => {
  it('disallows the Arabic private routes the way it disallows en and fa', () => {
    const rules = robots().rules;
    const rule = Array.isArray(rules) ? rules[0] : rules;
    const disallow = rule.disallow;
    expect(Array.isArray(disallow)).toBe(true);
    for (const path of [
      '/ar/dashboard',
      '/ar/settings',
      '/ar/billing',
      '/ar/admin',
      '/ar/reading/new',
    ]) {
      expect(disallow).toContain(path);
    }
  });
});
