import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const { targetUserId } = await req.json();
    if (!targetUserId) return NextResponse.json({ error: 'اختار المستخدم' }, { status: 400 });

    // Prevent chatting with yourself
    if (user.id === targetUserId) {
      return NextResponse.json({ error: 'مش تقدر تبعت لنفسك' }, { status: 400 });
    }

    // Verify target user exists
    const targetUser = await db.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'المستخدم مش موجود' }, { status: 404 });
    }

    // Check if chat room already exists between these two users
    const existingRoom = await db.chatRoom.findFirst({
      where: {
        OR: [
          { patientId: user.id, doctorId: targetUserId },
          { patientId: targetUserId, doctorId: user.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingRoom) {
      return NextResponse.json({ roomId: existingRoom.id });
    }

    // For admin: create a chat room without appointment (no restrictions)
    if (user.role === 'admin') {
      const chatRoom = await db.chatRoom.create({
        data: {
          patientId: user.id,
          doctorId: targetUserId,
          status: 'open',
        },
      });

      // Notify the target user
      const targetProfile = targetUser.profile;
      const targetName = targetProfile?.realName || targetProfile?.username || 'مستخدم';
      await db.notification.create({
        data: {
          userId: targetUserId,
          type: 'appointment',
          title: 'رسالة جديدة من الإدارة',
          body: 'بدأ مشرف محادثة معاك في وصال',
          link: '/chat/' + chatRoom.id,
        },
      });

      return NextResponse.json({ roomId: chatRoom.id }, { status: 201 });
    }

    // For regular users: create chat room + appointment (same as before)
    // Verify target is a doctor
    if (targetUser.role !== 'doctor') {
      return NextResponse.json({ error: 'الشات متاح مع الأطباء بس' }, { status: 400 });
    }

    // Check if chat room already exists between these two
    const existingRoom2 = await db.chatRoom.findFirst({
      where: {
        OR: [
          { patientId: user.id, doctorId: targetUserId },
          { patientId: targetUserId, doctorId: user.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingRoom2) {
      return NextResponse.json({ roomId: existingRoom2.id });
    }

    // Create new chat room + appointment
    const appointment = await db.appointment.create({
      data: {
        patientId: user.id,
        doctorId: targetUserId,
        appointmentDate: new Date(),
        reason: 'محادثة مباشرة',
        status: 'confirmed',
      },
    });

    const chatRoom = await db.chatRoom.create({
      data: {
        appointmentId: appointment.id,
        patientId: user.id,
        doctorId: targetUserId,
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
