import { createHmac, timingSafeEqual, createHash } from 'node:crypto';

import { cookies } from 'next/headers';

export const CMS_SESSION_COOKIE = 'magnamat_cms';

function sessionSecret(): string | null {
  const s = process.env.CMS_SESSION_SECRET;
  if (!s || s.length < 24) return null;
  return s;
}

function signPayload(payloadB64: string, secret: string): string {
  return createHmac('sha256', secret).update(payloadB64).digest('base64url');
}

export async function createAdminSessionToken(): Promise<string | null> {
  const secret = sessionSecret();
  if (!secret) return null;
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
  const payloadB64 = Buffer.from(JSON.stringify({ v: 1 as const, exp }), 'utf8').toString('base64url');
  const sig = signPayload(payloadB64, secret);
  return `${payloadB64}.${sig}`;
}

export function verifyAdminSessionToken(token: string): boolean {
  const secret = sessionSecret();
  if (!secret) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payloadB64, sig] = parts;
  if (!payloadB64 || !sig) return false;
  const expected = signPayload(payloadB64, secret);
  try {
    if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  } catch {
    return false;
  }
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as { v?: number; exp?: number };
    if (payload.v !== 1 || typeof payload.exp !== 'number') return false;
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

export async function getAdminSession(): Promise<boolean> {
  try {
    const jar = await cookies();
    const v = jar.get(CMS_SESSION_COOKIE)?.value;
    if (!v) return false;
    return verifyAdminSessionToken(v);
  } catch {
    return false;
  }
}

export function adminPasswordConfigured(): boolean {
  const p = process.env.CMS_ADMIN_PASSWORD;
  return typeof p === 'string' && p.length > 0;
}

/** Constant-time compare of UTF-8 passwords via SHA-256 digests (same length). */
export function adminPasswordMatches(input: string): boolean {
  const expected = process.env.CMS_ADMIN_PASSWORD;
  if (!expected) return false;
  const a = createHash('sha256').update(input, 'utf8').digest();
  const b = createHash('sha256').update(expected, 'utf8').digest();
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function setAdminSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(CMS_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/admin',
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearAdminSessionCookie() {
  const jar = await cookies();
  jar.delete({ name: CMS_SESSION_COOKIE, path: '/admin' });
}
