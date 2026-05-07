import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

export async function GET(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const { roomId } = await params;
    const room = await db.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
            status: true,
            reason: true,
          },
        },
      },
    });
    if (!room) return NextResponse.json({ error: 'الشات مش موجود' }, { status: 404 });

    if (room.patientId !== user.id && room.doctorId !== user.id) {
      return NextResponse.json({ error: 'مش مسموح' }, { status: 403 });
    }

    const messages = await db.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
    });

    // Fetch profiles separately
    const [patientUser, doctorUser] = await Promise.all([
      db.user.findUnique({ where: { id: room.patientId }, include: { profile: true } }),
      db.user.findUnique({ where: { id: room.doctorId }, include: { profile: true } }),
    ]);

    // Build a sender lookup map
    const senderMap: Record<string, { name: string; avatarUrl?: string | null }> = {};
    const patientProfile = patientUser?.profile;
    const doctorProfile = doctorUser?.profile;
    senderMap[room.patientId] = {
      name: patientProfile?.realName || patientProfile?.username || 'مستخدم',
      avatarUrl: patientProfile?.avatarUrl,
    };
    senderMap[room.doctorId] = {
      name: doctorProfile?.realName || doctorUser?.email || 'دكتور',
      avatarUrl: doctorProfile?.avatarUrl,
    };

    // Attach sender info to each message
    const messagesWithSender = messages.map((msg) => ({
      ...msg,
      createdAt: msg.createdAt.toISOString(),
      sender: senderMap[msg.senderId] || { name: 'مجهول' },
    }));

    // Determine if patient can send right now
    const appointment = room.appointment;
    const isPatient = user.id === room.patientId;
    let patientCanSend = true;
    let sessionMessage = '';

    if (isPatient && appointment && appointment.appointmentDate) {
      const apptDate = new Date(appointment.appointmentDate);
      const now = new Date();
      // Session window: 15 minutes before to 30 minutes after
      const windowStart = new Date(apptDate.getTime() - 15 * 60 * 1000);
      const windowEnd = new Date(apptDate.getTime() + 30 * 60 * 1000);

      if (appointment.status === 'pending') {
        patientCanSend = false;
        sessionMessage = 'في انتظار تأكيد الدكتور للموعد';
      } else if (appointment.status === 'cancelled') {
        patientCanSend = false;
        sessionMessage = 'تم إلغاء الموعد';
      } else if (appointment.status === 'completed') {
        patientCanSend = false;
        sessionMessage = 'انتهت الجلسة';
      } else if (now < windowStart) {
        patientCanSend = false;
        const options: Intl.DateTimeFormatOptions = {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        };
        sessionMessage = `ميعاد الجلسة: ${apptDate.toLocaleDateString('ar-EG', options)}`;
      } else if (now > windowEnd) {
        patientCanSend = false;
        sessionMessage = 'انتهى وقت الجلسة';
      }
    }

    return NextResponse.json({
      messages: messagesWithSender,
      room: {
        id: room.id,
        status: room.status,
        patientId: room.patientId,
        doctorId: room.doctorId,
        patientName: senderMap[room.patientId].name,
        patientAvatar: senderMap[room.patientId].avatarUrl,
        doctorName: senderMap[room.doctorId].name,
        doctorAvatar: senderMap[room.doctorId].avatarUrl,
        appointment: appointment || null,
        patientCanSend,
        sessionMessage,
        isPatient,
      },
    });
  } catch (error) {
    console.error('Chat messages GET error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const { roomId } = await params;
    const room = await db.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        appointment: {
          select: {
            appointmentDate: true,
            status: true,
          },
        },
      },
    });
    if (!room) return NextResponse.json({ error: 'الشات مش موجود' }, { status: 404 });

    if (room.patientId !== user.id && room.doctorId !== user.id) {
      return NextResponse.json({ error: 'مش مسموح' }, { status: 403 });
    }

    // Restrict patient: can only send during session window or if confirmed
    const isPatient = user.id === room.patientId;
    if (isPatient && room.appointment) {
      const appointment = room.appointment;
      if (appointment.status === 'pending') {
        return NextResponse.json({ error: 'في انتظار تأكيد الدكتور للموعد' }, { status: 403 });
      }
      if (appointment.status === 'cancelled') {
        return NextResponse.json({ error: 'تم إلغاء الموعد' }, { status: 403 });
      }
      if (appointment.status === 'completed') {
        return NextResponse.json({ error: 'انتهت الجلسة' }, { status: 403 });
      }
      if (appointment.appointmentDate) {
        const apptDate = new Date(appointment.appointmentDate);
        const now = new Date();
        const windowStart = new Date(apptDate.getTime() - 15 * 60 * 1000);
        const windowEnd = new Date(apptDate.getTime() + 30 * 60 * 1000);

        if (now < windowStart) {
          return NextResponse.json({ error: 'الجلسة لسه ما بدأتش. تقدر تبعت 15 دقيقة قبل الموعد' }, { status: 403 });
        }
        if (now > windowEnd) {
          return NextResponse.json({ error: 'انتهى وقت الجلسة' }, { status: 403 });
        }
      }
    }

    const body = await req.json();
    const { content } = body;

    if (!content) return NextResponse.json({ error: 'اكتب رسالة' }, { status: 400 });

    const message = await db.chatMessage.create({
      data: {
        roomId,
        senderId: user.id,
        messageType: 'text',
        content,
      },
    });

    // Fetch sender profile for response
    const sender = await db.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    });

    return NextResponse.json({
      message: {
        ...message,
        createdAt: message.createdAt.toISOString(),
        sender: {
          name: sender?.profile?.realName || sender?.profile?.username || 'مستخدم',
          avatarUrl: sender?.profile?.avatarUrl,
        },
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Chat message POST error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
