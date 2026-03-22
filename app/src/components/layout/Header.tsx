'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface HeaderProps {
  user?: { email: string; tier: string } | null;
  language?: 'en' | 'fa';
}

export default function Header({ user, language = 'en' }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isRTL = language === 'fa';
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  async function toggleLanguage() {
    const newLang = language === 'en' ? 'fa' : 'en';
    await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: newLang }),
    });
    router.refresh();
  }

  return (
    <header className="border-b border-white/10 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between" dir={isRTL ? 'rtl' : 'ltr'}>
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
          <span className="text-amber-400 text-xl">&#10022;</span>
          <span className="font-semibold text-white tracking-wide">TarotVeil</span>
        </Link>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-gray-300 transition-transform ${menuOpen ? 'rotate-45 translate-y-1' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-300 transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-300 transition-transform ${menuOpen ? '-rotate-45 -translate-y-1' : ''}`} />
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <NavLink href="/dashboard" current={pathname} label={language === 'en' ? 'Dashboard' : 'داشبورد'} />
              <NavLink href="/reading/new" current={pathname} label={language === 'en' ? 'New Reading' : 'خوانش جدید'} />
              <NavLink href="/tarot-card-meanings" current={pathname} label={language === 'en' ? 'Card Meanings' : 'معانی کارت‌ها'} />
              <NavLink href="/spreads" current={pathname} label={language === 'en' ? 'Spreads' : 'گسترش‌ها'} />
              <NavLink href="/billing" current={pathname} label={language === 'en' ? 'Billing' : 'اشتراک'} />
              <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-amber-200/80 capitalize">
                {user.tier}
              </span>
              <button
                onClick={toggleLanguage}
                className="text-xs px-2 py-1 rounded-full border border-white/15 text-gray-400 hover:border-amber-400/50 hover:text-amber-400 transition-colors"
                title={language === 'en' ? 'Switch to Farsi' : 'تغییر به انگلیسی'}
              >
                {language === 'en' ? 'فا' : 'EN'}
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-sm text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                {loggingOut
                  ? '...'
                  : language === 'en' ? 'Sign Out' : 'خروج'}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/daily"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {language === 'en' ? 'Daily Card' : 'کارت روز'}
              </Link>
              <Link
                href="/tarot-card-meanings"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {language === 'en' ? 'Card Meanings' : 'معانی کارت‌ها'}
              </Link>
              <Link
                href="/spreads"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {language === 'en' ? 'Spreads' : 'گسترش‌ها'}
              </Link>
              <Link
                href="/login"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {language === 'en' ? 'Sign In' : 'ورود'}
              </Link>
              <Link
                href="/signup"
                className="text-sm px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors"
              >
                {language === 'en' ? 'Get Started' : 'شروع'}
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <nav className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-sm px-4 py-3 flex flex-col gap-3" dir={isRTL ? 'rtl' : 'ltr'}>
          {user ? (
            <>
              <NavLink href="/dashboard" current={pathname} label={language === 'en' ? 'Dashboard' : 'داشبورد'} onClick={() => setMenuOpen(false)} />
              <NavLink href="/reading/new" current={pathname} label={language === 'en' ? 'New Reading' : 'خوانش جدید'} onClick={() => setMenuOpen(false)} />
              <NavLink href="/tarot-card-meanings" current={pathname} label={language === 'en' ? 'Card Meanings' : 'معانی کارت‌ها'} onClick={() => setMenuOpen(false)} />
              <NavLink href="/spreads" current={pathname} label={language === 'en' ? 'Spreads' : 'گسترش‌ها'} onClick={() => setMenuOpen(false)} />
              <NavLink href="/billing" current={pathname} label={language === 'en' ? 'Billing' : 'اشتراک'} onClick={() => setMenuOpen(false)} />
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-amber-200/80 capitalize">
                  {user.tier}
                </span>
                <button
                  onClick={toggleLanguage}
                  className="text-xs px-2 py-1 rounded-full border border-white/15 text-gray-400 hover:border-amber-400/50 hover:text-amber-400 transition-colors"
                >
                  {language === 'en' ? 'فا' : 'EN'}
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="text-sm text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  {loggingOut ? '...' : language === 'en' ? 'Sign Out' : 'خروج'}
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/daily" className="text-sm text-gray-400 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>
                {language === 'en' ? 'Daily Card' : 'کارت روز'}
              </Link>
              <Link href="/tarot-card-meanings" className="text-sm text-gray-400 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>
                {language === 'en' ? 'Card Meanings' : 'معانی کارت‌ها'}
              </Link>
              <Link href="/spreads" className="text-sm text-gray-400 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>
                {language === 'en' ? 'Spreads' : 'گسترش‌ها'}
              </Link>
              <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>
                {language === 'en' ? 'Sign In' : 'ورود'}
              </Link>
              <Link href="/signup" className="text-sm px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors text-center" onClick={() => setMenuOpen(false)}>
                {language === 'en' ? 'Get Started' : 'شروع'}
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}

function NavLink({ href, current, label, onClick }: { href: string; current: string; label: string; onClick?: () => void }) {
  const isActive = current.startsWith(href);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`text-sm transition-colors ${
        isActive ? 'text-amber-400' : 'text-gray-400 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );
}
