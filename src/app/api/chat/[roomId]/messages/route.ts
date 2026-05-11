import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';
import { decryptMessage, isEncrypted } from '@/lib/chat-encryption';

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

    // Check access: participant OR admin
    const isAdmin = user.role === 'admin';
    if (room.patientId !== user.id && room.doctorId !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'مش مسموح' }, { status: 403 });
    }

    // Mark messages from the other person as read
    await db.chatMessage.updateMany({
      where: { roomId, senderId: { not: user.id }, read: false },
      data: { read: true },
    });

    const messages = await db.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    messages.reverse();

    // Fetch profiles
    const [patientUser, doctorUser] = await Promise.all([
      db.user.findUnique({ where: { id: room.patientId }, include: { profile: true } }),
      db.user.findUnique({ where: { id: room.doctorId }, include: { profile: true } }),
    ]);

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

    // Decrypt ALL text message contents
    const messagesWithSender = messages.map((msg) => {
      let decryptedContent = msg.content;

      if (msg.messageType === 'text' && msg.content) {
        // Always try to decrypt text messages - decryptMessage handles
        // both encrypted and plain text gracefully
        decryptedContent = decryptMessage(msg.content);
      }

      return {
        ...msg,
        content: decryptedContent,
        createdAt: msg.createdAt.toISOString(),
        sender: senderMap[msg.senderId] || { name: 'مجهول' },
      };
    });

    // Session window check
    const appointment = room.appointment;
    const isPatient = user.id === room.patientId;
    let patientCanSend = true;
    let sessionMessage = '';

    // Admin can always send, no restrictions
    if (!isAdmin && isPatient && appointment && appointment.appointmentDate) {
      const apptDate = new Date(appointment.appointmentDate);
      const now = new Date();
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
        sessionMessage = `appointment_time:${apptDate.toISOString()}`;
      } else if (now > windowEnd) {
        patientCanSend = false;
        sessionMessage = 'انتهى وقت الجلسة';
      }
    }

    // If no appointment linked (admin chat), patientCanSend stays true for admin
    // For non-admin users without appointment, they can always send
    if (!isAdmin && !isPatient && !appointment) {
      patientCanSend = true;
    }

    // Check if room is closed
    const isRoomClosed = room.status === 'closed';
    const canSend = isAdmin ? true : (!isRoomClosed && (!isPatient || patientCanSend));

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
        patientCanSend: canSend,
        sessionMessage: isAdmin ? '' : sessionMessage,
        isPatient: isPatient && !isAdmin,
        isAdmin,
        isClosed: isRoomClosed,
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
          select: { appointmentDate: true, status: true },
        },
      },
    });
    if (!room) return NextResponse.json({ error: 'الشات مش موجود' }, { status: 404 });

    // Check access
    const isAdmin = user.role === 'admin';
    if (room.patientId !== user.id && room.doctorId !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'مش مسموح' }, { status: 403 });
    }

    // Check room is not closed
    if (room.status === 'closed' && !isAdmin) {
      return NextResponse.json({ error: 'المحادثة مقفلة. مش تقدر تبعت رسالة' }, { status: 403 });
    }

    // Patient session window check
    const isPatient = user.id === room.patientId;
    if (!isAdmin && isPatient && room.appointment) {
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
    if (content.length > 5000) return NextResponse.json({ error: 'الرسالة طويلة أوي. الحد الأقصى 5000 حرف' }, { status: 400 });

    // Rate limit: 30 msgs/hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await db.chatMessage.count({
      where: { roomId, senderId: user.id, createdAt: { gte: oneHourAgo } },
    });
    if (recentCount >= 30) {
      return NextResponse.json({ error: 'أنت بتقصد كتير. استنى شوية وبعدين كمّل' }, { status: 429 });
    }

    // Encrypt message content before storing (new format with prefix)
    const { encryptMessage } = await import('@/lib/chat-encryption');
    const encryptedContent = encryptMessage(content);

    const message = await db.chatMessage.create({
      data: {
        roomId,
        senderId: user.id,
        messageType: 'text',
        content: encryptedContent,
      },
    });

    const sender = await db.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    });

    return NextResponse.json({
      message: {
        ...message,
        content, // Return decrypted content to display
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
