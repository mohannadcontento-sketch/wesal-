'use client';

import { useState, useEffect } from 'react';

interface SupporterApplication {
  id: string;
  userId: string;
  status: string;
  bio?: string;
  specialty: string;
  experience?: string;
  certificates: string;
  reviewNotes?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    role: string;
    profile: {
      realName: string;
      username: string | null;
      reputationScore: number;
      reputationTier: string;
      specialty?: string;
    };
  };
}

export default function SupporterApplications() {
  const [applications, setApplications] = useState<SupporterApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/supporters')
      .then((r) => r.json())
      .then((d) => setApplications(d.supporters || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleReview = async (
    id: string,
    status: 'approved' | 'rejected' | 'suspended'
  ) => {
    const notes = reviewNotes[id] || '';
    try {
      const res = await fetch(`/api/admin/supporters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewNotes: notes }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === id
              ? { ...app, status, reviewNotes: notes }
              : app
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

  const pending = applications.filter((a) => a.status === 'pending');
  const reviewed = applications.filter((a) => a.status !== 'pending');

  const displayedApplications =
    filterStatus === 'pending'
      ? pending
      : filterStatus === 'reviewed'
        ? reviewed
        : applications;

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

  const parseCertificates = (certs: string): string[] => {
    try {
      return JSON.parse(certs);
    } catch {
      return [];
    }
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
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full font-medium">
            <span className="material-symbols-outlined text-sm">pause_circle</span>
            موقوف
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
            { label: 'الكل', value: 'all' as const, count: applications.length, icon: 'list' },
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

      {/* Pending Applications */}
      {filterStatus !== 'reviewed' && pending.length > 0 && (
        <div className="space-y-3">
          {pending
            .filter((_) => filterStatus === 'all' || filterStatus === 'pending')
            .map((app) => {
              const certs = parseCertificates(app.certificates);
              return (
                <div key={app.id} className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl p-5 sm:p-6 hover:shadow-[0_8px_32px_0_rgba(0,67,70,0.08)] transition-all">
                  {/* User Info Row */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center bg-emerald-100 text-emerald-700">
                      <span className="material-symbols-outlined">volunteer_activism</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-on-surface">
                          {app.user?.profile?.realName || 'مستخدم'}
                        </p>
                        {statusBadge(app.status)}
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {app.user?.email}
                      </p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {app.specialty && (
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs text-emerald-600">psychology</span>
                            <span className="text-xs text-emerald-700 font-medium">{app.specialty}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-primary-container">star</span>
                          <span className="text-xs text-primary-container font-medium">{app.user?.profile?.reputationScore || 0} نقطة سمعة</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-1">
                        {formatDate(app.createdAt)}
                      </p>
                    </div>

                    {/* Expand Toggle */}
                    <button
                      className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full shrink-0 transition-colors"
                      onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {expandedId === app.id ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                  </div>

                  {/* Bio Excerpt (always visible for pending) */}
                  {app.bio && (
                    <div className="mb-3 text-sm text-on-surface-variant leading-relaxed bg-surface-container-low/50 p-3 rounded-lg">
                      <span className="font-medium text-on-surface text-xs block mb-1">نبذة:</span>
                      {app.bio.length > 150 ? `${app.bio.substring(0, 150)}...` : app.bio}
                    </div>
                  )}

                  {/* Expanded Review Section */}
                  {expandedId === app.id && (
                    <div className="space-y-4 pt-3 border-t border-outline-variant/30">
                      {/* Full Bio */}
                      {app.bio && (
                        <div>
                          <span className="text-xs font-medium text-on-surface-variant block mb-1">النبذة كاملة:</span>
                          <p className="text-sm text-on-surface leading-relaxed">{app.bio}</p>
                        </div>
                      )}

                      {/* Experience */}
                      {app.experience && (
                        <div>
                          <span className="text-xs font-medium text-on-surface-variant block mb-1">الخبرة:</span>
                          <p className="text-sm text-on-surface leading-relaxed">{app.experience}</p>
                        </div>
                      )}

                      {/* Certificates */}
                      {certs.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-on-surface-variant block mb-1">الشهادات والكورسات:</span>
                          <div className="flex flex-wrap gap-2">
                            {certs.map((cert, i) => (
                              <span key={i} className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg">
                                <span className="material-symbols-outlined text-sm">workspace_premium</span>
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Review Notes */}
                      <div>
                        <label className="text-xs text-on-surface-variant mb-1.5 block font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">chat</span>
                          ملاحظات المراجعة
                        </label>
                        <textarea
                          value={reviewNotes[app.id] || ''}
                          onChange={(e) =>
                            setReviewNotes((prev) => ({
                              ...prev,
                              [app.id]: e.target.value,
                            }))
                          }
                          placeholder="أضف ملاحظاتك هنا..."
                          className="w-full min-h-[80px] bg-surface-container-low border border-outline-variant rounded-xl text-sm p-3 resize-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleReview(app.id, 'approved')}
                          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                        >
                          <span className="material-symbols-outlined text-base">check_circle</span>
                          قبول الداعم
                        </button>
                        <button
                          onClick={() => handleReview(app.id, 'rejected')}
                          className="flex items-center gap-1.5 px-4 py-2 text-error hover:bg-error-container rounded-xl text-sm font-bold transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">block</span>
                          رفض الطلب
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Reviewed Applications */}
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
            {reviewed.map((app) => {
              const certs = parseCertificates(app.certificates);
              return (
                <div key={app.id} className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${
                      app.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : app.status === 'suspended'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-surface-container-high text-on-surface-variant'
                    }`}>
                      <span className="material-symbols-outlined text-lg">volunteer_activism</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-on-surface">
                          {app.user?.profile?.realName || 'مستخدم'}
                        </p>
                        {statusBadge(app.status)}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-on-surface-variant">{app.user?.email}</span>
                        {app.specialty && (
                          <span className="text-xs text-emerald-600 font-medium">• {app.specialty}</span>
                        )}
                      </div>
                      {app.reviewNotes && (
                        <p className="text-xs text-on-surface-variant mt-1">{app.reviewNotes}</p>
                      )}
                      {app.status === 'approved' && certs.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {certs.slice(0, 3).map((cert, i) => (
                            <span key={i} className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">
                              {cert}
                            </span>
                          ))}
                          {certs.length > 3 && (
                            <span className="text-[10px] text-on-surface-variant">+{certs.length - 3}</span>
                          )}
                        </div>
                      )}
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        {formatDate(app.createdAt)}
                      </p>
                    </div>
                    {/* Suspend button for approved supporters */}
                    {app.status === 'approved' && (
                      <button
                        onClick={() => handleReview(app.id, 'suspended')}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors shrink-0"
                        title="إيقاف الداعم"
                      >
                        <span className="material-symbols-outlined text-lg">pause_circle</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Empty State */}
      {displayedApplications.length === 0 && !isLoading && (
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-outline-variant mx-auto mb-3 block">
            {filterStatus === 'pending' ? 'volunteer_activism' : filterStatus === 'reviewed' ? 'schedule' : 'inbox'}
          </span>
          <p className="text-base font-bold text-on-surface">
            {filterStatus === 'pending'
              ? 'لا توجد طلبات معلقة'
              : filterStatus === 'reviewed'
                ? 'لا توجد طلبات تمت مراجعتها'
                : 'لا توجد طلبات داعمين'}
          </p>
          <p className="text-sm text-on-surface-variant mt-1">
            {filterStatus === 'pending'
              ? 'جميع طلبات الداعمين تمت مراجعتها'
              : filterStatus === 'reviewed'
                ? 'لم تتم مراجعة أي طلب بعد'
                : 'لم يتم تقديم أي طلبات داعمين حتى الآن'}
          </p>
        </div>
      )}
    </div>
  );
}
