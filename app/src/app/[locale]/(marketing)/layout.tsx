import { getSessionUser } from '@/lib/db/auth';
import { getProfile } from '@/lib/db/queries';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  const profile = user ? await getProfile(user.id) : null;

  return (
    <>
      <Header
        user={
          user
            ? { email: user.email || '', tier: profile?.tier || 'free' }
            : undefined
        }
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
