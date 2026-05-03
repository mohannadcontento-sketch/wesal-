'use client';

import { useState, useEffect } from 'react';
import AnimatedCard from '@/components/animations/AnimatedCard';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle,
  XCircle,
  Clock,
  Stethoscope,
  ShieldCheck,
  AlertCircle,
  Eye,
  Ban,
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
          <Card key={i} className="p-4 h-36">
            <Skeleton className="h-5 w-40 rounded-md mb-3" />
            <Skeleton className="h-4 w-60 rounded-md mb-2" />
            <Skeleton className="h-20 w-full rounded-md" />
          </Card>
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
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <Clock className="w-3 h-3" />
            قيد الانتظار
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="gap-1.5 text-xs border-green-300 text-green-700 bg-green-50">
            <CheckCircle className="w-3 h-3" />
            مقبول
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1.5 text-xs">
            <XCircle className="w-3 h-3" />
            مرفوض
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <AlertCircle className="w-3 h-3" />
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Filter Tabs & Count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={filterStatus === 'all' ? 'default' : 'ghost'}
            onClick={() => setFilterStatus('all')}
            className={filterStatus === 'all' ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}
          >
            الكل ({requests.length})
          </Button>
          <Button
            size="sm"
            variant={filterStatus === 'pending' ? 'default' : 'ghost'}
            onClick={() => setFilterStatus('pending')}
            className={`gap-1.5 ${filterStatus === 'pending' ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}`}
          >
            <Clock className="w-3.5 h-3.5" />
            قيد الانتظار ({pending.length})
          </Button>
          <Button
            size="sm"
            variant={filterStatus === 'reviewed' ? 'default' : 'ghost'}
            onClick={() => setFilterStatus('reviewed')}
            className={`gap-1.5 ${filterStatus === 'reviewed' ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            تمت المراجعة ({reviewed.length})
          </Button>
        </div>
      </div>

      {/* Pending Requests */}
      {filterStatus !== 'reviewed' && pending.length > 0 && (
        <div className="space-y-3">
          {pending
            .filter((_) => filterStatus === 'all' || filterStatus === 'pending')
            .map((req, index) => (
              <AnimatedCard key={req.id} delay={index * 0.05}>
                <Card className={`p-4 sm:p-5 ${req.status === 'pending' ? 'border-amber-200' : ''}`}>
                  {/* User Info Row */}
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full shrink-0 ${
                        req.user?.role === 'doctor'
                          ? 'bg-purple-50 text-purple-600'
                          : 'bg-teal-50 text-teal-600'
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
                        <p className="text-sm font-semibold text-foreground">
                          {req.user?.profile?.realName || 'مستخدم'}
                        </p>
                        {statusBadge(req.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {req.user?.email}
                      </p>
                      {req.user?.profile?.specialty && (
                        <div className="flex items-center gap-1 mt-1">
                          <Stethoscope className="w-3 h-3 text-purple-600" />
                          <span className="text-xs text-purple-600 font-medium">
                            {req.user.profile.specialty}
                          </span>
                        </div>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {formatDate(req.createdAt)}
                      </p>
                    </div>

                    {/* Expand Toggle (pending only) */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground shrink-0"
                      onClick={() =>
                        setExpandedId(expandedId === req.id ? null : req.id)
                      }
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Expanded Review Section */}
                  {expandedId === req.id && (
                    <div className="space-y-3 pt-3 border-t border-border">
                      {/* Notes Field */}
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                          <MessageSquare className="w-3 h-3 inline ml-1" />
                          ملاحظات المراجعة
                        </label>
                        <Textarea
                          value={reviewNotes[req.id] || ''}
                          onChange={(e) =>
                            setReviewNotes((prev) => ({
                              ...prev,
                              [req.id]: e.target.value,
                            }))
                          }
                          placeholder="أضف ملاحظاتك هنا..."
                          className="min-h-[80px] rounded-xl text-sm resize-none"
                          rows={3}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleReview(req.id, 'approved')}
                          className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          قبول وتوثيق
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReview(req.id, 'rejected')}
                          className="text-red-600 hover:bg-red-50 gap-1.5"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          رفض الطلب
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </AnimatedCard>
            ))}
        </div>
      )}

      {/* Reviewed Requests */}
      {filterStatus !== 'pending' && reviewed.length > 0 && (
        <>
          {filterStatus === 'all' && pending.length > 0 && (
            <div className="flex items-center gap-2 pt-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                المراجعة السابقة
              </span>
              <Separator className="flex-1" />
            </div>
          )}
          <div className="space-y-3">
            {reviewed.map((req, index) => (
              <AnimatedCard key={req.id} delay={index * 0.04}>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${
                        req.user?.role === 'doctor'
                          ? 'bg-purple-50 text-purple-600'
                          : 'bg-muted text-muted-foreground'
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
                        <p className="text-sm font-semibold text-foreground">
                          {req.user?.profile?.realName || 'مستخدم'}
                        </p>
                        {statusBadge(req.status)}
                      </div>
                      {req.reviewNotes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {req.reviewNotes}
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {formatDate(req.createdAt)}
                      </p>
                    </div>
                  </div>
                </Card>
              </AnimatedCard>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {displayedRequests.length === 0 && !isLoading && (
        <AnimatedCard>
          <Card className="p-6">
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
          </Card>
        </AnimatedCard>
      )}
    </div>
  );
}
