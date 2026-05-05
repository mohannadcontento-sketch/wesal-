import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

export async function GET(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const bookmarks = await db.bookmark.findMany({
      where: { userId: user.id },
      include: { post: true },
      orderBy: { createdAt: 'desc' },
    });

    // Batch fetch author avatars for bookmarked posts
    const authorIds = [...new Set(bookmarks.map(b => b.post.authorId).filter(Boolean))];
    let avatarMap: Record<string, string | null> = {};
    if (authorIds.length > 0) {
      const authorProfiles = await db.profile.findMany({
        where: { userId: { in: authorIds } },
        select: { userId: true, avatarUrl: true },
      });
      for (const ap of authorProfiles) {
        avatarMap[ap.userId] = ap.avatarUrl;
      }
    }

    // Inject avatar URLs into posts
    const enrichedBookmarks = bookmarks.map(b => ({
      ...b,
      post: {
        ...b.post,
        authorAvatarUrl: avatarMap[b.post.authorId] || null,
      },
    }));

    return NextResponse.json({ bookmarks: enrichedBookmarks });
  } catch (error) {
    console.error('Bookmarks GET error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const body = await req.json();
    const { postId } = body;

    if (!postId) return NextResponse.json({ error: 'postId مطلوب' }, { status: 400 });

    const existing = await db.bookmark.findUnique({
      where: { userId_postId: { userId: user.id, postId } },
    });

    if (existing) {
      await db.bookmark.delete({ where: { id: existing.id } });
      return NextResponse.json({ action: 'removed' });
    }

    try {
      await db.bookmark.create({
        data: { userId: user.id, postId },
      });
    } catch (error: unknown) {
      // Handle race condition: if unique constraint fails, bookmark was already added
      const prismaError = error as { code?: string };
      if (prismaError.code === 'P2002') {
        return NextResponse.json({ action: 'added' });
      }
      throw error;
    }

    return NextResponse.json({ action: 'added' });
  } catch (error) {
    console.error('Bookmark POST error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
