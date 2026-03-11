import { getSessionUser } from '@/lib/db/auth';
import { getProfile, getRecentReadings } from '@/lib/db/queries';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) return null;

  const profile = await getProfile(user.id);
  const readings = await getRecentReadings(user.id, 10);

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'Reader';

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {displayName}
        </h1>
        <p className="text-purple-300/60 text-sm mt-1">
          Your readings are waiting for you.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/reading/new"
          className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/50 to-purple-950/50 border border-purple-700/30 hover:border-amber-400/30 transition-colors group"
        >
          <div className="text-amber-400 text-2xl mb-3">&#10022;</div>
          <h2 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
            New Reading
          </h2>
          <p className="text-sm text-purple-300/60 mt-1">
            Draw cards and receive your narrative interpretation.
          </p>
        </Link>

        {profile?.tier === 'free' && (
          <Link
            href="/billing"
            className="p-6 rounded-2xl bg-gradient-to-br from-amber-900/20 to-purple-950/50 border border-amber-700/20 hover:border-amber-400/30 transition-colors group"
          >
            <div className="text-amber-400 text-2xl mb-3">&#9733;</div>
            <h2 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
              Upgrade to Pro
            </h2>
            <p className="text-sm text-purple-300/60 mt-1">
              Unlimited readings, deeper interpretation, follow-up questions.
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
                className="block p-4 rounded-xl bg-purple-950/30 border border-purple-800/20 hover:border-purple-600/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-white capitalize">
                      {reading.spread_type.replace('-', ' ')}
                    </span>
                    {reading.question && (
                      <p className="text-xs text-purple-400/60 mt-0.5 truncate max-w-md">
                        {reading.question}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-purple-400/40">
                    {new Date(reading.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-purple-400/50 py-8 text-center">
            No readings yet. Start your first one!
          </p>
        )}
      </div>
    </div>
  );
}
