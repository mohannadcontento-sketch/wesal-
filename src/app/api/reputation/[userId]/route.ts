import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

export async function GET(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const currentUser = await getUserFromSession(req);
    if (!currentUser) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const { userId } = await params;
    const profile = await db.profile.findUnique({ where: { userId } });

    if (!profile) return NextResponse.json({ error: 'مش موجود' }, { status: 404 });

    // Only show public reputation info; hide fromUserId for privacy
    const isOwner = currentUser.id === userId || currentUser.role === 'admin';

    const logs = await db.reputationLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Strip fromUserId from logs for non-owners to protect anonymity
    const safeLogs = isOwner ? logs : logs.map(({ fromUserId, ...rest }) => rest);

    return NextResponse.json({
      reputationScore: profile.reputationScore,
      reputationTier: profile.reputationTier,
      logs: safeLogs,
    });
  } catch (error) {
    console.error('Reputation GET error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
