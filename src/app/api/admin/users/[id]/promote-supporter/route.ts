import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

// POST /api/admin/users/[id]/promote-supporter - Promote a user to supporter via reputation
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getUserFromSession(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'مش مسموح' }, { status: 403 });
    }

    const { id: userId } = await params;
    const body = await req.json();
    const { specialty, bio, reviewNotes } = body;

    // Check user exists
    const targetUser = await db.user.findUnique({
      where: { id: userId },
      include: { profile: true, supporterProfile: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'المستخدم مش موجود' }, { status: 404 });
    }

    // Check not already a supporter
    if (targetUser.supporterProfile) {
      if (targetUser.supporterProfile.status === 'approved') {
        return NextResponse.json({ error: 'المستخدم ده داعم بالفعل' }, { status: 400 });
      }
      if (targetUser.supporterProfile.status === 'pending') {
        return NextResponse.json({ error: 'المستخدم عنده طلب داعم معلق بالفعل' }, { status: 400 });
      }
    }

    // Check reputation score
    const reputationScore = targetUser.profile?.reputationScore || 0;
    if (reputationScore < 200) {
      return NextResponse.json({ error: 'المستخدم لازم يكون عنده 200 نقطة سمعة على الأقل' }, { status: 400 });
    }

    // Delete any existing rejected/suspended supporter record
    if (targetUser.supporterProfile) {
      await db.supporter.delete({ where: { id: targetUser.supporterProfile.id } });
    }

    // Create supporter record (auto-approved since admin is promoting)
    const supporter = await db.supporter.create({
      data: {
        userId: targetUser.id,
        bio: bio || `داعم معتمد بناءً على مستوى السمعة (${reputationScore} نقطة)`,
        specialty: specialty || 'دعم نفسي',
        experience: targetUser.profile?.specialty || '',
        certificates: JSON.stringify([]),
        certificateFiles: JSON.stringify([]),
        status: 'approved',
        reviewedBy: admin.id,
        reviewNotes: reviewNotes || 'تم الترقية تلقائياً بناءً على مستوى السمعة',
        source: 'reputation',
        reputationOfferedAt: new Date(),
        available: true,
      },
    });

    // Update user role to supporter
    await db.user.update({
      where: { id: targetUser.id },
      data: { role: 'supporter' },
    });

    // Update profile verification
    await db.profile.updateMany({
      where: { userId: targetUser.id },
      data: { isVerified: true, verifiedAt: new Date() },
    });

    // Send notification to the user
    await db.notification.create({
      data: {
        userId: targetUser.id,
        type: 'supporter',
        title: 'تم ترقيتك لداعم!',
        body: `مبروك! بناءً على مستواك المميز في السمعة (${reputationScore} نقطة)، تم ترقيتك لداعم معتمد في وصال.`,
      },
    });

    return NextResponse.json({
      message: 'تم ترقية المستخدم لداعم بنجاح',
      supporterId: supporter.id,
    }, { status: 201 });
  } catch (error) {
    console.error('Promote supporter error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
