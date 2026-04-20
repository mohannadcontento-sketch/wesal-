import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { requireAuth } from '@/lib/supabase-server';

// ─── GET /api/consultations — جلب الدكاترة (مفتوح للكل) ───
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ doctors: [], message: 'Supabase not configured' });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';

    let query = supabase!
      .from('doctors')
      .select('*')
      .eq('is_verified', true)
      .order('rating', { ascending: false });

    if (category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: doctors, error } = await query;

    if (error) {
      return NextResponse.json({ doctors: [], error: error.message }, { status: 500 });
    }

    const formattedDoctors = doctors?.map(d => ({
      id: d.id,
      name: d.name,
      specialty: d.specialty,
      category: d.category,
      rating: d.rating,
      reviews: d.reviews_count,
      sessions: d.sessions_count,
      price: `${d.price} جنيه`,
      types: d.session_types || ['chat'],
      bio: d.bio || '',
      color: d.avatar_color || 'bg-teal-100 text-teal-700',
      initial: d.avatar_initial || d.name.charAt(0),
      availableTimes: d.available_times || [],
    })) || [];

    return NextResponse.json({ doctors: formattedDoctors });
  } catch (error) {
    return NextResponse.json({ doctors: [] }, { status: 500 });
  }
}

// ─── POST /api/consultations — حجز جلسة (محتاج تسجيل دخول) ───
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 });
    }

    const { user, response: authError } = await requireAuth(request);
    if (authError) return authError;
    if (!user) return NextResponse.json({ success: false, error: 'لازم تسجل دخول' }, { status: 401 });

    const { doctorId, sessionType, selectedTime } = await request.json();

    if (!doctorId || !sessionType) {
      return NextResponse.json({ success: false, error: 'البيانات مطلوبة' }, { status: 400 });
    }

    const patientId = user.id; // users.id = auth.uid()

    const { data: consultation, error } = await supabase!
      .from('consultations')
      .insert({
        patient_id: patientId,
        doctor_id: doctorId,
        session_type: sessionType,
        selected_time: selectedTime || null,
        status: 'pending',
      })
      .select('id, session_type, status, created_at')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: 'حصل خطأ أثناء الحجز' }, { status: 500 });
    }

    return NextResponse.json({ success: true, consultation });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'خطأ في السيرفر' }, { status: 500 });
  }
}
