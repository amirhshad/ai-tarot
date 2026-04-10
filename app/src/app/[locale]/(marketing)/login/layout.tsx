import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In to Your Tarot Reading Account',
  description:
    'Log in to TarotVeil to access your tarot readings, follow-up conversations, and reading history. Continue your spiritual journey.',
  alternates: {
    canonical: 'https://www.tarotveil.com/login',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
