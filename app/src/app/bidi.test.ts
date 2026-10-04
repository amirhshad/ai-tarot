import { describe, it, expect } from 'vitest';
import { isolateLtr, brandForTitle, BRAND } from '@/i18n/locales';

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

// Review Focus 2: isRtl is true for both fa and ar, but only ar's brand is a
// Latin run. Isolating Farsi's already-RTL brand adds invisible control
// characters to an indexed title for no benefit, so brandForTitle must test
// script, not just direction.
describe('brandForTitle', () => {
  it('leaves the English brand untouched — LTR locale, no isolation', () => {
    expect(brandForTitle('en')).toBe('TarotVeil');
  });

  it('isolates the Arabic brand — RTL locale, Latin brand', () => {
    expect(brandForTitle('ar')).toBe(isolateLtr('TarotVeil'));
  });

  it('leaves the Farsi brand byte-identical to BRAND.fa — RTL locale, non-Latin brand, no marks added', () => {
    expect(brandForTitle('fa')).toBe(BRAND.fa);
    expect(brandForTitle('fa')).not.toContain('⁨');
    expect(brandForTitle('fa')).not.toContain('⁩');
  });
});
