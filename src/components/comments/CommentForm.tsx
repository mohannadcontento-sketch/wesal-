'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onCommentAdded: (comment: Record<string, unknown>) => void;
}

export function CommentForm({ postId, parentId, onCommentAdded }: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId }),
      });

      if (res.ok) {
        const data = await res.json();
        onCommentAdded(data.comment);
        setContent('');
      } else {
        const data = await res.json();
        toast.error(data.error || 'حصل خطأ');
      }
    } catch {
      toast.error('حصل خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-2.5 items-start">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center shrink-0">
        <span className="text-[10px] font-semibold text-primary-container">{user.badge}</span>
      </div>
      <div className="flex-1 flex items-center gap-2">
        <input
          type="text"
          placeholder="اكتب تعليق..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 h-9 px-3 rounded-xl border border-outline-variant bg-surface-container-low text-xs text-on-surface placeholder:text-on-surface-variant transition-all duration-200 focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 focus:bg-surface-container-lowest outline-none"
          maxLength={1000}
          disabled={loading}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          className="shrink-0 h-8 w-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          title="إرسال"
        >
          {loading ? (
            <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-[16px]">send</span>
          )}
        </button>
      </div>
    </div>
  );
}
