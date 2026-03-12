import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Your Free Account — Start Reading Today',
  description:
    'Sign up for TarotVeil and get your first AI-powered tarot reading for free. Narrative interpretations, crypto-random cards, and conversational follow-ups.',
  alternates: {
    canonical: 'https://www.tarotveil.com/signup',
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
