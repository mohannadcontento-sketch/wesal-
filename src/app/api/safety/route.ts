import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ─── POST /api/safety — بلاغ أمان ───
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 });
    }

    const { reporterId, contentType, contentId, targetUserId, reason, riskScore } = await request.json();

    if (!reporterId || !contentType || !reason) {
      return NextResponse.json({ success: false, error: 'البيانات مطلوبة' }, { status: 400 });
    }

    const reportData: Record<string, unknown> = {
      reporter_id: reporterId,
      content_type: contentType,
      content_id: contentId || null,
      target_user_id: targetUserId || null,
      reason,
      risk_score: riskScore || 30,
      status: 'pending',
    };

    // لو الـ risk score عالي → escalate فوري
    if (riskScore >= 70) {
      reportData.status = 'emergency';
    } else if (riskScore >= 50) {
      reportData.status = 'escalated';
    }

    const { data: report, error } = await supabase!
      .from('safety_reports')
      .insert(reportData)
      .select('id, status')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: 'حصل خطأ' }, { status: 500 });
    }

    // لو emergency → خفض سمعة المستخدم الهدف
    if (riskScore >= 70 && targetUserId) {
      await supabase!.from('reputation_logs').insert({
        user_id: targetUserId,
        action: 'content_reported',
        points: -10.0,
        source_type: contentType,
        source_id: contentId,
      });
    }

    return NextResponse.json({
      success: true,
      report,
      message: riskScore >= 70
        ? 'تم رفع البلاغ كموقف طوارئ — فريق الأمان سيراجع فوراً'
        : 'تم إرسال البلاغ — سيراجعه فريق الأمان خلال ٢٤ ساعة',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'خطأ في السيرفر' }, { status: 500 });
  }
}
