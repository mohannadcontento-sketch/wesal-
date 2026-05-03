'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Post {
  id: string;
  authorDisplay: string;
  authorBadge: string;
  authorRole: string;
  content: string;
  moods: string;
  commentCount: number;
  reactionCount: number;
  createdAt: string;
  reactions?: Record<string, number>;
}

export default function BookmarksPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch('/api/bookmarks')
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        setPosts(
          (data.bookmarks || [])
            .map((b: { post: Post }) => b.post)
            .filter(Boolean)
        );
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user]);

  const handleRemoveBookmark = async (postId: string) => {
    setRemoving(postId);
    const prevPosts = posts;
    setPosts(prev => prev.filter(p => p.id !== postId));
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.action === 'removed') {
          toast.success('تم إزالة الحفظ');
        } else {
          setPosts(prevPosts);
        }
      } else {
        setPosts(prevPosts);
        toast.error('حصل خطأ');
      }
    } catch {
      setPosts(prevPosts);
      toast.error('حصل خطأ');
    } finally {
      setRemoving(null);
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
  };

  const showLoading = loading && user;
  const isEmpty = !user || (!loading && posts.length === 0);

  return (
    <MainLayout>
      <div className="px-5 py-4 space-y-5">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container-low text-primary-container">
            <span className="material-symbols-outlined text-xl filled">bookmark</span>
          </div>
          <div>
            <h1 className="font-bold text-on-surface text-sm">المحفوظات</h1>
            <p className="text-sm text-on-surface-variant">
              {showLoading ? 'جاري التحميل...' : `${posts.length} مشاركة محفوظة`}
            </p>
          </div>
        </div>

        {/* Auth check */}
        {!user ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container-low">
              <span className="material-symbols-outlined text-3xl text-outline-variant">bookmark</span>
            </div>
            <p className="text-sm text-on-surface-variant">سجل دخول الأول</p>
          </div>
        ) : showLoading ? (
          /* Loading skeleton */
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-surface-container-high shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-28 rounded bg-surface-container-high" />
                    <div className="h-3 w-full rounded bg-surface-container-high" />
                    <div className="h-3 w-3/4 rounded bg-surface-container-high" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          /* Empty State */
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-container-low">
              <span className="material-symbols-outlined text-5xl text-outline-variant">bookmark_border</span>
            </div>
            <p className="text-sm font-medium text-on-surface">مفيش مشاركات محفوظة</p>
            <p className="mt-1.5 text-sm text-on-surface-variant max-w-xs mx-auto">
              احفظ المشاركات اللي بتعجبك بالضغط على أيقونة الحفظ
            </p>
          </div>
        ) : (
          /* Bookmarked Posts */
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-sm p-4 group relative hover:shadow-[0_8px_32px_0_rgba(0,67,70,0.08)] transition-all"
              >
                {/* Author */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-10 w-10 rounded-full bg-surface-container-low flex items-center justify-center text-sm">
                    {post.authorBadge}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {post.authorRole === 'doctor' ? (
                        <Link href="/doctors" className="text-sm font-semibold text-on-surface hover:text-primary-container transition-colors truncate">
                          {post.authorDisplay}
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold text-on-surface truncate">{post.authorDisplay}</span>
                      )}
                      {post.authorRole === 'doctor' && (
                        <span className="text-[10px] font-medium bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded-full">طبيب</span>
                      )}
                    </div>
                    <span className="text-xs text-on-surface-variant">{timeAgo(post.createdAt)}</span>
                  </div>
                  {/* Remove bookmark button */}
                  <button
                    onClick={() => handleRemoveBookmark(post.id)}
                    disabled={removing === post.id}
                    className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    title="إزالة من المحفوظات"
                  >
                    {removing === post.id ? (
                      <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-lg">close</span>
                    )}
                  </button>
                </div>

                {/* Content */}
                <div className="mb-3">
                  <p className="whitespace-pre-wrap text-sm text-on-surface leading-relaxed line-clamp-3">{post.content}</p>
                  {post.moods && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {post.moods.split(',').filter(Boolean).map((mood, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant text-[11px] font-medium"
                        >
                          {mood.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Engagement Row */}
                <div className="flex items-center gap-4 pt-3 border-t border-outline-variant/20 text-on-surface-variant text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">favorite</span>
                    <span>{post.reactionCount} إعجاب</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">comment</span>
                    <span>{post.commentCount} تعليق</span>
                  </div>
                  <div className="flex-1" />
                  <div className="flex items-center gap-1 text-primary-container">
                    <span className="material-symbols-outlined text-base filled">bookmark</span>
                    <span className="text-[11px] font-medium">محفوظ</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
