import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

// Helper to check if patient can send
async function checkPatientCanSend(userId: string, room: { patientId: string; doctorId: string; appointmentId?: string | null }) {
  if (userId !== room.patientId) return { canSend: true, message: '' };

  // Admin can always send voice
  // (admin role is checked in caller via user.role but we don't pass it here;
  //  the caller handles admin bypass separately)

  // Fetch appointment
  let appointment = null;
  if (room.appointmentId) {
    appointment = await db.appointment.findUnique({
      where: { id: room.appointmentId },
      select: { appointmentDate: true, status: true },
    });
  }

  if (!appointment) return { canSend: true, message: '' };

  if (appointment.status === 'pending') {
    return { canSend: false, message: 'في انتظار تأكيد الدكتور للموعد' };
  }
  if (appointment.status === 'cancelled') {
    return { canSend: false, message: 'تم إلغاء الموعد' };
  }
  if (appointment.status === 'completed') {
    return { canSend: false, message: 'انتهت الجلسة' };
  }

  if (appointment.appointmentDate) {
    const apptDate = new Date(appointment.appointmentDate);
    const now = new Date();
    const windowStart = new Date(apptDate.getTime() - 15 * 60 * 1000);
    const windowEnd = new Date(apptDate.getTime() + 30 * 60 * 1000);

    if (now < windowStart) {
      return { canSend: false, message: 'الجلسة لسه ما بدأتش. تقدر تبعت 15 دقيقة قبل الموعد' };
    }
    if (now > windowEnd) {
      return { canSend: false, message: 'انتهى وقت الجلسة' };
    }
  }

  return { canSend: true, message: '' };
}

export async function POST(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const { roomId } = await params;
    const room = await db.chatRoom.findUnique({ where: { id: roomId } });
    if (!room) return NextResponse.json({ error: 'الشات مش موجود' }, { status: 404 });

    if (room.patientId !== user.id && room.doctorId !== user.id) {
      return NextResponse.json({ error: 'مش مسموح' }, { status: 403 });
    }

    // Check patient restriction (admin can always send)
    if (user.role !== 'admin') {
      const { canSend, message } = await checkPatientCanSend(user.id, room);
      if (!canSend) {
        return NextResponse.json({ error: message }, { status: 403 });
      }
    }

    const body = await req.json();
    const { voiceData, duration } = body;

    if (!voiceData) return NextResponse.json({ error: 'سجل صوت' }, { status: 400 });

    const message_entry = await db.chatMessage.create({
      data: {
        roomId,
        senderId: user.id,
        messageType: 'voice',
        voiceUrl: voiceData,
        voiceDuration: duration || 0,
      },
    });

    // Fetch sender profile for response
    const sender = await db.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    });

    return NextResponse.json({
      message: {
        ...message_entry,
        createdAt: message_entry.createdAt.toISOString(),
        sender: {
          name: sender?.profile?.realName || sender?.profile?.username || 'مستخدم',
          avatarUrl: sender?.profile?.avatarUrl,
        },
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Voice POST error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
