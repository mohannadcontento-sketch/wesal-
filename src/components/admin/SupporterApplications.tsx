'use client';

import { useState, useEffect } from 'react';

interface SupporterApplication {
  id: string;
  userId: string;
  status: string;
  bio?: string;
  specialty: string;
  experience?: string;
  certificates: string[] | string;
  certificateFiles: string[] | string;
  reviewNotes?: string;
  reviewedBy?: string;
  source?: string;
  reputationOfferedAt?: string;
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

interface EligibleUser {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  profile: {
    realName: string;
    username: string | null;
    avatarUrl: string | null;
    reputationScore: number;
    reputationTier: string;
    specialty?: string;
    isVerified: boolean;
  };
}

export default function SupporterApplications() {
  const [applications, setApplications] = useState<SupporterApplication[]>([]);
  const [eligibleUsers, setEligibleUsers] = useState<EligibleUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'applications' | 'eligible'>('applications');
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [promoteData, setPromoteData] = useState<Record<string, { specialty: string; bio: string }>>({});

  useEffect(() => {
    fetch('/api/admin/supporters')
      .then((r) => r.json())
      .then((d) => setApplications(d.supporters || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));

    fetch('/api/admin/supporters/eligible')
      .then((r) => r.json())
      .then((d) => setEligibleUsers(d.eligibleUsers || []))
      .catch(() => {});
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

  const handlePromote = async (userId: string) => {
    const data = promoteData[userId] || { specialty: 'دعم نفسي', bio: '' };
    if (!data.bio || data.bio.trim().length < 20) {
      alert('اكتب نبذة عن الداعم (20 حرف على الأقل)');
      return;
    }
    setPromotingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/promote-supporter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialty: data.specialty,
          bio: data.bio,
          reviewNotes: 'تمت الترقية بناءً على مستوى السمعة',
        }),
      });
      if (res.ok) {
        setEligibleUsers((prev) => prev.filter((u) => u.id !== userId));
        // Refresh applications
        const appRes = await fetch('/api/admin/supporters');
        const appData = await appRes.json();
        setApplications(appData.supporters || []);
      }
    } catch {
      // Silently fail
    } finally {
      setPromotingId(null);
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

  const parseCertificates = (certs: string[] | string): string[] => {
    if (Array.isArray(certs)) return certs;
    try {
      return JSON.parse(certs);
    } catch {
      return [];
    }
  };

  const parseCertificateFiles = (files: string[] | string): string[] => {
    if (Array.isArray(files)) return files;
    try {
      return JSON.parse(files);
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

  const sourceBadge = (source?: string) => {
    if (source === 'reputation') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] bg-primary-container/40 text-primary-container px-1.5 py-0.5 rounded-full font-medium">
          <span className="material-symbols-outlined" style={{ fontSize: 10 }}>stars</span>
          عبر السمعة
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      {/* Tab Toggle */}
      <div className="flex gap-2 border-b border-outline-variant/30 pb-3">
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'applications'
              ? 'bg-primary text-on-primary shadow-md'
              : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-base">volunteer_activism</span>
          طلبات الانضمام ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('eligible')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'eligible'
              ? 'bg-primary text-on-primary shadow-md'
              : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-base">stars</span>
          مؤهلون بالسمعة ({eligibleUsers.length})
        </button>
      </div>

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <>
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
                  const certFiles = parseCertificateFiles(app.certificateFiles);
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
                            {sourceBadge(app.source)}
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

                      {/* Certificate Files Preview */}
                      {certFiles.length > 0 && (
                        <div className="mb-3">
                          <span className="text-xs font-medium text-on-surface-variant block mb-1.5">ملفات الشهادات المرفوعة:</span>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {certFiles.map((url, i) => (
                              <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 w-20 h-20 rounded-lg border border-outline-variant overflow-hidden hover:border-primary transition-colors relative group"
                              >
                                {url.endsWith('.pdf') ? (
                                  <div className="w-full h-full flex items-center justify-center bg-surface-container">
                                    <span className="material-symbols-outlined text-2xl text-error">picture_as_pdf</span>
                                  </div>
                                ) : (
                                  <img src={url} alt={`شهادة ${i + 1}`} className="w-full h-full object-cover" />
                                )}
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="material-symbols-outlined text-white text-lg">open_in_new</span>
                                </div>
                              </a>
                            ))}
                          </div>
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

                          {/* Certificate Files Full View */}
                          {certFiles.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-on-surface-variant block mb-1">ملفات الشهادات:</span>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {certFiles.map((url, i) => (
                                  <a
                                    key={i}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="border border-outline-variant rounded-xl overflow-hidden hover:border-primary transition-colors"
                                  >
                                    {url.endsWith('.pdf') ? (
                                      <div className="h-32 flex items-center justify-center bg-surface-container">
                                        <span className="material-symbols-outlined text-3xl text-error">picture_as_pdf</span>
                                      </div>
                                    ) : (
                                      <img src={url} alt={`شهادة ${i + 1}`} className="h-32 w-full object-cover" />
                                    )}
                                    <div className="p-2 text-center">
                                      <span className="text-[10px] text-primary font-medium">شهادة {i + 1} - اضغط للعرض</span>
                                    </div>
                                  </a>
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
                            {sourceBadge(app.source)}
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
        </>
      )}

      {/* Eligible Users Tab */}
      {activeTab === 'eligible' && (
        <>
          <div className="bg-primary-container/30 border border-primary-container rounded-xl p-4 mb-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-xl mt-0.5">info</span>
            <div>
              <p className="text-sm font-medium text-on-surface">المستخدمون المؤهلون بالسمعة</p>
              <p className="text-xs text-on-surface-variant mt-1">
                دول مستخدمين وصلوا لـ 200 نقطة سمعة أو أكتر ومش داعمين لسه. تقدر ترقيهم لداعم مباشرة.
              </p>
            </div>
          </div>

          {eligibleUsers.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-outline-variant mx-auto mb-3 block">stars</span>
              <p className="text-base font-bold text-on-surface">مفيش مستخدمين مؤهلين حالياً</p>
              <p className="text-sm text-on-surface-variant mt-1">المستخدمين اللي يوصلوا 200 نقطة سمعة هيظهروا هنا</p>
            </div>
          ) : (
            <div className="space-y-3">
              {eligibleUsers.map((eu) => (
                <div key={eu.id} className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center bg-primary-container/40 text-primary-container">
                      <span className="material-symbols-outlined">stars</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-on-surface">
                          {eu.profile?.realName || eu.profile?.username || 'مستخدم'}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[10px] bg-primary-container/40 text-primary-container px-1.5 py-0.5 rounded-full font-medium">
                          <span className="material-symbols-outlined" style={{ fontSize: 10 }}>stars</span>
                          مؤهل بالسمعة
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">{eu.email}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-primary-container font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>star</span>
                          {eu.profile?.reputationScore || 0} نقطة سمعة
                        </span>
                        {eu.profile?.specialty && (
                          <span className="text-xs text-emerald-600 font-medium">{eu.profile.specialty}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Promote form */}
                  <div className="mt-4 pt-3 border-t border-outline-variant/30 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-on-surface-variant block mb-1">التخصص</label>
                        <select
                          value={promoteData[eu.id]?.specialty || 'دعم نفسي'}
                          onChange={(e) => setPromoteData(prev => ({
                            ...prev,
                            [eu.id]: { ...prev[eu.id] || { bio: '', specialty: 'دعم نفسي' }, specialty: e.target.value }
                          }))}
                          className="w-full h-9 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface p-2 focus:border-primary transition-all"
                        >
                          <option value="دعم نفسي">دعم نفسي</option>
                          <option value="دعم أسري">دعم أسري</option>
                          <option value="دعم أكاديمي">دعم أكاديمي</option>
                          <option value="دعم اجتماعي">دعم اجتماعي</option>
                          <option value="دعم لضحايا العنف">دعم لضحايا العنف</option>
                          <option value="دعم الإدمان">دعم الإدمان</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-on-surface-variant block mb-1">نبذة (20 حرف على الأقل)</label>
                        <input
                          type="text"
                          value={promoteData[eu.id]?.bio || ''}
                          onChange={(e) => setPromoteData(prev => ({
                            ...prev,
                            [eu.id]: { ...prev[eu.id] || { bio: '', specialty: 'دعم نفسي' }, bio: e.target.value }
                          }))}
                          placeholder="داعم معتمد بناءً على السمعة..."
                          className="w-full h-9 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface p-2 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handlePromote(eu.id)}
                      disabled={promotingId === eu.id || !(promoteData[eu.id]?.bio?.length >= 20)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {promotingId === eu.id ? (
                        <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-sm">volunteer_activism</span>
                      )}
                      ترقية لداعم
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
