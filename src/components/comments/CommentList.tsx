'use client';

import { useState, useEffect } from 'react';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { useAuth } from '@/hooks/useAuth';

interface Comment {
  id: string;
  authorDisplay: string;
  authorBadge: string;
  content: string;
  createdAt: string;
  reactions: Record<string, number>;
  replies?: Comment[];
}

export function CommentList({ postId, onCommentAdded }: { postId: string; onCommentAdded: () => void }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchComments() {
      try {
        const res = await fetch(`/api/posts/${postId}/comments`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setComments(data.comments || []);
        }
      } catch (error) {
        console.error('Fetch comments error:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchComments();
    return () => { cancelled = true; };
  }, [postId]);

  const handleCommentAdded = (comment: Record<string, unknown>) => {
    setComments((prev) => [...prev, comment as unknown as Comment]);
    onCommentAdded();
  };

  return (
    <div className="flex flex-col gap-4">
      {user && (
        <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-surface-container-high shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <div className="h-3.5 w-20 bg-surface-container-high rounded" />
                  <div className="h-3 w-12 bg-surface-container-high rounded" />
                </div>
                <div className="h-3.5 w-full bg-surface-container-high rounded" />
                <div className="h-3.5 w-3/4 bg-surface-container-high rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant mb-2">
            <span className="material-symbols-outlined text-xl">chat_bubble</span>
          </div>
          <p className="text-xs text-on-surface-variant text-center">
            لا توجد تعليقات بعد. كن أول من يعلق!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} />
          ))}
        </div>
      )}
    </div>
  );
}
