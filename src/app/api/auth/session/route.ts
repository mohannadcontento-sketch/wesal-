import { NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { buildAuthUser } from '@/lib/auth/session';

export async function GET(req: Request) {
  try {
    // Get session token from cookie
    const token = req.headers.get('cookie')
      ?.split(';')
      .find(c => c.trim().startsWith('wesal-session='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Verify the JWT token
    const authUser = await verifySessionToken(token);
    if (!authUser) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Double-check user still exists and is not disabled
    const dbUser = await db.user.findUnique({
      where: { id: authUser.userId },
      include: { profile: true },
    });

    if (!dbUser || dbUser.disabled) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Return fresh user data from database
    const freshUser = buildAuthUser(dbUser);

    return NextResponse.json({ user: freshUser });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
