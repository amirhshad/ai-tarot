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
    <header className="border-b border-purple-800/30 bg-purple-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between" dir={isRTL ? 'rtl' : 'ltr'}>
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
          <span className="text-amber-400 text-xl">&#10022;</span>
          <span className="font-semibold text-white tracking-wide">AI Tarot</span>
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <NavLink href="/dashboard" current={pathname} label={language === 'en' ? 'Dashboard' : 'داشبورد'} />
              <NavLink href="/reading/new" current={pathname} label={language === 'en' ? 'New Reading' : 'خوانش جدید'} />
              <NavLink href="/billing" current={pathname} label={language === 'en' ? 'Billing' : 'اشتراک'} />
              <span className="text-xs px-2 py-1 rounded-full bg-purple-800/50 text-purple-300 capitalize">
                {user.tier}
              </span>
              <button
                onClick={toggleLanguage}
                className="text-xs px-2 py-1 rounded-full border border-purple-700/50 text-purple-300 hover:border-amber-400/50 hover:text-amber-400 transition-colors"
                title={language === 'en' ? 'Switch to Farsi' : 'تغییر به انگلیسی'}
              >
                {language === 'en' ? 'فا' : 'EN'}
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-sm text-purple-400 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                {loggingOut
                  ? '...'
                  : language === 'en' ? 'Sign Out' : 'خروج'}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-purple-300 hover:text-white transition-colors"
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
    </header>
  );
}

function NavLink({ href, current, label }: { href: string; current: string; label: string }) {
  const isActive = current.startsWith(href);
  return (
    <Link
      href={href}
      className={`text-sm transition-colors ${
        isActive ? 'text-amber-400' : 'text-purple-300 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );
}
