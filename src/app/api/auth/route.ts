import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, createServerSupabase } from '@/lib/supabase-server';
import { supabase } from '@/lib/supabase';

// ─── GET /api/auth/profile — جلب بيانات المستخدم الحالي ───
export async function GET(request: NextRequest) {
  try {
    const { user, response: authError } = await requireAuth(request);
    if (authError) return authError;
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    // نبحث عن الـ profile في جدول users باستخدام auth.uid()
    // لأننا عملنا users.id = auth.users.id
    const { data: profile, error } = await supabase!
      .from('users')
      .select('*')
      .eq('id', user!.id)
      .single();

    if (error || !profile) {
      // لو الـ profile مش موجود، نعمل واحد جديد
      const anonId = 'مسافر #' + Math.floor(Math.random() * 9000 + 1000);
      const colors = [
        'bg-teal-100 text-teal-700',
        'bg-purple-100 text-purple-700',
        'bg-amber-100 text-amber-700',
        'bg-rose-100 text-rose-700',
        'bg-blue-100 text-blue-700',
      ];
      const avatarColor = colors[Math.floor(Math.random() * colors.length)];

      const { data: newProfile, error: insertError } = await supabase!
        .from('users')
        .upsert({
          id: user!.id,
          anon_id: anonId,
          phone_hash: 'auto',
          nickname: user!.user_metadata?.nickname || anonId,
          avatar_color: avatarColor,
          user_type: 'patient',
          reputation_score: 0,
          tier: 'new',
          streak_days: 0,
        })
        .select()
        .single();

      if (insertError || !newProfile) {
        return NextResponse.json({ error: 'حصل خطأ أثناء جلب البيانات' }, { status: 500 });
      }

      return NextResponse.json({
        userId: newProfile.id,
        anonId: newProfile.anon_id,
        nickname: newProfile.nickname,
        role: newProfile.user_type as string,
        avatarColor: newProfile.avatar_color,
        trackerEnabled: newProfile.tracker_enabled || false,
        tier: newProfile.tier,
        streakDays: newProfile.streak_days || 0,
        reputationScore: newProfile.reputation_score || 0,
      });
    }

    return NextResponse.json({
      userId: profile.id,
      anonId: profile.anon_id,
      nickname: profile.nickname,
      role: profile.user_type as string,
      avatarColor: profile.avatar_color,
      trackerEnabled: profile.tracker_enabled || false,
      tier: profile.tier,
      streakDays: profile.streak_days || 0,
      reputationScore: profile.reputation_score || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 });
  }
}

// ─── PATCH /api/auth/profile — تحديث بيانات المستخدم ───
export async function PATCH(request: NextRequest) {
  try {
    const { user, response: authError } = await requireAuth(request);
    if (authError) return authError;
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const body = await request.json();
    const { nickname, avatar_color } = body;

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (nickname) updateData.nickname = nickname;
    if (avatar_color) updateData.avatar_color = avatar_color;

    const { data: updated, error } = await supabase!
      .from('users')
      .update(updateData)
      .eq('id', user!.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'حصل خطأ أثناء التحديث' }, { status: 500 });
    }

    return NextResponse.json({
      userId: updated.id,
      anonId: updated.anon_id,
      nickname: updated.nickname,
      role: updated.user_type,
      avatarColor: updated.avatar_color,
      trackerEnabled: updated.tracker_enabled || false,
      tier: updated.tier,
      streakDays: updated.streak_days || 0,
      reputationScore: updated.reputation_score || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 });
  }
}

// ─── POST /api/auth — إرسال OTP (حتى لو المستخدم مبعتش من الـ Client) ───
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 });
    }

    const { phone, nickname } = await request.json();

    if (!phone || phone.length < 10) {
      return NextResponse.json({ success: false, error: 'رقم الموبايل مطلوب' }, { status: 400 });
    }

    // نستخدم Supabase Auth Client — ده اللي بيبعت الـ SMS فعلاً
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: '+20' + phone.replace(/\s/g, ''),
      options: {
        data: nickname ? { nickname } : {},
      },
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'تم إرسال كود التأكيد على الموبايل',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'خطأ في السيرفر' }, { status: 500 });
  }
}
