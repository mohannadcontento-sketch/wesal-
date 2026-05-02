'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';

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
      <div className="avatar avatar-sm font-heading shrink-0 mt-0.5">
        {user.badge}
      </div>
      <div className="flex-1 flex items-center gap-2">
        <input
          type="text"
          placeholder="اكتب تعليق..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 h-9 px-3 rounded-xl border border-border bg-surface-dim text-body-sm text-text-primary placeholder:text-text-tertiary transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:bg-card"
          maxLength={1000}
          disabled={loading}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          className="btn btn-primary btn-sm btn-icon-sm shrink-0 disabled:opacity-40"
          title="إرسال"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
