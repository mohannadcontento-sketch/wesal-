import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ─── GET /api/posts — جلب المنشورات ───
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ posts: [], message: 'Supabase not configured — using mock data' });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: posts, error } = await supabase!
      .from('posts')
      .select(`
        id,
        content,
        likes_count,
        helpfuls_count,
        comments_count,
        created_at,
        user_id,
        users:user_id (anon_id, avatar_color)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ posts: [], error: error.message }, { status: 500 });
    }

    const formattedPosts = posts?.map(post => ({
      id: post.id,
      content: post.content,
      likes: post.likes_count || 0,
      helpfuls: post.helpfuls_count || 0,
      comments: post.comments_count || 0,
      time: formatRelativeTime(post.created_at),
      author: (post.users as any)?.[0]?.anon_id || 'مجهول',
      authorInitial: (post.users as any)?.[0]?.anon_id?.charAt(0) || 'م',
      authorColor: (post.users as any)?.[0]?.avatar_color || 'bg-gray-100 text-gray-700',
    })) || [];

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    return NextResponse.json({ posts: [] }, { status: 500 });
  }
}

// ─── POST /api/posts — إنشاء منشور ───
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 });
    }

    const { content, userId } = await request.json();

    if (!content || !userId) {
      return NextResponse.json({ success: false, error: 'المحتوى مطلوب' }, { status: 400 });
    }

    // فحص المحتوى — كلمات محظورة بسيطة
    const blockedWords = ['انتحار', 'أقتل', 'أموت', 'القضاء على'];
    const hasBlockedWord = blockedWords.some(w => content.includes(w));
    const status = hasBlockedWord ? 'pending' : 'published';

    const { data: post, error } = await supabase!
      .from('posts')
      .insert({
        user_id: userId,
        content: content.slice(0, 2000),
        status,
      })
      .select('id, content, created_at')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: 'حصل خطأ أثناء النشر' }, { status: 500 });
    }

    // لو فيه كلمات محظورة → بلاغ أمان تلقائي
    if (hasBlockedWord) {
      await supabase!.from('safety_reports').insert({
        reporter_id: userId,
        content_type: 'post',
        content_id: post.id,
        reason: 'كلمات محظورة مكتشفة تلقائياً',
        risk_score: 50,
        status: 'pending',
      });
    }

    return NextResponse.json({ success: true, post });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'خطأ في السيرفر' }, { status: 500 });
  }
}

// ─── DELETE /api/posts?id=xxx — حذف منشور ───
export async function DELETE(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!postId || !userId) {
      return NextResponse.json({ success: false, error: 'معرف المنشور مطلوب' }, { status: 400 });
    }

    const { error } = await supabase!
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ success: false, error: 'حصل خطأ أثناء الحذف' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'خطأ في السيرفر' }, { status: 500 });
  }
}

// ─── Helper: تنسيق الوقت النسبي ───
function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays === 1) return 'أمس';
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  return date.toLocaleDateString('ar-EG');
}
