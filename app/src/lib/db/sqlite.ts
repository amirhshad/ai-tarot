import { createClient, type Client } from '@libsql/client';

let _client: Client | null = null;
let _initialized = false;

export function getDb(): Client {
  if (!_client) {
    const url = process.env.TURSO_DATABASE_URL || 'file:data/tarot.db';
    console.log('[DB] Creating client with URL:', url.substring(0, 30) + '...');
    console.log('[DB] Auth token present:', !!process.env.TURSO_AUTH_TOKEN);
    _client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _client;
}

export async function ensureSchema(): Promise<void> {
  if (_initialized) return;
  const db = getDb();

  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      language TEXT NOT NULL DEFAULT 'en',
      tier TEXT NOT NULL DEFAULT 'free',
      stripe_customer_id TEXT UNIQUE,
      stripe_subscription_id TEXT UNIQUE,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS readings (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      spread_type TEXT NOT NULL,
      question TEXT,
      cards TEXT NOT NULL,
      interpretation TEXT,
      model_used TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'en',
      tokens_used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS follow_ups (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      reading_id TEXT NOT NULL REFERENCES readings(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      tokens_used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS usage (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      week_start TEXT NOT NULL,
      single_count INTEGER DEFAULT 0,
      three_card_count INTEGER DEFAULT 0,
      celtic_cross_count INTEGER DEFAULT 0,
      UNIQUE (user_id, week_start)
    );

    CREATE TABLE IF NOT EXISTS waitlist (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      email TEXT NOT NULL UNIQUE,
      language TEXT DEFAULT 'en',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_readings_user ON readings(user_id);
    CREATE INDEX IF NOT EXISTS idx_readings_created ON readings(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_follow_ups_reading ON follow_ups(reading_id);
    CREATE INDEX IF NOT EXISTS idx_usage_user_week ON usage(user_id, week_start);
  `);

  _initialized = true;
}
