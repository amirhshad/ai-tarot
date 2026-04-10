import { createClient, type Client } from '@libsql/client';

let _client: Client | null = null;
let _initialized = false;

export function getDb(): Client {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL || 'file:data/tarot.db',
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

  // Reading feedback table (for both anonymous and authenticated readings)
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS reading_feedback (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      reading_id TEXT REFERENCES readings(id) ON DELETE CASCADE,
      helpful INTEGER NOT NULL CHECK (helpful IN (0, 1)),
      source TEXT NOT NULL DEFAULT 'authenticated' CHECK (source IN ('anonymous', 'authenticated')),
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_reading_feedback_reading ON reading_feedback(reading_id);
  `);

  // Migrations for new columns (try/catch since SQLite lacks ADD COLUMN IF NOT EXISTS)
  const migrations = [
    `ALTER TABLE readings ADD COLUMN share_token TEXT`,
    `ALTER TABLE profiles ADD COLUMN auth_provider TEXT DEFAULT 'email'`,
    `ALTER TABLE profiles ADD COLUMN google_id TEXT`,
    `ALTER TABLE readings ADD COLUMN feedback INTEGER`,
    `ALTER TABLE readings ADD COLUMN topic TEXT`,
    `ALTER TABLE usage ADD COLUMN horseshoe_count INTEGER DEFAULT 0`,
    `ALTER TABLE card_content ADD COLUMN as_feelings TEXT`,
    `ALTER TABLE card_content ADD COLUMN how_someone_sees_you TEXT`,
    `ALTER TABLE card_content ADD COLUMN advice TEXT`,
    // Farsi content columns
    `ALTER TABLE card_content ADD COLUMN name_fa TEXT`,
    `ALTER TABLE card_content ADD COLUMN upright_keywords_fa TEXT`,
    `ALTER TABLE card_content ADD COLUMN reversed_keywords_fa TEXT`,
    `ALTER TABLE card_content ADD COLUMN featured_snippet_fa TEXT`,
    `ALTER TABLE card_content ADD COLUMN upright_meaning_fa TEXT`,
    `ALTER TABLE card_content ADD COLUMN reversed_meaning_fa TEXT`,
    `ALTER TABLE card_content ADD COLUMN love_relationships_fa TEXT`,
    `ALTER TABLE card_content ADD COLUMN career_finances_fa TEXT`,
    `ALTER TABLE card_content ADD COLUMN as_feelings_fa TEXT`,
    `ALTER TABLE card_content ADD COLUMN how_someone_sees_you_fa TEXT`,
    `ALTER TABLE card_content ADD COLUMN advice_fa TEXT`,
    `ALTER TABLE card_content ADD COLUMN yes_or_no_fa TEXT`,
    `ALTER TABLE card_content ADD COLUMN combinations_fa TEXT`,
    `ALTER TABLE card_content ADD COLUMN faq_fa TEXT`,
    `ALTER TABLE card_content ADD COLUMN meta_title_fa TEXT`,
    `ALTER TABLE card_content ADD COLUMN meta_description_fa TEXT`,
  ];
  for (const sql of migrations) {
    try { await db.execute(sql); } catch { /* column already exists */ }
  }

  // Create indexes (also wrapped in try/catch in case columns don't exist yet)
  const indexes = [
    `CREATE INDEX IF NOT EXISTS idx_readings_share_token ON readings(share_token)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_google_id ON profiles(google_id)`,
  ];
  for (const sql of indexes) {
    try { await db.execute(sql); } catch { /* ignore if column missing */ }
  }

  // SEO content tables for programmatic pages
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS card_content (
      slug TEXT PRIMARY KEY,
      card_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      arcana TEXT NOT NULL,
      suit TEXT,
      number INTEGER NOT NULL,
      element TEXT,
      zodiac TEXT,
      upright_keywords TEXT NOT NULL,
      reversed_keywords TEXT NOT NULL,
      featured_snippet TEXT NOT NULL,
      upright_meaning TEXT NOT NULL,
      reversed_meaning TEXT NOT NULL,
      love_relationships TEXT NOT NULL,
      career_finances TEXT NOT NULL,
      yes_or_no TEXT NOT NULL,
      yes_or_no_verdict TEXT NOT NULL,
      combinations TEXT NOT NULL,
      faq TEXT NOT NULL,
      related_cards TEXT NOT NULL,
      meta_title TEXT NOT NULL,
      meta_description TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_card_content_arcana ON card_content(arcana);
    CREATE INDEX IF NOT EXISTS idx_card_content_suit ON card_content(suit);
  `);

  _initialized = true;
}
