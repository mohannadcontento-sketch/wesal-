'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import AnimatedCard from '@/components/animations/AnimatedCard';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
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
      color: 'bg-teal-50 text-teal-600',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'الأطباء',
      value: stats.doctors,
      icon: Stethoscope,
      color: 'bg-purple-50 text-purple-600',
      trend: '+5%',
      trendUp: true,
    },
    {
      label: 'المنشورات',
      value: stats.posts,
      icon: FileText,
      color: 'bg-green-50 text-green-600',
      trend: '+8%',
      trendUp: true,
    },
    {
      label: 'طلبات التوثيق',
      value: stats.pendingVerifications,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600',
      trend:
        stats.pendingVerifications > 0
          ? `${stats.pendingVerifications} جديد`
          : 'لا يوجد',
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
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-sm">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">لوحة التحكم</h1>
            <p className="text-sm text-muted-foreground">
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
              <Card className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl ${stat.color}`}
                  >
                    <Icon className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
                  </div>
                  {stat.trendUp !== null && (
                    <div
                      className={`flex items-center gap-0.5 text-xs font-medium ${
                        stat.trendUp ? 'text-green-600' : 'text-red-600'
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
                <p className="text-3xl font-bold text-foreground">
                  {isLoadingStats ? (
                    <Skeleton className="inline-block w-12 h-8 rounded-md" />
                  ) : (
                    stat.value
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stat.label}
                </p>
              </Card>
            </AnimatedCard>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Verification Requests */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              طلبات التوثيق الأخيرة
            </h2>
            <Link href="/admin/verification">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                عرض الكل
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {requests.length === 0 ? (
            <AnimatedCard>
              <Card className="p-6">
                <EmptyState
                  icon={CheckCircle}
                  title="لا توجد طلبات معلقة"
                  description="جميع طلبات التوثيق تمت مراجعتها"
                />
              </Card>
            </AnimatedCard>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 5).map((req, index) => (
                <AnimatedCard key={req.id} delay={index * 0.06}>
                  <Card className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-600 shrink-0">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {req.user.profile.realName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{req.user.profile.username || '—'} · {req.user.profile.reputationScore} نقطة
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {req.user.profile.reputationTier}
                            </Badge>
                            <span className="text-[11px] text-muted-foreground">
                              {formatDate(req.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleAction(req.id, 'approved')}
                          className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          توثيق
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAction(req.id, 'rejected')}
                          className="text-red-600 hover:bg-red-50 gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          رفض
                        </Button>
                      </div>
                    </div>
                  </Card>
                </AnimatedCard>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Summary */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <AnimatedCard delay={0.2}>
            <Card className="p-5">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg font-semibold">
                  إجراءات سريعة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link key={action.href} href={action.href}>
                        <Button
                          variant={action.variant === 'primary' ? 'default' : 'ghost'}
                          className="w-full justify-start gap-3 bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          <Icon className="w-4 h-4" />
                          {action.label}
                          <ArrowLeft className="w-4 h-4 mr-auto" />
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>

          {/* Platform Summary */}
          <AnimatedCard delay={0.3}>
            <Card className="p-5">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg font-semibold">
                  ملخص المنصة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-teal-600" />
                    المستخدمون النشطون
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {stats.totalUsers}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-purple-600" />
                    الأطباء الموثقون
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {stats.doctors}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-green-600" />
                    إجمالي المنشورات
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {stats.posts}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-amber-600" />
                    طلبات معلقة
                  </div>
                  <Badge
                    variant={stats.pendingVerifications > 0 ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {stats.pendingVerifications}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
}
