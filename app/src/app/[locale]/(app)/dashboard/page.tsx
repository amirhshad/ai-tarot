import { getSessionUser } from '@/lib/db/auth';
import { getProfile, getRecentReadings } from '@/lib/db/queries';
import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import ClaimAnonymousReading from '@/components/reading/ClaimAnonymousReading';
import DeleteReadingButton from '@/components/reading/DeleteReadingButton';

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('dashboard');

  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getProfile(user.id);
  const readings = await getRecentReadings(user.id, 5);
  const displayName = profile?.display_name || user.email?.split('@')[0] || 'Reader';
  const isFA = locale === 'fa';

  function formatRelativeDate(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (isFA) {
      if (diffDays === 0) return 'امروز';
      if (diffDays === 1) return 'دیروز';
      if (diffDays < 7) return `${diffDays} روز پیش`;
      return date.toLocaleDateString('fa-IR');
    }
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }

  const spreadLabels: Record<string, string> = isFA
    ? { 'single': 'تک کارت', 'three-card': 'سه کارت', 'celtic-cross': 'صلیب سلتی', 'horseshoe': 'نعل اسب' }
    : { 'single': 'Single', 'three-card': 'Three Card', 'celtic-cross': 'Celtic Cross', 'horseshoe': 'Horseshoe' };

  const topicLabels: Record<string, string> = isFA
    ? { 'love': 'عشق', 'career': 'شغل', 'yes-or-no': 'بله/خیر', 'general': 'عمومی' }
    : { 'love': 'Love', 'career': 'Career', 'yes-or-no': 'Yes/No', 'general': 'General' };

  return (
    <div className="space-y-8">
      <ClaimAnonymousReading />
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {t('welcome', { name: displayName })}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/reading/new"
          className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/10 hover:border-amber-400/30 transition-colors group"
        >
          <div className="text-amber-400 text-2xl mb-3">&#10022;</div>
          <h2 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
            {t('newReading')}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t('newReadingDesc')}
          </p>
        </Link>

        {profile?.tier === 'free' && (
          <Link
            href="/billing"
            className="p-6 rounded-2xl bg-gradient-to-br from-amber-900/20 to-white/[0.02] border border-amber-700/20 hover:border-amber-400/30 transition-colors group"
          >
            <div className="text-amber-400 text-2xl mb-3">&#9733;</div>
            <h2 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
              {t('upgradePro')}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {t('upgradeDesc')}
            </p>
          </Link>
        )}

        {(profile?.tier === 'free' || profile?.tier === 'pro') && (
          <Link
            href="/billing"
            className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/20 to-white/[0.02] border border-purple-700/20 hover:border-purple-400/30 transition-colors group"
          >
            <div className="text-purple-400 text-2xl mb-3">&#10023;</div>
            <h2 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
              {profile?.tier === 'pro' ? t('upgradePremium') : t('goPremium')}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {t('premiumDesc')}
            </p>
          </Link>
        )}
      </div>

      {/* Recent Readings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{t('recentReadings')}</h2>
          {readings && readings.length > 0 && (
            <Link
              href="/history"
              className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              {t('viewAllHistory')}
            </Link>
          )}
        </div>
        {readings && readings.length > 0 ? (
          <div className="space-y-2">
            {readings.map((reading) => (
              <Link
                key={reading.id}
                href={`/reading/${reading.id}`}
                className="block p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/15 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white capitalize">
                        {spreadLabels[reading.spread_type] || reading.spread_type}
                      </span>
                      {reading.topic && (
                        <>
                          <span className="text-gray-600">·</span>
                          <span className="text-xs text-gray-400">
                            {topicLabels[reading.topic] || reading.topic}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {reading.question || t('generalReading')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className="text-xs text-gray-600">
                      {formatRelativeDate(reading.created_at)}
                    </span>
                    <DeleteReadingButton readingId={reading.id} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 py-8 text-center">
            {t('noReadings')}
          </p>
        )}
      </div>
    </div>
  );
}
