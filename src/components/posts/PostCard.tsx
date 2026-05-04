'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CommentList } from '@/components/comments/CommentList';
import { toast } from 'sonner';
import Link from 'next/link';

interface PostCardProps {
  post: {
    id: string;
    authorDisplay: string;
    authorBadge: string;
    authorRole: string;
    content: string;
    moods: string;
    commentCount: number;
    reactionCount: number;
    createdAt: string;
    reactions: Record<string, number>;
    userReaction?: string | null;
    isSensitive?: boolean;
    sensitiveReason?: string;
    imageUrl?: string;
  };
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [reactions, setReactions] = useState(post.reactions || {});
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [bookmarked, setBookmarked] = useState(false);
  // Initialize from server data so the button shows correct state on load
  const [userReaction, setUserReaction] = useState<string | null>(post.userReaction || null);
  const [showSensitive, setShowSensitive] = useState(!post.isSensitive);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
  };

  const handleReaction = async (type: string) => {
    if (!user) {
      toast.error('سجل دخول الأول');
      return;
    }

    const wasActive = userReaction === type;

    // Optimistic update
    setUserReaction(wasActive ? null : type);
    setReactions((prev) => {
      const updated = { ...prev };
      if (!wasActive) {
        // If switching from one reaction type to another
        if (userReaction && updated[userReaction]) {
          updated[userReaction] = Math.max(0, updated[userReaction] - 1);
          if (updated[userReaction] === 0) delete updated[userReaction];
        }
        updated[type] = (updated[type] || 0) + 1;
      } else {
        // Removing reaction
        updated[type] = Math.max(0, (updated[type] || 0) - 1);
        if (updated[type] === 0) delete updated[type];
      }
      return updated;
    });

    try {
      const res = await fetch(`/api/posts/${post.id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Revert on failure
      setUserReaction(wasActive ? type : null);
      setReactions((prev) => {
        const updated = { ...prev };
        if (!wasActive) {
          // Undo add
          updated[type] = Math.max(0, (updated[type] || 0) - 1);
          if (updated[type] === 0) delete updated[type];
          // Restore previous reaction
          if (userReaction) {
            updated[userReaction] = (updated[userReaction] || 0) + 1;
          }
        } else {
          // Undo remove
          updated[type] = (updated[type] || 0) + 1;
        }
        return updated;
      });
      toast.error('حصل خطأ');
    }
  };

  const handleBookmark = async () => {
    if (!user) return;
    const prev = bookmarked;
    setBookmarked(!prev);
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarked(data.action === 'added');
        toast.success(data.action === 'added' ? 'تم الحفظ' : 'تم الإزالة');
      } else {
        setBookmarked(prev);
      }
    } catch {
      setBookmarked(prev);
      toast.error('حصل خطأ');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'وصال - مشاركة',
          text: post.content.substring(0, 100),
          url: window.location.origin + `/community`,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(post.content.substring(0, 100));
      toast.success('تم نسخ النص');
    }
  };

  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);
  const isDoctor = post.authorRole === 'doctor';
  const isLiked = userReaction === 'heart' || userReaction === 'like';

  return (
    <article className={`bg-surface-bright rounded-xl border p-4 sm:p-5 transition-shadow duration-200 hover:shadow-[0_4px_20px_0_rgba(23,42,57,0.06)] ${
      isDoctor ? 'border-primary-container/20 shadow-[0_4px_20px_0_rgba(23,42,57,0.05)]' : 'border-outline-variant/30 shadow-[0_4px_20px_0_rgba(23,42,57,0.02)]'
    }`}>
      {/* Author Row */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3 items-center">
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center ${
            isDoctor ? 'border-2 border-primary-container' : ''
          } ${!post.authorBadge ? 'bg-primary-container/10' : ''}`}>
            {post.authorBadge ? (
              <span className="text-sm font-semibold text-primary-container">{post.authorBadge}</span>
            ) : (
              <span className="material-symbols-outlined text-xl text-primary-container">person</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              {isDoctor ? (
                <Link href="/doctors" className="text-[15px] font-medium text-on-surface hover:text-primary-container transition-colors font-[var(--font-heading)]">
                  {post.authorDisplay}
                </Link>
              ) : (
                <span className="text-[15px] font-medium text-on-surface font-[var(--font-heading)]">{post.authorDisplay}</span>
              )}
              {isDoctor && (
                <span className="material-symbols-outlined filled text-[16px] text-primary-container">verified</span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant">
              {isDoctor && 'أخصائية طب نفسي · '}
              {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>
        <button className="text-on-surface-variant hover:text-on-surface transition-colors p-1">
          <span className="material-symbols-outlined text-[20px]">more_vert</span>
        </button>
      </div>

      {/* Content / Sensitive Warning */}
      {post.isSensitive && !showSensitive ? (
        <div className="bg-surface-container-low rounded-lg p-5 border border-outline-variant/30 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-[32px] text-primary-container mb-2">visibility_off</span>
          <h4 className="text-lg font-semibold text-on-surface mb-2 font-[var(--font-heading)]">محتوى حساس</h4>
          <p className="text-sm text-on-surface-variant mb-4 max-w-[250px]">
            {post.sensitiveReason || 'هذا المنشور يحتوي على نقاش قد يكون حساساً للبعض.'}
          </p>
          <button
            onClick={() => setShowSensitive(true)}
            className="bg-surface text-primary-container border border-primary-container text-sm font-semibold px-4 py-2 rounded-full hover:bg-surface-container transition-colors"
          >
            عرض المحتوى
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-base text-on-surface leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Mood Tags */}
          {post.moods && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.moods.split(',').filter(Boolean).map((mood, i) => (
                <span
                  key={i}
                  className="bg-surface-container-high text-primary-container px-3 py-1 rounded-full text-xs font-medium"
                >
                  {mood.trim()}
                </span>
              ))}
            </div>
          )}
        </>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between border-t border-outline-variant/30 pt-3 mt-3">
        <div className="flex gap-4">
          {/* Like / Heart */}
          <button
            onClick={() => handleReaction('heart')}
            className={`flex items-center gap-1 text-sm transition-all duration-200 ${
              isLiked
                ? 'text-red-500 scale-105'
                : 'text-on-surface-variant hover:text-red-400'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${isLiked ? 'filled' : ''}`}>favorite</span>
            {totalReactions > 0 && <span className={`font-medium ${isLiked ? 'text-red-500' : ''}`}>{totalReactions}</span>}
          </button>

          {/* Comments */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1 text-sm transition-colors ${
              showComments
                ? 'text-primary-container'
                : 'text-on-surface-variant hover:text-primary-container'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${showComments ? 'filled' : ''}`}>chat_bubble</span>
            {commentCount > 0 && <span className="font-medium">{commentCount}</span>}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            className={`transition-colors ${
              bookmarked
                ? 'text-primary-container'
                : 'text-on-surface-variant hover:text-primary-container'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${bookmarked ? 'filled' : ''}`}>bookmark</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="text-on-surface-variant hover:text-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-outline-variant/30">
          <CommentList postId={post.id} onCommentAdded={() => setCommentCount((c) => c + 1)} />
        </div>
      )}
    </article>
  );
}
