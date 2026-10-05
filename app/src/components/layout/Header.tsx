'use client';

import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';
import { trackLanguageSwitch, resetUser } from '@/lib/analytics/events';
import { PAYMENTS_ENABLED } from '@/lib/config/features';
import { LOCALES, LOCALE_LABELS, toLocale, type Locale } from '@/i18n/locales';

interface HeaderProps {
  user?: { email: string; tier: string } | null;
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // With payments off, /billing is only useful to someone who already has a
  // subscription to manage — free users would land on a dead end.
  const showBilling = PAYMENTS_ENABLED || (user?.tier ?? 'free') !== 'free';

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      resetUser();
      router.push('/login');
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <header className="border-b border-white/10 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
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
              <NavLink href="/dashboard" current={pathname} label={t('dashboard')} />
              <NavLink href="/reading/new" current={pathname} label={t('newReading')} />
              <NavLink href="/tarot-card-meanings" current={pathname} label={t('cardMeanings')} />
              <NavLink href="/spreads" current={pathname} label={t('spreads')} />
              <NavLink href="/history" current={pathname} label={t('history')} />
              {showBilling && <NavLink href="/billing" current={pathname} label={t('billing')} />}
              <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-amber-200/80 capitalize">
                {user.tier}
              </span>
              <LanguageSwitcher label={t('language')} />
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-sm text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                {loggingOut ? '...' : tc('signOut')}
              </button>
            </>
          ) : (
            <>
              <Link href="/daily" className="text-sm text-gray-400 hover:text-white transition-colors">
                {t('dailyCard')}
              </Link>
              <Link href="/tarot-card-meanings" className="text-sm text-gray-400 hover:text-white transition-colors">
                {t('cardMeanings')}
              </Link>
              <Link href="/spreads" className="text-sm text-gray-400 hover:text-white transition-colors">
                {t('spreads')}
              </Link>
              <LanguageSwitcher label={t('language')} />
              <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                {tc('signIn')}
              </Link>
              <Link href="/signup" className="text-sm px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors">
                {tc('getStarted')}
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <nav className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-sm px-4 py-3 flex flex-col gap-3">
          {user ? (
            <>
              <NavLink href="/dashboard" current={pathname} label={t('dashboard')} onClick={() => setMenuOpen(false)} />
              <NavLink href="/reading/new" current={pathname} label={t('newReading')} onClick={() => setMenuOpen(false)} />
              <NavLink href="/tarot-card-meanings" current={pathname} label={t('cardMeanings')} onClick={() => setMenuOpen(false)} />
              <NavLink href="/spreads" current={pathname} label={t('spreads')} onClick={() => setMenuOpen(false)} />
              <NavLink href="/history" current={pathname} label={t('history')} onClick={() => setMenuOpen(false)} />
              {showBilling && <NavLink href="/billing" current={pathname} label={t('billing')} onClick={() => setMenuOpen(false)} />}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-amber-200/80 capitalize">
                  {user.tier}
                </span>
                <LanguageSwitcher label={t('language')} align="start" onSwitch={() => setMenuOpen(false)} />
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="text-sm text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  {loggingOut ? '...' : tc('signOut')}
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/daily" className="text-sm text-gray-400 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>
                {t('dailyCard')}
              </Link>
              <Link href="/tarot-card-meanings" className="text-sm text-gray-400 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>
                {t('cardMeanings')}
              </Link>
              <Link href="/spreads" className="text-sm text-gray-400 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>
                {t('spreads')}
              </Link>
              <div className="flex items-center gap-3 pt-1">
                <LanguageSwitcher label={t('language')} align="start" onSwitch={() => setMenuOpen(false)} />
                <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>
                  {tc('signIn')}
                </Link>
                <Link href="/signup" className="text-sm px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors text-center" onClick={() => setMenuOpen(false)}>
                  {tc('getStarted')}
                </Link>
              </div>
            </>
          )}
        </nav>
      )}
    </header>
  );
}

/**
 * Locale picker for the header.
 *
 * A two-way toggle cannot express three locales, so this is a select-only
 * combobox over `LOCALES` — the ARIA APG pattern: a labelled button owning a
 * `listbox`, with `aria-activedescendant` roving over non-focusable options.
 * Every label comes from `LOCALE_LABELS`, in its own script, because a
 * language name should never be translated.
 *
 * All box-side classes are logical (`start-0`/`end-0`, `text-start`): the
 * header renders LTR in English and RTL in Farsi and Arabic, and a physical
 * `right-0` would push the menu off-screen in one of them. `align` says which
 * logical edge the menu hangs from — the desktop nav sits at the container's
 * inline-end so its menu hangs from `end`, while the mobile row starts at the
 * inline-start, where an `end`-hung menu overflows the viewport.
 */
function LanguageSwitcher({
  label,
  align = 'end',
  onSwitch,
}: {
  label: string;
  /**
   * Which logical edge the menu hangs from. Do not collapse this to a single
   * value — the two trees anchor the trigger on opposite sides:
   *
   * - Desktop: the `<nav>` sits at the container's inline-end, so the trigger
   *   is near the inline-end edge and an `end`-hung menu grows inward. Fits.
   * - Mobile: the menu row starts at the inline-start, so the trigger is ~16px
   *   from the inline-start edge. An `end`-hung menu grows *outward* and hangs
   *   off the viewport — measured at 66px of a 128px menu clipped on `/ar` at
   *   390px wide, and mirrored in English, where `end-0` resolves to `right:0`
   *   and puts the menu at a negative x. Hence `start` for the mobile sites.
   *
   * Both values are logical, so each mirrors correctly between LTR and RTL;
   * the difference here is where the trigger sits, not which script it is in.
   */
  align?: 'start' | 'end';
  onSwitch?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = toLocale(useLocale());
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => LOCALES.indexOf(locale));

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const baseId = useId();
  const labelId = `${baseId}-label`;
  const triggerId = `${baseId}-trigger`;
  const listboxId = `${baseId}-listbox`;
  const optionId = (candidate: Locale) => `${baseId}-option-${candidate}`;

  // Close on a click anywhere outside the control.
  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [open]);

  // Move focus into the listbox when it opens so the arrow keys reach it.
  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  function openList() {
    setActiveIndex(LOCALES.indexOf(locale));
    setOpen(true);
  }

  function closeList() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function select(next: Locale) {
    setOpen(false);
    if (next === locale) {
      triggerRef.current?.focus();
      return;
    }
    trackLanguageSwitch(locale, next);
    onSwitch?.();
    router.replace(pathname, { locale: next });
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openList();
    }
  }

  function handleListKeyDown(event: React.KeyboardEvent<HTMLUListElement>) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, LOCALES.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(LOCALES.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        select(LOCALES[activeIndex]);
        break;
      case 'Escape':
        event.preventDefault();
        closeList();
        break;
      case 'Tab':
        // No preventDefault: focus returns to the trigger and the browser's
        // own Tab then carries on to the next nav item.
        closeList();
        break;
      default:
        break;
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <span id={labelId} className="sr-only">
        {label}
      </span>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-labelledby={`${labelId} ${triggerId}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleTriggerKeyDown}
        className="text-xs px-2 py-1 rounded-full border border-white/15 text-gray-400 hover:border-amber-400/50 hover:text-amber-400 transition-colors"
      >
        {LOCALE_LABELS[locale]}
      </button>
      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={labelId}
          aria-activedescendant={optionId(LOCALES[activeIndex])}
          onKeyDown={handleListKeyDown}
          className={`absolute ${
            align === 'start' ? 'start-0' : 'end-0'
          } mt-1 min-w-[8rem] rounded-lg border border-white/10 bg-black/95 py-1 shadow-lg z-50 focus:outline-none`}
        >
          {LOCALES.map((candidate, index) => (
            <li
              key={candidate}
              id={optionId(candidate)}
              role="option"
              aria-selected={candidate === locale}
              onClick={() => select(candidate)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`cursor-pointer px-3 py-1.5 text-start text-sm transition-colors ${
                candidate === locale ? 'text-amber-400' : 'text-gray-300'
              } ${index === activeIndex ? 'bg-white/10' : ''}`}
            >
              {LOCALE_LABELS[candidate]}
            </li>
          ))}
        </ul>
      )}
    </div>
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
