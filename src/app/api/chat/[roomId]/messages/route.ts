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
        patient: { include: { profile: true } },
        doctor: { include: { profile: true } },
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

    // Build a sender lookup map
    const senderMap: Record<string, { name: string; avatarUrl?: string | null }> = {};
    const patientProfile = room.patient.profile;
    const doctorProfile = room.doctor.profile;
    senderMap[room.patientId] = {
      name: patientProfile?.realName || patientProfile?.username || 'مستخدم',
      avatarUrl: patientProfile?.avatarUrl,
    };
    senderMap[room.doctorId] = {
      name: doctorProfile?.realName || 'دكتور',
      avatarUrl: doctorProfile?.avatarUrl,
    };

    // Attach sender info to each message
    const messagesWithSender = messages.map((msg) => ({
      ...msg,
      createdAt: msg.createdAt.toISOString(),
      sender: senderMap[msg.senderId] || { name: 'مجهول' },
    }));

    return NextResponse.json({
      messages: messagesWithSender,
      room: {
        id: room.id,
        status: room.status,
        patientName: senderMap[room.patientId].name,
        patientAvatar: senderMap[room.patientId].avatarUrl,
        doctorName: senderMap[room.doctorId].name,
        doctorAvatar: senderMap[room.doctorId].avatarUrl,
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
    });
    if (!room) return NextResponse.json({ error: 'الشات مش موجود' }, { status: 404 });

    if (room.patientId !== user.id && room.doctorId !== user.id) {
      return NextResponse.json({ error: 'مش مسموح' }, { status: 403 });
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
      include: {
        sender: { include: { profile: true } },
      },
    });

    return NextResponse.json({
      message: {
        ...message,
        createdAt: message.createdAt.toISOString(),
        sender: {
          name: message.sender.profile?.realName || message.sender.profile?.username || 'مستخدم',
          avatarUrl: message.sender.profile?.avatarUrl,
        },
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Chat message POST error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
