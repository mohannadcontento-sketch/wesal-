import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

// DELETE /api/notifications/[id] — delete a notification
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const { id } = await params;

    const notification = await db.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== user.id) {
      return NextResponse.json({ error: 'الإشعار مش موجود' }, { status: 404 });
    }

    await db.notification.delete({ where: { id } });

    return NextResponse.json({ message: 'تم حذف الإشعار' });
  } catch (error) {
    console.error('Notification DELETE error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
