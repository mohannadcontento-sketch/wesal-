import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';
import { AVATARS } from '@/lib/avatars';

export async function PUT(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user) {
      return NextResponse.json({ error: 'سجل دخول الأول' }, { status: 401 });
    }

    const body = await req.json();
    const { avatarUrl } = body;

    if (!avatarUrl || typeof avatarUrl !== 'string') {
      return NextResponse.json({ error: 'الصورة مطلوبة' }, { status: 400 });
    }

    // Validate avatarUrl: must be either a built-in avatar or a valid URL
    const isBuiltIn = avatarUrl.startsWith('avatar:') && AVATARS.some((a) => a.id === avatarUrl);
    const isUrl = avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://');

    if (!isBuiltIn && !isUrl) {
      return NextResponse.json({ error: 'صورة غير صالحة' }, { status: 400 });
    }

    // Ensure profile exists
    const existingProfile = await db.profile.findUnique({
      where: { userId: user.id },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: 'الملف الشخصي غير موجود' }, { status: 404 });
    }

    // Update avatar
    const profile = await db.profile.update({
      where: { userId: user.id },
      data: { avatarUrl },
    });

    return NextResponse.json({ avatarUrl: profile.avatarUrl });
  } catch (error) {
    console.error('Avatar PUT error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
