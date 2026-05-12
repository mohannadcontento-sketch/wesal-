import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

// POST /api/supporters/apply - Apply to become a supporter
export async function POST(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    // Check if already a supporter
    const existing = await db.supporter.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      if (existing.status === 'pending') {
        return NextResponse.json({ error: 'طلبك لسه قيد المراجعة' }, { status: 400 });
      }
      if (existing.status === 'approved') {
        return NextResponse.json({ error: 'أنت داعم بالفعل' }, { status: 400 });
      }
      if (existing.status === 'suspended') {
        return NextResponse.json({ error: 'حسابك كداعم موقوف' }, { status: 403 });
      }
      if (existing.status === 'rejected') {
        // Allow re-apply after rejection
        await db.supporter.delete({ where: { id: existing.id } });
      }
    }

    const body = await req.json();
    const { bio, specialty, experience, certificates, avatarData } = body;

    if (!bio || bio.trim().length < 50) {
      return NextResponse.json({ error: 'اكتب نبذة عنك (50 حرف على الأقل)' }, { status: 400 });
    }

    // Validate qualification: must have at least one
    const hasCertificates = certificates && Array.isArray(certificates) && certificates.length > 0;
    const hasReputation = (user.reputationScore || 0) >= 200;

    if (!hasCertificates && !hasReputation) {
      return NextResponse.json({ error: 'لازم تكون حاصل على كورسات/شهادات أو عندك 200 نقطة سمعة على الأقل' }, { status: 400 });
    }

    // Handle avatar upload (base64 to URL)
    let avatarUrl = body.avatarUrl || null;
    if (avatarData && typeof avatarData === 'string' && avatarData.startsWith('data:image')) {
      try {
        const { getSupabaseService } = await import('@/lib/supabase/server');
        const supabase = getSupabaseService();
        if (supabase) {
          const buffer = Buffer.from(avatarData.split(',')[1], 'base64');
          const ext = avatarData.split(';')[0].split('/')[1] || 'jpg';
          const fileName = `supporters/${user.id}/${Date.now()}.${ext}`;

          const { error } = await supabase.storage
            .from('avatars')
            .upload(fileName, buffer, { contentType: `image/${ext}`, upsert: true });

          if (!error) {
            const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
            avatarUrl = data.publicUrl;
          }
        }
      } catch (imgErr) {
        console.error('Avatar upload error:', imgErr);
        // Continue without avatar
      }
    }

    const supporter = await db.supporter.create({
      data: {
        userId: user.id,
        bio: bio.trim(),
        specialty: specialty || 'دعم نفسي',
        experience: experience || '',
        certificates: JSON.stringify(certificates || []),
        avatarUrl,
        status: 'pending',
      },
    });

    return NextResponse.json({
      message: 'تم تقديم الطلب بنجاح! هنراجعه وهنرد عليك',
      supporterId: supporter.id,
    }, { status: 201 });
  } catch (error) {
    console.error('Supporter apply error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}

// GET /api/supporters/apply - Check current user's supporter status
export async function GET(req: Request) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return NextResponse.json({ error: 'سجل دخول' }, { status: 401 });

    const supporter = await db.supporter.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      isSupporter: !!supporter,
      status: supporter?.status || null,
      supporter: supporter ? {
        id: supporter.id,
        bio: supporter.bio,
        specialty: supporter.specialty,
        rating: supporter.rating,
        totalSessions: supporter.totalSessions,
      } : null,
      canApply: !supporter || supporter.status === 'rejected',
      reputationScore: user.reputationScore || 0,
      reputationRequired: 200,
    });
  } catch (error) {
    console.error('Supporter status check error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
