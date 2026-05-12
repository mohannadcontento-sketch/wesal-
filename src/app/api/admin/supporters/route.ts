import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

export async function GET(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'مش مسموح' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    const where = statusFilter && statusFilter !== 'all'
      ? { status: statusFilter }
      : {};

    const supporters = await db.supporter.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            disabled: true,
            createdAt: true,
            profile: {
              select: {
                realName: true,
                username: true,
                avatarUrl: true,
                specialty: true,
                reputationScore: true,
                reputationTier: true,
                isVerified: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ supporters });
  } catch (error) {
    console.error('Admin supporters GET error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
