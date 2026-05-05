import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const { doctorId } = await req.json();
    if (!doctorId) return NextResponse.json({ error: 'اختار دكتور' }, { status: 400 });

    // Verify doctor exists
    const doctor = await db.user.findUnique({ where: { id: doctorId } });
    if (!doctor || doctor.role !== 'doctor') {
      return NextResponse.json({ error: 'الدكتور مش موجود' }, { status: 404 });
    }

    // Check if chat room already exists between these two
    const existingRoom = await db.chatRoom.findFirst({
      where: {
        OR: [
          { patientId: user.id, doctorId },
          { patientId: doctorId, doctorId: user.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingRoom) {
      return NextResponse.json({ roomId: existingRoom.id });
    }

    // Create new chat room + appointment
    const appointment = await db.appointment.create({
      data: {
        patientId: user.id,
        doctorId,
        appointmentDate: new Date(),
        reason: 'محادثة مباشرة',
        status: 'confirmed',
      },
    });

    const chatRoom = await db.chatRoom.create({
      data: {
        appointmentId: appointment.id,
        patientId: user.id,
        doctorId,
        status: 'open',
      },
    });

    await db.appointment.update({
      where: { id: appointment.id },
      data: { chatRoomId: chatRoom.id },
    });

    return NextResponse.json({ roomId: chatRoom.id }, { status: 201 });
  } catch (error) {
    console.error('Quick chat error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
