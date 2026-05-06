import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';
import { getUserBadge, getDisplayName } from '@/types';
import { areCommentsAllowed, isMaintenanceMode } from '@/lib/settings';

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
      return { ...c };
    }));

    // Batch reaction queries for all comments and replies
    const commentIds = commentsWithReactions.flatMap(c => [c.id, ...(c.replies || []).map(r => r.id)]);

    const allReactions = await db.reaction.groupBy({
      by: ['type', 'targetId'],
      where: { targetId: { in: commentIds }, targetType: 'comment' },
      _count: { type: true },
    });

    const reactionsByTarget: Record<string, Record<string, number>> = {};
    for (const r of allReactions) {
      if (!reactionsByTarget[r.targetId]) reactionsByTarget[r.targetId] = {};
      reactionsByTarget[r.targetId][r.type] = r._count.type;
    }

    let userReactionsByTarget: Record<string, string[]> = {};
    if (currentUser) {
      const userReactions = await db.reaction.findMany({
        where: { userId: currentUser.id, targetId: { in: commentIds }, targetType: 'comment' },
        select: { targetId: true, type: true },
      });
      for (const r of userReactions) {
        if (!userReactionsByTarget[r.targetId]) userReactionsByTarget[r.targetId] = [];
        userReactionsByTarget[r.targetId].push(r.type);
      }
    }

    const finalComments = commentsWithReactions.map(c => {
      const repliesWithReactions = (c.replies || []).map(r => ({
        ...r,
        reactions: reactionsByTarget[r.id] || {},
        userReactions: userReactionsByTarget[r.id] || [],
      }));
      return {
        ...c,
        reactions: reactionsByTarget[c.id] || {},
        userReactions: userReactionsByTarget[c.id] || [],
        replies: repliesWithReactions,
      };
    });

    return NextResponse.json({ comments: finalComments });
  } catch (error) {
    console.error('Comments GET error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (await isMaintenanceMode()) {
      return NextResponse.json({ error: 'المنصة في وضع الصيانة' }, { status: 503 });
    }
    if (!(await areCommentsAllowed())) {
      return NextResponse.json({ error: 'التعليقات مغلقة حالياً' }, { status: 403 });
    }

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

    if (content.trim().length > 2000) {
      return NextResponse.json({ error: 'التعليق طويل أوف، الحد الأقصى 2000 حرف' }, { status: 400 });
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

    // Notify post author (skip if commenting on own post)
    const post = await db.post.findUnique({ where: { id } });
    const commenterName = user.profile?.realName || user.profile?.username || 'مستخدم';
    const commenterUsername = user.profile?.username || 'me';
    if (post && post.authorId !== user.id) {
      await db.notification.create({
        data: {
          userId: post.authorId,
          type: 'comment',
          title: 'تعليق جديد على منشورك',
          body: `${commenterName} علّق: "${content.trim().substring(0, 60)}${content.trim().length > 60 ? '...' : ''}"`,
          link: `/profile/${commenterUsername}`,
        },
      });
    }

    // Notify parent comment author (reply notification)
    if (parentId && post) {
      const parentComment = await db.comment.findUnique({ where: { id: parentId } });
      if (parentComment && parentComment.authorId !== user.id && parentComment.authorId !== post.authorId) {
        await db.notification.create({
          data: {
            userId: parentComment.authorId,
            type: 'comment',
            title: 'رد جديد على تعليقك',
            body: `${commenterName} ردّ على تعليقك`,
            link: `/profile/${commenterUsername}`,
          },
        });
      }
    }

    // Check if post should become trending
    if (post && post.section !== 'trending' && (post.commentCount >= 3 || post.reactionCount >= 5)) {
      await db.post.update({ where: { id }, data: { section: 'trending' } });
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Comments POST error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
