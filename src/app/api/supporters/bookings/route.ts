import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

// GET /api/supporters/bookings - Get current user's supporter bookings
export async function GET(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const bookings = await db.supporterBooking.findMany({
      where: { userId: user.id },
      include: {
        supporter: {
          include: {
            user: { include: { profile: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const bookingsList = await Promise.all(
      bookings.map(async (b) => {
        const profile = b.supporter.user.profile;
        const name = profile?.realName || profile?.username || 'داعم';
        const avatar = b.supporter.avatarUrl || profile?.avatarUrl || null;

        return {
          id: b.id,
          supporterId: b.supporterId,
          supporterName: name,
          supporterAvatar: avatar,
          scheduledDate: b.scheduledDate.toISOString(),
          status: b.status,
          notes: b.notes,
          chatRoomId: b.chatRoomId,
          createdAt: b.createdAt.toISOString(),
        };
      })
    );

    return NextResponse.json({ bookings: bookingsList });
  } catch (error) {
    console.error('Supporter bookings GET error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

// PATCH /api/supporters/bookings - Update booking status (cancel, etc.)
export async function PATCH(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const { bookingId, status } = await req.json();

    if (!bookingId || !status) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
    }

    const booking = await db.supporterBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) return NextResponse.json({ error: 'الحجز مش موجود' }, { status: 404 });

    // Only the user who booked can cancel
    if (booking.userId !== user.id) {
      return NextResponse.json({ error: 'مش مسموح' }, { status: 403 });
    }

    if (booking.status !== 'upcoming') {
      return NextResponse.json({ error: 'مش قادر تعدل الحجز' }, { status: 400 });
    }

    const updated = await db.supporterBooking.update({
      where: { id: bookingId },
      data: { status },
    });

    return NextResponse.json({ booking: updated });
  } catch (error) {
    console.error('Supporter booking PATCH error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
