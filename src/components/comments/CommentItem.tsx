'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { CommentForm } from './CommentForm';

interface ReplyData {
  id: string;
  authorDisplay: string;
  authorBadge: string;
  content: string;
  createdAt: string;
  reactions: Record<string, number>;
  userReactions?: string[];
}

interface CommentItemProps {
  comment: {
    id: string;
    authorDisplay: string;
    authorBadge: string;
    content: string;
    createdAt: string;
    reactions: Record<string, number>;
    userReactions?: string[];
    replies?: ReplyData[];
  };
  postId: string;
  topCommentId?: string;
  onNewReply?: (reply: ReplyData) => void;
}

// ── Nested Reply sub-component ──
function ReplyItem({
  reply,
  postId,
  topCommentId,
  onNewReply,
}: {
  reply: ReplyData;
  postId: string;
  topCommentId: string;
  onNewReply?: (reply: ReplyData) => void;
}) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState(reply.reactions || {});
  const [userReactions, setUserReactions] = useState<string[]>(reply.userReactions || []);
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
    const wasActive = userReactions.includes(type);

    // Optimistic update
    setUserReactions((prev) => wasActive ? prev.filter((t) => t !== type) : [...prev, type]);
    setReactions((prev) => {
      const updated = { ...prev };
      if (wasActive) {
        updated[type] = Math.max(0, (updated[type] || 0) - 1);
        if (updated[type] === 0) delete updated[type];
      } else {
        updated[type] = (updated[type] || 0) + 1;
      }
      return updated;
    });

    try {
      const res = await fetch(`/api/comments/${reply.id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.action === 'added' && data.points) {
          toast.success(`+${data.points} نقطة سمعة`);
        }
      }
    } catch {
      // Revert
      setUserReactions((prev) => wasActive ? [...prev, type] : prev.filter((t) => t !== type));
      setReactions((prev) => {
        const updated = { ...prev };
        if (wasActive) {
          updated[type] = (updated[type] || 0) + 1;
        } else {
          updated[type] = Math.max(0, (updated[type] || 0) - 1);
          if (updated[type] === 0) delete updated[type];
        }
        return updated;
      });
      toast.error('حصل خطأ');
    }
  };

  const handleReplyAdded = (newReply: Record<string, unknown>) => {
    setShowReplyForm(false);
    onNewReply?.(newReply as unknown as ReplyData);
  };

  const reactionButtons = [
    { type: 'like', icon: 'thumb_up', label: 'إعجاب', points: '+1' },
    { type: 'thanks', icon: 'favorite', label: 'شكر', points: '+3' },
    { type: 'helpful', icon: 'volunteer_activism', label: 'مفيد', points: '+5' },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center shrink-0">
          <span className="text-[8px] font-semibold text-on-surface">{reply.authorBadge}</span>
        </div>
        <div className="flex-1 min-w-0">
          {/* Name & Time */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[11px] font-semibold text-on-surface">{reply.authorDisplay}</span>
            <span className="text-[10px] text-on-surface-variant">{timeAgo(reply.createdAt)}</span>
          </div>

          {/* Content */}
          <p className="text-xs leading-relaxed text-on-surface mb-1.5">{reply.content}</p>

          {/* Reaction & Reply buttons */}
          <div className="flex items-center gap-0.5 flex-wrap">
            {reactionButtons.map(({ type, icon, label, points }) => {
              const count = reactions[type] || 0;
              const isActive = userReactions.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => handleReaction(type)}
                  className={`gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md transition-all duration-200 flex items-center ${
                    isActive
                      ? 'text-primary-container bg-primary-container/15'
                      : 'text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[13px] ${count > 0 ? 'filled' : ''}`}>{icon}</span>
                  <span>{count > 0 ? count : label}</span>
                  {count === 0 && <span className="text-[8px] text-on-surface-variant/60">{points}</span>}
                </button>
              );
            })}
            {user && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="gap-1 px-1.5 py-0.5 text-[10px] font-medium text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 rounded-md transition-colors flex items-center"
              >
                <span className="material-symbols-outlined text-[13px]">reply</span>
                رد
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && user && (
        <div className="mr-9 mt-1">
          <CommentForm
            postId={postId}
            parentId={topCommentId}
            onCommentAdded={handleReplyAdded}
          />
        </div>
      )}
    </div>
  );
}

// ── Main CommentItem Component ──
export function CommentItem({ comment, postId, topCommentId, onNewReply }: CommentItemProps) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState(comment.reactions || {});
  const [userReactions, setUserReactions] = useState<string[]>(comment.userReactions || []);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [localReplies, setLocalReplies] = useState<ReplyData[]>(comment.replies || []);

  const rootCommentId = topCommentId || comment.id;

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
    const wasActive = userReactions.includes(type);

    // Optimistic update
    setUserReactions((prev) => wasActive ? prev.filter((t) => t !== type) : [...prev, type]);
    setReactions((prev) => {
      const updated = { ...prev };
      if (wasActive) {
        updated[type] = Math.max(0, (updated[type] || 0) - 1);
        if (updated[type] === 0) delete updated[type];
      } else {
        updated[type] = (updated[type] || 0) + 1;
      }
      return updated;
    });

    try {
      const res = await fetch(`/api/comments/${comment.id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.action === 'added' && data.points) {
          toast.success(`+${data.points} نقطة سمعة`);
        }
      }
    } catch {
      // Revert
      setUserReactions((prev) => wasActive ? [...prev, type] : prev.filter((t) => t !== type));
      setReactions((prev) => {
        const updated = { ...prev };
        if (wasActive) {
          updated[type] = (updated[type] || 0) + 1;
        } else {
          updated[type] = Math.max(0, (updated[type] || 0) - 1);
          if (updated[type] === 0) delete updated[type];
        }
        return updated;
      });
      toast.error('حصل خطأ');
    }
  };

  const handleReplyAdded = (reply: Record<string, unknown>) => {
    setShowReplyForm(false);
    const newReply = reply as unknown as ReplyData;
    setLocalReplies((prev) => [...prev, newReply]);
    onNewReply?.(newReply);
  };

  const handleNestedReplyAdded = (newReply: ReplyData) => {
    setLocalReplies((prev) => [...prev, newReply]);
    onNewReply?.(newReply);
  };

  const reactionButtons = [
    { type: 'like', icon: 'thumb_up', label: 'إعجاب', points: '+1' },
    { type: 'thanks', icon: 'favorite', label: 'شكر', points: '+3' },
    { type: 'helpful', icon: 'volunteer_activism', label: 'مفيد', points: '+5' },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Main Comment */}
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-semibold text-primary-container">{comment.authorBadge}</span>
        </div>
        <div className="flex-1 min-w-0">
          {/* Name & Time */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-on-surface">{comment.authorDisplay}</span>
            <span className="text-[11px] text-on-surface-variant">{timeAgo(comment.createdAt)}</span>
          </div>

          {/* Content */}
          <p className="text-xs text-on-surface leading-relaxed mb-2">{comment.content}</p>

          {/* Reactions & Reply */}
          <div className="flex items-center gap-0.5 flex-wrap">
            {reactionButtons.map(({ type, icon, label, points }) => {
              const count = reactions[type] || 0;
              const isActive = userReactions.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => handleReaction(type)}
                  className={`gap-1 px-2 py-1 text-[11px] font-medium rounded-lg transition-all duration-200 flex items-center ${
                    isActive
                      ? 'text-primary-container bg-primary-container/15'
                      : 'text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[14px] ${count > 0 || isActive ? 'filled' : ''}`}>{icon}</span>
                  <span>{count > 0 ? count : label}</span>
                  {count === 0 && <span className="text-[9px] text-on-surface-variant/60">{points}</span>}
                </button>
              );
            })}
            {user && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className={`gap-1 px-2 py-1 text-[11px] font-medium rounded-lg transition-all duration-200 flex items-center ${
                  showReplyForm
                    ? 'text-primary-container bg-primary-container/15'
                    : 'text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">reply</span>
                رد
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && user && (
        <div className="mr-11">
          <CommentForm
            postId={postId}
            parentId={rootCommentId}
            onCommentAdded={handleReplyAdded}
          />
        </div>
      )}

      {/* Nested Replies */}
      {localReplies.length > 0 && (
        <div className="mr-11 flex flex-col gap-3 border-r-2 border-primary-container/20 pr-3">
          {localReplies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              postId={postId}
              topCommentId={rootCommentId}
              onNewReply={handleNestedReplyAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
}
