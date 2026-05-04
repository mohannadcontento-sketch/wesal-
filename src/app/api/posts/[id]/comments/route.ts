import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';
import { getUserBadge, getDisplayName } from '@/types';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getUserFromSession(req);
    const { id } = await params;

    const comments = await db.comment.findMany({
      where: { postId: id, parentId: null },
      orderBy: { createdAt: 'asc' },
      include: {
        replies: { orderBy: { createdAt: 'asc' } },
      },
    });

    const commentsWithReactions = await Promise.all(comments.map(async (c) => {
      const reactions = await db.reaction.groupBy({
        by: ['type'],
        where: { targetId: c.id, targetType: 'comment' },
        _count: { type: true },
      });
      const reactionMap: Record<string, number> = {};
      reactions.forEach((r) => { reactionMap[r.type] = r._count.type; });

      // Fetch current user's reactions on this comment
      let userReactions: string[] = [];
      if (currentUser) {
        const userReactList = await db.reaction.findMany({
          where: { userId: currentUser.id, targetId: c.id, targetType: 'comment' },
          select: { type: true },
        });
        userReactions = userReactList.map((r) => r.type);
      }

      const repliesWithReactions = await Promise.all((c.replies || []).map(async (r) => {
        const rReactions = await db.reaction.groupBy({
          by: ['type'],
          where: { targetId: r.id, targetType: 'comment' },
          _count: { type: true },
        });
        const rMap: Record<string, number> = {};
        rReactions.forEach((rr) => { rMap[rr.type] = rr._count.type; });

        // Fetch current user's reactions on this reply
        let rUserReactions: string[] = [];
        if (currentUser) {
          const rUserReactList = await db.reaction.findMany({
            where: { userId: currentUser.id, targetId: r.id, targetType: 'comment' },
            select: { type: true },
          });
          rUserReactions = rUserReactList.map((rr) => rr.type);
        }

        return { ...r, reactions: rMap, userReactions: rUserReactions };
      }));

      return { ...c, reactions: reactionMap, userReactions, replies: repliesWithReactions };
    }));

    return NextResponse.json({ comments: commentsWithReactions });
  } catch (error) {
    console.error('Comments GET error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession(req);
    if (!user || !user.profile) {
      return NextResponse.json({ error: 'سجل دخول الأول' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { content, parentId } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'اكتب تعليق' }, { status: 400 });
    }

    const displayName = getDisplayName({ ...user.profile, role: user.role });
    const badge = getUserBadge(user.role, user.profile?.reputationTier);

    const comment = await db.comment.create({
      data: {
        postId: id,
        authorId: user.id,
        authorDisplay: displayName,
        authorBadge: badge,
        parentId: parentId || null,
        content: content.trim(),
      },
    });

    await db.post.update({
      where: { id },
      data: { commentCount: { increment: 1 } },
    });

    // Check if post should become trending
    const post = await db.post.findUnique({ where: { id } });
    if (post && post.section !== 'trending' && (post.commentCount >= 3 || post.reactionCount >= 5)) {
      await db.post.update({ where: { id }, data: { section: 'trending' } });
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Comments POST error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
