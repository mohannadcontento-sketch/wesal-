import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

export async function GET(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    // Build the where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { realName: { contains: search, mode: 'insensitive' } } },
        { profile: { username: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (role && role !== 'all') {
      where.role = role;
    }

    // Count total matching users
    const total = await db.user.count({ where });

    // Fetch users with related data
    const users = await db.user.findMany({
      where,
      include: {
        profile: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            sentMessages: true,
            patientAppointments: true,
            doctorAppointments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Calculate stats
    const [totalUsers, activeDoctors, bannedUsers, newThisMonth] = await Promise.all([
      db.user.count(),
      db.user.count({
        where: {
          role: 'doctor',
          disabled: false,
          profile: { isVerified: true },
        },
      }),
      db.user.count({ where: { disabled: true } }),
      db.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    const formattedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      realName: u.profile?.realName || '',
      username: u.profile?.username || null,
      avatarUrl: u.profile?.avatarUrl || null,
      specialty: u.profile?.specialty || null,
      location: u.profile?.location || null,
      bio: u.profile?.bio || null,
      phone: u.phone || null,
      isVerified: u.profile?.isVerified || false,
      reputationScore: u.profile?.reputationScore || 0,
      reputationTier: u.profile?.reputationTier || 'beginner',
      createdAt: u.createdAt,
      disabled: u.disabled,
      messageCount: u._count.sentMessages,
      appointmentCount: u._count.patientAppointments + u._count.doctorAppointments,
      postsCount: u._count.posts,
      commentsCount: u._count.comments,
    }));

    return NextResponse.json({
      users: formattedUsers,
      stats: {
        totalUsers,
        activeDoctors,
        bannedUsers,
        newThisMonth,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
