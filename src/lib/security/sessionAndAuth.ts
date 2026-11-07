import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const OWNER_COOKIE_NAME = 'atelier_owner_session';
const HMAC_SECRET =
  process.env.ATELIER_SESSION_SECRET || 'atelier-epistemic-engine-default-hmac-key-2026';

function signOwnerToken(ownerId: string): string {
  const sig = crypto.createHmac('sha256', HMAC_SECRET).update(ownerId).digest('hex').slice(0, 24);
  return `${ownerId}.${sig}`;
}

function verifyOwnerToken(token: string): string | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [ownerId, sig] = parts;
  const expected = crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(ownerId)
    .digest('hex')
    .slice(0, 24);
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return ownerId;
}

export function resolveRequestOwnerId(req: NextRequest): {
  ownerId: string;
  signedToken: string;
  isNewSession: boolean;
} {
  // 1. Check signed cookie
  const cookieVal = req.cookies.get(OWNER_COOKIE_NAME)?.value;
  if (cookieVal) {
    const verified = verifyOwnerToken(cookieVal);
    if (verified) {
      return { ownerId: verified, signedToken: cookieVal, isNewSession: false };
    }
  }

  // 2. Check explicit header token
  const headerToken = req.headers.get('x-atelier-owner-token');
  if (headerToken) {
    const verified = verifyOwnerToken(headerToken);
    if (verified) {
      return { ownerId: verified, signedToken: headerToken, isNewSession: false };
    }
  }

  // 3. Issue a new cryptographically random owner session ID
  const newOwnerId = `usr_${crypto.randomBytes(10).toString('hex')}`;
  const signedToken = signOwnerToken(newOwnerId);
  return { ownerId: newOwnerId, signedToken, isNewSession: true };
}

export function attachOwnerSessionCookie(
  res: NextResponse,
  signedToken: string
): NextResponse {
  res.cookies.set({
    name: OWNER_COOKIE_NAME,
    value: signedToken,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}

/**
 * Multi-endpoint Rate Limiter with standard HTTP rate-limit headers
 */
const buckets = new Map<string, number[]>();

export function checkEndpointRateLimit(
  req: NextRequest,
  bucketName: string,
  maxPerMinute = 30
): {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
  headers: Record<string, string>;
} {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'local-client';
  const key = `${bucketName}:${ip}`;
  const now = Date.now();
  const windowMs = 60_000;

  const recent = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  const allowed = recent.length < maxPerMinute;
  if (allowed) {
    recent.push(now);
    buckets.set(key, recent);
  }

  const remaining = Math.max(0, maxPerMinute - recent.length);
  const oldest = recent[0] || now;
  const resetSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));

  return {
    allowed,
    remaining,
    resetSeconds,
    headers: {
      'X-RateLimit-Limit': String(maxPerMinute),
      'X-RateLimit-Remaining': String(remaining),
      'X-RateLimit-Reset': String(resetSeconds),
    },
  };
}
