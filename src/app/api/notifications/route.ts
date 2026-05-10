import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

export async function GET(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    // Check for upcoming appointments and send 15-minute reminders
    const now = new Date();
    const fifteenMinutesLater = new Date(now.getTime() + 15 * 60 * 1000);

    // Find appointments that are confirmed and within 15 minutes from now
    const upcomingAppointments = await db.appointment.findMany({
      where: {
        status: 'confirmed',
        appointmentDate: {
          gt: now,
          lte: fifteenMinutesLater,
        },
        chatRoomId: { not: null },
      },
      include: {
        patient: { include: { profile: true } },
        doctor: { include: { profile: true } },
        chatRoom: true,
      },
    });

    for (const appt of upcomingAppointments) {
      // Check if a reminder already exists for this appointment
      const existingReminder = await db.notification.findFirst({
        where: {
          type: 'session_reminder',
          userId: { in: [appt.patientId, appt.doctorId] },
          createdAt: { gte: new Date(now.getTime() - 30 * 60 * 1000) },
        },
      });

      if (!existingReminder) {
        const doctorName = appt.doctor.profile?.realName || appt.doctor.profile?.username || 'الدكتور';
        const patientName = appt.patient.profile?.realName || appt.patient.profile?.username || 'المريض';
        const chatLink = appt.chatRoomId ? `/chat/${appt.chatRoomId}` : null;

        const options: Intl.DateTimeFormatOptions = {
          hour: '2-digit',
          minute: '2-digit',
        };
        // Use UTC for notification text - will be displayed in user's timezone on client
        const timeStr = appt.appointmentDate.toLocaleTimeString('ar-EG', options);

        // Notify the patient
        await db.notification.create({
          data: {
            userId: appt.patientId,
            type: 'session_reminder',
            title: 'تذكير بالجلسة',
            body: `جلستك مع ${doctorName} هتبدأ بعد 15 دقيقة (${timeStr})`,
            link: chatLink,
          },
        });

        // Notify the doctor
        await db.notification.create({
          data: {
            userId: appt.doctorId,
            type: 'session_reminder',
            title: 'تذكير بالجلسة',
            body: `جلسة مع ${patientName} هتبدأ بعد 15 دقيقة (${timeStr})`,
            link: chatLink,
          },
        });
      }
    }

    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Notifications GET error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    await db.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });

    return NextResponse.json({ message: 'تم تحديث الإشعارات' });
  } catch (error) {
    console.error('Notifications PUT error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const body = await req.json();
    const { notificationId, markAll } = body;

    // Mark all as read
    if (markAll) {
      await db.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      });
      return NextResponse.json({ message: 'تم تحديث الإشعارات' });
    }

    // Mark individual notification as read
    if (notificationId) {
      await db.notification.update({
        where: { id: notificationId, userId: user.id },
        data: { read: true },
      });
      return NextResponse.json({ message: 'تم تحديث الإشعار' });
    }

    return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 });
  } catch (error) {
    console.error('Notifications PATCH error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
