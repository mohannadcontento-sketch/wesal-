import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

// GET /api/supporters/[id] - Get single supporter details
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const { id } = await params;

    const supporter = await db.supporter.findUnique({
      where: { id },
      include: {
        user: { include: { profile: true } },
        _count: { select: { bookings: true } },
      },
    });

    if (!supporter || supporter.status !== 'approved') {
      return NextResponse.json({ error: 'الداعم مش موجود' }, { status: 404 });
    }

    const profile = supporter.user.profile;

    return NextResponse.json({
      id: supporter.id,
      name: profile?.realName || profile?.username || 'داعم',
      avatarUrl: supporter.avatarUrl || profile?.avatarUrl || null,
      bio: supporter.bio,
      specialty: supporter.specialty,
      experience: supporter.experience,
      certificates: JSON.parse(supporter.certificates || '[]'),
      rating: supporter.rating,
      totalSessions: supporter._count.bookings,
      available: supporter.available,
    });
  } catch (error) {
    console.error('Supporter GET by ID error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

// POST /api/supporters/[id] - Book a session with supporter
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const { id: supporterId } = await params;
    const body = await req.json();
    const { scheduledDate, notes } = body;

    // Validate supporter exists and is available
    const supporter = await db.supporter.findUnique({
      where: { id: supporterId },
    });

    if (!supporter || supporter.status !== 'approved' || !supporter.available) {
      return NextResponse.json({ error: 'الداعم مش متاح دلوقتي' }, { status: 404 });
    }

    // Can't book yourself
    if (supporter.userId === user.id) {
      return NextResponse.json({ error: 'مش تقدر تحجز مع نفسك' }, { status: 400 });
    }

    // Check if user already has an active booking with ANY supporter
    const existingBooking = await db.supporterBooking.findFirst({
      where: {
        userId: user.id,
        status: { in: ['upcoming', 'active'] },
      },
    });

    if (existingBooking) {
      return NextResponse.json({ error: 'لديك حجز مع داعم بالفعل. خلصه الأول قبل ما تحجز تاني' }, { status: 400 });
    }

    // Validate scheduled date - at least 8 hours from now
    const sessionDate = new Date(scheduledDate);
    const now = new Date();
    const eightHoursMs = 8 * 60 * 60 * 1000;

    if (isNaN(sessionDate.getTime())) {
      return NextResponse.json({ error: 'التاريخ مش صحيح' }, { status: 400 });
    }

    if (sessionDate.getTime() - now.getTime() < eightHoursMs) {
      return NextResponse.json({ error: 'لازم تحجز قبل الجلسة بـ 8 ساعات على الأقل' }, { status: 400 });
    }

    // Check if the time slot is available (no other booking within 1 hour)
    const oneHourBefore = new Date(sessionDate.getTime() - 60 * 60 * 1000);
    const oneHourAfter = new Date(sessionDate.getTime() + 60 * 60 * 1000);

    const conflictingBooking = await db.supporterBooking.findFirst({
      where: {
        supporterId,
        status: { in: ['upcoming', 'active'] },
        scheduledDate: {
          gte: oneHourBefore,
          lte: oneHourAfter,
        },
      },
    });

    if (conflictingBooking) {
      return NextResponse.json({ error: 'الوقت ده محجوز. اختار وقت تاني' }, { status: 400 });
    }

    // Create booking + chat room
    const chatRoom = await db.chatRoom.create({
      data: {
        patientId: user.id,
        doctorId: supporter.userId,
        status: 'open',
      },
    });

    const booking = await db.supporterBooking.create({
      data: {
        supporterId,
        userId: user.id,
        scheduledDate: sessionDate,
        status: 'upcoming',
        notes: notes?.trim() || null,
        chatRoomId: chatRoom.id,
      },
    });

    // Notify supporter
    const userProfile = await db.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    });
    const userName = userProfile?.profile?.realName || 'مستخدم';

    await db.notification.create({
      data: {
        userId: supporter.userId,
        type: 'appointment',
        title: 'حجز جلسة دعم جديدة',
        body: `${userName} حجز جلسة معاك`,
        link: `/chat/${chatRoom.id}`,
      },
    });

    // Notify user
    const supporterProfile = await db.user.findUnique({
      where: { id: supporter.userId },
      include: { profile: true },
    });
    const supporterName = supporterProfile?.profile?.realName || 'داعم';

    await db.notification.create({
      data: {
        userId: user.id,
        type: 'appointment',
        title: 'تم حجز الجلسة بنجاح',
        body: `جلسة مع ${supporterName} في ${sessionDate.toLocaleDateString('ar-EG', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}`,
        link: `/chat/${chatRoom.id}`,
      },
    });

    return NextResponse.json({
      message: 'تم الحجز بنجاح!',
      booking: {
        id: booking.id,
        scheduledDate: booking.scheduledDate.toISOString(),
        status: booking.status,
        chatRoomId: chatRoom.id,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Supporter booking error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
