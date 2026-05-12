import { SignJWT, jwtVerify } from 'jose';
import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

const AUTH_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || (() => { throw new Error('AUTH_SECRET environment variable must be set'); })()
);

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  username?: string | null;
  realName: string;
  badge: string;
  reputationScore: number;
  specialty?: string | null;
  avatarUrl?: string | null;
}

function getUserBadge(role: string, reputationTier?: string): string {
  if (role === 'doctor') return 'local_hospital';
  if (role === 'trusted') return 'workspace_premium';
  if (role === 'admin') return 'shield';
  if (reputationTier === 'notable') return 'stars';
  if (reputationTier === 'active') return 'menu_book';
  return 'eco';
}

/**
 * Create a JWT session token for a user
 */
export async function createSessionToken(user: AuthUser): Promise<string> {
  const token = await new SignJWT({
    userId: user.userId,
    email: user.email,
    role: user.role,
    username: user.username || '',
    realName: user.realName,
    badge: user.badge,
    reputationScore: user.reputationScore,
    specialty: user.specialty || '',
    avatarUrl: user.avatarUrl || '',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 days
    .sign(AUTH_SECRET);

  return token;
}

/**
 * Verify a JWT session token and return the user data
 */
export async function verifySessionToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, AUTH_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
      username: (payload.username as string) || null,
      realName: (payload.realName as string) || '',
      badge: (payload.badge as string) || 'eco',
      reputationScore: (payload.reputationScore as number) || 0,
      specialty: (payload.specialty as string) || null,
      avatarUrl: (payload.avatarUrl as string) || null,
    };
  } catch {
    return null;
  }
}

/**
 * Get session token from request cookies
 */
function getTokenFromRequest(req: Request | NextRequest): string | null {
  // Try cookie header
  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.split(';').find(c => c.trim().startsWith('wesal-session='));
    if (match) {
      const eqIndex = match.indexOf('=');
      return match.substring(eqIndex + 1).trim() || null;
    }
  }

  // For NextRequest, try cookies.get
  if ('cookies' in req) {
    try {
      const cookie = (req as NextRequest).cookies.get('wesal-session');
      if (cookie) return cookie.value;
    } catch {
      // Ignore
    }
  }

  return null;
}

/**
 * Get current user from JWT cookie in a Request object
 * Use this in API routes: const user = await getCurrentUser(request);
 */
export async function getCurrentUser(req?: Request | NextRequest): Promise<AuthUser | null> {
  if (!req) return null;

  try {
    const token = getTokenFromRequest(req);
    if (!token) return null;

    const authUser = await verifySessionToken(token);
    if (!authUser) return null;

    // Verify user still exists and is not disabled
    const dbUser = await db.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, disabled: true },
    });

    if (!dbUser || dbUser.disabled) return null;

    return authUser;
  } catch {
    return null;
  }
}

/**
 * Get current user with full Prisma data from JWT cookie in a Request object
 * Returns the raw Prisma user object with profile included
 */
export async function getUserFromSession(req?: Request | NextRequest) {
  if (!req) return null;

  try {
    const token = getTokenFromRequest(req);
    if (!token) return null;

    const authUser = await verifySessionToken(token);
    if (!authUser) return null;

    const user = await db.user.findUnique({
      where: { id: authUser.userId },
      include: { profile: true },
    });

    if (!user || user.disabled) return null;

    return user;
  } catch {
    return null;
  }
}

/**
 * Build AuthUser from database user record
 */
export function buildAuthUser(user: {
  id: string;
  email: string;
  role: string;
  profile?: {
    username?: string | null;
    realName: string;
    reputationScore: number;
    reputationTier?: string;
    specialty?: string | null;
    avatarUrl?: string | null;
  } | null;
}): AuthUser {
  const badge = getUserBadge(user.role, user.profile?.reputationTier);
  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    username: user.profile?.username || null,
    realName: user.profile?.realName || '',
    badge,
    reputationScore: user.profile?.reputationScore || 0,
    specialty: user.profile?.specialty || null,
    avatarUrl: user.profile?.avatarUrl || null,
  };
}

export { getUserBadge };
