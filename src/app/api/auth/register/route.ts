import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';
import { buildAuthUser, createSessionToken } from '@/lib/auth/session';
import { randomInt } from 'crypto';
import { sendOtpEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email, phone, password, type, realName, specialty } = body;

    // Validate required fields
    if (!email || !password || !phone) {
      return NextResponse.json(
        { error: 'الإيميل وكلمة المرور ورقم الموبايل مطلوبين' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'كلمة المرور لازم تكون 6 أحرف على الأقل' },
        { status: 400 }
      );
    }

    if (type === 'user' && !username) {
      return NextResponse.json(
        { error: 'اسم المستخدم مطلوب' },
        { status: 400 }
      );
    }

    if (type === 'doctor' && (!realName || !specialty)) {
      return NextResponse.json(
        { error: 'الاسم والتخصص مطلوبين للأطباء' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'الإيميل مسجل بالفعل، سجل دخول بدل كده' },
        { status: 400 }
      );
    }

    // Check existing username
    if (username) {
      const existingUsername = await db.profile.findUnique({ where: { username } });
      if (existingUsername) {
        return NextResponse.json(
          { error: 'اسم المستخدم ده مأخوذ، جرب اسم تاني' },
          { status: 400 }
        );
      }
    }

    const role = type === 'doctor' ? 'doctor' : 'user';

    // Hash the password
    const passwordHash = await hash(password, 12);

    // Generate OTP code (6 digits)
    const otpCode = String(randomInt(100000, 999999));
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user + profile in our database
    const user = await db.user.create({
      data: {
        email,
        phone,
        passwordHash,
        role,
        emailVerified: false,
        otpCode,
        otpExpiresAt,
        profile: {
          create: {
            username: type === 'user' ? username : null,
            realName: type === 'doctor' ? realName : username || 'مستخدم',
            specialty: type === 'doctor' ? specialty : null,
          },
        },
      },
      include: { profile: true },
    });

    const authUser = buildAuthUser(user);

    // Create session token
    const token = await createSessionToken(authUser);

    // Build response
    const response = NextResponse.json({
      message: 'تم إنشاء الحساب! افحص إيميلك للرمز التأكيدي.',
      user: authUser,
      needsVerification: true,
      email: user.email,
    });

    // Set auth cookie
    response.cookies.set('wesal-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Send OTP email via Supabase Edge Function (with fallback)
    const emailResult = await sendOtpEmail(email, otpCode);

    if (!emailResult.success) {
      console.error(`[AUTH] Failed to send registration OTP to ${email} via ${emailResult.method}: ${emailResult.error}`);
    }

    console.log(`[AUTH] Registration OTP for ${email}: ${otpCode} (sent via: ${emailResult.method})`);

    // Include delivery method info in response
    response.headers.set('X-Email-Method', emailResult.method);

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'حصل خطأ في إنشاء الحساب، جرب تاني' },
      { status: 500 }
    );
  }
}
