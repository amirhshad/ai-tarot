import type { Metadata } from 'next';

// Same shell for every visitor, but it is the auth flow. Keep it out of the
// shared CDN cache with the other session surfaces.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sign In to Your Tarot Reading Account',
  description:
    'Log in to TarotVeil to access your tarot readings, follow-up conversations, and reading history. Continue your spiritual journey.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
