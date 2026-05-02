'use client';

import { useState, useEffect } from 'react';
import AnimatedCard from '@/components/animations/AnimatedCard';
import EmptyState from '@/components/shared/EmptyState';
import {
  CheckCircle,
  XCircle,
  Clock,
  Stethoscope,
  ShieldCheck,
  AlertCircle,
  Eye,
  Ban,
  Filter,
  Search,
  MessageSquare,
} from 'lucide-react';
import type { VerificationRequest } from '@/types';

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
          <div
            key={i}
            className="card p-4 h-36 rounded-2xl"
          >
            <div className="skeleton h-5 w-40 rounded-md mb-3" />
            <div className="skeleton h-4 w-60 rounded-md mb-2" />
            <div className="skeleton h-20 w-full rounded-md" />
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
          <span className="badge badge-muted gap-1.5">
            <Clock className="w-3 h-3" />
            قيد الانتظار
          </span>
        );
      case 'approved':
        return (
          <span className="badge badge-success gap-1.5">
            <CheckCircle className="w-3 h-3" />
            مقبول
          </span>
        );
      case 'rejected':
        return (
          <span className="badge badge-destructive gap-1.5">
            <XCircle className="w-3 h-3" />
            مرفوض
          </span>
        );
      default:
        return (
          <span className="badge badge-muted gap-1.5">
            <AlertCircle className="w-3 h-3" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Filter Tabs & Count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`btn btn-sm ${
              filterStatus === 'all' ? 'btn-primary' : 'btn-ghost'
            }`}
          >
            الكل ({requests.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`btn btn-sm ${
              filterStatus === 'pending' ? 'btn-primary' : 'btn-ghost'
            } gap-1.5`}
          >
            <Clock className="w-3.5 h-3.5" />
            قيد الانتظار ({pending.length})
          </button>
          <button
            onClick={() => setFilterStatus('reviewed')}
            className={`btn btn-sm ${
              filterStatus === 'reviewed' ? 'btn-primary' : 'btn-ghost'
            } gap-1.5`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            تمت المراجعة ({reviewed.length})
          </button>
        </div>
      </div>

      {/* Pending Requests */}
      {filterStatus !== 'reviewed' && pending.length > 0 && (
        <div className="space-y-3">
          {pending
            .filter((_) => filterStatus === 'all' || filterStatus === 'pending')
            .map((req, index) => (
              <AnimatedCard key={req.id} delay={index * 0.05}>
                <div
                  className={`card p-4 sm:p-5 transition-all duration-200 ${
                    req.status === 'pending'
                      ? 'border-warm/30'
                      : ''
                  }`}
                >
                  {/* User Info Row */}
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full shrink-0 ${
                        req.user?.role === 'doctor'
                          ? 'bg-accent-light text-accent'
                          : 'bg-primary-light text-primary'
                      }`}
                    >
                      {req.user?.role === 'doctor' ? (
                        <Stethoscope className="w-5 h-5" />
                      ) : (
                        <ShieldCheck className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-text-primary">
                          {req.user?.profile?.realName || 'مستخدم'}
                        </p>
                        {statusBadge(req.status)}
                      </div>
                      <p className="text-caption text-text-tertiary mt-0.5">
                        {req.user?.email}
                      </p>
                      {req.user?.profile?.specialty && (
                        <div className="flex items-center gap-1 mt-1">
                          <Stethoscope className="w-3 h-3 text-accent" />
                          <span className="text-caption text-accent font-medium">
                            {req.user.profile.specialty}
                          </span>
                        </div>
                      )}
                      <p className="text-[11px] text-text-tertiary mt-1">
                        {formatDate(req.createdAt)}
                      </p>
                    </div>

                    {/* Expand Toggle (pending only) */}
                    <button
                      onClick={() =>
                        setExpandedId(
                          expandedId === req.id ? null : req.id
                        )
                      }
                      className="btn btn-ghost btn-icon-sm text-text-tertiary shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Expanded Review Section */}
                  {expandedId === req.id && (
                    <div className="animate-fade-in-up space-y-3 pt-3 border-t border-border-light">
                      {/* Notes Field */}
                      <div>
                        <label className="text-caption text-text-secondary mb-1.5 block font-medium">
                          <MessageSquare className="w-3 h-3 inline ml-1" />
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
                          className="input !h-auto !min-h-[80px] !rounded-xl text-sm font-body resize-none"
                          rows={3}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReview(req.id, 'approved')}
                          className="btn btn-sm btn-primary gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          قبول وتوثيق
                        </button>
                        <button
                          onClick={() => handleReview(req.id, 'rejected')}
                          className="btn btn-sm btn-ghost text-destructive hover:bg-destructive-light gap-1.5"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          رفض الطلب
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            ))}
        </div>
      )}

      {/* Reviewed Requests */}
      {filterStatus !== 'pending' && reviewed.length > 0 && (
        <>
          {filterStatus === 'all' && pending.length > 0 && (
            <div className="flex items-center gap-2 pt-2">
              <div className="divider flex-1" />
              <span className="text-caption text-text-tertiary font-medium">
                المراجعة السابقة
              </span>
              <div className="divider flex-1" />
            </div>
          )}
          <div className="space-y-3">
            {reviewed.map((req, index) => (
              <AnimatedCard key={req.id} delay={index * 0.04}>
                <div className="card p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${
                        req.user?.role === 'doctor'
                          ? 'bg-accent-light text-accent'
                          : 'bg-muted text-text-tertiary'
                      }`}
                    >
                      {req.user?.role === 'doctor' ? (
                        <Stethoscope className="w-4 h-4" />
                      ) : (
                        <ShieldCheck className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-text-primary">
                          {req.user?.profile?.realName || 'مستخدم'}
                        </p>
                        {statusBadge(req.status)}
                      </div>
                      {req.reviewNotes && (
                        <p className="text-caption text-text-secondary mt-1 font-body">
                          {req.reviewNotes}
                        </p>
                      )}
                      <p className="text-[11px] text-text-tertiary mt-0.5">
                        {formatDate(req.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {displayedRequests.length === 0 && !isLoading && (
        <AnimatedCard>
          <div className="card p-6">
            <EmptyState
              icon={
                filterStatus === 'pending'
                  ? CheckCircle
                  : filterStatus === 'reviewed'
                  ? Clock
                  : AlertCircle
              }
              title={
                filterStatus === 'pending'
                  ? 'لا توجد طلبات معلقة'
                  : filterStatus === 'reviewed'
                  ? 'لا توجد طلبات تمت مراجعتها'
                  : 'لا توجد طلبات توثيق'
              }
              description={
                filterStatus === 'pending'
                  ? 'جميع طلبات التوثيق تمت مراجعتها'
                  : filterStatus === 'reviewed'
                  ? 'لم تتم مراجعة أي طلب بعد'
                  : 'لم يتم تقديم أي طلبات توثيق حتى الآن'
              }
            />
          </div>
        </AnimatedCard>
      )}
    </div>
  );
}
