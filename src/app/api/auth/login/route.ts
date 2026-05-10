import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { db } from '@/lib/db';
import { buildAuthUser, createSessionToken } from '@/lib/auth/session';

// In-memory rate limit for login attempts (per email)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'الإيميل وكلمة المرور مطلوبين' },
        { status: 400 }
      );
    }

    // Rate limiting check
    const normalizedEmail = email.toLowerCase().trim();
    const now = Date.now();
    const attempts = loginAttempts.get(normalizedEmail);
    if (attempts) {
      if (now - attempts.lastAttempt > LOGIN_WINDOW_MS) {
        loginAttempts.delete(normalizedEmail);
      } else if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
        const waitMinutes = Math.ceil((LOGIN_WINDOW_MS - (now - attempts.lastAttempt)) / 60000);
        return NextResponse.json(
          { error: `محاولات كتير. استنى ${waitMinutes} دقيقة وبعدين جرب` },
          { status: 429 }
        );
      }
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      include: { profile: true },
    });

    if (!user) {
      // Record failed attempt
      const existing = loginAttempts.get(normalizedEmail) || { count: 0, lastAttempt: now };
      loginAttempts.set(normalizedEmail, { count: existing.count + 1, lastAttempt: now });
      return NextResponse.json(
        { error: 'الإيميل أو كلمة المرور غلط' },
        { status: 401 }
      );
    }

    if (user.disabled) {
      return NextResponse.json(
        { error: 'الحساب ده معطل، تواصل مع الدعم' },
        { status: 403 }
      );
    }

    // Verify password
    const passwordMatch = await compare(password, user.passwordHash);
    if (!passwordMatch) {
      const existing = loginAttempts.get(normalizedEmail) || { count: 0, lastAttempt: now };
      loginAttempts.set(normalizedEmail, { count: existing.count + 1, lastAttempt: now });
      return NextResponse.json(
        { error: 'الإيميل أو كلمة المرور غلط' },
        { status: 401 }
      );
    }

    // Clear attempts on successful login
    loginAttempts.delete(normalizedEmail);

    const authUser = buildAuthUser(user);

    // Create session token
    const token = await createSessionToken(authUser);

    // Build the response with user data
    const response = NextResponse.json({
      user: authUser,
    });

    // Set auth cookie
    response.cookies.set('wesal-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'حصل خطأ في تسجيل الدخول، جرب تاني' },
      { status: 500 }
    );
  }
}
