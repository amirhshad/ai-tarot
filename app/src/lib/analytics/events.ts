import posthog from 'posthog-js';

const isEnabled = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_POSTHOG_KEY;

/** Identify a user after login/signup */
export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!isEnabled) return;
  posthog.identify(userId, properties);
}

/** Reset identity on logout */
export function resetUser() {
  if (!isEnabled) return;
  posthog.reset();
}

/** Track a custom event */
export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (!isEnabled) return;
  posthog.capture(event, properties);
}

// ── Pre-defined event helpers ──────────────────────────────────────

export function trackReadingStarted(spreadType: string, topic?: string, language?: string) {
  trackEvent('reading_started', { spread_type: spreadType, topic, language });
}

export function trackReadingCompleted(spreadType: string, topic?: string, language?: string, tokensUsed?: number) {
  trackEvent('reading_completed', { spread_type: spreadType, topic, language, tokens_used: tokensUsed });
}

export function trackFollowUpAsked(readingId: string, questionNumber: number) {
  trackEvent('follow_up_asked', { reading_id: readingId, question_number: questionNumber });
}

export function trackFeedbackSubmitted(readingId: string, helpful: boolean) {
  trackEvent('feedback_submitted', { reading_id: readingId, helpful });
}

export function trackSignup(method: 'email' | 'google') {
  trackEvent('user_signed_up', { method });
}

export function trackLogin(method: 'email' | 'google') {
  trackEvent('user_logged_in', { method });
}

export function trackUpgrade(fromTier: string, toTier: string) {
  trackEvent('subscription_upgraded', { from_tier: fromTier, to_tier: toTier });
}

export function trackLanguageSwitch(fromLocale: string, toLocale: string) {
  trackEvent('language_switched', { from: fromLocale, to: toLocale });
}

export function trackCardMeaningViewed(cardSlug: string, locale: string) {
  trackEvent('card_meaning_viewed', { card_slug: cardSlug, locale });
}

export function trackFreeReadingStarted(topic?: string) {
  trackEvent('free_reading_started', { topic });
}
