import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ─── POST /api/posts/[id]/comments — إضافة تفاعل (لايك / مفيد / حفظ) ───
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 });
    }

    const { id: postId } = await params;
    const { userId, reactionType } = await request.json();

    if (!userId || !reactionType || !['like', 'helpful', 'save'].includes(reactionType)) {
      return NextResponse.json({ success: false, error: 'بيانات غير صالحة' }, { status: 400 });
    }

    // التحقق من هل التفاعل موجود
    const { data: existing } = await supabase!
      .from('post_reactions')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .eq('reaction_type', reactionType)
      .single();

    if (existing) {
      // إزالة التفاعل (toggle off)
      await supabase!.from('post_reactions').delete().eq('id', existing.id);
      return NextResponse.json({ success: true, action: 'removed' });
    }

    // إضافة تفاعل جديد
    const { error } = await supabase!
      .from('post_reactions')
      .insert({ user_id: userId, post_id: postId, reaction_type: reactionType });

    if (error) {
      return NextResponse.json({ success: false, error: 'حصل خطأ' }, { status: 500 });
    }

    // تحديث السمعة لو تفاعل مفيد
    if (reactionType === 'helpful') {
      const { data: post } = await supabase!
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();
      if (post) {
        await supabase!.from('reputation_logs').insert({
          user_id: post.user_id,
          action: 'received_helpful',
          points: 2.0,
          source_type: 'post',
          source_id: postId,
        });
      }
    }

    return NextResponse.json({ success: true, action: 'added' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'خطأ في السيرفر' }, { status: 500 });
  }
}
