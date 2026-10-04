import { describe, it, expect } from 'vitest';
import { resolveReadingLanguage } from '@/lib/ai/language';

// Review Focus 3: a user with profile.language 'ar' browsing /en currently
// gets an Arabic interpretation inside an English page, because the API reads
// `requestLanguage || profile?.language`. The URL locale must win.
describe('resolveReadingLanguage', () => {
  it('prefers an explicit request language', () => {
    expect(resolveReadingLanguage({ requestLanguage: 'ar', urlLocale: 'en', profileLanguage: 'fa' })).toBe('ar');
  });

  it('prefers the URL locale over the stored profile language', () => {
    expect(resolveReadingLanguage({ urlLocale: 'en', profileLanguage: 'ar' })).toBe('en');
    expect(resolveReadingLanguage({ urlLocale: 'ar', profileLanguage: 'en' })).toBe('ar');
  });

  it('falls back to the profile language when no URL locale is known', () => {
    expect(resolveReadingLanguage({ profileLanguage: 'ar' })).toBe('ar');
  });

  it('defaults to English when nothing is supplied', () => {
    expect(resolveReadingLanguage({})).toBe('en');
  });

  it('ignores unsupported values at every level', () => {
    expect(resolveReadingLanguage({ requestLanguage: 'de', urlLocale: 'ar' })).toBe('ar');
    expect(resolveReadingLanguage({ requestLanguage: 'de', profileLanguage: 'ru' })).toBe('en');
    expect(resolveReadingLanguage({ requestLanguage: 'ar-SA' })).toBe('en');
  });
});
