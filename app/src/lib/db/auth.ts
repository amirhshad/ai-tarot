import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getDb, ensureSchema } from './sqlite';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is required');
  return secret;
}
const JWT_SECRET = getJwtSecret();
const COOKIE_NAME = 'tarot_session';
const TOKEN_EXPIRY = '7d';

export interface AuthUser {
  id: string;
  email: string;
}

// ── Password helpers ──

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

// ── JWT helpers ──

export function createToken(user: AuthUser): string {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser;
    return { id: payload.id, email: payload.email };
  } catch {
    return null;
  }
}

// ── Cookie helpers ──

export async function setSessionCookie(user: AuthUser): Promise<void> {
  const token = createToken(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// ── User CRUD ──

export async function createUser(email: string, password: string, displayName?: string): Promise<AuthUser> {
  await ensureSchema();
  const db = getDb();
  const id = crypto.randomUUID();
  const passwordHash = hashPassword(password);

  await db.execute({
    sql: `INSERT INTO profiles (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)`,
    args: [id, email.toLowerCase().trim(), passwordHash, displayName || null],
  });

  return { id, email: email.toLowerCase().trim() };
}

export async function findUserByEmail(email: string) {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT id, email, password_hash, auth_provider FROM profiles WHERE email = ?`,
    args: [email.toLowerCase().trim()],
  });
  return result.rows[0] as unknown as { id: string; email: string; password_hash: string; auth_provider: string | null } | undefined;
}

export async function findUserById(id: string) {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT id, email FROM profiles WHERE id = ?`,
    args: [id],
  });
  return result.rows[0] as unknown as { id: string; email: string } | undefined;
}

// ── Auth flow ──

export async function signUp(email: string, password: string, displayName?: string): Promise<{ user: AuthUser } | { error: string }> {
  const existing = await findUserByEmail(email);
  if (existing) {
    return { error: 'An account with this email already exists' };
  }
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' };
  }
  const user = await createUser(email, password, displayName);
  return { user };
}

export async function signIn(email: string, password: string): Promise<{ user: AuthUser } | { error: string }> {
  const found = await findUserByEmail(email);
  if (!found) {
    return { error: 'Invalid email or password' };
  }
  // OAuth-only accounts cannot sign in with password
  if (found.auth_provider === 'google' && found.password_hash.startsWith('OAUTH:')) {
    return { error: 'This account uses Google sign-in. Please sign in with Google.' };
  }
  if (!verifyPassword(password, found.password_hash)) {
    return { error: 'Invalid email or password' };
  }
  return { user: { id: found.id, email: found.email } };
}
