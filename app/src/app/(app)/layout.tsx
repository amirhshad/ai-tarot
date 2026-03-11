import { getSessionUser } from '@/lib/db/auth';
import { getProfile } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await getProfile(user.id);

  return (
    <>
      <Header
        user={{
          email: user.email || '',
          tier: profile?.tier || 'free',
        }}
        language={(profile?.language || 'en') as 'en' | 'fa'}
      />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>
      <Footer language={(profile?.language || 'en') as 'en' | 'fa'} />
    </>
  );
}
