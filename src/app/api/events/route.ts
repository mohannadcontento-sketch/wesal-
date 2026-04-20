import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { requireAuth } from '@/lib/supabase-server';

// ─── GET /api/events — جلب الفعاليات (مفتوح للكل) ───
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ events: [], message: 'Supabase not configured' });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    let query = supabase!
      .from('events')
      .select(`
        id, title, description, speaker_name, speaker_specialty,
        event_type, event_date, event_time, registered_count, max_capacity,
        status, meeting_link, created_at,
        doctor:doctor_id (avatar_initial, avatar_color)
      `)
      .order('event_date', { ascending: true });

    if (status === 'upcoming') {
      query = query.in('status', ['approved']).gte('event_date', new Date().toISOString().split('T')[0]);
    } else if (status === 'past') {
      query = query.in('status', ['approved', 'completed']).lt('event_date', new Date().toISOString().split('T')[0]);
    }

    const { data: events, error } = await query;

    if (error) {
      return NextResponse.json({ events: [], error: error.message }, { status: 500 });
    }

    const formattedEvents = events?.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      speaker: e.speaker_name,
      speakerSpecialty: e.speaker_specialty,
      type: e.event_type,
      date: new Date(e.event_date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: e.event_time,
      registered: e.registered_count || 0,
      capacity: e.max_capacity || 100,
      status: e.event_date > new Date().toISOString().split('T')[0]
        ? (e.status === 'approved' ? 'available' : 'coming_soon')
        : 'past',
      color: (e.doctor as any)?.[0]?.avatar_color || 'bg-teal-100 text-teal-700',
      initial: (e.doctor as any)?.[0]?.avatar_initial || e.speaker_name?.charAt(0) || '?',
    })) || [];

    return NextResponse.json({ events: formattedEvents });
  } catch (error) {
    return NextResponse.json({ events: [] }, { status: 500 });
  }
}

// ─── POST /api/events — تسجيل في فعالية (محتاج تسجيل دخول) ───
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 });
    }

    const { user, response: authError } = await requireAuth(request);
    if (authError) return authError;
    if (!user) return NextResponse.json({ success: false, error: 'لازم تسجل دخول' }, { status: 401 });

    const { eventId } = await request.json();

    if (!eventId) {
      return NextResponse.json({ success: false, error: 'البيانات مطلوبة' }, { status: 400 });
    }

    const userId = user.id; // users.id = auth.uid()

    // التحقق من المساحة
    const { data: event } = await supabase!
      .from('events')
      .select('registered_count, max_capacity')
      .eq('id', eventId)
      .single();

    if (event && event.registered_count >= event.max_capacity) {
      return NextResponse.json({ success: false, error: 'المقاعد ممتلئة' }, { status: 400 });
    }

    // إضافة تسجيل
    const { error } = await supabase!
      .from('event_registrations')
      .insert({ user_id: userId, event_id: eventId });

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: 'أنت مسجل بالفعل' }, { status: 409 });
      }
      return NextResponse.json({ success: false, error: 'حصل خطأ' }, { status: 500 });
    }

    // تحديث عدد المسجلين
    await supabase!
      .from('events')
      .update({ registered_count: (event?.registered_count || 0) + 1 })
      .eq('id', eventId);

    return NextResponse.json({ success: true, message: 'تم التسجيل بنجاح' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'خطأ في السيرفر' }, { status: 500 });
  }
}

// ─── DELETE /api/events — إلغاء التسجيل (محتاج تسجيل دخول) ───
export async function DELETE(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 });
    }

    const { user, response: authError } = await requireAuth(request);
    if (authError) return authError;
    if (!user) return NextResponse.json({ success: false, error: 'لازم تسجل دخول' }, { status: 401 });

    const { eventId } = await request.json();

    if (!eventId) {
      return NextResponse.json({ success: false, error: 'البيانات مطلوبة' }, { status: 400 });
    }

    const userId = user.id;

    const { error } = await supabase!
      .from('event_registrations')
      .delete()
      .eq('user_id', userId)
      .eq('event_id', eventId);

    if (error) {
      return NextResponse.json({ success: false, error: 'حصل خطأ' }, { status: 500 });
    }

    // تحديث عدد المسجلين
    const { data: event } = await supabase!
      .from('events')
      .select('registered_count')
      .eq('id', eventId)
      .single();

    if (event) {
      await supabase!
        .from('events')
        .update({ registered_count: Math.max(0, (event.registered_count || 1) - 1) })
        .eq('id', eventId);
    }

    return NextResponse.json({ success: true, message: 'تم إلغاء التسجيل' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'خطأ في السيرفر' }, { status: 500 });
  }
}
