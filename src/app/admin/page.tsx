'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

interface VerificationRequest {
  id: string;
  userId: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    profile: {
      realName: string;
      username: string | null;
      reputationScore: number;
      reputationTier: string;
    };
  };
}

interface DashboardStats {
  totalUsers: number;
  doctors: number;
  posts: number;
  pendingVerifications: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    doctors: 0,
    posts: 0,
    pendingVerifications: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }
    if (user?.role === 'admin') {
      fetch('/api/admin/verification-requests')
        .then((r) => r.json())
        .then((data) => {
          setRequests(data.requests || []);
          setStats((prev) => ({
            ...prev,
            pendingVerifications: (data.requests || []).filter(
              (r: VerificationRequest) => r.status === 'pending'
            ).length,
          }));
        });

      fetch('/api/admin/stats')
        .then((r) => r.json())
        .then((data) => {
          setStats((prev) => ({
            totalUsers: data.totalUsers || prev.totalUsers,
            doctors: data.doctors || prev.doctors,
            posts: data.posts || prev.posts,
            pendingVerifications: data.pendingVerifications || prev.pendingVerifications,
          }));
        })
        .catch(() => {
          setStats((prev) => ({ ...prev }));
        })
        .finally(() => setIsLoadingStats(false));
    }
  }, [user, router]);

  const handleAction = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/verification-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(status === 'approved' ? 'تم التوثيق بنجاح' : 'تم الرفض');
        setRequests((prev) => prev.filter((r) => r.id !== id));
        setStats((prev) => ({
          ...prev,
          pendingVerifications: Math.max(0, prev.pendingVerifications - 1),
        }));
      }
    } catch {
      toast.error('حصل خطأ أثناء معالجة الطلب');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <span className="material-symbols-outlined filled text-4xl text-primary">admin_panel_settings</span>
        <div>
          <h1 className="text-[32px] font-bold text-primary leading-tight">لوحة الإدارة</h1>
          <p className="text-sm text-on-surface-variant mt-1">إدارة المنصة والتحقق من الطلبات</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Pending */}
        <div className="bg-white/10 backdrop-blur-[40px] border border-white/40 rounded-xl p-6 shadow-[0_4px_24px_0_rgba(0,43,45,0.05)] relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary-fixed opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-outline">طلبات معلقة</h3>
            <span className="material-symbols-outlined text-primary-container">pending_actions</span>
          </div>
          <p className="text-[32px] font-bold text-primary">
            {isLoadingStats ? '...' : stats.pendingVerifications}
          </p>
        </div>

        {/* Verified Today */}
        <div className="bg-white/10 backdrop-blur-[40px] border border-white/40 rounded-xl p-6 shadow-[0_4px_24px_0_rgba(0,43,45,0.05)] relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-tertiary-fixed opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-outline">تم التحقق اليوم</h3>
            <span className="material-symbols-outlined text-tertiary-container">how_to_reg</span>
          </div>
          <p className="text-[32px] font-bold text-tertiary-container">
            {isLoadingStats ? '...' : stats.doctors}
          </p>
        </div>

        {/* Total Users */}
        <div className="bg-white/10 backdrop-blur-[40px] border border-white/40 rounded-xl p-6 shadow-[0_4px_24px_0_rgba(0,43,45,0.05)] relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-error-container opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-outline">إجمالي المستخدمين</h3>
            <span className="material-symbols-outlined text-error">group</span>
          </div>
          <p className="text-[32px] font-bold text-error">
            {isLoadingStats ? '...' : stats.totalUsers}
          </p>
        </div>
      </div>

      {/* Verification Requests List */}
      <div className="bg-white/10 backdrop-blur-[40px] border border-white/40 rounded-xl shadow-[0_4px_24px_0_rgba(0,43,45,0.05)] overflow-hidden">
        <div className="p-6 border-b border-surface-variant flex justify-between items-center bg-surface-container-lowest/50">
          <h2 className="text-xl font-semibold text-primary">طلبات التحقق من الهوية</h2>
          <Link
            href="/admin/verification"
            className="flex items-center gap-2 text-sm font-bold text-primary-container hover:text-primary transition-colors"
          >
            عرض الكل
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-outline-variant mx-auto mb-3 block">verified_user</span>
            <p className="text-base font-semibold text-on-surface">لا توجد طلبات معلقة</p>
            <p className="text-sm text-on-surface-variant mt-1">جميع طلبات التوثيق تمت مراجعتها</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-variant/50">
            {requests.slice(0, 5).map((req) => (
              <div key={req.id} className="p-6 flex items-center justify-between hover:bg-surface-container-low/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-fixed bg-surface-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary-container">person</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">
                      {req.user?.profile?.realName || 'مستخدم'}
                    </h4>
                    <p className="text-xs text-outline flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-xs">star</span>
                      {req.user?.profile?.reputationScore || 0} نقطة سمعة
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center hover:bg-error hover:text-white transition-colors"
                    title="رفض"
                    onClick={() => handleAction(req.id, 'rejected')}
                  >
                    <span className="material-symbols-outlined">cancel</span>
                  </button>
                  <button
                    className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center hover:bg-primary-container hover:text-white transition-colors"
                    title="قبول"
                    onClick={() => handleAction(req.id, 'approved')}
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                  </button>
                  <Link
                    href="/admin/verification"
                    className="px-4 py-2 text-sm font-bold text-primary border border-outline-variant rounded-lg hover:bg-surface-variant transition-colors mr-2 hidden sm:block"
                  >
                    عرض التفاصيل
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
