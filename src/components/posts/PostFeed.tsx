'use client';

import { useState, useEffect, useCallback } from 'react';
import { PostCard } from './PostCard';
import EmptyState from '@/components/shared/EmptyState';

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
  userReaction?: string | null;
  isSensitive?: boolean;
  sensitiveReason?: string;
  imageUrl?: string;
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
      <div className="flex flex-col gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface-bright rounded-xl border border-outline-variant/30 p-5 shadow-[0_4px_20px_0_rgba(23,42,57,0.02)] animate-pulse">
            {/* Author skeleton */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-surface-container-high shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 bg-surface-container-high rounded" />
                <div className="h-3 w-16 bg-surface-container-high rounded" />
              </div>
            </div>
            {/* Content skeleton */}
            <div className="space-y-2 mb-4">
              <div className="h-4 w-full bg-surface-container-high rounded" />
              <div className="h-4 w-4/5 bg-surface-container-high rounded" />
              <div className="h-4 w-3/5 bg-surface-container-high rounded" />
            </div>
            {/* Tags skeleton */}
            <div className="flex gap-2 mb-4">
              <div className="h-7 w-20 bg-surface-container-high rounded-full" />
              <div className="h-7 w-16 bg-surface-container-high rounded-full" />
            </div>
            {/* Action bar skeleton */}
            <div className="flex items-center justify-between border-t border-outline-variant/30 pt-3">
              <div className="flex gap-4">
                <div className="h-6 w-12 bg-surface-container-high rounded" />
                <div className="h-6 w-12 bg-surface-container-high rounded" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-6 bg-surface-container-high rounded" />
                <div className="h-6 w-6 bg-surface-container-high rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icon="forum"
        title="لا توجد مشاركات بعد"
        description="كن أول من ينشر تجربتك مع المجتمع!"
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
