import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const post = await db.post.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: 'مش موجود' }, { status: 404 });

    const reactions = await db.reaction.groupBy({
      by: ['type'],
      where: { targetId: id, targetType: 'post' },
      _count: { type: true },
    });
    const reactionMap: Record<string, number> = {};
    reactions.forEach((r) => { reactionMap[r.type] = r._count.type; });

    const comments = await db.comment.findMany({
      where: { postId: id, parentId: null },
      orderBy: { createdAt: 'asc' },
      include: {
        replies: { orderBy: { createdAt: 'asc' } },
      },
    });

    return NextResponse.json({ post: { ...post, reactions: reactionMap }, comments });
  } catch (error) {
    console.error('Post GET error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const { id } = await params;
    const post = await db.post.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: 'مش موجود' }, { status: 404 });

    if (post.authorId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'مش مسموح' }, { status: 403 });
    }

    await db.post.delete({ where: { id } });
    return NextResponse.json({ message: 'تم الحذف' });
  } catch (error) {
    console.error('Post DELETE error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
