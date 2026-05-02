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
    <div className="space-y-4">
      {user && (
        <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-2.5">
              <div className="skeleton h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <div className="skeleton h-3 w-20 rounded-md" />
                  <div className="skeleton h-2.5 w-12 rounded-md" />
                </div>
                <div className="skeleton h-3 w-full rounded-md" />
                <div className="skeleton h-3 w-3/4 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-caption text-text-tertiary py-4">
          لا توجد تعليقات بعد. كن أول من يعلق!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} />
          ))}
        </div>
      )}
    </div>
  );
}
