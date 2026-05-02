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
        patient: { include: { profile: true } },
        doctor: { include: { profile: true } },
        chatRoom: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Appointments GET error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
