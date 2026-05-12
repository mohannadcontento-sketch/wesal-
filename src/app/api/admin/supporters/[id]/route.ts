import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'مش مسموح' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, reviewNotes } = body;

    if (!['approved', 'rejected', 'suspended'].includes(status)) {
      return NextResponse.json({ error: 'حالة غلط' }, { status: 400 });
    }

    const supporter = await db.supporter.findUnique({ where: { id } });
    if (!supporter) {
      return NextResponse.json({ error: 'الطلب مش موجود' }, { status: 404 });
    }

    // Update supporter status
    await db.supporter.update({
      where: { id },
      data: {
        status,
        reviewedBy: user.id,
        reviewNotes: reviewNotes || null,
      },
    });

    // When approving: update user role to 'supporter'
    if (status === 'approved') {
      await db.user.update({
        where: { id: supporter.userId },
        data: { role: 'supporter' },
      });

      // Also update profile verification
      await db.profile.updateMany({
        where: { userId: supporter.userId },
        data: { isVerified: true, verifiedAt: new Date() },
      });

      // Send notification
      await db.notification.create({
        data: {
          userId: supporter.userId,
          type: 'supporter',
          title: 'تم قبولك كداعم!',
          body: 'مبروك! حسابك بقى داعم معتمد في وصال. دلوقتي تقدر تستقبل طلبات الدعم.',
        },
      });
    }

    // When rejecting: send notification
    if (status === 'rejected') {
      await db.notification.create({
        data: {
          userId: supporter.userId,
          type: 'supporter',
          title: 'تم رفض طلب الداعم',
          body: reviewNotes || 'للأسف طلبك اترفض. ممكن تقدم تاني بعد تحسين مؤهلاتك.',
        },
      });
    }

    // When suspending: send notification + revert role
    if (status === 'suspended') {
      await db.user.update({
        where: { id: supporter.userId },
        data: { role: 'user' },
      });

      await db.notification.create({
        data: {
          userId: supporter.userId,
          type: 'supporter',
          title: 'تم إيقاف حسابك كداعم',
          body: reviewNotes || 'حسابك كداعم تم إيقافه مؤقتاً.',
        },
      });
    }

    return NextResponse.json({
      message: status === 'approved'
        ? 'تم قبول الداعم'
        : status === 'rejected'
          ? 'تم رفض الطلب'
          : 'تم إيقاف الداعم',
    });
  } catch (error) {
    console.error('Admin supporter PUT error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
