'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { UserAvatar } from '@/components/avatars/UserAvatar';

interface PatientInfo {
  id: string;
  realName: string;
  username?: string | null;
  avatarUrl?: string | null;
}

interface Appointment {
  id: string;
  appointmentDate: string;
  reason: string;
  status: string;
  patientId: string;
  doctorId: string;
  chatRoomId?: string | null;
  patient: { profile: { realName: string; username?: string | null; avatarUrl?: string | null } } | null;
  doctor: { profile: { realName: string } } | null;
  createdAt: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeUntil(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMs < 0) return 'انتهى';
  if (diffMins < 60) return `بعد ${diffMins} دقيقة`;
  if (diffHours < 24) return `بعد ${diffHours} ساعة`;
  return `بعد ${diffDays} يوم`;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'في انتظار التأكيد', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  confirmed: { label: 'مؤكد', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  completed: { label: 'مكتمل', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  cancelled: { label: 'ملغي', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'completed' | 'all'>('pending');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.role !== 'doctor') {
        router.push('/');
        return;
      }
      fetchAppointments();
    } else if (!user) {
      setLoading(false);
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      if (res.ok) setAppointments(data.appointments || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appointmentId: string, status: string) => {
    setUpdatingId(appointmentId);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status } : a));
        toast.success(status === 'confirmed' ? 'تم تأكيد الموعد' : status === 'completed' ? 'تم إنهاء الموعد' : 'تم إلغاء الموعد');
      } else {
        const data = await res.json();
        toast.error(data.error || 'حصل خطأ');
      }
    } catch {
      toast.error('حصل خطأ');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wesal-cream">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-wesal-medium mb-3 block">lock</span>
          <p className="text-sm text-wesal-medium">سجل دخول الأول</p>
          <Link href="/login" className="mt-4 inline-block px-6 py-2 bg-wesal-dark text-white rounded-xl text-sm font-bold">
            سجل دخول
          </Link>
        </div>
      </div>
    );
  }

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const totalPatients = new Set(appointments.map(a => a.patientId)).size;

  const filtered = activeTab === 'all'
    ? appointments
    : appointments.filter(a => a.status === activeTab);

  return (
    <div className="min-h-screen bg-surface">
      {/* Top Bar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-8 h-16 bg-white/60 backdrop-blur-xl border-b border-wesal-ice/50 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-full hover:bg-wesal-ice/50 transition-colors text-wesal-dark">
            <span className="material-symbols-outlined text-2xl">arrow_forward</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">stethoscope</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-wesal-navy leading-tight">لوحة الطبيب</h1>
              <p className="text-[11px] text-wesal-medium">{user.realName || user.username}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/chat" className="p-2 rounded-full hover:bg-wesal-ice/50 transition-colors text-wesal-dark relative" title="المحادثات">
            <span className="material-symbols-outlined text-xl">forum</span>
          </Link>
          <Link href="/notifications" className="p-2 rounded-full hover:bg-wesal-ice/50 transition-colors text-wesal-dark" title="الإشعارات">
            <span className="material-symbols-outlined text-xl">notifications</span>
          </Link>
        </div>
      </nav>

      <main className="pt-20 pb-8 px-4 md:px-8 max-w-5xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'مواعيد معلقة', value: pendingCount, icon: 'schedule', color: 'from-amber-400 to-amber-600', bg: 'bg-amber-50' },
            { label: 'مواعيد مؤكدة', value: confirmedCount, icon: 'event_available', color: 'from-emerald-400 to-emerald-600', bg: 'bg-emerald-50' },
            { label: 'مواعيد مكتملة', value: completedCount, icon: 'task_alt', color: 'from-blue-400 to-blue-600', bg: 'bg-blue-50' },
            { label: 'إجمالي المرضى', value: totalPatients, icon: 'group', color: 'from-purple-400 to-purple-600', bg: 'bg-purple-50' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} border border-white/50 rounded-2xl p-4 shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <span className="material-symbols-outlined text-xl text-wesal-medium">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-wesal-navy">{stat.value}</p>
              <p className="text-xs text-wesal-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {[
            { key: 'pending' as const, label: 'المعلقة', count: pendingCount },
            { key: 'confirmed' as const, label: 'المؤكدة', count: confirmedCount },
            { key: 'completed' as const, label: 'المكتملة', count: completedCount },
            { key: 'all' as const, label: 'الكل', count: appointments.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-wesal-dark text-white shadow-md'
                  : 'bg-white text-wesal-medium hover:bg-wesal-ice border border-wesal-ice/70'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold px-1.5 ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-wesal-ice text-wesal-dark'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-wesal-ice rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-wesal-ice rounded w-1/3" />
                    <div className="h-3 bg-wesal-ice rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-wesal-ice">
              <span className="material-symbols-outlined text-3xl text-wesal-medium">
                {activeTab === 'pending' ? 'inbox' : activeTab === 'all' ? 'event_busy' : 'check_circle'}
              </span>
            </div>
            <p className="text-sm font-medium text-wesal-navy">
              {activeTab === 'pending' ? 'مفيش مواعيد معلقة' : activeTab === 'confirmed' ? 'مفيش مواعيد مؤكدة' : 'مفيش مواعيد'}
            </p>
            <p className="text-xs text-wesal-medium mt-1">
              {activeTab === 'pending' ? 'هتلاقي المواعيد الجديدة هنا أول ما المرضى يحجزوا' : 'المواعيد هتظهر هنا لما تيجي'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((appt) => {
              const patientName = appt.patient?.profile?.realName || appt.patient?.profile?.username || 'مريض';
              const patientAvatar = appt.patient?.profile?.avatarUrl || null;
              const patientUsername = appt.patient?.profile?.username;
              const status = statusConfig[appt.status] || statusConfig.pending;
              const isUpdating = updatingId === appt.id;

              return (
                <div key={appt.id} className="bg-white rounded-2xl border border-wesal-ice/70 p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    {/* Patient Avatar */}
                    <div className="shrink-0">
                      <UserAvatar avatarUrl={patientAvatar} username={patientName} size="lg" className="!w-12 !h-12" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="text-sm font-bold text-wesal-navy truncate">{patientName}</h3>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <span className="text-[11px] text-wesal-medium shrink-0">{timeUntil(appt.appointmentDate)}</span>
                      </div>

                      {/* Appointment Date */}
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="material-symbols-outlined text-wesal-medium text-sm">calendar_today</span>
                        <span className="text-xs text-wesal-medium">{formatDate(appt.appointmentDate)}</span>
                      </div>

                      {/* Reason */}
                      <p className="text-xs text-wesal-navy/70 mt-1.5 line-clamp-2 bg-wesal-cream/50 rounded-lg px-3 py-1.5">
                        {appt.reason}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        {/* Chat Button */}
                        {appt.chatRoomId && (
                          <Link
                            href={`/chat/${appt.chatRoomId}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-wesal-ice text-wesal-dark hover:bg-wesal-sky/30 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">chat</span>
                            فتح المحادثة
                          </Link>
                        )}

                        {/* Status Actions for Pending */}
                        {appt.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(appt.id, 'confirmed')}
                              disabled={isUpdating}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
                            >
                              {isUpdating ? (
                                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                              ) : (
                                <span className="material-symbols-outlined text-sm">check</span>
                              )}
                              تأكيد
                            </button>
                            <button
                              onClick={() => updateStatus(appt.id, 'cancelled')}
                              disabled={isUpdating}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-sm">close</span>
                              رفض
                            </button>
                          </>
                        )}

                        {/* Complete for Confirmed */}
                        {appt.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus(appt.id, 'completed')}
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                            ) : (
                              <span className="material-symbols-outlined text-sm">task_alt</span>
                            )}
                            إنهاء الجلسة
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
