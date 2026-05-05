import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

// POST /api/reports — file a report
export async function POST(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const body = await req.json();
    const { targetId, targetType, reason, details } = body;

    if (!targetId || !targetType || !reason) {
      return NextResponse.json({ error: 'البيانات مطلوبة' }, { status: 400 });
    }

    const validTypes = ['post', 'comment', 'user'];
    if (!validTypes.includes(targetType)) {
      return NextResponse.json({ error: 'نوع الهدف غير صالح' }, { status: 400 });
    }

    // Check for duplicate report
    const existing = await db.report.findFirst({
      where: {
        reporterId: user.id,
        targetId,
        targetType,
        status: 'pending',
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'لقد بلّغت بالفعل عن هذا المحتوى' }, { status: 409 });
    }

    const report = await db.report.create({
      data: {
        reporterId: user.id,
        targetId,
        targetType,
        reason: reason.trim(),
        details: details?.trim() || null,
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error('Report POST error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

// GET /api/reports — list all reports (admin only)
export async function GET(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مسموح' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const reports = await db.report.findMany({
      where,
      include: {
        reporter: {
          select: {
            profile: { select: { realName: true, username: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Reports GET error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
