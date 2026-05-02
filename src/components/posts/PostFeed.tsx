'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PostCard } from './PostCard';
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
          <div key={i} className="card p-5 animate-pulse">
            {/* Author skeleton */}
            <div className="flex items-center gap-3 mb-4">
              <div className="skeleton h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3.5 w-28 rounded-md" />
                <div className="skeleton h-2.5 w-16 rounded-md" />
              </div>
            </div>
            {/* Content skeleton */}
            <div className="space-y-2 mb-4">
              <div className="skeleton h-3 w-full rounded-md" />
              <div className="skeleton h-3 w-4/5 rounded-md" />
              <div className="skeleton h-3 w-3/5 rounded-md" />
            </div>
            {/* Action bar skeleton */}
            <div className="flex gap-3 pt-3 border-t border-border-light">
              <div className="skeleton h-7 w-16 rounded-lg" />
              <div className="skeleton h-7 w-16 rounded-lg" />
              <div className="skeleton h-7 w-16 rounded-lg" />
              <div className="flex-1" />
              <div className="skeleton h-7 w-10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="py-16 text-center"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light">
          <MessageSquarePlus className="w-7 h-7 text-primary" />
        </div>
        <p className="text-body-md font-semibold text-text-primary mb-1">لا توجد مشاركات بعد</p>
        <p className="text-body-sm text-text-tertiary">كن أول من ينشر تجربتك مع المجتمع!</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <PostCard post={post} />
        </motion.div>
      ))}
    </div>
  );
}
