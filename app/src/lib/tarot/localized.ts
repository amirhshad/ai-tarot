/**
 * Locale-aware reads over the `localized` sidecar.
 *
 * Call sites use these rather than indexing `localized` directly, so that the
 * English-is-canonical rule lives in one place.
 */
import type { Locale } from '@/i18n/locales';
import type { SpreadDefinition, SpreadPosition, TarotCard } from './types';

export function cardName(card: TarotCard, locale: Locale): string {
  return locale === 'en' ? card.name : card.localized[locale].name;
}

export function cardKeywords(card: TarotCard, locale: Locale): string[] {
  return locale === 'en' ? card.keywords : card.localized[locale].keywords;
}

export function spreadName(spread: SpreadDefinition, locale: Locale): string {
  return locale === 'en' ? spread.name : spread.localized[locale].name;
}

export function spreadDescription(spread: SpreadDefinition, locale: Locale): string {
  return locale === 'en' ? spread.description : spread.localized[locale].description;
}

export function positionName(position: SpreadPosition, locale: Locale): string {
  return locale === 'en' ? position.name : position.localized[locale].name;
}

export function positionDescription(position: SpreadPosition, locale: Locale): string {
  return locale === 'en' ? position.description : position.localized[locale].description;
}
