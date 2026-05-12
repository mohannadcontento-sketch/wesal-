import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

// GET /api/admin/supporters/eligible - Get users eligible for supporter role via reputation
export async function GET(req: Request) {
  try {
    const admin = await getUserFromSession(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'مش مسموح' }, { status: 403 });
    }

    // Find users with 200+ reputation score who are NOT supporters yet
    const eligibleUsers = await db.user.findMany({
      where: {
        role: { in: ['user', 'trusted'] },
        disabled: false,
        profile: {
          reputationScore: { gte: 200 },
        },
        supporterProfile: null,
      },
      include: {
        profile: {
          select: {
            realName: true,
            username: true,
            avatarUrl: true,
            reputationScore: true,
            reputationTier: true,
            specialty: true,
            isVerified: true,
          },
        },
      },
      orderBy: {
        profile: { reputationScore: 'desc' },
      },
    });

    const users = eligibleUsers.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      profile: u.profile,
    }));

    return NextResponse.json({ eligibleUsers: users });
  } catch (error) {
    console.error('Eligible supporters GET error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
