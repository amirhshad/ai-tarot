import { getSessionUser } from '@/lib/db/auth';
import { getProfile, getRecentReadings } from '@/lib/db/queries';
import Link from 'next/link';
import ClaimAnonymousReading from '@/components/reading/ClaimAnonymousReading';
import DeleteReadingButton from '@/components/reading/DeleteReadingButton';

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) return null;

  const profile = await getProfile(user.id);
  const readings = await getRecentReadings(user.id, 10);

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'Reader';

  return (
    <div className="space-y-8">
      <ClaimAnonymousReading />
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {displayName}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Your readings are waiting for you.
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
            New Reading
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Draw cards and receive your narrative interpretation.
          </p>
        </Link>

        {profile?.tier === 'free' && (
          <Link
            href="/billing"
            className="p-6 rounded-2xl bg-gradient-to-br from-amber-900/20 to-white/[0.02] border border-amber-700/20 hover:border-amber-400/30 transition-colors group"
          >
            <div className="text-amber-400 text-2xl mb-3">&#9733;</div>
            <h2 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
              Upgrade to Pro
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Unlimited readings, deeper interpretation, 5 follow-up questions.
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
              {profile?.tier === 'pro' ? 'Upgrade to Premium' : 'Go Premium'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              10 follow-ups, custom spreads, trend analysis, English + Farsi + Arabic.
            </p>
          </Link>
        )}
      </div>

      {/* Recent Readings */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Readings</h2>
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
                    <span className="text-sm font-medium text-white capitalize">
                      {reading.spread_type.replace('-', ' ')}
                    </span>
                    {reading.question && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {reading.question}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className="text-xs text-gray-600">
                      {new Date(reading.created_at).toLocaleDateString()}
                    </span>
                    <DeleteReadingButton readingId={reading.id} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 py-8 text-center">
            No readings yet. Start your first one!
          </p>
        )}
      </div>
    </div>
  );
}
