import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL = process.env.JWT_SECRET;

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = ORIGINAL;
  vi.resetModules();
});

describe('JWT secret', () => {
  it('does not throw at import when JWT_SECRET is unset', async () => {
    delete process.env.JWT_SECRET;
    vi.resetModules();
    await expect(import('./auth')).resolves.toMatchObject({
      createToken: expect.any(Function),
      verifyToken: expect.any(Function),
    });
  });

  it('refuses to sign a token when JWT_SECRET is unset', async () => {
    delete process.env.JWT_SECRET;
    vi.resetModules();
    const { createToken } = await import('./auth');
    expect(() => createToken({ id: 'user-1', email: 'a@example.com' })).toThrow(
      'JWT_SECRET environment variable is required',
    );
  });

  it('signs and verifies with the configured secret', async () => {
    process.env.JWT_SECRET = 'test-secret-not-for-production';
    vi.resetModules();
    const { createToken, verifyToken } = await import('./auth');
    const token = createToken({ id: 'user-1', email: 'a@example.com' });
    expect(verifyToken(token)).toEqual({ id: 'user-1', email: 'a@example.com' });
  });

  it('does not accept a token when the secret is missing', async () => {
    process.env.JWT_SECRET = 'test-secret-not-for-production';
    vi.resetModules();
    const { createToken } = await import('./auth');
    const token = createToken({ id: 'user-1', email: 'a@example.com' });

    delete process.env.JWT_SECRET;
    vi.resetModules();
    const { verifyToken } = await import('./auth');
    expect(() => verifyToken(token)).toThrow('JWT_SECRET environment variable is required');
  });
});
