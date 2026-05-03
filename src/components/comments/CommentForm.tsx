'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

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
      <Avatar size="sm">
        <AvatarFallback className="bg-teal-100 text-teal-700 font-semibold text-[10px]">
          {user.badge}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 flex items-center gap-2">
        <input
          type="text"
          placeholder="اكتب تعليق..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 h-9 px-3 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 focus:bg-white outline-none"
          maxLength={1000}
          disabled={loading}
        />
        <Button
          variant="default"
          size="icon-sm"
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          title="إرسال"
          className="shrink-0 h-8 w-8"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
