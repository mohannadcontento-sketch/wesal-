import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const doctors = await db.user.findMany({
      where: { role: 'doctor' },
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });

    // Return in the format the frontend expects: (User & { profile?: Profile })[]
    const result = doctors.map((d) => ({
      id: d.id,
      email: d.email,
      phone: d.phone,
      role: d.role,
      disabled: d.disabled,
      emailVerified: d.emailVerified,
      createdAt: d.createdAt.toISOString(),
      profile: d.profile ? {
        id: d.profile.id,
        userId: d.profile.userId,
        username: d.profile.username,
        realName: d.profile.realName,
        bio: d.profile.bio,
        avatarUrl: d.profile.avatarUrl,
        specialty: d.profile.specialty,
        location: d.profile.location,
        rating: d.profile.rating,
        reputationScore: d.profile.reputationScore,
        reputationTier: d.profile.reputationTier,
        isVerified: d.profile.isVerified,
        verifiedAt: d.profile.verifiedAt?.toISOString() || null,
        createdAt: d.profile.createdAt.toISOString(),
      } : null,
    }));

    return NextResponse.json({ doctors: result });
  } catch (error) {
    console.error('Doctors GET error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
