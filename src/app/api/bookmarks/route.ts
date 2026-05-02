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

    return NextResponse.json({ bookmarks });
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

    await db.bookmark.create({
      data: { userId: user.id, postId },
    });

    return NextResponse.json({ action: 'added' });
  } catch (error) {
    console.error('Bookmark POST error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
