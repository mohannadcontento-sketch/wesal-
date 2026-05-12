import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/supporters - List approved & available supporters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const specialty = searchParams.get('specialty') || '';

    const where: Record<string, unknown> = {
      status: 'approved',
      available: true,
    };

    if (search) {
      where.OR = [
        { user: { profile: { realName: { contains: search, mode: 'insensitive' } } } },
        { user: { profile: { username: { contains: search, mode: 'insensitive' } } } },
        { bio: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (specialty) {
      where.specialty = { contains: specialty, mode: 'insensitive' };
    }

    const supporters = await db.supporter.findMany({
      where,
      include: {
        user: {
          include: { profile: true },
        },
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { rating: 'desc' },
    });

    const supportersList = supporters.map((s) => {
      const profile = s.user.profile;
      return {
        id: s.id,
        userId: s.userId,
        name: profile?.realName || profile?.username || 'داعم',
        avatarUrl: s.avatarUrl || profile?.avatarUrl || null,
        bio: s.bio,
        specialty: s.specialty,
        experience: s.experience,
        certificates: JSON.parse(s.certificates || '[]'),
        rating: s.rating,
        totalSessions: s._count.bookings,
        isOnline: true, // Could add presence later
      };
    });

    // Get specialties for filters
    const specialties = await db.supporter.groupBy({
      by: ['specialty'],
      where: { status: 'approved', available: true },
      _count: { id: true },
    });

    return NextResponse.json({
      supporters: supportersList,
      specialties: specialties.map(s => s.specialty),
    });
  } catch (error) {
    console.error('Supporters GET error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
