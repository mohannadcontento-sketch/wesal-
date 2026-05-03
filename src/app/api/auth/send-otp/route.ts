import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomInt } from 'crypto';
import { sendOtpEmail } from '@/lib/email';

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

    // Send OTP email via Supabase Edge Function (with fallback)
    const emailResult = await sendOtpEmail(email, otpCode);

    if (!emailResult.success) {
      console.error(`[AUTH] Failed to send OTP email to ${email} via ${emailResult.method}: ${emailResult.error}`);
      // Still return success — the OTP is stored in DB and logged
      // This prevents locking users out if email service is temporarily down
    }

    console.log(`[AUTH] OTP for ${email}: ${otpCode} (sent via: ${emailResult.method})`);

    return NextResponse.json({
      message: 'تم إرسال رمز جديد لإيميلك',
      // In development or console-fallback mode, return OTP for testing
      ...(emailResult.method === 'console-fallback' && { devOtp: otpCode }),
      deliveryMethod: emailResult.method,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'حصل خطأ في إرسال الرمز' },
      { status: 500 }
    );
  }
}
