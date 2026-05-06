'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CommentList } from '@/components/comments/CommentList';
import { toast } from 'sonner';
import Link from 'next/link';
import { UserAvatar } from '@/components/avatars/UserAvatar';

interface PostCardProps {
  post: {
    id: string;
    authorId: string;
    authorDisplay: string;
    authorBadge: string;
    authorAvatarUrl?: string | null;
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
  onDelete?: (postId: string) => void;
}

export function PostCard({ post, onDelete }: PostCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [reactions, setReactions] = useState(post.reactions || {});
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [bookmarked, setBookmarked] = useState(false);
  // Initialize from server data so the button shows correct state on load
  const [userReaction, setUserReaction] = useState<string | null>(post.userReaction || null);
  const [showSensitive, setShowSensitive] = useState(!post.isSensitive);
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);

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
          url: window.location.origin + `/`,
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
  const canManage = user && (user.userId === post.authorId || user.role === 'admin');
  const canReport = user && user.userId !== post.authorId;

  const handleReport = async () => {
    if (!user || reporting || !reportReason) return;
    setReporting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: post.id,
          targetType: 'post',
          reason: reportReason,
          details: reportDetails.trim() || undefined,
        }),
      });
      if (res.ok) {
        toast.success('تم إرسال البلاغ بنجاح');
        setReported(true);
        setShowReport(false);
        setShowMenu(false);
      } else {
        const data = await res.json();
        toast.error(data.error || 'حصل خطأ');
      }
    } catch {
      toast.error('حصل خطأ');
    } finally {
      setReporting(false);
    }
  };

  const handleDelete = async () => {
    setShowMenu(false);
    if (!user || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('تم حذف المنشور');
        if (onDelete) onDelete(post.id);
        else window.dispatchEvent(new CustomEvent('post-created'));
      } else {
        const data = await res.json();
        toast.error(data.error || 'حصل خطأ');
      }
    } catch {
      toast.error('حصل خطأ');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className={`bg-surface-bright rounded-xl border p-4 sm:p-5 transition-shadow duration-200 hover:shadow-[0_4px_20px_0_rgba(23,42,57,0.06)] ${
      isDoctor ? 'border-primary-container/20 shadow-[0_4px_20px_0_rgba(23,42,57,0.05)]' : 'border-outline-variant/30 shadow-[0_4px_20px_0_rgba(23,42,57,0.02)]'
    }`}>
      {/* Author Row */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3 items-center">
          {/* Avatar */}
          <UserAvatar
            avatarUrl={post.authorAvatarUrl}
            username={post.authorDisplay}
            size="md"
          />
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
        {(canManage || canReport) && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-on-surface-variant hover:text-on-surface transition-colors p-1"
            >
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute left-0 top-8 z-20 bg-white rounded-xl border border-outline-variant/30 shadow-lg py-1 min-w-[140px] animate-fade-in-up">
                  {canManage && (
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      {deleting ? 'جاري الحذف...' : 'حذف المنشور'}
                    </button>
                  )}
                  {canReport && !reported && (
                    <button
                      onClick={() => { setShowMenu(false); setShowReport(true); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">flag</span>
                      بلاغ عن المنشور
                    </button>
                  )}
                  {reported && (
                    <div className="px-4 py-2.5 text-sm text-on-surface-variant/60 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-emerald-500">check_circle</span>
                      تم إرسال البلاغ
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Report Dialog */}
        {showReport && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowReport(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-md p-6 relative animate-fade-in-up"
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
            >
              <button
                onClick={() => setShowReport(false)}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <span className="material-symbols-outlined text-gray-600 text-lg">close</span>
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-500 text-xl">flag</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">بلاغ عن المنشور</h3>
                  <p className="text-xs text-on-surface-variant">ساعدنا في الحفاظ على المجتمع آمن</p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'spam', label: 'محتوى مزعج' },
                    { value: 'inappropriate', label: 'محتوى غير لائق' },
                    { value: 'harassment', label: 'تحرش أو تنمر' },
                    { value: 'false_info', label: 'معلومات مضللة' },
                    { value: 'other', label: 'سبب آخر' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setReportReason(opt.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border cursor-pointer ${
                        reportReason === opt.value
                          ? 'bg-red-50 border-red-200 text-red-700'
                          : 'bg-gray-50 border-gray-200 text-on-surface-variant hover:bg-gray-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={reportDetails}
                  onChange={e => setReportDetails(e.target.value)}
                  placeholder="تفاصيل إضافية (اختياري)..."
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReport(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-on-surface-variant hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleReport}
                  disabled={!reportReason || reporting}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {reporting ? 'جاري الإرسال...' : 'إرسال البلاغ'}
                </button>
              </div>
            </div>
          </div>
        )}
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
