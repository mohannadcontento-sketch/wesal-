import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';
import { getUserBadge, getDisplayName } from '@/types';

export async function GET(req: Request) {
  try {
    const user = await getUserFromSession(req);
    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section') || 'shares';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = 20;

    let where = {};
    if (section === 'shares') {
      // Show only the current user's own posts
      if (user) {
        where = { authorId: user.id };
      } else {
        where = { authorRole: { in: ['user', 'trusted'] } };
      }
    } else if (section === 'doctors') {
      where = { authorRole: 'doctor' };
    } else if (section === 'trending') {
      where = { OR: [{ reactionCount: { gte: 5 } }, { commentCount: { gte: 3 } }] };
    }

    const posts = await db.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Batch fetch author avatars
    const authorIds = [...new Set(posts.map(p => p.authorId))];
    const authorProfiles = await db.profile.findMany({
      where: { userId: { in: authorIds } },
      select: { userId: true, avatarUrl: true },
    });
    const avatarMap: Record<string, string | null> = {};
    for (const ap of authorProfiles) {
      avatarMap[ap.userId] = ap.avatarUrl;
    }

    const postsWithReactions = posts.map(post => ({
      ...post,
      authorAvatarUrl: avatarMap[post.authorId] || null,
    }));

    // Batch reaction queries: fetch all reactions for these posts in one query
    const postIds = postsWithReactions.map(p => p.id);
    const allReactions = await db.reaction.groupBy({
      by: ['type', 'targetId'],
      where: { targetId: { in: postIds }, targetType: 'post' },
      _count: { type: true },
    });

    // Build a map: targetId -> { type -> count }
    const reactionsByPost: Record<string, Record<string, number>> = {};
    for (const r of allReactions) {
      if (!reactionsByPost[r.targetId]) reactionsByPost[r.targetId] = {};
      reactionsByPost[r.targetId][r.type] = r._count.type;
    }

    // Batch user reactions: fetch all reactions by current user for these posts
    let userReactionsMap: Record<string, string> = {};
    if (user) {
      const userReactions = await db.reaction.findMany({
        where: { userId: user.id, targetId: { in: postIds }, targetType: 'post' },
        select: { targetId: true, type: true },
      });
      for (const r of userReactions) {
        userReactionsMap[r.targetId] = r.type;
      }
    }

    // Merge into posts
    const finalPosts = postsWithReactions.map(post => ({
      ...post,
      reactions: reactionsByPost[post.id] || {},
      userReaction: userReactionsMap[post.id] || null,
    }));

    return NextResponse.json({ posts: finalPosts });
  } catch (error) {
    console.error('Posts GET error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user || !user.profile) {
      return NextResponse.json({ error: 'سجل دخول الأول' }, { status: 401 });
    }

    const body = await req.json();
    const { content, moods } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'اكتب شي' }, { status: 400 });
    }

    if (content.trim().length > 10000) {
      return NextResponse.json({ error: 'المنشور طويل أوف، الحد الأقصى 10000 حرف' }, { status: 400 });
    }

    const displayName = getDisplayName({ ...user.profile, role: user.role });
    const badge = getUserBadge(user.role, user.profile?.reputationTier);
    const section = user.role === 'doctor' ? 'doctors' : 'shares';

    const post = await db.post.create({
      data: {
        authorId: user.id,
        authorDisplay: displayName,
        authorBadge: badge,
        authorRole: user.role,
        content: content.trim(),
        moods: moods || '',
        section,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Posts POST error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
