'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ReportItem {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: string;
  reason: string;
  details: string | null;
  status: string;
  reviewNotes: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reporter: {
    profile: { realName: string; username: string | null } | null;
  };
}

const REASON_LABELS: Record<string, string> = {
  spam: 'محتوى مزعج',
  inappropriate: 'محتوى غير لائق',
  harassment: 'تحرش أو تنمر',
  false_info: 'معلومات مضللة',
  other: 'سبب آخر',
};

const TARGET_TYPE_LABELS: Record<string, string> = {
  post: 'منشور',
  comment: 'تعليق',
  user: 'مستخدم',
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('pending');
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const loadReports = () => {
    fetch(`/api/reports${activeFilter !== 'all' ? `?status=${activeFilter}` : ''}`)
      .then(r => r.json())
      .then(data => setReports(data.reports || []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadReports(); }, [activeFilter]);

  const handleReview = async (id: string, status: string) => {
    setReviewing(id);
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewNotes: reviewNotes || null }),
      });
      if (res.ok) {
        toast.success(status === 'resolved' ? 'تم حل البلاغ وإخفاء المحتوى' : 'تم رفض البلاغ');
        setReviewNotes('');
        loadReports();
      } else {
        toast.error('حصل خطأ');
      }
    } catch {
      toast.error('حصل خطأ');
    } finally {
      setReviewing(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'resolved': return 'bg-emerald-100 text-emerald-700';
      case 'dismissed': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد المراجعة';
      case 'resolved': return 'تم الحل';
      case 'dismissed': return 'مرفوض';
      default: return status;
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${Math.floor(hours / 24)} يوم`;
  };

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-6 animate-pulse">
            <div className="h-5 bg-white/20 rounded w-1/3 mb-3" />
            <div className="h-3 bg-white/20 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <span className="material-symbols-outlined filled text-4xl text-primary">report</span>
        <div>
          <h1 className="text-[32px] font-bold text-primary leading-tight">البلاغات</h1>
          <p className="text-sm text-on-surface-variant mt-1">مراجعة البلاغات المقدمة من المستخدمين</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/10 backdrop-blur border border-white/40 rounded-xl p-4">
          <div className="text-xs text-on-surface-variant mb-1">قيد المراجعة</div>
          <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
        </div>
        <div className="bg-white/10 backdrop-blur border border-white/40 rounded-xl p-4">
          <div className="text-xs text-on-surface-variant mb-1">تم الحل</div>
          <div className="text-2xl font-bold text-emerald-600">
            {reports.filter(r => r.status === 'resolved').length}
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur border border-white/40 rounded-xl p-4">
          <div className="text-xs text-on-surface-variant mb-1">إجمالي</div>
          <div className="text-2xl font-bold text-primary">{reports.length}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'الكل' },
          { key: 'pending', label: 'قيد المراجعة' },
          { key: 'resolved', label: 'تم الحل' },
          { key: 'dismissed', label: 'مرفوض' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeFilter === tab.key
                ? 'bg-primary text-white'
                : 'bg-white/10 text-on-surface-variant hover:bg-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="bg-white/10 backdrop-blur border border-white/40 rounded-xl overflow-hidden">
        {reports.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-outline-variant mx-auto mb-3 block">shield</span>
            <p className="text-base font-semibold text-on-surface">مفيش بلاغات</p>
            <p className="text-sm text-on-surface-variant mt-1">المشروع آمن، مفيش بلاغات حالياً</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {reports.map(report => (
              <div key={report.id} className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-red-500 text-xl">flag</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-on-surface">
                          بلاغ عن {TARGET_TYPE_LABELS[report.targetType] || report.targetType}
                        </span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getStatusColor(report.status)}`}>
                          {getStatusLabel(report.status)}
                        </span>
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        بلّغ عنه: {report.reporter?.profile?.realName || 'مستخدم'} · {timeAgo(report.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3 mb-3">
                  <div className="text-sm font-medium text-on-surface mb-1">
                    السبب: {REASON_LABELS[report.reason] || report.reason}
                  </div>
                  {report.details && (
                    <p className="text-sm text-on-surface-variant leading-relaxed">{report.details}</p>
                  )}
                  <div className="text-xs text-on-surface-variant/60 mt-2">
                    معرّف الهدف: {report.targetId}
                  </div>
                </div>

                {report.reviewNotes && (
                  <div className="bg-emerald-50 rounded-lg p-3 mb-3">
                    <div className="text-xs font-semibold text-emerald-800 mb-1">ملاحظات المراجعة:</div>
                    <p className="text-sm text-emerald-700">{report.reviewNotes}</p>
                  </div>
                )}

                {/* Review Actions (only for pending) */}
                {report.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="أضف ملاحظات..."
                      value={reviewing === report.id ? reviewNotes : ''}
                      onChange={e => setReviewNotes(e.target.value)}
                      onFocus={() => setReviewing(report.id)}
                      className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      dir="rtl"
                    />
                    <button
                      onClick={() => handleReview(report.id, 'resolved')}
                      disabled={reviewing !== report.id}
                      className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      حلّ البلاغ
                    </button>
                    <button
                      onClick={() => handleReview(report.id, 'dismissed')}
                      disabled={reviewing !== report.id}
                      className="px-3 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      ارفض
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
