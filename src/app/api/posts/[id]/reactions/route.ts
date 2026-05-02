import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { type } = body;

    const validTypes = ['like', 'sad', 'angry'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'نوع تفاعل غلط' }, { status: 400 });
    }

    const existing = await db.reaction.findUnique({
      where: { userId_targetId_targetType_type: { userId: user.id, targetId: id, targetType: 'post', type } },
    });

    if (existing) {
      await db.reaction.delete({ where: { id: existing.id } });
      await db.post.update({ where: { id }, data: { reactionCount: { decrement: 1 } } });
      return NextResponse.json({ action: 'removed' });
    }

    await db.reaction.create({
      data: { userId: user.id, targetId: id, targetType: 'post', type },
    });
    await db.post.update({ where: { id }, data: { reactionCount: { increment: 1 } } });

    // Check trending
    const post = await db.post.findUnique({ where: { id } });
    if (post && post.section !== 'trending' && (post.reactionCount >= 5 || post.commentCount >= 3)) {
      await db.post.update({ where: { id }, data: { section: 'trending' } });
    }

    return NextResponse.json({ action: 'added' });
  } catch (error) {
    console.error('Post reaction error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
