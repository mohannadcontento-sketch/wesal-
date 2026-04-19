import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ─── POST /api/tracker — تسجيل مزاج جديد ───
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 });
    }

    const { userId, moodScore, moodEmoji, journalText } = await request.json();

    if (!userId || !moodScore) {
      return NextResponse.json({ success: false, error: 'البيانات مطلوبة' }, { status: 400 });
    }

    const { data: log, error } = await supabase!
      .from('tracker_logs')
      .insert({
        user_id: userId,
        mood_score: Math.min(10, Math.max(1, moodScore)),
        mood_emoji: moodEmoji || null,
        journal_text: journalText || null,
        risk_level: 'low',
      })
      .select('id, mood_score, mood_emoji, journal_text, created_at')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: 'حصل خطأ أثناء التسجيل' }, { status: 500 });
    }

    return NextResponse.json({ success: true, log });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'خطأ في السيرفر' }, { status: 500 });
  }
}

// ─── GET /api/tracker?userId=xxx — جلب سجل المزاج ───
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ logs: [], streak: 0 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '7');

    if (!userId) {
      return NextResponse.json({ logs: [], streak: 0, error: 'userId required' }, { status: 400 });
    }

    // جلب سجل المزاج للأيام الأخيرة
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data: logs, error } = await supabase!
      .from('tracker_logs')
      .select('id, mood_score, mood_emoji, journal_text, ai_analysis, risk_level, created_at')
      .eq('user_id', userId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });

    // جلب streak
    const { data: user } = await supabase!
      .from('users')
      .select('streak_days')
      .eq('id', userId)
      .single();

    return NextResponse.json({
      logs: logs || [],
      streak: user?.streak_days || 0,
    });
  } catch (error) {
    return NextResponse.json({ logs: [], streak: 0 }, { status: 500 });
  }
}
