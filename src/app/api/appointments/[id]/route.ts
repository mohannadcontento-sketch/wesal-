import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession(req);
    if (!user || user.role !== 'doctor') {
      return NextResponse.json({ error: 'مش مسموح' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'حالة غلط' }, { status: 400 });
    }

    // Verify this doctor owns this appointment
    const existing = await db.appointment.findUnique({ where: { id } });
    if (!existing || existing.doctorId !== user.id) {
      return NextResponse.json({ error: 'مش مسموح تعدل الموعد ده' }, { status: 403 });
    }

    const appointment = await db.appointment.update({
      where: { id },
      data: { status },
    });

    // Notify the patient about the status change
    const statusMessages: Record<string, { title: string; body: string }> = {
      confirmed: { title: 'تم تأكيد موعدك', body: 'تم تأكيد موعدك مع الطبيب' },
      completed: { title: 'تم إنهاء الموعد', body: 'تم إنهاء موعدك مع الطبيب. نتمنى لك دوام الصحة' },
      cancelled: { title: 'تم إلغاء الموعد', body: 'تم إلغاء موعدك مع الطبيب. يمكنك حجز موعد جديد' },
    };

    const msg = statusMessages[status];
    if (msg) {
      await db.notification.create({
        data: {
          userId: existing.patientId,
          type: 'appointment',
          title: msg.title,
          body: msg.body,
          link: '/chat/' + (existing.chatRoomId || ''),
        },
      });
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error('Appointment PUT error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
