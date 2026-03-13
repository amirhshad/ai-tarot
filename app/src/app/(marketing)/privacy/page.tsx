import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'TarotVeil privacy policy. Learn how we handle your data, readings, and personal information.',
  alternates: {
    canonical: 'https://www.tarotveil.com/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-8">
        Privacy Policy
      </h1>
      <div className="font-body text-base font-medium leading-relaxed space-y-6">
        <p className="text-stone-400 text-sm">Last updated: March 13, 2026</p>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">1. Information We Collect</h2>
          <p className="text-stone-300">
            When you create an account, we collect your email address and authentication credentials.
            When you use our tarot reading service, we store your reading history including cards drawn,
            spread type, and AI-generated interpretations. Card draws use client-side cryptographic
            randomness and are not influenced by any server-side data.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">2. How We Use Your Information</h2>
          <p className="text-stone-300">
            We use your information to provide and improve our tarot reading service, manage your
            subscription, and communicate service updates. Your readings are private and never shared
            with third parties. We do not sell your personal data.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">3. Data Storage &amp; Security</h2>
          <p className="text-stone-300">
            Your data is stored securely on Supabase (PostgreSQL) with row-level security policies.
            Authentication is handled through Supabase Auth. Payment information is processed and
            stored by Stripe &mdash; we never see or store your full card details.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">4. Third-Party Services</h2>
          <p className="text-stone-300">
            We use the following third-party services: Supabase (database and authentication),
            Stripe (payment processing), Anthropic (AI interpretation), Vercel (hosting and analytics),
            and PostHog (product analytics). Each service has its own privacy policy governing their
            handling of data.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">5. Your Rights</h2>
          <p className="text-stone-300">
            You can access, update, or delete your account and reading history at any time through
            your settings page. To request complete data deletion, contact us at privacy@tarotveil.com.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">6. Cookies</h2>
          <p className="text-stone-300">
            We use essential cookies for authentication and session management. Analytics cookies
            (Vercel Analytics, PostHog) help us understand how our service is used. You can disable
            non-essential cookies in your browser settings.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-white mt-8 mb-3">7. Contact</h2>
          <p className="text-stone-300">
            For privacy-related questions, contact us at privacy@tarotveil.com.
          </p>
        </section>
      </div>
    </div>
  );
}
