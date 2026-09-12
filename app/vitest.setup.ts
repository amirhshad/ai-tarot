/**
 * Node 18 does not expose `crypto` as a global inside Vitest's VM context, but
 * the browser does and `cryptoShuffle` is client-side code that relies on it.
 * Polyfill rather than changing the source to import from node:crypto.
 */
import { webcrypto } from 'node:crypto';

if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
}
