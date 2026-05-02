import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomInt } from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'الإيميل مطلوب' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: 'الإيميل مش موجود عندنا' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'الإيميل متأكد بالفعل، سجل دخول عادي' },
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

    // TODO: Send OTP email via email service
    // For now, we return the OTP in development
    console.log(`[AUTH] OTP for ${email}: ${otpCode}`);

    return NextResponse.json({
      message: 'تم إرسال رمز جديد لإيميلك',
      // In development, return OTP for testing
      ...(process.env.NODE_ENV === 'development' && { devOtp: otpCode }),
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'حصل خطأ في إرسال الرمز' },
      { status: 500 }
    );
  }
}
