'use client';

import { useState } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
    <Card className="py-0 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4 space-y-0">
        {/* Author Row */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar size="lg">
            <AvatarFallback className="bg-teal-100 text-teal-700 font-semibold text-sm">
              {post.authorBadge}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {post.authorRole === 'doctor' ? (
                <Link href="/doctors" className="text-sm font-semibold text-gray-900 hover:text-teal-600 transition-colors truncate">
                  {post.authorDisplay}
                </Link>
              ) : (
                <span className="text-sm font-semibold text-gray-900 truncate">{post.authorDisplay}</span>
              )}
              {post.authorRole === 'doctor' && (
                <BadgeCheck className="w-4 h-4 text-purple-500 shrink-0" />
              )}
              {post.authorRole === 'doctor' && (
                <Badge className="text-[10px] px-1.5 py-0">طبيب</Badge>
              )}
            </div>
            <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
          </div>
          <Button variant="ghost" size="icon-sm" className="text-gray-400 hover:text-gray-900 shrink-0">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="whitespace-pre-wrap text-sm text-gray-600 leading-relaxed line-clamp-4">
            {post.content}
          </p>
          {post.moods && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.moods.split(',').filter(Boolean).map((mood, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-xs text-teal-600 font-medium"
                >
                  {mood.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
          {reactionButtons.map(({ type, icon: Icon, label }) => {
            const isActive = userReaction === type;
            const count = reactions[type] || 0;
            return (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                onClick={() => handleReaction(type)}
                title={label}
                className={`gap-1.5 px-3 h-8 text-xs font-medium ${
                  isActive
                    ? 'text-teal-600 bg-teal-50 hover:text-teal-600 hover:bg-teal-50'
                    : 'text-gray-400 hover:text-teal-600 hover:bg-teal-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'fill-current' : ''}`} />
                {count > 0 && <span>{count}</span>}
              </Button>
            );
          })}

          {/* Total Reactions */}
          {totalReactions > 0 && (
            <span className="text-[10px] text-gray-400 mr-1">
              {totalReactions}
            </span>
          )}

          <div className="flex-1" />

          {/* Comment Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            title="التعليقات"
            className={`gap-1.5 px-3 h-8 text-xs font-medium ${
              showComments
                ? 'text-teal-600 bg-teal-50 hover:text-teal-600 hover:bg-teal-50'
                : 'text-gray-400 hover:text-teal-600 hover:bg-teal-50'
            }`}
          >
            <MessageCircle className={`w-4 h-4 ${showComments ? 'fill-current' : ''}`} />
            {commentCount > 0 && <span>{commentCount}</span>}
          </Button>

          {/* Bookmark Button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleBookmark}
            title={bookmarked ? 'إزالة من المحفوظات' : 'حفظ'}
            className={`h-8 w-8 ${
              bookmarked
                ? 'text-amber-500 bg-amber-50 hover:text-amber-500 hover:bg-amber-50'
                : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
            }`}
          >
            {bookmarked ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </Button>

          {/* Share Button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleShare}
            title="مشاركة"
            className="h-8 w-8 text-gray-400 hover:text-purple-500 hover:bg-purple-50"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <CommentList postId={post.id} onCommentAdded={() => setCommentCount((c) => c + 1)} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
