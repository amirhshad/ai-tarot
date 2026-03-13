import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'TarotVeil terms of service. Usage terms for our AI-powered tarot reading platform.',
  alternates: {
    canonical: 'https://www.tarotveil.com/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-8">
        Terms of Service
      </h1>
      <div className="font-body text-base font-medium leading-relaxed space-y-6">
        <p className="text-stone-400 text-sm">Last updated: March 13, 2026</p>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">1. Service Description</h2>
          <p className="text-stone-300">
            TarotVeil is an AI-powered tarot reading platform that provides narrative interpretations
            of tarot card spreads. Our service is for entertainment and personal reflection purposes
            only. Readings should not be used as a substitute for professional advice in medical,
            legal, financial, or psychological matters.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">2. Accounts</h2>
          <p className="text-stone-300">
            You may use a limited free reading without an account. To access full features, you must
            create an account with a valid email address. You are responsible for maintaining the
            security of your account credentials.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">3. Subscriptions &amp; Billing</h2>
          <p className="text-stone-300">
            Paid plans (Pro and Premium) are billed monthly through Stripe. You can cancel your
            subscription at any time through the billing page or Stripe customer portal. Cancellation
            takes effect at the end of your current billing period. Refunds are handled on a
            case-by-case basis.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">4. Fair Use</h2>
          <p className="text-stone-300">
            Free accounts are limited to 1 single-card reading per day and 1 three-card reading per
            week. Paid plans offer unlimited readings as described on our pricing page. We reserve
            the right to limit excessive automated usage.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">5. Intellectual Property</h2>
          <p className="text-stone-300">
            AI-generated reading interpretations are provided for your personal use. The TarotVeil
            brand, design, and platform code are proprietary. Tarot card imagery used is from the
            public domain Rider-Waite-Smith deck.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">6. Disclaimer</h2>
          <p className="text-stone-300">
            TarotVeil provides AI-generated tarot readings for entertainment purposes. We make no
            claims of supernatural ability or predictive accuracy. Card draws use cryptographic
            randomness and are not influenced by any external factors. The service is provided
            &ldquo;as is&rdquo; without warranties of any kind.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">7. Contact</h2>
          <p className="text-stone-300">
            For questions about these terms, contact us at support@tarotveil.com.
          </p>
        </section>
      </div>
    </div>
  );
}
