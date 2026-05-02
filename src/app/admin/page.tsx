'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';
import AnimatedCard from '@/components/animations/AnimatedCard';
import EmptyState from '@/components/shared/EmptyState';
import {
  Shield,
  Users,
  Stethoscope,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Activity,
  Eye,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react';

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
      // Fetch verification requests (existing logic)
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

      // Fetch dashboard stats
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
          // Use verification data as fallback
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

  const statCards = [
    {
      label: 'إجمالي المستخدمين',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-primary-light text-primary',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'الأطباء',
      value: stats.doctors,
      icon: Stethoscope,
      color: 'bg-accent-light text-accent',
      trend: '+5%',
      trendUp: true,
    },
    {
      label: 'المنشورات',
      value: stats.posts,
      icon: FileText,
      color: 'bg-success-light text-success',
      trend: '+8%',
      trendUp: true,
    },
    {
      label: 'طلبات التوثيق',
      value: stats.pendingVerifications,
      icon: Clock,
      color: 'bg-[#FEF3C7] text-warm',
      trend: stats.pendingVerifications > 0 ? `${stats.pendingVerifications} جديد` : 'لا يوجد',
      trendUp: null,
    },
  ];

  const quickActions = [
    {
      label: 'مراجعة الطلبات',
      href: '/admin/verification',
      icon: Eye,
      variant: 'primary' as const,
    },
  ];

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary text-white shadow-glow">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-h3 text-text-primary font-heading">
              لوحة التحكم
            </h1>
            <p className="text-body-sm text-text-secondary">
              نظرة عامة على منصة وصال
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <AnimatedCard key={stat.label} delay={index * 0.08}>
              <div className="card p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl ${stat.color}`}
                  >
                    <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                  </div>
                  {stat.trendUp !== null && (
                    <div
                      className={`flex items-center gap-0.5 text-xs font-medium ${
                        stat.trendUp
                          ? 'text-success'
                          : 'text-destructive'
                      }`}
                    >
                      <TrendingUp
                        className={`w-3 h-3 ${
                          !stat.trendUp ? 'rotate-180' : ''
                        }`}
                      />
                      {stat.trend}
                    </div>
                  )}
                </div>
                <p className="text-h2 text-text-primary font-heading">
                  {isLoadingStats ? (
                    <span className="skeleton inline-block w-12 h-8 rounded-md" />
                  ) : (
                    stat.value
                  )}
                </p>
                <p className="text-caption text-text-tertiary mt-0.5">
                  {stat.label}
                </p>
              </div>
            </AnimatedCard>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Verification Requests */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h4 text-text-primary font-heading flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              طلبات التوثيق الأخيرة
            </h2>
            <Link href="/admin/verification">
              <button className="btn btn-ghost btn-sm gap-1.5 text-text-secondary">
                عرض الكل
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {requests.length === 0 ? (
            <AnimatedCard>
              <div className="card p-6">
                <EmptyState
                  icon={CheckCircle}
                  title="لا توجد طلبات معلقة"
                  description="جميع طلبات التوثيق تمت مراجعتها"
                />
              </div>
            </AnimatedCard>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 5).map((req, index) => (
                <AnimatedCard key={req.id} delay={index * 0.06}>
                  <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          {req.user.profile.realName}
                        </p>
                        <p className="text-caption text-text-tertiary">
                          @{req.user.profile.username || '—'} · {req.user.profile.reputationScore} نقطة
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="badge badge-primary">
                            {req.user.profile.reputationTier}
                          </span>
                          <span className="text-[11px] text-text-tertiary">
                            {formatDate(req.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:flex-shrink-0">
                      <button
                        onClick={() => handleAction(req.id, 'approved')}
                        className="btn btn-sm btn-primary gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        توثيق
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'rejected')}
                        className="btn btn-sm btn-ghost text-destructive hover:bg-destructive-light gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        رفض
                      </button>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Summary */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <AnimatedCard delay={0.2}>
            <div className="card p-5">
              <h3 className="text-h4 text-text-primary font-heading mb-4">
                إجراءات سريعة
              </h3>
              <div className="space-y-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.href} href={action.href}>
                      <button
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          action.variant === 'primary'
                            ? 'btn btn-primary justify-start'
                            : 'hover:bg-muted text-text-secondary'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {action.label}
                        <ArrowLeft className="w-4 h-4 mr-auto" />
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>
          </AnimatedCard>

          {/* Platform Summary */}
          <AnimatedCard delay={0.3}>
            <div className="card p-5">
              <h3 className="text-h4 text-text-primary font-heading mb-4">
                ملخص المنصة
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    المستخدمون النشطون
                  </div>
                  <span className="text-sm font-semibold text-text-primary">
                    {stats.totalUsers}
                  </span>
                </div>
                <div className="divider" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    الأطباء الموثقون
                  </div>
                  <span className="text-sm font-semibold text-text-primary">
                    {stats.doctors}
                  </span>
                </div>
                <div className="divider" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    إجمالي المنشورات
                  </div>
                  <span className="text-sm font-semibold text-text-primary">
                    {stats.posts}
                  </span>
                </div>
                <div className="divider" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <div className="w-2 h-2 rounded-full bg-warm" />
                    طلبات معلقة
                  </div>
                  <span
                    className={`badge ${
                      stats.pendingVerifications > 0
                        ? 'badge-destructive'
                        : 'badge-success'
                    }`}
                  >
                    {stats.pendingVerifications}
                  </span>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
}
