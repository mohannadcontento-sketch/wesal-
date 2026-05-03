'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Bookmark,
  BookmarkCheck,
  Heart,
  MessageCircle,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <BookmarkCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">المحفوظات</h1>
            <p className="text-sm text-gray-500">
              {showLoading ? 'جاري التحميل...' : `${posts.length} مشاركة محفوظة`}
            </p>
          </div>
        </div>

        {/* Auth check */}
        {!user ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50">
              <Bookmark className="h-7 w-7 text-teal-600/40" />
            </div>
            <p className="text-sm text-gray-500">سجل دخول الأول</p>
          </div>
        ) : showLoading ? (
          /* Loading skeleton */
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="rounded-2xl border-gray-200 bg-white p-4 animate-pulse">
                <CardContent className="p-0">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-28 rounded bg-gray-200" />
                      <div className="h-3 w-full rounded bg-gray-200" />
                      <div className="h-3 w-3/4 rounded bg-gray-200" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isEmpty ? (
          /* Empty State */
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-50">
              <Bookmark className="h-9 w-9 text-teal-600/30" />
            </div>
            <p className="text-sm font-medium text-gray-900">مفيش مشاركات محفوظة</p>
            <p className="mt-1.5 text-sm text-gray-500 max-w-xs mx-auto">
              احفظ المشاركات اللي بتعجبك بالضغط على أيقونة الحفظ
            </p>
          </div>
        ) : (
          /* Bookmarked Posts */
          <div className="space-y-3">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="rounded-2xl border-gray-200 shadow-sm bg-white p-4 group relative"
              >
                <CardContent className="p-0">
                  {/* Author */}
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="size-10 bg-teal-50 text-teal-600">
                      <AvatarFallback className="bg-teal-50 text-teal-600 text-sm">
                        {post.authorBadge}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {post.authorRole === 'doctor' ? (
                          <Link href="/doctors" className="text-sm font-semibold text-gray-900 hover:text-teal-600 transition-colors truncate">
                            {post.authorDisplay}
                          </Link>
                        ) : (
                          <span className="text-sm font-semibold text-gray-900 truncate">{post.authorDisplay}</span>
                        )}
                        {post.authorRole === 'doctor' && (
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[10px]">طبيب</Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{timeAgo(post.createdAt)}</span>
                    </div>
                    {/* Remove bookmark button */}
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleRemoveBookmark(post.id)}
                      disabled={removing === post.id}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      title="إزالة من المحفوظات"
                    >
                      {removing === post.id ? (
                        <span className="h-4 w-4 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                      ) : (
                        <X className="size-4" />
                      )}
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="mb-3">
                    <p className="whitespace-pre-wrap text-sm text-gray-500 leading-relaxed line-clamp-3">{post.content}</p>
                    {post.moods && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {post.moods.split(',').filter(Boolean).map((mood, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="bg-teal-50 text-teal-700 hover:bg-teal-100 text-[11px]"
                          >
                            {mood.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Engagement Row */}
                  <Separator className="bg-gray-100 mb-3" />
                  <div className="flex items-center gap-4 text-gray-500 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5" />
                      <span>{post.reactionCount} إعجاب</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>{post.commentCount} تعليق</span>
                    </div>
                    <div className="flex-1" />
                    <div className="flex items-center gap-1 text-teal-600">
                      <BookmarkCheck className="h-3.5 w-3.5" />
                      <span className="text-[11px]">محفوظ</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
