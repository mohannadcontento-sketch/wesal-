'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { MoodSelector } from './MoodSelector';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';

interface PostFormProps {
  onPostCreated?: () => void;
}

export function PostForm({ onPostCreated }: PostFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [moods, setMoods] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!user) return null;

  const charCount = content.length;
  const maxChars = 2000;
  const isNearLimit = charCount > maxChars * 0.85;

  const handleSubmit = async () => {
    if (!content.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), moods: moods.join(',') }),
      });

      if (res.ok) {
        setContent('');
        setMoods([]);
        toast.success('تم النشر!');
        // Trigger refresh of the post feed
        if (onPostCreated) {
          onPostCreated();
        } else {
          // Fallback: dispatch a custom event that PostFeed can listen to
          window.dispatchEvent(new CustomEvent('post-created'));
        }
      } else {
        const data = await res.json();
        toast.error(data.error || 'حصل خطأ في النشر');
      }
    } catch {
      toast.error('حصل خطأ، جرب تاني');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <motion.div
      className="card p-4"
      initial={false}
    >
      <div className="flex gap-3">
        <div className="avatar avatar-md font-heading shrink-0">
          {user.badge}
        </div>
        <div className="flex-1 space-y-3 min-w-0">
          {/* Textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              placeholder="شارك فكرة أو تجربة..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full min-h-[80px] resize-none rounded-xl border border-border bg-surface-dim px-3.5 py-3 text-body-md text-text-primary placeholder:text-text-tertiary transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:bg-card"
              maxLength={maxChars}
              disabled={loading}
            />
            {charCount > 0 && (
              <div
                className={`absolute bottom-2.5 left-3 text-[10px] font-medium transition-colors ${
                  isNearLimit ? 'text-warm' : 'text-text-tertiary'
                }`}
              >
                {charCount}/{maxChars}
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          <div className="flex items-center justify-between gap-2">
            <MoodSelector selected={moods} onChange={setMoods} />
            <div className="flex items-center gap-2">
              <span className="text-caption text-text-tertiary hidden sm:block">
                Ctrl+Enter للنشر
              </span>
              <button
                onClick={handleSubmit}
                disabled={loading || !content.trim()}
                className="btn btn-primary btn-sm gap-1.5 disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                {loading ? 'جاري النشر...' : 'نشر'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
