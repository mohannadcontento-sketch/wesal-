import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { db } from '@/lib/db';
import { buildAuthUser, createSessionToken } from '@/lib/auth/session';

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

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
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
      return NextResponse.json(
        { error: 'الإيميل أو كلمة المرور غلط' },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error: 'لازم تأكد إيميلك الأول. افحص إيميلك للرمز التأكيدي.',
          needsVerification: true,
          email: user.email
        },
        { status: 403 }
      );
    }

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
