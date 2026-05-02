import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

export async function GET(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const { roomId } = await params;
    const room = await db.chatRoom.findUnique({ where: { id: roomId } });
    if (!room) return NextResponse.json({ error: 'الشات مش موجود' }, { status: 404 });

    if (room.patientId !== user.id && room.doctorId !== user.id) {
      return NextResponse.json({ error: 'مش مسموح' }, { status: 403 });
    }

    const messages = await db.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ messages });
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
    const room = await db.chatRoom.findUnique({ where: { id: roomId } });
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
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Chat message POST error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
