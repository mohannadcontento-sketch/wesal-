import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'مش مسموح' }, { status: 403 });
    }

    const { id } = await params;

    // Prevent admin from banning themselves
    if (user.id === id) {
      return NextResponse.json({ error: 'مش تقدر تحظر نفسك' }, { status: 400 });
    }

    // Prevent banning other admins
    const targetUser = await db.user.findUnique({ where: { id } });
    if (!targetUser) return NextResponse.json({ error: 'المستخدم مش موجود' }, { status: 404 });
    if (targetUser.role === 'admin') {
      return NextResponse.json({ error: 'مش تقدر تحظر أدمن' }, { status: 400 });
    }

    const body = await req.json();
    const action = body.action || 'ban';

    if (action === 'ban') {
      await db.user.update({
        where: { id },
        data: { disabled: true },
      });
      return NextResponse.json({ message: 'تم حظر المستخدم' });
    } else if (action === 'unban') {
      await db.user.update({
        where: { id },
        data: { disabled: false },
      });
      return NextResponse.json({ message: 'تم فك الحظر' });
    }

    return NextResponse.json({ error: 'إجراء غلط' }, { status: 400 });
  } catch (error) {
    console.error('Ban user error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
