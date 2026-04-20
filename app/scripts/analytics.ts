/**
 * User behavior analytics from the database.
 *
 * Usage:
 *   cd app && npx tsx scripts/analytics.ts
 *
 * Requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env.local
 */
import { createClient } from '@libsql/client';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(__dirname, '../.env.local');
const env: Record<string, string> = {};
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const m = line.match(/^([A-Z_]+)=(.+)/);
    if (m) env[m[1]] = m[2].trim();
  });
}

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || env.TURSO_AUTH_TOKEN,
});

function divider(title: string) {
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`  ${title}`);
  console.log('═'.repeat(50));
}

async function main() {
  // ── Users Overview ──
  divider('USERS');
  const users = await db.execute('SELECT COUNT(*) as c FROM profiles');
  const usersThisWeek = await db.execute("SELECT COUNT(*) as c FROM profiles WHERE created_at > datetime('now', '-7 days')");
  const usersThisMonth = await db.execute("SELECT COUNT(*) as c FROM profiles WHERE created_at > datetime('now', '-30 days')");
  const tiers = await db.execute('SELECT tier, COUNT(*) as c FROM profiles GROUP BY tier ORDER BY c DESC');
  const langs = await db.execute('SELECT language, COUNT(*) as c FROM profiles GROUP BY language ORDER BY c DESC');

  console.log(`Total: ${users.rows[0].c}`);
  console.log(`New this week: ${usersThisWeek.rows[0].c}`);
  console.log(`New this month: ${usersThisMonth.rows[0].c}`);
  console.log('\nBy tier:');
  tiers.rows.forEach(r => console.log(`  ${r.tier}: ${r.c}`));
  console.log('\nBy language:');
  langs.rows.forEach(r => console.log(`  ${r.language}: ${r.c}`));

  // ── Readings Overview ──
  divider('READINGS');
  const totalReadings = await db.execute('SELECT COUNT(*) as c FROM readings');
  const readingsThisWeek = await db.execute("SELECT COUNT(*) as c FROM readings WHERE created_at > datetime('now', '-7 days')");
  const readingsThisMonth = await db.execute("SELECT COUNT(*) as c FROM readings WHERE created_at > datetime('now', '-30 days')");
  const avgPerUser = await db.execute('SELECT ROUND(AVG(cnt), 1) as avg FROM (SELECT COUNT(*) as cnt FROM readings GROUP BY user_id)');

  console.log(`Total: ${totalReadings.rows[0].c}`);
  console.log(`This week: ${readingsThisWeek.rows[0].c}`);
  console.log(`This month: ${readingsThisMonth.rows[0].c}`);
  console.log(`Avg per user: ${avgPerUser.rows[0].avg || 0}`);

  // ── By Spread Type ──
  divider('READINGS BY SPREAD TYPE');
  const bySpread = await db.execute('SELECT spread_type, COUNT(*) as c FROM readings GROUP BY spread_type ORDER BY c DESC');
  bySpread.rows.forEach(r => console.log(`  ${r.spread_type}: ${r.c}`));

  // ── By Topic ──
  divider('READINGS BY TOPIC');
  const byTopic = await db.execute("SELECT COALESCE(topic, 'general') as topic, COUNT(*) as c FROM readings GROUP BY topic ORDER BY c DESC");
  byTopic.rows.forEach(r => console.log(`  ${r.topic}: ${r.c}`));

  // ── By Language ──
  divider('READINGS BY LANGUAGE');
  const byLang = await db.execute('SELECT language, COUNT(*) as c FROM readings GROUP BY language ORDER BY c DESC');
  byLang.rows.forEach(r => console.log(`  ${r.language}: ${r.c}`));

  // ── By Model ──
  divider('AI MODEL USAGE');
  const byModel = await db.execute('SELECT model_used, COUNT(*) as c FROM readings GROUP BY model_used ORDER BY c DESC');
  byModel.rows.forEach(r => console.log(`  ${r.model_used}: ${r.c}`));

  // ── Follow-ups ──
  divider('FOLLOW-UP QUESTIONS');
  const totalFollowUps = await db.execute("SELECT COUNT(*) as c FROM follow_ups WHERE role = 'user'");
  const avgFollowUps = await db.execute("SELECT ROUND(AVG(cnt), 1) as avg FROM (SELECT COUNT(*) as cnt FROM follow_ups WHERE role = 'user' GROUP BY reading_id)");
  const readingsWithFollowUps = await db.execute("SELECT COUNT(DISTINCT reading_id) as c FROM follow_ups WHERE role = 'user'");

  console.log(`Total follow-up questions: ${totalFollowUps.rows[0].c}`);
  console.log(`Readings with follow-ups: ${readingsWithFollowUps.rows[0].c}`);
  console.log(`Avg follow-ups per reading (when used): ${avgFollowUps.rows[0].avg || 0}`);

  // ── Feedback ──
  divider('READING FEEDBACK');
  const feedback = await db.execute('SELECT helpful, COUNT(*) as c FROM reading_feedback GROUP BY helpful ORDER BY helpful DESC');
  const feedbackTotal = await db.execute('SELECT COUNT(*) as c FROM reading_feedback');
  console.log(`Total feedback: ${feedbackTotal.rows[0].c}`);
  feedback.rows.forEach(r => console.log(`  ${r.helpful === 1 ? 'Helpful' : 'Not helpful'}: ${r.c}`));

  // ── Daily Activity (last 14 days) ──
  divider('DAILY ACTIVITY (last 14 days)');
  const daily = await db.execute(`
    SELECT DATE(created_at) as day, COUNT(*) as readings
    FROM readings
    WHERE created_at > datetime('now', '-14 days')
    GROUP BY DATE(created_at)
    ORDER BY day DESC
  `);
  if (daily.rows.length === 0) {
    console.log('  No readings in the last 14 days.');
  } else {
    daily.rows.forEach(r => console.log(`  ${r.day}: ${r.readings} reading(s)`));
  }

  // ── Top Users ──
  divider('TOP USERS (by readings)');
  const topUsers = await db.execute(`
    SELECT p.display_name, p.email, p.tier, COUNT(r.id) as readings
    FROM profiles p
    JOIN readings r ON r.user_id = p.id
    GROUP BY p.id
    ORDER BY readings DESC
    LIMIT 5
  `);
  topUsers.rows.forEach((r, i) => console.log(`  ${i + 1}. ${r.display_name || r.email} (${r.tier}) — ${r.readings} readings`));

  // ── Token Usage ──
  divider('TOKEN USAGE');
  const tokens = await db.execute('SELECT SUM(tokens_used) as total, ROUND(AVG(tokens_used)) as avg FROM readings WHERE tokens_used > 0');
  console.log(`Total tokens: ${tokens.rows[0].total || 0}`);
  console.log(`Avg tokens per reading: ${tokens.rows[0].avg || 0}`);

  // ── Waitlist ──
  divider('WAITLIST');
  const waitlist = await db.execute('SELECT COUNT(*) as c FROM waitlist');
  console.log(`Total signups: ${waitlist.rows[0].c}`);

  console.log('\n');
}

main().catch(console.error);
