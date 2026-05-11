import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';
import { uploadVoice, MAX_VOICE_DURATION_SECONDS } from '@/lib/voice-storage';

// Helper to check if patient can send
async function checkPatientCanSend(userId: string, room: { patientId: string; doctorId: string; appointmentId?: string | null }) {
  if (userId !== room.patientId) return { canSend: true, message: '' };

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

    // Check access: participant OR admin
    const isAdmin = user.role === 'admin';
    if (room.patientId !== user.id && room.doctorId !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'مش مسموح' }, { status: 403 });
    }

    // Check room is not closed
    if (room.status === 'closed' && !isAdmin) {
      return NextResponse.json({ error: 'المحادثة مقفلة. مش تقدر تبعت رسالة صوتية' }, { status: 403 });
    }

    // Check patient restriction (admin can always send)
    if (!isAdmin) {
      const { canSend, message } = await checkPatientCanSend(user.id, room);
      if (!canSend) {
        return NextResponse.json({ error: message }, { status: 403 });
      }
    }

    const body = await req.json();
    const { voiceData, duration } = body;

    if (!voiceData) return NextResponse.json({ error: 'سجل صوت' }, { status: 400 });

    // Max voice duration: 5 minutes
    if (duration && duration > MAX_VOICE_DURATION_SECONDS) {
      return NextResponse.json({ error: 'الرسالة الصوتية طويلة أوي. الحد الأقصى 5 دقائق' }, { status: 400 });
    }

    // Rate limit: max 20 voice messages per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentVoiceCount = await db.chatMessage.count({
      where: { roomId, senderId: user.id, messageType: 'voice', createdAt: { gte: oneHourAgo } },
    });
    if (recentVoiceCount >= 20) {
      return NextResponse.json({ error: 'أنت مسجل كتير. استنى شوية' }, { status: 429 });
    }

    // Upload voice to storage (Supabase Storage or base64 fallback)
    const messageId = `msg_${Date.now()}_${user.id.slice(0, 8)}`;
    const uploadResult = await uploadVoice(voiceData, messageId, roomId, user.id);

    const message_entry = await db.chatMessage.create({
      data: {
        roomId,
        senderId: user.id,
        messageType: 'voice',
        voiceUrl: uploadResult.url,
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
    const msg = error instanceof Error ? error.message : 'حصل خطأ';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
