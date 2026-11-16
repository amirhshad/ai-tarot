import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

/**
 * No session read here. `cookies()` would opt every marketing page into
 * dynamic rendering (`Cache-Control: private, no-cache, no-store`). The
 * header resolves the session in the browser instead, so logged-in and
 * logged-out visitors share one cacheable HTML document.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
