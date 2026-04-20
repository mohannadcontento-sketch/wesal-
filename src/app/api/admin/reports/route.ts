import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ reports: [], message: 'Supabase not configured' });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    let query = supabase!
      .from('safety_reports')
      .select(`
        id, content_type, content_id, reason, risk_score, status,
        action_taken, created_at, reviewed_at,
        reporter:reporter_id (anon_id, nickname),
        target:target_user_id (anon_id, nickname)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: reports, error } = await query;

    if (error) {
      return NextResponse.json({ reports: [], error: error.message }, { status: 500 });
    }

    // Get content for each report
    const formattedReports = await Promise.all((reports || []).map(async (r: any) => {
      let content = '';
      if (r.content_type === 'post' && r.content_id) {
        const { data: post } = await supabase!.from('posts').select('content').eq('id', r.content_id).single();
        content = post?.content || '';
      } else if (r.content_type === 'comment' && r.content_id) {
        const { data: comment } = await supabase!.from('comments').select('content').eq('id', r.content_id).single();
        content = comment?.content || '';
      }

      return {
        id: r.id,
        contentType: r.content_type,
        contentId: r.content_id,
        content,
        reason: r.reason,
        riskScore: r.risk_score || 0,
        status: r.status,
        actionTaken: r.action_taken,
        reporter: (r.reporter as any)?.[0]?.anon_id || (r.reporter as any)?.[0]?.nickname || 'مجهول',
        targetAnonId: (r.target as any)?.[0]?.anon_id || (r.target as any)?.[0]?.nickname || 'غير محدد',
        date: new Date(r.created_at).toISOString().split('T')[0],
        reviewedAt: r.reviewed_at ? new Date(r.reviewed_at).toISOString().split('T')[0] : null,
      };
    }));

    return NextResponse.json({ reports: formattedReports });
  } catch (error) {
    return NextResponse.json({ reports: [] }, { status: 500 });
  }
}

// PATCH /api/admin/reports — Update report status
export async function PATCH(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 });
    }

    const { reportId, status, actionTaken, reviewerId } = await request.json();

    if (!reportId || !status) {
      return NextResponse.json({ success: false, error: 'reportId and status required' }, { status: 400 });
    }

    const { error } = await supabase!
      .from('safety_reports')
      .update({
        status,
        action_taken: actionTaken || null,
        reviewer_id: reviewerId || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', reportId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // If approved/escalated, also remove the content
    if (status === 'approved' || status === 'escalated' || status === 'emergency') {
      // Content removal handled by admin decision
    }

    return NextResponse.json({ success: true, message: 'تم تحديث البلاغ' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'خطأ في السيرفر' }, { status: 500 });
  }
}
