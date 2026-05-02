import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const doctors = await db.user.findMany({
      where: { role: 'doctor' },
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });

    const result = doctors.map((d) => ({
      id: d.id,
      realName: d.profile?.realName || '',
      specialty: d.profile?.specialty || '',
      bio: d.profile?.bio || '',
      avatarUrl: d.profile?.avatarUrl,
      rating: d.profile?.rating || 0,
      location: d.profile?.location || '',
    }));

    return NextResponse.json({ doctors: result });
  } catch (error) {
    console.error('Doctors GET error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
