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
    await db.user.delete({ where: { id } });

    return NextResponse.json({ message: 'تم حذف المستخدم' });
  } catch (error) {
    console.error('Ban user error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
