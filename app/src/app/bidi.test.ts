import { describe, it, expect } from 'vitest';
import { isolateLtr, BRAND } from '@/i18n/locales';

// Review Focus 1: a Latin wordmark inside an RTL string reorders the
// punctuation around it. '%s | TarotVeil' renders with the bar in the wrong
// place unless the Latin run is bidi-isolated.
describe('isolateLtr', () => {
  it('wraps text in First Strong Isolate and Pop Directional Isolate', () => {
    expect(isolateLtr('TarotVeil')).toBe('⁨TarotVeil⁩');
  });

  it('is idempotent so a twice-wrapped brand does not accumulate marks', () => {
    expect(isolateLtr(isolateLtr('TarotVeil'))).toBe('⁨TarotVeil⁩');
  });

  it('leaves an empty string alone', () => {
    expect(isolateLtr('')).toBe('');
  });

  it('isolates the Arabic brand so the title separator stays put', () => {
    const template = `%s | ${isolateLtr(BRAND.ar)}`;
    expect(template).toContain('⁨');
    expect(template.indexOf('|')).toBeLessThan(template.indexOf('⁨'));
  });
});
