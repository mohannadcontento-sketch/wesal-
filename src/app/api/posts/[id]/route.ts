import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { requireAuth } from '@/lib/supabase-server';

// ─── POST /api/posts/[id] — تفاعل مع منشور (لايك/مفيد/حفظ) ───
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 });
    }

    const { user, response: authError } = await requireAuth(request);
    if (authError) return authError;
    if (!user) return NextResponse.json({ success: false, error: 'لازم تسجل دخول' }, { status: 401 });

    const { id: postId } = await params;
    const { reactionType = 'like' } = await request.json();

    if (!['like', 'helpful', 'save'].includes(reactionType)) {
      return NextResponse.json({ success: false, error: 'نوع التفاعل مش صحيح' }, { status: 400 });
    }

    const userId = user.id; // users.id = auth.uid()

    // Toggle: لو التفاعل موجود → نحذفه، لو مش موجود → نضيفه
    const { data: existing } = await supabase!
      .from('post_reactions')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .eq('reaction_type', reactionType)
      .single();

    if (existing) {
      // حذف التفاعل
      await supabase!
        .from('post_reactions')
        .delete()
        .eq('id', existing.id);
      return NextResponse.json({ success: true, action: 'removed' });
    } else {
      // إضافة تفاعل
      const { error } = await supabase!
        .from('post_reactions')
        .insert({ user_id: userId, post_id: postId, reaction_type: reactionType });

      if (error) {
        return NextResponse.json({ success: false, error: 'حصل خطأ' }, { status: 500 });
      }
      return NextResponse.json({ success: true, action: 'added' });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'خطأ في السيرفر' }, { status: 500 });
  }
}
