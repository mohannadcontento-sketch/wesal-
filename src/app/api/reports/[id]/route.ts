import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

// PUT /api/reports/[id] — review a report (admin only)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromSession(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, reviewNotes } = body;

    const existing = await db.report.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'البلاغ مش موجود' }, { status: 404 });
    }

    if (!['resolved', 'dismissed'].includes(status)) {
      return NextResponse.json({ error: 'حالة غير صالحة' }, { status: 400 });
    }

    const report = await db.report.update({
      where: { id },
      data: {
        status,
        reviewNotes: reviewNotes?.trim() || null,
        reviewedBy: user.id,
        reviewedAt: new Date(),
      },
    });

    // If resolved, optionally take action on target
    if (status === 'resolved' && existing.targetType === 'post') {
      // Hide post by adding hidden marker instead of destroying content
      const postExists = await db.post.findUnique({ where: { id: existing.targetId } });
      if (postExists) {
        await db.post.update({
          where: { id: existing.targetId },
          data: { content: '[تم إخفاء المنشور بسبب مخالفة]' },
        });
      }
    }

    // Notify the reporter about the review result
    const reportStatusMessage = status === 'resolved'
      ? 'تم اتخاذ إجراء بشأن بلاغك'
      : 'تم مراجعة بلاغك ورفضه';
    await db.notification.create({
      data: {
        userId: existing.reporterId,
        type: 'system',
        title: reportStatusMessage,
        body: reviewNotes?.trim() || (status === 'resolved' ? 'تم حل البلاغ واتخاذ الإجراء المناسب' : 'لم يتم اتخاذ إجراء على البلاغ'),
        link: '/',
      },
    });

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Report PUT error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
