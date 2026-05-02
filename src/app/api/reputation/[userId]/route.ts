import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

export async function GET(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const profile = await db.profile.findUnique({ where: { userId } });

    if (!profile) return NextResponse.json({ error: 'مش موجود' }, { status: 404 });

    const logs = await db.reputationLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      reputationScore: profile.reputationScore,
      reputationTier: profile.reputationTier,
      logs,
    });
  } catch (error) {
    console.error('Reputation GET error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
