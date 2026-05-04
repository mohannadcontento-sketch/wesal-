import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buildAuthUser, createSessionToken } from '@/lib/auth/session';
import { randomInt } from 'crypto';
import { sendOtpEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: 'الإيميل والرمز مطلوبين' },
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
        { error: 'الحساب مش موجود' },
        { status: 404 }
      );
    }

    // Check OTP code
    if (!user.otpCode || !user.otpExpiresAt) {
      return NextResponse.json(
        { error: 'مفيش رمز تأكيد مرسل. اطلب رمز جديد.' },
        { status: 400 }
      );
    }

    // Check if OTP expired
    if (new Date() > user.otpExpiresAt) {
      return NextResponse.json(
        { error: 'الرمز انتهى، اطلب رمز جديد' },
        { status: 400 }
      );
    }

    // Check if OTP matches
    if (user.otpCode !== code) {
      return NextResponse.json(
        { error: 'الرمز غلط، جرب تاني' },
        { status: 400 }
      );
    }

    // Mark email as verified and clear OTP
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    const authUser = buildAuthUser(user);

    // Create session token
    const token = await createSessionToken(authUser);

    // Build response
    const response = NextResponse.json({
      message: 'تم تأكيد الإيميل! أهلاً بيك في وصال 🎉',
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
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'حصل خطأ في التحقق، جرب تاني' },
      { status: 500 }
    );
  }
}

// Also handle resend OTP
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'الإيميل مطلوب' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: 'الإيميل مش موجود' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'الإيميل متأكد بالفعل، سجل دخول' },
        { status: 400 }
      );
    }

    // Generate new OTP code
    const otpCode = String(randomInt(100000, 999999));
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpiresAt },
    });

    // Send OTP email via Supabase Edge Function (with fallback)
    const emailResult = await sendOtpEmail(email, otpCode);

    if (!emailResult.success) {
      console.error(`[AUTH] Failed to resend OTP to ${email} via ${emailResult.method}: ${emailResult.error}`);
    }

    console.log(`[AUTH] Resend OTP for ${email}: ${otpCode} (sent via: ${emailResult.method})`);

    return NextResponse.json({
      message: 'تم إرسال رمز جديد لإيميلك',
      ...(emailResult.method === 'console-fallback' && { devOtp: otpCode }),
      deliveryMethod: emailResult.method,
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'حصل خطأ في إرسال الرمز' },
      { status: 500 }
    );
  }
}
