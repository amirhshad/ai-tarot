import { getDb, ensureSchema } from './sqlite';

// ── Profiles ──

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  language: string;
  tier: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function getProfile(userId: string): Promise<Profile | undefined> {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM profiles WHERE id = ?', args: [userId] });
  return result.rows[0] as unknown as Profile | undefined;
}

export async function updateProfile(userId: string, data: Partial<Pick<Profile, 'display_name' | 'language' | 'tier' | 'stripe_customer_id' | 'stripe_subscription_id'>>): Promise<void> {
  await ensureSchema();
  const db = getDb();
  const fields: string[] = [];
  const values: (string | null)[] = [];

  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = ?`);
    values.push(value as string | null);
  }

  fields.push("updated_at = datetime('now')");
  values.push(userId);

  await db.execute({ sql: `UPDATE profiles SET ${fields.join(', ')} WHERE id = ?`, args: values });
}

// ── Readings ──

export interface ReadingRow {
  id: string;
  user_id: string;
  spread_type: string;
  question: string | null;
  cards: string; // JSON string
  interpretation: string | null;
  model_used: string;
  language: string;
  tokens_used: number;
  share_token: string | null;
  feedback: number | null;
  created_at: string;
}

export async function createReading(data: {
  user_id: string;
  spread_type: string;
  question?: string;
  cards: unknown;
  model_used: string;
  language: string;
}): Promise<string> {
  await ensureSchema();
  const db = getDb();
  const id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO readings (id, user_id, spread_type, question, cards, model_used, language) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, data.user_id, data.spread_type, data.question || null, JSON.stringify(data.cards), data.model_used, data.language],
  });
  return id;
}

export async function getReading(id: string, userId: string): Promise<ReadingRow | undefined> {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM readings WHERE id = ? AND user_id = ?', args: [id, userId] });
  return result.rows[0] as unknown as ReadingRow | undefined;
}

export async function updateReadingInterpretation(id: string, interpretation: string): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.execute({ sql: 'UPDATE readings SET interpretation = ? WHERE id = ?', args: [interpretation, id] });
}

export async function getRecentReadings(userId: string, limit = 10): Promise<ReadingRow[]> {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM readings WHERE user_id = ? ORDER BY created_at DESC LIMIT ?', args: [userId, limit] });
  return result.rows as unknown as ReadingRow[];
}

export async function deleteReading(id: string, userId: string): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.execute({ sql: 'DELETE FROM readings WHERE id = ? AND user_id = ?', args: [id, userId] });
}

export async function getReadingByShareToken(token: string): Promise<ReadingRow | undefined> {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM readings WHERE share_token = ?', args: [token] });
  return result.rows[0] as unknown as ReadingRow | undefined;
}

export async function setShareToken(readingId: string, userId: string, token: string): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.execute({ sql: 'UPDATE readings SET share_token = ? WHERE id = ? AND user_id = ?', args: [token, readingId, userId] });
}

// ── Follow-ups ──

export interface FollowUpRow {
  id: string;
  reading_id: string;
  role: string;
  content: string;
  tokens_used: number;
  created_at: string;
}

export async function createFollowUp(data: { reading_id: string; role: string; content: string }): Promise<void> {
  await ensureSchema();
  const db = getDb();
  const id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO follow_ups (id, reading_id, role, content) VALUES (?, ?, ?, ?)`,
    args: [id, data.reading_id, data.role, data.content],
  });
}

export async function getFollowUps(readingId: string): Promise<FollowUpRow[]> {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM follow_ups WHERE reading_id = ? ORDER BY created_at ASC', args: [readingId] });
  return result.rows as unknown as FollowUpRow[];
}

export async function countUserFollowUps(readingId: string): Promise<number> {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({ sql: "SELECT COUNT(*) as count FROM follow_ups WHERE reading_id = ? AND role = 'user'", args: [readingId] });
  return (result.rows[0] as unknown as { count: number }).count;
}

// ── Usage / Quota ──

export interface UsageRow {
  id: string;
  user_id: string;
  week_start: string;
  single_count: number;
  three_card_count: number;
  celtic_cross_count: number;
}

export async function getUsage(userId: string, weekStart: string): Promise<UsageRow | undefined> {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM usage WHERE user_id = ? AND week_start = ?', args: [userId, weekStart] });
  return result.rows[0] as unknown as UsageRow | undefined;
}

export async function upsertUsage(userId: string, weekStart: string, column: string): Promise<void> {
  await ensureSchema();
  const db = getDb();
  const existing = await getUsage(userId, weekStart);

  if (existing) {
    await db.execute({ sql: `UPDATE usage SET ${column} = ${column} + 1 WHERE id = ?`, args: [existing.id] });
  } else {
    const id = crypto.randomUUID();
    await db.execute({
      sql: `INSERT INTO usage (id, user_id, week_start, ${column}) VALUES (?, ?, ?, 1)`,
      args: [id, userId, weekStart],
    });
  }
}

// ── Reading Feedback ──

export async function submitReadingFeedback(readingId: string, helpful: boolean): Promise<void> {
  await ensureSchema();
  const db = getDb();
  const id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO reading_feedback (id, reading_id, helpful, source) VALUES (?, ?, ?, 'authenticated')`,
    args: [id, readingId, helpful ? 1 : 0],
  });
  await db.execute({
    sql: `UPDATE readings SET feedback = ? WHERE id = ?`,
    args: [helpful ? 1 : 0, readingId],
  });
}

export async function submitAnonymousFeedback(helpful: boolean): Promise<void> {
  await ensureSchema();
  const db = getDb();
  const id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO reading_feedback (id, helpful, source) VALUES (?, ?, 'anonymous')`,
    args: [id, helpful ? 1 : 0],
  });
}

// ── Waitlist ──

export async function addToWaitlist(email: string): Promise<boolean> {
  await ensureSchema();
  const db = getDb();
  try {
    const id = crypto.randomUUID();
    await db.execute({ sql: 'INSERT INTO waitlist (id, email) VALUES (?, ?)', args: [id, email.toLowerCase().trim()] });
    return true;
  } catch {
    return true;
  }
}

// ── Stripe profile helpers ──

export async function getProfileByStripeCustomer(customerId: string): Promise<Profile | undefined> {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM profiles WHERE stripe_customer_id = ?', args: [customerId] });
  return result.rows[0] as unknown as Profile | undefined;
}

export async function getProfileByStripeSubscription(subscriptionId: string): Promise<Profile | undefined> {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM profiles WHERE stripe_subscription_id = ?', args: [subscriptionId] });
  return result.rows[0] as unknown as Profile | undefined;
}

export async function updateProfileByStripeCustomer(customerId: string, data: Partial<Pick<Profile, 'tier' | 'stripe_subscription_id'>>): Promise<void> {
  await ensureSchema();
  const db = getDb();
  const fields: string[] = [];
  const values: (string | null | undefined)[] = [];

  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = ?`);
    values.push(value as string | null | undefined);
  }

  fields.push("updated_at = datetime('now')");
  values.push(customerId);

  await db.execute({ sql: `UPDATE profiles SET ${fields.join(', ')} WHERE stripe_customer_id = ?`, args: values as (string | null)[] });
}

export async function updateProfileByStripeSubscription(subscriptionId: string, data: Partial<Pick<Profile, 'tier' | 'stripe_subscription_id'>>): Promise<void> {
  await ensureSchema();
  const db = getDb();
  const fields: string[] = [];
  const values: (string | null | undefined)[] = [];

  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = ?`);
    values.push(value as string | null | undefined);
  }

  fields.push("updated_at = datetime('now')");
  values.push(subscriptionId);

  await db.execute({ sql: `UPDATE profiles SET ${fields.join(', ')} WHERE stripe_subscription_id = ?`, args: values as (string | null)[] });
}
