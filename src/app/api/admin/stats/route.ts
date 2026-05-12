import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

export async function GET(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const [totalUsers, doctors, posts, pendingSupporters] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: 'doctor' } }),
      db.post.count(),
      db.supporter.count({ where: { status: 'pending' } }),
    ]);

    return NextResponse.json({ totalUsers, doctors, posts, pendingSupporters });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
