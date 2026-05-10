import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

export async function GET(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    // Get chat rooms where user is patient or doctor
    // Include rooms even without messages (created from bookings)
    const rooms = await db.chatRoom.findMany({
      where: {
        OR: [
          { patientId: user.id },
          { doctorId: user.id },
        ],
      },
      include: {
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
            status: true,
            reason: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            messageType: true,
            createdAt: true,
            senderId: true,
          },
        },
        _count: {
          select: {
            messages: { where: { read: false, senderId: { not: user.id } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Build room list with other person's info and last message
    const roomsWithInfo = await Promise.all(
      rooms.map(async (room) => {
        const otherUserId = room.patientId === user.id ? room.doctorId : room.patientId;
        const otherUser = await db.user.findUnique({
          where: { id: otherUserId },
          include: { profile: true },
        });

        const otherName = otherUser?.profile?.realName || otherUser?.profile?.username || 'مستخدم';
        const otherAvatar = otherUser?.profile?.avatarUrl || null;
        const otherRole = otherUser?.role || 'user';
        const otherSpecialty = otherUser?.profile?.specialty || '';
        const isVerified = otherUser?.profile?.isVerified || false;

        const lastMessage = room.messages[0] || null;
        const unreadCount = room._count.messages;

        return {
          id: room.id,
          otherUserId,
          otherName,
          otherAvatar,
          otherRole,
          otherSpecialty,
          isVerified,
          lastMessage: lastMessage ? {
            id: lastMessage.id,
            content: lastMessage.content,
            messageType: lastMessage.messageType,
            createdAt: lastMessage.createdAt.toISOString(),
            senderId: lastMessage.senderId,
          } : null,
          unreadCount,
          appointment: room.appointment || null,
          createdAt: room.createdAt.toISOString(),
        };
      })
    );

    return NextResponse.json({ rooms: roomsWithInfo });
  } catch (error) {
    console.error('Chat rooms GET error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
