'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MoodSelector } from './MoodSelector';
import { toast } from 'sonner';

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
        if (onPostCreated) {
          onPostCreated();
        } else {
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
    <section className="bg-surface-bright rounded-xl border border-outline-variant/30 p-4 sm:p-5 shadow-[0_4px_20px_0_rgba(23,42,57,0.02)] mb-6">
      <div className="flex gap-4 items-start">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 mt-1 bg-primary-container/10 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary-container">{user.badge}</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              placeholder="ماذا يدور في ذهنك؟ شارك المجتمع..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-surface-container-low rounded-lg p-3 text-base text-on-surface placeholder:text-on-surface-variant border-none focus:ring-2 focus:ring-primary-container/50 resize-none min-h-[80px] transition-shadow"
              maxLength={maxChars}
              disabled={loading}
              rows={3}
            />
            {charCount > 0 && (
              <span className={`absolute bottom-2.5 left-3 text-[11px] font-medium transition-colors ${
                isNearLimit ? 'text-error' : 'text-on-surface-variant'
              }`}>
                {charCount}/{maxChars}
              </span>
            )}
          </div>

          {/* Bottom Bar */}
          <div className="flex justify-between items-center mt-3">
            <div className="flex gap-1">
              <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors" title="إضافة صورة">
                <span className="material-symbols-outlined text-[20px]">image</span>
              </button>
              <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors" title="إضافة رابط">
                <span className="material-symbols-outlined text-[20px]">link</span>
              </button>
              <MoodSelector selected={moods} onChange={setMoods} />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-on-surface-variant hidden sm:block">
                Ctrl+Enter للنشر
              </span>
              <button
                onClick={handleSubmit}
                disabled={loading || !content.trim()}
                className="bg-primary-container text-on-primary text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">send</span>
                )}
                {loading ? 'جاري النشر...' : 'نشر'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
