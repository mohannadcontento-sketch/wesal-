import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';
import { isValidAvatarId } from '@/lib/avatar-ids';
import { buildAuthUser, createSessionToken } from '@/lib/auth/session';

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
    const isBuiltIn = avatarUrl.startsWith('avatar:') && isValidAvatarId(avatarUrl);
    const isUrl = avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://');

    if (!isBuiltIn && !isUrl) {
      return NextResponse.json({ error: 'صورة غير صالحة' }, { status: 400 });
    }

    // Use upsert: create profile if missing, update if exists
    const profile = await db.profile.upsert({
      where: { userId: user.id },
      update: { avatarUrl },
      create: { userId: user.id, realName: user.profile?.realName || user.email.split('@')[0] },
    });

    // Build fresh auth user data with updated avatar
    const freshUser = await db.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    });
    const authUser = freshUser ? buildAuthUser(freshUser) : null;

    // Create a new session token with updated avatarUrl
    const response = NextResponse.json({
      avatarUrl: profile.avatarUrl,
      user: authUser,
    });

    // Update the session cookie so avatar is immediately fresh on reload
    if (authUser) {
      const token = await createSessionToken(authUser);
      response.cookies.set('wesal-session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Avatar PUT error:', error);
    return NextResponse.json({ error: 'حصل خطأ في تحديث الصورة' }, { status: 500 });
  }
}
