'use client';

import { useState } from 'react';

interface AnalyticsData {
  users: {
    total: number;
    thisWeek: number;
    thisMonth: number;
    byTier: { tier: string; count: number }[];
    byLanguage: { language: string; count: number }[];
    byAuth: { method: string; count: number }[];
  };
  readings: {
    total: number;
    thisWeek: number;
    thisMonth: number;
    avgPerUser: number;
    bySpread: { type: string; count: number }[];
    byTopic: { topic: string; count: number }[];
    byLanguage: { language: string; count: number }[];
    byModel: { model: string; count: number }[];
  };
  followUps: {
    total: number;
    readingsWithFollowUps: number;
    avgPerReading: number;
  };
  feedback: { helpful: boolean; count: number }[];
  dailyActivity: { day: string; readings: number }[];
  topUsers: { name: string; tier: string; readings: number }[];
  tokens: { total: number; avgPerReading: number };
  waitlist: number;
  generatedAt: string;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function BreakdownList({ items, labelKey, valueKey }: { items: Record<string, unknown>[]; labelKey: string; valueKey: string }) {
  const total = items.reduce((s, i) => s + (i[valueKey] as number), 0);
  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const pct = total > 0 ? Math.round(((item[valueKey] as number) / total) * 100) : 0;
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300 capitalize">{String(item[labelKey]).replace(/-/g, ' ')}</span>
                <span className="text-gray-500">{item[valueKey] as number} ({pct}%)</span>
              </div>
              <div className="mt-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-amber-400/60 rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function fetchAnalytics() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) {
        const body = await res.json();
        setError(body.error || 'Failed to load');
        setLoading(false);
        return;
      }
      setData(await res.json());
    } catch {
      setError('Network error');
    }
    setLoading(false);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          {data && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {new Date(data.generatedAt).toLocaleString()}
            </p>
          )}
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-black font-semibold rounded-lg transition-colors text-sm"
        >
          {loading ? 'Loading...' : data ? 'Refresh' : 'Load Analytics'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {!data && !loading && !error && (
        <div className="py-20 text-center text-gray-500">
          Click <strong>Load Analytics</strong> to fetch the latest data.
        </div>
      )}

      {data && (
        <>
          {/* Users */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Users</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total" value={data.users.total} />
              <StatCard label="This week" value={data.users.thisWeek} />
              <StatCard label="This month" value={data.users.thisMonth} />
              <StatCard label="Waitlist" value={data.waitlist} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">By Tier</p>
                <BreakdownList items={data.users.byTier} labelKey="tier" valueKey="count" />
              </div>
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">By Language</p>
                <BreakdownList items={data.users.byLanguage} labelKey="language" valueKey="count" />
              </div>
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">By Auth Method</p>
                <BreakdownList items={data.users.byAuth} labelKey="method" valueKey="count" />
              </div>
            </div>
          </section>

          {/* Readings */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Readings</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total" value={data.readings.total} />
              <StatCard label="This week" value={data.readings.thisWeek} />
              <StatCard label="This month" value={data.readings.thisMonth} />
              <StatCard label="Avg / user" value={data.readings.avgPerUser} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">By Spread Type</p>
                <BreakdownList items={data.readings.bySpread} labelKey="type" valueKey="count" />
              </div>
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">By Topic</p>
                <BreakdownList items={data.readings.byTopic} labelKey="topic" valueKey="count" />
              </div>
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">By Language</p>
                <BreakdownList items={data.readings.byLanguage} labelKey="language" valueKey="count" />
              </div>
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">AI Model</p>
                <BreakdownList items={data.readings.byModel} labelKey="model" valueKey="count" />
              </div>
            </div>
          </section>

          {/* Engagement */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Engagement</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard label="Follow-up questions" value={data.followUps.total} />
              <StatCard label="Readings with follow-ups" value={data.followUps.readingsWithFollowUps} />
              <StatCard label="Avg follow-ups / reading" value={data.followUps.avgPerReading} />
            </div>
            {data.feedback.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Feedback</p>
                <div className="flex gap-6">
                  {data.feedback.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={f.helpful ? 'text-green-400' : 'text-red-400'}>
                        {f.helpful ? '👍' : '👎'}
                      </span>
                      <span className="text-gray-300">{f.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Daily Activity */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Daily Activity (last 30 days)</h2>
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              {data.dailyActivity.length === 0 ? (
                <p className="text-gray-500 text-sm">No activity in the last 30 days.</p>
              ) : (
                <div className="space-y-1.5">
                  {data.dailyActivity.map(d => {
                    const maxReadings = Math.max(...data.dailyActivity.map(x => x.readings as number));
                    const pct = maxReadings > 0 ? Math.round(((d.readings as number) / maxReadings) * 100) : 0;
                    return (
                      <div key={d.day as string} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-24 flex-shrink-0">{d.day as string}</span>
                        <div className="flex-1 h-4 bg-white/[0.04] rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400/50 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-6 text-right">{d.readings as number}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Top Users */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Top Users</h2>
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <div className="space-y-3">
                {data.topUsers.map((u, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 w-5">{i + 1}.</span>
                      <span className="text-gray-300">{u.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-amber-200/80 capitalize">
                        {u.tier}
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm">{u.readings} readings</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
