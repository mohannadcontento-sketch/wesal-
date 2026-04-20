import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ users: [], message: 'Supabase not configured' });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';

    let query = supabase!
      .from('users')
      .select(`
        id, anon_id, nickname, avatar_color, user_type, tier,
        reputation_score, streak_days, is_active, tracker_enabled,
        daily_follow_up, supervisor_id, is_banned, last_active, created_at
      `)
      .order('created_at', { ascending: false });

    if (role !== 'all') {
      query = query.eq('user_type', role);
    }

    if (search) {
      query = query.or(`anon_id.ilike.%${search}%,nickname.ilike.%${search}%`);
    }

    const { data: users, error } = await query;

    if (error) {
      return NextResponse.json({ users: [], error: error.message }, { status: 500 });
    }

    // Get posts count for each user
    const userIds = (users || []).map(u => u.id);
    let postsCounts: Record<string, number> = {};
    if (userIds.length > 0) {
      const { data: postsCount } = await supabase!
        .from('posts')
        .select('user_id')
        .in('user_id', userIds);
      postsCounts = (postsCount || []).reduce((acc: Record<string, number>, p: any) => {
        acc[p.user_id] = (acc[p.user_id] || 0) + 1;
        return acc;
      }, {});
    }

    // Get supervisor names
    const supervisorIds = [...new Set((users || []).filter(u => u.supervisor_id).map(u => u.supervisor_id!))];
    let supervisorNames: Record<string, string> = {};
    if (supervisorIds.length > 0) {
      const { data: supervisors } = await supabase!
        .from('users')
        .select('id, anon_id, nickname')
        .in('id', supervisorIds);
      supervisorNames = (supervisors || []).reduce((acc: Record<string, string>, s: any) => {
        acc[s.id] = s.nickname || s.anon_id;
        return acc;
      }, {});
    }

    // Get latest mood for tracker users
    const trackerUserIds = (users || []).filter(u => u.tracker_enabled).map(u => u.id);
    let latestMoods: Record<string, number> = {};
    if (trackerUserIds.length > 0) {
      const { data: moodLogs } = await supabase!
        .from('tracker_logs')
        .select('user_id, mood_score, created_at')
        .in('user_id', trackerUserIds)
        .order('created_at', { ascending: false });

      // Get latest mood per user
      const seen = new Set<string>();
      for (const log of (moodLogs || [])) {
        if (!seen.has(log.user_id)) {
          latestMoods[log.user_id] = log.mood_score;
          seen.add(log.user_id);
        }
      }
    }

    const formattedUsers = (users || []).map(u => ({
      id: u.id,
      anonId: u.anon_id,
      nickname: u.nickname || u.anon_id,
      role: u.user_type,
      tier: u.tier,
      trackerEnabled: u.tracker_enabled || false,
      dailyFollowUp: u.daily_follow_up || false,
      supervisor: u.supervisor_id ? (supervisorNames[u.supervisor_id] || 'غير محدد') : null,
      supervisorId: u.supervisor_id || null,
      streakDays: u.streak_days || 0,
      reputation: Math.round(u.reputation_score || 0),
      postsCount: postsCounts[u.id] || 0,
      joinDate: new Date(u.created_at).toISOString().split('T')[0],
      moodScore: latestMoods[u.id] || undefined,
      isBanned: u.is_banned || false,
      isActive: u.is_active !== false,
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    return NextResponse.json({ users: [] }, { status: 500 });
  }
}

// PATCH /api/admin/users — Update user (role, tracker, daily follow-up, supervisor, ban)
export async function PATCH(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { userId, updates } = body; // updates: { user_type?, tracker_enabled?, daily_follow_up?, supervisor_id?, is_banned?, is_active? }

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
    }

    const { error } = await supabase!
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'تم التحديث بنجاح' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'خطأ في السيرفر' }, { status: 500 });
  }
}
