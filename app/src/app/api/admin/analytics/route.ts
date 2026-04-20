import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/db/auth';
import { getProfile } from '@/lib/db/queries';
import { getDb, ensureSchema } from '@/lib/db/sqlite';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Auth check — only premium users can access
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profile = await getProfile(user.id);
  if (profile?.tier !== 'premium') {
    return NextResponse.json({ error: 'Forbidden — premium only' }, { status: 403 });
  }

  await ensureSchema();
  const db = getDb();

  const [
    usersTotal,
    usersThisWeek,
    usersThisMonth,
    usersByTier,
    usersByLang,
    usersByAuth,
    readingsTotal,
    readingsThisWeek,
    readingsThisMonth,
    avgPerUser,
    bySpread,
    byTopic,
    byLang,
    byModel,
    followUpsTotal,
    followUpsAvg,
    readingsWithFollowUps,
    feedbackRows,
    dailyActivity,
    topUsers,
    tokensUsage,
    waitlistCount,
  ] = await Promise.all([
    db.execute('SELECT COUNT(*) as c FROM profiles'),
    db.execute("SELECT COUNT(*) as c FROM profiles WHERE created_at > datetime('now', '-7 days')"),
    db.execute("SELECT COUNT(*) as c FROM profiles WHERE created_at > datetime('now', '-30 days')"),
    db.execute('SELECT tier, COUNT(*) as c FROM profiles GROUP BY tier ORDER BY c DESC'),
    db.execute('SELECT language, COUNT(*) as c FROM profiles GROUP BY language ORDER BY c DESC'),
    db.execute("SELECT COALESCE(auth_provider, 'email') as method, COUNT(*) as c FROM profiles GROUP BY auth_provider ORDER BY c DESC"),
    db.execute('SELECT COUNT(*) as c FROM readings'),
    db.execute("SELECT COUNT(*) as c FROM readings WHERE created_at > datetime('now', '-7 days')"),
    db.execute("SELECT COUNT(*) as c FROM readings WHERE created_at > datetime('now', '-30 days')"),
    db.execute('SELECT ROUND(AVG(cnt), 1) as avg FROM (SELECT COUNT(*) as cnt FROM readings GROUP BY user_id)'),
    db.execute('SELECT spread_type, COUNT(*) as c FROM readings GROUP BY spread_type ORDER BY c DESC'),
    db.execute("SELECT COALESCE(topic, 'general') as topic, COUNT(*) as c FROM readings GROUP BY topic ORDER BY c DESC"),
    db.execute('SELECT language, COUNT(*) as c FROM readings GROUP BY language ORDER BY c DESC'),
    db.execute('SELECT model_used, COUNT(*) as c FROM readings GROUP BY model_used ORDER BY c DESC'),
    db.execute("SELECT COUNT(*) as c FROM follow_ups WHERE role = 'user'"),
    db.execute("SELECT ROUND(AVG(cnt), 1) as avg FROM (SELECT COUNT(*) as cnt FROM follow_ups WHERE role = 'user' GROUP BY reading_id)"),
    db.execute("SELECT COUNT(DISTINCT reading_id) as c FROM follow_ups WHERE role = 'user'"),
    db.execute('SELECT helpful, COUNT(*) as c FROM reading_feedback GROUP BY helpful ORDER BY helpful DESC'),
    db.execute(`
      SELECT DATE(created_at) as day, COUNT(*) as readings
      FROM readings WHERE created_at > datetime('now', '-30 days')
      GROUP BY DATE(created_at) ORDER BY day DESC
    `),
    db.execute(`
      SELECT p.display_name, p.email, p.tier, COUNT(r.id) as readings
      FROM profiles p JOIN readings r ON r.user_id = p.id
      GROUP BY p.id ORDER BY readings DESC LIMIT 10
    `),
    db.execute('SELECT SUM(tokens_used) as total, ROUND(AVG(tokens_used)) as avg FROM readings WHERE tokens_used > 0'),
    db.execute('SELECT COUNT(*) as c FROM waitlist'),
  ]);

  return NextResponse.json({
    users: {
      total: usersTotal.rows[0].c,
      thisWeek: usersThisWeek.rows[0].c,
      thisMonth: usersThisMonth.rows[0].c,
      byTier: usersByTier.rows.map(r => ({ tier: r.tier, count: r.c })),
      byLanguage: usersByLang.rows.map(r => ({ language: r.language, count: r.c })),
      byAuth: usersByAuth.rows.map(r => ({ method: r.method, count: r.c })),
    },
    readings: {
      total: readingsTotal.rows[0].c,
      thisWeek: readingsThisWeek.rows[0].c,
      thisMonth: readingsThisMonth.rows[0].c,
      avgPerUser: avgPerUser.rows[0].avg || 0,
      bySpread: bySpread.rows.map(r => ({ type: r.spread_type, count: r.c })),
      byTopic: byTopic.rows.map(r => ({ topic: r.topic, count: r.c })),
      byLanguage: byLang.rows.map(r => ({ language: r.language, count: r.c })),
      byModel: byModel.rows.map(r => ({ model: r.model_used, count: r.c })),
    },
    followUps: {
      total: followUpsTotal.rows[0].c,
      readingsWithFollowUps: readingsWithFollowUps.rows[0].c,
      avgPerReading: followUpsAvg.rows[0].avg || 0,
    },
    feedback: feedbackRows.rows.map(r => ({
      helpful: r.helpful === 1,
      count: r.c,
    })),
    dailyActivity: dailyActivity.rows.map(r => ({ day: r.day, readings: r.readings })),
    topUsers: topUsers.rows.map(r => ({
      name: r.display_name || (r.email as string).split('@')[0],
      tier: r.tier,
      readings: r.readings,
    })),
    tokens: {
      total: tokensUsage.rows[0].total || 0,
      avgPerReading: tokensUsage.rows[0].avg || 0,
    },
    waitlist: waitlistCount.rows[0].c,
    generatedAt: new Date().toISOString(),
  });
}
