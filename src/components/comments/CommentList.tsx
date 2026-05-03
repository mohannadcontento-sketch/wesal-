'use client';

import { useState, useEffect } from 'react';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle } from 'lucide-react';

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
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-2.5 w-12" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-400 mb-2">
            <MessageCircle className="w-5 h-5" />
          </div>
          <p className="text-xs text-gray-400 text-center">
            لا توجد تعليقات بعد. كن أول من يعلق!
          </p>
        </div>
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
