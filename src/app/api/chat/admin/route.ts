import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

// POST /api/chat/admin - Admin starts a chat with any user
export async function POST(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'مش مسموح - للأدمن بس' }, { status: 403 });
    }

    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return NextResponse.json({ error: 'اختار المستخدم' }, { status: 400 });
    }

    // Prevent chatting with yourself
    if (user.id === targetUserId) {
      return NextResponse.json({ error: 'مش تقدر تبعت لنفسك' }, { status: 400 });
    }

    // Verify target user exists
    const targetUser = await db.user.findUnique({
      where: { id: targetUserId },
      include: { profile: true },
    });
    if (!targetUser) {
      return NextResponse.json({ error: 'المستخدم مش موجود' }, { status: 404 });
    }

    // Check if chat room already exists between admin and target
    const existingRoom = await db.chatRoom.findFirst({
      where: {
        OR: [
          { patientId: user.id, doctorId: targetUserId },
          { patientId: targetUserId, doctorId: user.id },
        ],
      },
    });

    if (existingRoom) {
      return NextResponse.json({ roomId: existingRoom.id });
    }

    // Create chat room without appointment (admin chat, no restrictions)
    const chatRoom = await db.chatRoom.create({
      data: {
        patientId: user.id,
        doctorId: targetUserId,
        status: 'open',
      },
    });

    // Notify the target user
    const targetName = targetUser.profile?.realName || targetUser.profile?.username || 'مستخدم';
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
  } catch (error) {
    console.error('Admin chat error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

// GET /api/chat/admin/users - Admin searches for users to chat with
export async function GET(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'مش مسموح' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const users = await db.user.findMany({
      where: {
        AND: [
          { id: { not: user.id } },
          { disabled: false },
          search ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { profile: { realName: { contains: search, mode: 'insensitive' } } },
              { profile: { username: { contains: search, mode: 'insensitive' } } },
            ],
          } : {},
        ],
      },
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        role: u.role,
        realName: u.profile?.realName || '',
        username: u.profile?.username || null,
        avatarUrl: u.profile?.avatarUrl || null,
        specialty: u.profile?.specialty || null,
        isVerified: u.profile?.isVerified || false,
      })),
    });
  } catch (error) {
    console.error('Admin chat users search error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
