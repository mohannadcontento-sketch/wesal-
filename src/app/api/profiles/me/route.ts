import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

export async function GET(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user) {
      return NextResponse.json({ error: 'سجل دخول الأول' }, { status: 401 });
    }

    const profile = await db.profile.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Profile me GET error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user) {
      return NextResponse.json({ error: 'سجل دخول الأول' }, { status: 401 });
    }

    const body = await req.json();
    const { bio, location, avatarUrl } = body;

    const profile = await db.profile.update({
      where: { userId: user.id },
      data: {
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Profile me PATCH error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
