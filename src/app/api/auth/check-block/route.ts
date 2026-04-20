import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

// ─── POST /api/auth/check-block — التحقق من حظر المستخدم ───
// يستخدم عند التسجيل (للتحقق من الموبايل والإيميل)
// وعند الدخول (للتحقق من user_id)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase(request);
    const body = await request.json();
    const { phone, email, user_id } = body;

    // 1. تحقق من user_id مباشرة (لحالة تسجيل الدخول)
    if (user_id) {
      const { data: userById, error } = await supabase
        .from('users')
        .select('id, is_banned, phone, email')
        .eq('id', user_id)
        .single();

      if (error) {
        return NextResponse.json({ blocked: false }, { status: 200 });
      }

      if (userById?.is_banned) {
        return NextResponse.json({
          blocked: true,
          reason: 'الحساب محظور',
          method: 'account',
        });
      }

      return NextResponse.json({ blocked: false });
    }

    // 2. تحقق من الموبايل (لحالة التسجيل — لو الموبايل محظور سابقاً)
    if (phone) {
      const { data: userByPhone } = await supabase
        .from('users')
        .select('id, is_banned, email')
        .eq('phone', phone)
        .single();

      if (userByPhone?.is_banned) {
        return NextResponse.json({
          blocked: true,
          reason: 'رقم الموبايل ده تابع لحساب محظور',
          method: 'phone',
        });
      }
    }

    // 3. تحقق من الإيميل (لحالة التسجيل)
    if (email) {
      const { data: userByEmail } = await supabase
        .from('users')
        .select('id, is_banned, phone')
        .eq('email', email)
        .single();

      if (userByEmail?.is_banned) {
        return NextResponse.json({
          blocked: true,
          reason: 'البريد الإلكتروني ده تابع لحساب محظور',
          method: 'email',
        });
      }
    }

    return NextResponse.json({ blocked: false });
  } catch (error) {
    // في حالة أي خطأ، نفترض إنه مش محظور (علشان ما نمنعش حد بالغلط)
    return NextResponse.json({ blocked: false }, { status: 200 });
  }
}
