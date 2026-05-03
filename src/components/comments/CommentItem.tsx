'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  ThumbsUp,
  Heart,
  HandHeart,
  Reply,
} from 'lucide-react';
import { toast } from 'sonner';
import { CommentForm } from './CommentForm';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface CommentItemProps {
  comment: {
    id: string;
    authorDisplay: string;
    authorBadge: string;
    content: string;
    createdAt: string;
    reactions: Record<string, number>;
    replies?: Array<{
      id: string;
      authorDisplay: string;
      authorBadge: string;
      content: string;
      createdAt: string;
      reactions: Record<string, number>;
    }>;
  };
  postId: string;
}

export function CommentItem({ comment, postId }: CommentItemProps) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState(comment.reactions || {});
  const [showReplyForm, setShowReplyForm] = useState(false);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${Math.floor(hours / 24)} يوم`;
  };

  const handleReaction = async (type: string) => {
    if (!user) {
      toast.error('سجل دخول الأول');
      return;
    }
    try {
      const res = await fetch(`/api/comments/${comment.id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const data = await res.json();
        setReactions((prev) => {
          const updated = { ...prev };
          if (data.action === 'added') {
            updated[type] = (updated[type] || 0) + 1;
          } else {
            updated[type] = Math.max(0, (updated[type] || 0) - 1);
            if (updated[type] === 0) delete updated[type];
          }
          return updated;
        });
        if (data.action === 'added' && data.points) {
          toast.success(`+${data.points} نقطة سمعة`);
        }
      }
    } catch {
      toast.error('حصل خطأ');
    }
  };

  const handleReplyAdded = (reply: Record<string, unknown>) => {
    setShowReplyForm(false);
  };

  const reactionButtons = [
    { type: 'like', icon: ThumbsUp, label: 'إعجاب', points: '+1' },
    { type: 'thanks', icon: Heart, label: 'شكر', points: '+3' },
    { type: 'helpful', icon: HandHeart, label: 'مفيد', points: '+5' },
  ];

  return (
    <div className="space-y-3">
      {/* Main Comment */}
      <div className="flex gap-2.5">
        <Avatar size="sm">
          <AvatarFallback className="bg-teal-100 text-teal-700 font-semibold text-[10px]">
            {comment.authorBadge}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          {/* Name & Time */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-gray-900">
              {comment.authorDisplay}
            </span>
            <span className="text-[11px] text-gray-400">
              {timeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Content */}
          <p className="text-xs text-gray-600 leading-relaxed mb-2">
            {comment.content}
          </p>

          {/* Reactions & Reply */}
          <div className="flex items-center gap-0.5 flex-wrap">
            {reactionButtons.map(({ type, icon: Icon, label, points }) => {
              const count = reactions[type] || 0;
              return (
                <Button
                  key={type}
                  variant="ghost"
                  size="xs"
                  onClick={() => handleReaction(type)}
                  className="gap-1 px-2 py-1 text-[11px] font-medium text-gray-400 hover:text-teal-600 hover:bg-teal-50"
                >
                  <Icon className="w-3 h-3" />
                  <span>{count > 0 ? count : label}</span>
                  {count === 0 && (
                    <span className="text-[9px] text-gray-400 opacity-60">{points}</span>
                  )}
                </Button>
              );
            })}
            {user && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="gap-1 px-2 py-1 text-[11px] font-medium text-gray-400 hover:text-purple-500 hover:bg-purple-50"
              >
                <Reply className="w-3 h-3" />
                رد
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && user && (
        <div className="mr-9">
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onCommentAdded={handleReplyAdded}
          />
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mr-9 space-y-3 border-r-2 border-teal-100 pr-3">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[8px] font-semibold text-gray-600">
                {reply.authorBadge}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[11px] font-semibold text-gray-900">
                    {reply.authorDisplay}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {timeAgo(reply.createdAt)}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed text-gray-600">
                  {reply.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
