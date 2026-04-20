import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ stats: null, message: 'Supabase not configured' });
    }

    const [
      { count: totalUsers },
      { count: totalPosts },
      { count: pendingReports },
      { count: todayConsultations },
    ] = await Promise.all([
      supabase!.from('users').select('id', { count: 'exact', head: true }),
      supabase!.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase!.from('safety_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase!.from('consultations').select('id', { count: 'exact', head: true }).in('status', ['pending', 'confirmed']),
    ]);

    // Active trackers
    const { count: activeTrackers } = await supabase!
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('tracker_enabled', true);

    // Role distribution
    const { data: roleDist } = await supabase!
      .from('users')
      .select('user_type');

    const roleCounts: Record<string, number> = {};
    (roleDist || []).forEach((u: any) => {
      roleCounts[u.user_type] = (roleCounts[u.user_type] || 0) + 1;
    });

    // Daily follow-ups active
    const { count: dailyFollowUps } = await supabase!
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('daily_follow_up', true);

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalPosts: totalPosts || 0,
        pendingReports: pendingReports || 0,
        todayConsultations: todayConsultations || 0,
        activeTrackers: activeTrackers || 0,
        dailyFollowUps: dailyFollowUps || 0,
        roleDistribution: roleCounts,
      }
    });
  } catch (error) {
    return NextResponse.json({ stats: null }, { status: 500 });
  }
}
