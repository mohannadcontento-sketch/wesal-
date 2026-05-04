import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';
import { REPUTATION_POINTS, getReputationTier } from '@/types';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { type } = body;

    const validTypes = ['like', 'helpful'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'نوع تفاعل غلط' }, { status: 400 });
    }

    const comment = await db.comment.findUnique({ where: { id } });
    if (!comment) return NextResponse.json({ error: 'التعليق مش موجود' }, { status: 404 });

    const existing = await db.reaction.findUnique({
      where: { userId_targetId_targetType_type: { userId: user.id, targetId: id, targetType: 'comment', type } },
    });

    if (existing) {
      // Remove reaction and reverse reputation
      const points = REPUTATION_POINTS[type as keyof typeof REPUTATION_POINTS] || 0;
      await db.$transaction([
        db.reaction.delete({ where: { id: existing.id } }),
        db.reputationLog.deleteMany({ where: { fromUserId: user.id, commentId: id, reactionType: type } }),
        db.profile.update({
          where: { userId: comment.authorId },
          data: { reputationScore: { decrement: points } },
        }),
      ]);

      // Update tier
      const profile = await db.profile.findUnique({ where: { userId: comment.authorId } });
      if (profile) {
        const { tier } = getReputationTier(Math.max(0, profile.reputationScore));
        await db.profile.update({ where: { userId: comment.authorId }, data: { reputationTier: tier } });
      }

      return NextResponse.json({ action: 'removed' });
    }

    // Add reaction and reputation
    const points = REPUTATION_POINTS[type as keyof typeof REPUTATION_POINTS] || 0;
    await db.$transaction([
      db.reaction.create({
        data: { userId: user.id, targetId: id, targetType: 'comment', type },
      }),
      db.reputationLog.create({
        data: {
          userId: comment.authorId,
          fromUserId: user.id,
          commentId: id,
          reactionType: type,
          points,
        },
      }),
      db.profile.update({
        where: { userId: comment.authorId },
        data: { reputationScore: { increment: points } },
      }),
    ]);

    // Update tier
    const profile = await db.profile.findUnique({ where: { userId: comment.authorId } });
    if (profile) {
      const { tier } = getReputationTier(profile.reputationScore);
      await db.profile.update({ where: { userId: comment.authorId }, data: { reputationTier: tier } });
    }

    return NextResponse.json({ action: 'added', points });
  } catch (error) {
    console.error('Comment reaction error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
