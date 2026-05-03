'use client';

import { useState, useEffect, useCallback } from 'react';
import { PostCard } from './PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/EmptyState';
import { MessageSquarePlus } from 'lucide-react';

interface Post {
  id: string;
  authorDisplay: string;
  authorBadge: string;
  authorRole: string;
  content: string;
  moods: string;
  section: string;
  commentCount: number;
  reactionCount: number;
  createdAt: string;
  reactions: Record<string, number>;
}

export function PostFeed({ section }: { section: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?section=${section}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Fetch posts error:', error);
    } finally {
      setLoading(false);
    }
  }, [section]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Listen for new posts created by PostForm
  useEffect(() => {
    const handlePostCreated = () => {
      fetchPosts();
    };
    window.addEventListener('post-created', handlePostCreated);
    return () => window.removeEventListener('post-created', handlePostCreated);
  }, [fetchPosts]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4 animate-pulse">
            {/* Author skeleton */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
            {/* Content skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
            {/* Action bar skeleton */}
            <div className="flex gap-3 pt-3 border-t border-gray-100">
              <Skeleton className="h-7 w-16 rounded-lg" />
              <Skeleton className="h-7 w-16 rounded-lg" />
              <Skeleton className="h-7 w-16 rounded-lg" />
              <div className="flex-1" />
              <Skeleton className="h-7 w-10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={MessageSquarePlus}
        title="لا توجد مشاركات بعد"
        description="كن أول من ينشر تجربتك مع المجتمع!"
      />
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
