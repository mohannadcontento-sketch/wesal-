import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ─── GET /api/posts/[id]/comments — جلب التعليقات ───
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ comments: [] });
    }

    const { id: postId } = await params;

    const { data: comments, error } = await supabase!
      .from('comments')
      .select(`
        id,
        content,
        helpful_count,
        parent_id,
        created_at,
        user_id,
        users:user_id (anon_id, avatar_color)
      `)
      .eq('post_id', postId)
      .eq('status', 'published')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ comments: [], error: error.message }, { status: 500 });
    }

    const formattedComments = comments?.map(c => ({
      id: c.id,
      content: c.content,
      helpfuls: c.helpful_count || 0,
      parentId: c.parent_id,
      time: formatRelativeTime(c.created_at),
      author: (c.users as any)?.[0]?.anon_id || 'مجهول',
      authorInitial: (c.users as any)?.[0]?.anon_id?.charAt(0) || 'م',
      authorColor: (c.users as any)?.[0]?.avatar_color || 'bg-gray-100 text-gray-700',
    })) || [];

    return NextResponse.json({ comments: formattedComments });
  } catch (error) {
    return NextResponse.json({ comments: [] }, { status: 500 });
  }
}

// ─── POST /api/posts/[id]/comments — إضافة تعليق ───
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 });
    }

    const { id: postId } = await params;
    const { content, userId, parentId } = await request.json();

    if (!content || !userId) {
      return NextResponse.json({ success: false, error: 'المحتوى مطلوب' }, { status: 400 });
    }

    const { data: comment, error } = await supabase!
      .from('comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content: content.slice(0, 1000),
        parent_id: parentId || null,
      })
      .select('id, content, created_at')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: 'حصل خطأ' }, { status: 500 });
    }

    // تحديث عدد التعليقات في المنشور
    await supabase!.rpc('update_post_counts_fn');

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'خطأ في السيرفر' }, { status: 500 });
  }
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  return 'أمس';
}
