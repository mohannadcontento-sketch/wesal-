import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;
    const profile = await db.profile.findUnique({ where: { username } });

    if (!profile) return NextResponse.json({ error: 'مش موجود' }, { status: 404 });

    const user = await db.user.findUnique({ where: { id: profile.userId } });
    if (!user) return NextResponse.json({ error: 'مش موجود' }, { status: 404 });

    const isPublic = user.role === 'doctor' || user.role === 'trusted' || profile.isVerified;

    const result: Record<string, unknown> = {
      username: profile.username,
      badge: user.role === 'doctor' ? '🏥' : user.role === 'trusted' ? '🌟' : '🔰',
      reputationScore: profile.reputationScore,
      reputationTier: profile.reputationTier,
    };

    if (isPublic) {
      result.realName = profile.realName;
      result.bio = profile.bio;
      result.avatarUrl = profile.avatarUrl;
      result.location = profile.location;
      if (user.role === 'doctor') {
        result.specialty = profile.specialty;
        result.rating = profile.rating;
      }
    }

    return NextResponse.json({ profile: result });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
