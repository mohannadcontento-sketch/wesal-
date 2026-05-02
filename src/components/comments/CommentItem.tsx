'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import {
  ThumbsUp,
  Heart,
  HelpingHand,
  Reply,
} from 'lucide-react';
import { toast } from 'sonner';
import { CommentForm } from './CommentForm';

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
    // Update local state with the new reply
    setShowReplyForm(false);
  };

  const reactionButtons = [
    { type: 'like', icon: ThumbsUp, label: 'إعجاب', points: '+1' },
    { type: 'thanks', icon: Heart, label: 'شكر', points: '+3' },
    { type: 'helpful', icon: HelpingHand, label: 'مفيد', points: '+5' },
  ];

  return (
    <div className="space-y-3">
      {/* Main Comment */}
      <div className="flex gap-2.5">
        <div className="avatar avatar-sm font-heading shrink-0 mt-0.5">
          {comment.authorBadge}
        </div>
        <div className="flex-1 min-w-0">
          {/* Name & Time */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-caption font-semibold text-text-primary">
              {comment.authorDisplay}
            </span>
            <span className="text-[11px] text-text-tertiary">
              {timeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Content */}
          <p className="text-body-sm text-text-secondary leading-relaxed mb-2">
            {comment.content}
          </p>

          {/* Reactions & Reply */}
          <div className="flex items-center gap-0.5 flex-wrap">
            {reactionButtons.map(({ type, icon: Icon, label, points }) => {
              const count = reactions[type] || 0;
              return (
                <motion.button
                  key={type}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleReaction(type)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-text-tertiary hover:text-primary hover:bg-primary-50 transition-all duration-200"
                >
                  <Icon className="w-3 h-3" />
                  <span>{count > 0 ? count : label}</span>
                  {count === 0 && (
                    <span className="text-[9px] text-text-tertiary opacity-60">{points}</span>
                  )}
                </motion.button>
              );
            })}
            {user && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-text-tertiary hover:text-accent hover:bg-accent-light transition-all duration-200"
              >
                <Reply className="w-3 h-3" />
                رد
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && user && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mr-9"
        >
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onCommentAdded={handleReplyAdded}
          />
        </motion.div>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mr-9 space-y-3 border-r-2 border-primary-100 pr-3">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex gap-2">
              <div className="avatar shrink-0 mt-0.5 text-[8px]" style={{ width: '24px', height: '24px', fontSize: '0.5rem' }}>
                {reply.authorBadge}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[11px] font-semibold text-text-primary">
                    {reply.authorDisplay}
                  </span>
                  <span className="text-[10px] text-text-tertiary">
                    {timeAgo(reply.createdAt)}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed text-text-secondary">
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
