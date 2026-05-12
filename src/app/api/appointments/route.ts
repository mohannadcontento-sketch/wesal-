import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const body = await req.json();
    const { doctorId, appointmentDate, reason } = body;

    if (!doctorId || !appointmentDate || !reason) {
      return NextResponse.json({ error: 'كل البيانات مطلوبة' }, { status: 400 });
    }

    // Prevent booking with yourself
    if (user.id === doctorId) {
      return NextResponse.json({ error: 'مش تقدر تحجز مع نفسك' }, { status: 400 });
    }

    const doctor = await db.user.findUnique({ where: { id: doctorId } });
    if (!doctor || doctor.role !== 'doctor') {
      return NextResponse.json({ error: 'الدكتور مش موجود' }, { status: 404 });
    }

    const appointment = await db.appointment.create({
      data: {
        patientId: user.id,
        doctorId,
        appointmentDate: new Date(appointmentDate),
        reason,
      },
    });

    const chatRoom = await db.chatRoom.create({
      data: {
        appointmentId: appointment.id,
        patientId: user.id,
        doctorId,
      },
    });

    await db.appointment.update({
      where: { id: appointment.id },
      data: { chatRoomId: chatRoom.id },
    });

    // Notify the doctor about the new appointment
    const patientName = user.profile?.realName || user.profile?.username || 'مستخدم';
    await db.notification.create({
      data: {
        userId: doctorId,
        type: 'appointment',
        title: 'موعد جديد',
        body: `${patientName} حجز موعد معاك: ${reason.substring(0, 60)}`,
        link: '/chat/' + chatRoom.id,
      },
    });

    // Notify the patient that the appointment was booked
    await db.notification.create({
      data: {
        userId: user.id,
        type: 'appointment',
        title: 'تم حجز الموعد',
        body: 'تم حجز موعدك بنجاح. هيتم تواصلك مع الدكتور قريب',
        link: '/chat/' + chatRoom.id,
      },
    });

    return NextResponse.json({ appointment, chatRoom }, { status: 201 });
  } catch (error) {
    console.error('Appointment POST error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const appointments = await db.appointment.findMany({
      where: user.role === 'doctor'
        ? { doctorId: user.id }
        : { patientId: user.id },
      include: {
        patient: { include: { profile: { select: { realName: true, username: true, avatarUrl: true, specialty: true } } } },
        doctor: { include: { profile: { select: { realName: true, username: true, avatarUrl: true, specialty: true } } } },
        chatRoom: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Strip all sensitive fields from response
    const safeAppointments = appointments.map(a => ({
      id: a.id,
      patientId: a.patientId,
      doctorId: a.doctorId,
      appointmentDate: a.appointmentDate,
      reason: a.reason,
      status: a.status,
      chatRoomId: a.chatRoomId,
      createdAt: a.createdAt,
      patient: { profile: a.patient.profile },
      doctor: { profile: a.doctor.profile },
      chatRoom: a.chatRoom,
    }));

    return NextResponse.json({ appointments: safeAppointments });
  } catch (error) {
    console.error('Appointments GET error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
