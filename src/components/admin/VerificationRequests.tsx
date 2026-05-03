'use client';

import { useState, useEffect } from 'react';

interface VerificationRequest {
  id: string;
  userId: string;
  status: string;
  reviewNotes?: string;
  reviewedAt?: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    role?: string;
    profile: {
      realName: string;
      username: string | null;
      reputationScore: number;
      reputationTier: string;
      specialty?: string;
    };
  };
}

export default function VerificationRequests() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/verification-requests')
      .then((r) => r.json())
      .then((d) => setRequests(d.requests || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleReview = async (
    id: string,
    status: 'approved' | 'rejected'
  ) => {
    const notes = reviewNotes[id] || '';
    try {
      const res = await fetch(`/api/admin/verification-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewNotes: notes }),
      });
      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status,
                  reviewNotes: notes,
                  reviewedAt: new Date().toISOString(),
                }
              : r
          )
        );
        setReviewNotes((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setExpandedId(null);
      }
    } catch {
      // Silently fail
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl p-6 animate-pulse">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-surface-container-high shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-40 rounded-md bg-surface-container-high" />
                <div className="h-4 w-60 rounded-md bg-surface-container-high" />
              </div>
            </div>
            <div className="h-20 w-full rounded-md bg-surface-container-high" />
          </div>
        ))}
      </div>
    );
  }

  const pending = requests.filter((r) => r.status === 'pending');
  const reviewed = requests.filter((r) => r.status !== 'pending');

  const displayedRequests =
    filterStatus === 'pending'
      ? pending
      : filterStatus === 'reviewed'
        ? reviewed
        : requests;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (hours < 1) return 'منذ قليل';
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return date.toLocaleDateString('ar-EG');
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-xs bg-surface-container-high text-on-surface-variant px-2 py-1 rounded-full font-medium">
            <span className="material-symbols-outlined text-sm">schedule</span>
            قيد الانتظار
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full font-medium">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            مقبول
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-xs bg-error-container text-error px-2 py-1 rounded-full font-medium">
            <span className="material-symbols-outlined text-sm">cancel</span>
            مرفوض
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs bg-surface-container-high text-on-surface-variant px-2 py-1 rounded-full font-medium">
            <span className="material-symbols-outlined text-sm">help</span>
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          {[
            { label: 'الكل', value: 'all' as const, count: requests.length, icon: 'list' },
            { label: 'قيد الانتظار', value: 'pending' as const, count: pending.length, icon: 'schedule' },
            { label: 'تمت المراجعة', value: 'reviewed' as const, count: reviewed.length, icon: 'verified' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterStatus === f.value
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/30'
              }`}
            >
              <span className="material-symbols-outlined text-base">{f.icon}</span>
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {/* Pending Requests */}
      {filterStatus !== 'reviewed' && pending.length > 0 && (
        <div className="space-y-3">
          {pending
            .filter((_) => filterStatus === 'all' || filterStatus === 'pending')
            .map((req) => (
              <div key={req.id} className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl p-5 sm:p-6 hover:shadow-[0_8px_32px_0_rgba(0,67,70,0.08)] transition-all">
                {/* User Info Row */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-full shrink-0 flex items-center justify-center ${
                    req.user?.role === 'doctor'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-primary-fixed/20 text-primary-container'
                  }`}>
                    <span className="material-symbols-outlined">
                      {req.user?.role === 'doctor' ? 'stethoscope' : 'shield' }
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-on-surface">
                        {req.user?.profile?.realName || 'مستخدم'}
                      </p>
                      {statusBadge(req.status)}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {req.user?.email}
                    </p>
                    {req.user?.profile?.specialty && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-xs text-primary-container">stethoscope</span>
                        <span className="text-xs text-primary-container font-medium">
                          {req.user.profile.specialty}
                        </span>
                      </div>
                    )}
                    <p className="text-[11px] text-on-surface-variant mt-1">
                      {formatDate(req.createdAt)}
                    </p>
                  </div>

                  {/* Expand Toggle */}
                  <button
                    className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full shrink-0 transition-colors"
                    onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {expandedId === req.id ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                </div>

                {/* Expanded Review Section */}
                {expandedId === req.id && (
                  <div className="space-y-3 pt-3 border-t border-outline-variant/30">
                    <div>
                      <label className="text-xs text-on-surface-variant mb-1.5 block font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">chat</span>
                        ملاحظات المراجعة
                      </label>
                      <textarea
                        value={reviewNotes[req.id] || ''}
                        onChange={(e) =>
                          setReviewNotes((prev) => ({
                            ...prev,
                            [req.id]: e.target.value,
                          }))
                        }
                        placeholder="أضف ملاحظاتك هنا..."
                        className="w-full min-h-[80px] bg-surface-container-low border border-outline-variant rounded-xl text-sm p-3 resize-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(req.id, 'approved')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-base">check_circle</span>
                        قبول وتوثيق
                      </button>
                      <button
                        onClick={() => handleReview(req.id, 'rejected')}
                        className="flex items-center gap-1.5 px-4 py-2 text-error hover:bg-error-container rounded-xl text-sm font-bold transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">block</span>
                        رفض الطلب
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Reviewed Requests */}
      {filterStatus !== 'pending' && reviewed.length > 0 && (
        <>
          {filterStatus === 'all' && pending.length > 0 && (
            <div className="flex items-center gap-2 pt-2">
              <div className="flex-1 h-px bg-outline-variant/30" />
              <span className="text-xs text-on-surface-variant font-medium whitespace-nowrap">
                المراجعة السابقة
              </span>
              <div className="flex-1 h-px bg-outline-variant/30" />
            </div>
          )}
          <div className="space-y-3">
            {reviewed.map((req) => (
              <div key={req.id} className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${
                    req.user?.role === 'doctor'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    <span className="material-symbols-outlined text-lg">
                      {req.user?.role === 'doctor' ? 'stethoscope' : 'shield'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-on-surface">
                        {req.user?.profile?.realName || 'مستخدم'}
                      </p>
                      {statusBadge(req.status)}
                    </div>
                    {req.reviewNotes && (
                      <p className="text-xs text-on-surface-variant mt-1">{req.reviewNotes}</p>
                    )}
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      {formatDate(req.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {displayedRequests.length === 0 && !isLoading && (
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-outline-variant mx-auto mb-3 block">
            {filterStatus === 'pending' ? 'verified_user' : filterStatus === 'reviewed' ? 'schedule' : 'inbox'}
          </span>
          <p className="text-base font-bold text-on-surface">
            {filterStatus === 'pending'
              ? 'لا توجد طلبات معلقة'
              : filterStatus === 'reviewed'
                ? 'لا توجد طلبات تمت مراجعتها'
                : 'لا توجد طلبات توثيق'}
          </p>
          <p className="text-sm text-on-surface-variant mt-1">
            {filterStatus === 'pending'
              ? 'جميع طلبات التوثيق تمت مراجعتها'
              : filterStatus === 'reviewed'
                ? 'لم تتم مراجعة أي طلب بعد'
                : 'لم يتم تقديم أي طلبات توثيق حتى الآن'}
          </p>
        </div>
      )}
    </div>
  );
}
