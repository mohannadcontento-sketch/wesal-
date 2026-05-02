import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'تم تسجيل الخروج' });

    // Clear the auth cookie
    response.cookies.set('wesal-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'حصل خطأ في تسجيل الخروج' },
      { status: 500 }
    );
  }
}
