import type { Metadata } from 'next';

// Same shell for every visitor, but it is the auth flow. Keep it out of the
// shared CDN cache with the other session surfaces.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Create Your Free Account — Start Reading Today',
  description:
    'Sign up for TarotVeil and get your first AI-powered tarot reading for free. Narrative interpretations, crypto-random cards, and conversational follow-ups.',
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
