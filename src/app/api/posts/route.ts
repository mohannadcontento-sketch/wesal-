import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';
import { getUserBadge, getDisplayName, getReputationTier } from '@/types';

export async function GET(req: Request) {
  try {
    const user = await getUserFromSession(req);
    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section') || 'shares';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    let where = {};
    if (section === 'shares') {
      where = { authorRole: { in: ['user', 'trusted'] } };
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

    const postsWithReactions = await Promise.all(posts.map(async (post) => {
      const reactions = await db.reaction.groupBy({
        by: ['type'],
        where: { targetId: post.id, targetType: 'post' },
        _count: { type: true },
      });

      const reactionMap: Record<string, number> = {};
      reactions.forEach((r) => { reactionMap[r.type] = r._count.type; });

      // Fetch current user's reaction on this post
      let userReaction: string | null = null;
      if (user) {
        const userReact = await db.reaction.findFirst({
          where: { userId: user.id, targetId: post.id, targetType: 'post' },
          select: { type: true },
        });
        if (userReact) userReaction = userReact.type;
      }

      return { ...post, reactions: reactionMap, userReaction };
    }));

    return NextResponse.json({ posts: postsWithReactions });
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
