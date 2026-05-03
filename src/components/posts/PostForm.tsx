'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MoodSelector } from './MoodSelector';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

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
    <Card className="py-0">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar size="lg">
            <AvatarFallback className="bg-teal-100 text-teal-700 font-semibold text-sm">
              {user.badge}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3 min-w-0">
            {/* Textarea */}
            <div className="relative">
              <Textarea
                ref={textareaRef as React.RefObject<HTMLTextAreaElement>}
                placeholder="شارك فكرة أو تجربة..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[80px] resize-none rounded-xl bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400"
                maxLength={maxChars}
                disabled={loading}
              />
              {charCount > 0 && (
                <div
                  className={`absolute bottom-2.5 left-3 text-[10px] font-medium transition-colors ${
                    isNearLimit ? 'text-amber-500' : 'text-gray-400'
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
                <span className="text-xs text-gray-400 hidden sm:block">
                  Ctrl+Enter للنشر
                </span>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={loading || !content.trim()}
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  {loading ? 'جاري النشر...' : 'نشر'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
