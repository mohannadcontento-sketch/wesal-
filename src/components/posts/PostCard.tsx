'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { CommentList } from '@/components/comments/CommentList';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  Share2,
  MoreHorizontal,
  ThumbsUp,
  Frown,
  BadgeCheck,
} from 'lucide-react';

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
  };
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [reactions, setReactions] = useState(post.reactions || {});
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [bookmarked, setBookmarked] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(null);

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
    setUserReaction(wasActive ? null : type);
    setReactions((prev) => {
      const updated = { ...prev };
      if (!wasActive) {
        if (userReaction && updated[userReaction]) {
          updated[userReaction] = Math.max(0, updated[userReaction] - 1);
        }
        updated[type] = (updated[type] || 0) + 1;
      } else {
        updated[type] = Math.max(0, (updated[type] || 0) - 1);
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
      setUserReaction(wasActive ? type : null);
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

  const reactionButtons = [
    { type: 'like', icon: ThumbsUp, label: 'مفيد' },
    { type: 'heart', icon: Heart, label: 'أشعر بذلك' },
    { type: 'sad', icon: Frown, label: 'محزن' },
  ];

  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);

  return (
    <motion.div
      className="card card-interactive p-5"
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Author Row */}
      <div className="flex items-start gap-3 mb-3">
        <div className="avatar avatar-md font-heading">
          {post.authorBadge}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {post.authorRole === 'doctor' ? (
              <Link href="/doctors" className="text-body-md font-semibold text-text-primary hover:text-primary transition-colors truncate">
                {post.authorDisplay}
              </Link>
            ) : (
              <span className="text-body-md font-semibold text-text-primary truncate">{post.authorDisplay}</span>
            )}
            {post.authorRole === 'doctor' && (
              <BadgeCheck className="w-4 h-4 text-accent shrink-0" />
            )}
            {post.authorRole === 'doctor' && (
              <span className="badge badge-primary text-[10px]">طبيب</span>
            )}
          </div>
          <span className="text-caption text-text-tertiary">{timeAgo(post.createdAt)}</span>
        </div>
        <button className="btn btn-ghost btn-icon-sm text-text-tertiary hover:text-text-primary">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="whitespace-pre-wrap text-body-md text-text-secondary leading-relaxed line-clamp-4">
          {post.content}
        </p>
        {post.moods && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.moods.split(',').filter(Boolean).map((mood, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1 text-caption text-primary font-medium"
              >
                {mood.trim()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-1 pt-3 border-t border-border-light">
        {reactionButtons.map(({ type, icon: Icon, label }) => {
          const isActive = userReaction === type;
          const count = reactions[type] || 0;
          return (
            <motion.button
              key={type}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleReaction(type)}
              title={label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-caption font-medium transition-all duration-200 ${
                isActive
                  ? 'text-primary bg-primary-light'
                  : 'text-text-tertiary hover:text-primary hover:bg-primary-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'fill-current' : ''}`} />
              {count > 0 && <span>{count}</span>}
            </motion.button>
          );
        })}

        {/* Total Reactions Badge */}
        {totalReactions > 0 && (
          <span className="text-[10px] text-text-tertiary mr-1">
            {totalReactions}
          </span>
        )}

        <div className="flex-1" />

        {/* Comment Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowComments(!showComments)}
          title="التعليقات"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-caption font-medium transition-all duration-200 ${
            showComments
              ? 'text-primary bg-primary-light'
              : 'text-text-tertiary hover:text-primary hover:bg-primary-50'
          }`}
        >
          <MessageCircle className={`w-4 h-4 ${showComments ? 'fill-current' : ''}`} />
          {commentCount > 0 && <span>{commentCount}</span>}
        </motion.button>

        {/* Bookmark Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleBookmark}
          title={bookmarked ? 'إزالة من المحفوظات' : 'حفظ'}
          className={`p-1.5 rounded-lg transition-all duration-200 ${
            bookmarked
              ? 'text-warm bg-warm-light'
              : 'text-text-tertiary hover:text-warm hover:bg-warm-light'
          }`}
        >
          {bookmarked ? (
            <BookmarkCheck className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </motion.button>

        {/* Share Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleShare}
          title="مشاركة"
          className="p-1.5 rounded-lg text-text-tertiary hover:text-accent hover:bg-accent-light transition-all duration-200"
        >
          <Share2 className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-3 pt-3 border-t border-border-light"
        >
          <CommentList postId={post.id} onCommentAdded={() => setCommentCount((c) => c + 1)} />
        </motion.div>
      )}
    </motion.div>
  );
}
