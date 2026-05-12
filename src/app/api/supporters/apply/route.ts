import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth/session';

// POST /api/supporters/apply - Apply to become a supporter (with certificate file uploads)
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

    // Parse FormData for file uploads
    const formData = await req.formData();
    const bio = formData.get('bio') as string;
    const specialty = (formData.get('specialty') as string) || 'دعم نفسي';
    const experience = (formData.get('experience') as string) || '';
    const certificateNamesRaw = formData.get('certificateNames') as string;
    let certificateNames: string[] = [];
    try {
      certificateNames = JSON.parse(certificateNamesRaw || '[]');
    } catch {
      certificateNames = [];
    }

    if (!bio || bio.trim().length < 50) {
      return NextResponse.json({ error: 'اكتب نبذة عنك (50 حرف على الأقل)' }, { status: 400 });
    }

    // Validate qualification: must have certificates OR reputation
    const hasCertificates = certificateNames.length > 0;
    const hasReputation = (user.profile?.reputationScore || 0) >= 200;
    const hasUploadedFiles = formData.getAll('certificateFiles').length > 0;

    if (!hasCertificates && !hasReputation && !hasUploadedFiles) {
      return NextResponse.json({ error: 'لازم تكون حاصل على كورسات/شهادات أو عندك 200 نقطة سمعة على الأقل' }, { status: 400 });
    }

    // Upload certificate files to Supabase Storage
    const certificateFileUrls: string[] = [];
    const files = formData.getAll('certificateFiles') as File[];
    
    if (files.length > 0) {
      try {
        const { getSupabaseService } = await import('@/lib/supabase/server');
        const supabase = getSupabaseService();
        
        if (supabase) {
          for (const file of files) {
            if (file.size > 5 * 1024 * 1024) { // 5MB max
              return NextResponse.json({ error: `حجم ملف ${file.name} أكبر من 5 ميجا` }, { status: 400 });
            }
            
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
              return NextResponse.json({ error: `نوع ملف ${file.name} غير مدعوم. استخدم صور أو PDF` }, { status: 400 });
            }

            const buffer = Buffer.from(await file.arrayBuffer());
            const ext = file.name.split('.').pop() || 'jpg';
            const fileName = `certificates/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

            const { error: uploadError } = await supabase.storage
              .from('avatars')
              .upload(fileName, buffer, { contentType: file.type, upsert: true });

            if (!uploadError) {
              const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
              certificateFileUrls.push(data.publicUrl);
            } else {
              console.error('Certificate upload error:', uploadError);
            }
          }
        }
      } catch (uploadErr) {
        console.error('Certificate file upload error:', uploadErr);
        // Continue without file uploads
      }
    }

    // Handle avatar upload (base64 to URL)
    let avatarUrl: string | null = null;
    const avatarFile = formData.get('avatar') as File | null;
    if (avatarFile && avatarFile.size > 0) {
      try {
        const { getSupabaseService } = await import('@/lib/supabase/server');
        const supabase = getSupabaseService();
        if (supabase) {
          const buffer = Buffer.from(await avatarFile.arrayBuffer());
          const ext = avatarFile.name.split('.').pop() || 'jpg';
          const fileName = `supporters/${user.id}/avatar-${Date.now()}.${ext}`;

          const { error } = await supabase.storage
            .from('avatars')
            .upload(fileName, buffer, { contentType: avatarFile.type, upsert: true });

          if (!error) {
            const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
            avatarUrl = data.publicUrl;
          }
        }
      } catch (imgErr) {
        console.error('Avatar upload error:', imgErr);
      }
    }

    const supporter = await db.supporter.create({
      data: {
        userId: user.id,
        bio: bio.trim(),
        specialty,
        experience: experience.trim(),
        certificates: JSON.stringify(certificateNames),
        certificateFiles: JSON.stringify(certificateFileUrls),
        avatarUrl,
        status: 'pending',
        source: 'application',
      },
    });

    return NextResponse.json({
      message: 'تم تقديم الطلب بنجاح! هنراجع شهاداتك وبياناتك وهنرد عليك',
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

    const reputationScore = user.profile?.reputationScore || 0;
    const reputationTier = user.profile?.reputationTier || 'beginner';

    return NextResponse.json({
      isSupporter: !!supporter,
      status: supporter?.status || null,
      supporter: supporter ? {
        id: supporter.id,
        bio: supporter.bio,
        specialty: supporter.specialty,
        rating: supporter.rating,
        totalSessions: supporter.totalSessions,
        certificateFiles: JSON.parse(supporter.certificateFiles || '[]'),
        source: supporter.source,
      } : null,
      canApply: !supporter || supporter.status === 'rejected',
      reputationScore,
      reputationRequired: 200,
      reputationTier,
      eligibleForSupporter: reputationScore >= 200 && !supporter,
    });
  } catch (error) {
    console.error('Supporter status check error:', error);
    return NextResponse.json({ error: 'حصل خطأ' }, { status: 500 });
  }
}
