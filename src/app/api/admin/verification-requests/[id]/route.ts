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

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'حالة غلط' }, { status: 400 });
    }

    const request = await db.verificationRequest.findUnique({ where: { id } });
    if (!request) return NextResponse.json({ error: 'الطلب مش موجود' }, { status: 404 });

    await db.verificationRequest.update({
      where: { id },
      data: { status, reviewedBy: user.id, reviewNotes, reviewedAt: new Date() },
    });

    if (status === 'approved') {
      const targetUser = await db.user.findUnique({
        where: { id: request.userId },
        include: { profile: true },
      });

      if (targetUser) {
        await db.user.update({
          where: { id: request.userId },
          data: { role: 'trusted' },
        });

        await db.profile.update({
          where: { userId: request.userId },
          data: { isVerified: true, verifiedAt: new Date() },
        });

        await db.notification.create({
          data: {
            userId: request.userId,
            type: 'verification',
            title: 'تم توثيق حسابك! 🌟',
            body: 'مبروك! حسابك بقى موثوق في وصال',
          },
        });
      }
    }

    return NextResponse.json({ message: status === 'approved' ? 'تم التوثيق' : 'تم الرفض' });
  } catch (error) {
    console.error('Verification PUT error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
