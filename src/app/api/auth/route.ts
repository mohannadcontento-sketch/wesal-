import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { createHash, randomUUID } from 'crypto';

// ─── POST /api/auth/send-otp — إرسال OTP ───
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 });
    }

    const { phone, nickname } = await request.json();

    if (!phone || phone.length < 10) {
      return NextResponse.json({ success: false, error: 'رقم الموبايل مطلوب (١٠ أرقام على الأقل)' }, { status: 400 });
    }

    // تشفير رقم الموبايل
    const phoneHash = createHash('sha256').update(phone + process.env.HASH_SALT || 'wesal-salt').digest('hex');

    // التحقق من هل المستخدم موجود
    const { data: existingUser } = await supabase!
      .from('users')
      .select('id, anon_id')
      .eq('phone_hash', phoneHash)
      .single();

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'تم إرسال كود التأكيد',
        isNewUser: false,
        userId: existingUser.id,
        anonId: existingUser.anon_id,
      });
    }

    // إنشاء مستخدم جديد
    const anonId = 'مسافر #' + Math.floor(Math.random() * 9000 + 1000);
    const colors = ['bg-teal-100 text-teal-700', 'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700', 'bg-blue-100 text-blue-700'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const { data: newUser, error } = await supabase!
      .from('users')
      .insert({
        id: randomUUID(),
        anon_id: anonId,
        phone_hash: phoneHash,
        nickname: nickname || anonId,
        avatar_color: avatarColor,
        user_type: 'patient',
        reputation_score: 0,
        tier: 'new',
      })
      .select('id, anon_id')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: 'حصل خطأ أثناء التسجيل' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء حساب وإرسال كود التأكيد',
      isNewUser: true,
      userId: newUser.id,
      anonId: newUser.anon_id,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'خطأ في السيرفر' }, { status: 500 });
  }
}
