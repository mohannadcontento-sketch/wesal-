'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { UserAvatar } from '@/components/avatars/UserAvatar';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  realName: string;
  username: string | null;
  avatarUrl: string | null;
  specialty: string | null;
  location: string | null;
  bio: string | null;
  phone: string | null;
  isVerified: boolean;
  reputationScore: number;
  reputationTier: string;
  createdAt: string;
  disabled: boolean;
  messageCount: number;
  appointmentCount: number;
  postsCount: number;
  commentsCount: number;
}

interface UserStats {
  totalUsers: number;
  activeDoctors: number;
  bannedUsers: number;
  newThisMonth: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const roleTabs = [
  { key: 'all', label: 'الكل' },
  { key: 'user', label: 'المستخدمون' },
  { key: 'doctor', label: 'الأطباء' },
  { key: 'admin', label: 'المشرفون' },
];

const roleBadgeColors: Record<string, string> = {
  user: 'bg-sky-100 text-sky-700 border-sky-200',
  doctor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
};

const roleLabels: Record<string, string> = {
  user: 'مستخدم',
  doctor: 'طبيب',
  admin: 'مشرف',
};

const tierLabels: Record<string, string> = {
  beginner: 'مبتدئ',
  active: 'نشط',
  notable: 'بارز',
  expert: 'خبير',
};

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 30) return `منذ ${diffDays} يوم`;
  if (diffMonths < 12) return `منذ ${diffMonths} شهر`;
  return `منذ ${diffYears} سنة`;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeDoctors: 0,
    bannedUsers: 0,
    newThisMonth: 0,
  });
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [search, setSearch] = useState('');
  const [activeRole, setActiveRole] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [banningId, setBanningId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (activeRole !== 'all') params.set('role', activeRole);
      params.set('page', page.toString());
      params.set('limit', '20');

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setStats(data.stats || { totalUsers: 0, activeDoctors: 0, bannedUsers: 0, newThisMonth: 0 });
        setPagination(data.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 });
      }
    } catch {
      toast.error('حصل خطأ في تحميل المستخدمين');
    } finally {
      setIsLoading(false);
    }
  }, [search, activeRole]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchUsers(1);
  }, [user, router, fetchUsers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, fetchUsers]);

  const handleBan = async (userId: string, currentlyDisabled: boolean) => {
    const action = currentlyDisabled ? 'unban' : 'ban';
    const confirmMsg = currentlyDisabled
      ? 'هل تريد فك حظر هذا المستخدم؟'
      : 'هل تريد حظر هذا المستخدم؟';

    if (!confirm(confirmMsg)) return;

    setBanningId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        toast.success(currentlyDisabled ? 'تم فك الحظر' : 'تم حظر المستخدم');
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, disabled: !currentlyDisabled } : u))
        );
        // Update stats
        if (currentlyDisabled) {
          setStats((prev) => ({ ...prev, bannedUsers: Math.max(0, prev.bannedUsers - 1) }));
        } else {
          setStats((prev) => ({ ...prev, bannedUsers: prev.bannedUsers + 1 }));
        }
      } else {
        const data = await res.json();
        toast.error(data.error || 'حصل خطأ');
      }
    } catch {
      toast.error('حصل خطأ في الاتصال');
    } finally {
      setBanningId(null);
    }
  };

  const handleSendMessage = async (targetUserId: string) => {
    try {
      const res = await fetch('/api/chat/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success('تم فتح المحادثة');
        setShowModal(false);
        router.push(`/chat/${data.roomId}`);
      } else {
        const data = await res.json();
        toast.error(data.error || 'حصل خطأ');
      }
    } catch {
      toast.error('حصل خطأ في الاتصال');
    }
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-container to-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-2xl text-on-primary">group</span>
        </div>
        <div>
          <h1 className="text-[32px] font-bold text-primary leading-tight">إدارة المستخدمين</h1>
          <p className="text-sm text-on-surface-variant">
            عرض وإدارة جميع المستخدمين المسجلين في المنصة
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-[40px] border border-white/40 rounded-xl p-4 shadow-[0_4px_24px_0_rgba(0,43,45,0.05)] relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-fixed opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-xl">people</span>
            <span className="text-xs font-bold text-outline">إجمالي المستخدمين</span>
          </div>
          <p className="text-2xl font-bold text-primary">{isLoading ? '...' : stats.totalUsers}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-[40px] border border-white/40 rounded-xl p-4 shadow-[0_4px_24px_0_rgba(0,43,45,0.05)] relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-tertiary-fixed opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-emerald-600 text-xl">local_hospital</span>
            <span className="text-xs font-bold text-outline">أطباء نشطون</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{isLoading ? '...' : stats.activeDoctors}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-[40px] border border-white/40 rounded-xl p-4 shadow-[0_4px_24px_0_rgba(0,43,45,0.05)] relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-error-container opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-error text-xl">block</span>
            <span className="text-xs font-bold text-outline">محظورون</span>
          </div>
          <p className="text-2xl font-bold text-error">{isLoading ? '...' : stats.bannedUsers}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-[40px] border border-white/40 rounded-xl p-4 shadow-[0_4px_24px_0_rgba(0,43,45,0.05)] relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-container opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary-container text-xl">person_add</span>
            <span className="text-xs font-bold text-outline">جددون هذا الشهر</span>
          </div>
          <p className="text-2xl font-bold text-primary-container">{isLoading ? '...' : stats.newThisMonth}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/10 backdrop-blur-[40px] border border-white/40 rounded-xl p-4 shadow-[0_4px_24px_0_rgba(0,43,45,0.05)] space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
            search
          </span>
          <input
            type="text"
            placeholder="ابحث بالاسم، البريد، أو اسم المستخدم..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          )}
        </div>

        {/* Role Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {roleTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveRole(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeRole === tab.key
                  ? 'bg-gradient-to-r from-slate-900 to-primary-container text-white shadow-md'
                  : 'bg-surface-container/50 text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table/Grid */}
      <div className="bg-white/10 backdrop-blur-[40px] border border-white/40 rounded-xl shadow-[0_4px_24px_0_rgba(0,43,45,0.05)] overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container-lowest/50 border-b border-surface-variant">
                <th className="text-right px-4 py-3 text-xs font-bold text-outline">المستخدم</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-outline">البريد</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-outline">الدور</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-outline">الحالة</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-outline">الانضمام</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-outline">السمعة</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-outline">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant/30">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-surface-container animate-pulse" /><div className="space-y-2"><div className="h-4 w-24 rounded bg-surface-container animate-pulse" /><div className="h-3 w-16 rounded bg-surface-container animate-pulse" /></div></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-32 rounded bg-surface-container animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-6 w-16 rounded-full bg-surface-container animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-12 rounded bg-surface-container animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-surface-container animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-10 rounded bg-surface-container animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="flex justify-center gap-2"><div className="h-8 w-8 rounded-lg bg-surface-container animate-pulse" /><div className="h-8 w-8 rounded-lg bg-surface-container animate-pulse" /></div></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <span className="material-symbols-outlined text-5xl text-outline-variant mx-auto mb-3 block">search_off</span>
                    <p className="text-base font-semibold text-on-surface">لا توجد نتائج</p>
                    <p className="text-sm text-on-surface-variant mt-1">جرب تغيير معايير البحث</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-surface-container-low/30 transition-colors"
                  >
                    {/* User Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          avatarUrl={u.avatarUrl}
                          username={u.realName || u.username || ''}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-on-surface truncate block max-w-[160px]">
                              {u.realName || 'بدون اسم'}
                            </span>
                            {u.isVerified && (
                              <span className="material-symbols-outlined text-blue-500 text-sm filled">
                                verified
                              </span>
                            )}
                          </div>
                          {u.username && (
                            <span className="text-xs text-on-surface-variant">@{u.username}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3">
                      <span className="text-on-surface-variant text-xs truncate block max-w-[180px]">
                        {u.email}
                      </span>
                    </td>

                    {/* Role Badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                          roleBadgeColors[u.role] || roleBadgeColors.user
                        }`}
                      >
                        {roleLabels[u.role] || 'مستخدم'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            u.disabled ? 'bg-red-500' : 'bg-emerald-500'
                          }`}
                        />
                        <span className={`text-xs font-semibold ${u.disabled ? 'text-error' : 'text-emerald-600'}`}>
                          {u.disabled ? 'محظور' : 'نشط'}
                        </span>
                      </div>
                    </td>

                    {/* Join Date */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-on-surface-variant">
                        {getRelativeTime(u.createdAt)}
                      </span>
                    </td>

                    {/* Reputation */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-amber-500 text-sm">star</span>
                        <span className="text-xs font-bold text-on-surface">{u.reputationScore}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleSendMessage(u.id)}
                          className="p-2 rounded-lg text-primary hover:bg-primary-container/20 transition-colors"
                          title="رسالة"
                        >
                          <span className="material-symbols-outlined text-lg">chat</span>
                        </button>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleBan(u.id, u.disabled)}
                            disabled={banningId === u.id}
                            className={`p-2 rounded-lg transition-colors ${
                              u.disabled
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-error hover:bg-error-container/30'
                            } ${banningId === u.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={u.disabled ? 'فك الحظر' : 'حظر'}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {u.disabled ? 'lock_open' : 'block'}
                            </span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setShowModal(true);
                          }}
                          className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                          title="عرض"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-surface-variant/30">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 space-y-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-28 rounded bg-surface-container animate-pulse" />
                    <div className="h-3 w-20 rounded bg-surface-container animate-pulse" />
                  </div>
                </div>
                <div className="h-4 w-full rounded bg-surface-container animate-pulse" />
              </div>
            ))
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-outline-variant mx-auto mb-3 block">search_off</span>
              <p className="text-base font-semibold text-on-surface">لا توجد نتائج</p>
            </div>
          ) : (
            users.map((u) => (
              <div key={u.id} className="p-4 hover:bg-surface-container-low/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      avatarUrl={u.avatarUrl}
                      username={u.realName || u.username || ''}
                      size="sm"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-on-surface text-sm">
                          {u.realName || 'بدون اسم'}
                        </span>
                        {u.isVerified && (
                          <span className="material-symbols-outlined text-blue-500 text-sm filled">verified</span>
                        )}
                      </div>
                      {u.username && (
                        <span className="text-xs text-on-surface-variant">@{u.username}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`w-2 h-2 rounded-full ${u.disabled ? 'bg-red-500' : 'bg-emerald-500'}`}
                    />
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        roleBadgeColors[u.role] || roleBadgeColors.user
                      }`}
                    >
                      {roleLabels[u.role] || 'مستخدم'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-on-surface-variant mb-3">
                  <span className="truncate max-w-[60%]">{u.email}</span>
                  <span>{getRelativeTime(u.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendMessage(u.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">chat</span>
                    رسالة
                  </button>
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleBan(u.id, u.disabled)}
                      disabled={banningId === u.id}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        u.disabled
                          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          : 'bg-red-50 text-error hover:bg-red-100'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {u.disabled ? 'lock_open' : 'block'}
                      </span>
                      {u.disabled ? 'فك الحظر' : 'حظر'}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedUser(u);
                      setShowModal(true);
                    }}
                    className="px-3 py-2 rounded-lg bg-surface-container text-on-surface-variant text-xs font-semibold hover:bg-surface-container-high transition-colors"
                  >
                    عرض
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-variant">
            <span className="text-xs text-on-surface-variant">
              عرض {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} من {pagination.total}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                      pagination.page === pageNum
                        ? 'bg-gradient-to-r from-slate-900 to-primary-container text-white'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/40">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-md p-5 border-b border-surface-variant flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-primary">تفاصيل المستخدم</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <UserAvatar
                  avatarUrl={selectedUser.avatarUrl}
                  username={selectedUser.realName || selectedUser.username || ''}
                  size="xl"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold text-on-surface">
                      {selectedUser.realName || 'بدون اسم'}
                    </h3>
                    {selectedUser.isVerified && (
                      <span className="material-symbols-outlined text-blue-500 text-xl filled">verified</span>
                    )}
                  </div>
                  {selectedUser.username && (
                    <p className="text-sm text-on-surface-variant">@{selectedUser.username}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        roleBadgeColors[selectedUser.role] || roleBadgeColors.user
                      }`}
                    >
                      {roleLabels[selectedUser.role] || 'مستخدم'}
                    </span>
                    <div className="flex items-center gap-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          selectedUser.disabled ? 'bg-red-500' : 'bg-emerald-500'
                        }`}
                      />
                      <span
                        className={`text-xs font-semibold ${
                          selectedUser.disabled ? 'text-error' : 'text-emerald-600'
                        }`}
                      >
                        {selectedUser.disabled ? 'محظور' : 'نشط'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <InfoItem
                  icon="email"
                  label="البريد الإلكتروني"
                  value={selectedUser.email}
                />
                {selectedUser.phone && (
                  <InfoItem
                    icon="phone"
                    label="الهاتف"
                    value={selectedUser.phone}
                  />
                )}
                {selectedUser.location && (
                  <InfoItem
                    icon="location_on"
                    label="الموقع"
                    value={selectedUser.location}
                  />
                )}
                {selectedUser.specialty && (
                  <InfoItem
                    icon="medical_services"
                    label="التخصص"
                    value={selectedUser.specialty}
                  />
                )}
                <InfoItem
                  icon="calendar_today"
                  label="تاريخ الانضمام"
                  value={getRelativeTime(selectedUser.createdAt)}
                />
                <InfoItem
                  icon="star"
                  label="مستوى السمعة"
                  value={`${selectedUser.reputationScore} نقطة (${tierLabels[selectedUser.reputationTier] || selectedUser.reputationTier})`}
                />
              </div>

              {/* Bio */}
              {selectedUser.bio && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="material-symbols-outlined text-outline text-sm">description</span>
                    <span className="text-xs font-bold text-outline">نبذة</span>
                  </div>
                  <p className="text-sm text-on-surface bg-surface-container/50 rounded-lg p-3 leading-relaxed">
                    {selectedUser.bio}
                  </p>
                </div>
              )}

              {/* Stats Grid */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined text-outline text-sm">analytics</span>
                  <span className="text-xs font-bold text-outline">إحصائيات الحساب</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <StatCard icon="article" label="المنشورات" value={selectedUser.postsCount} />
                  <StatCard icon="chat_bubble" label="التعليقات" value={selectedUser.commentsCount} />
                  <StatCard icon="mail" label="الرسائل" value={selectedUser.messageCount} />
                  <StatCard icon="event" label="المواعيد" value={selectedUser.appointmentCount} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-surface-variant">
                <button
                  onClick={() => handleSendMessage(selectedUser.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-900 to-primary-container text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined text-lg">chat</span>
                  إرسال رسالة
                </button>
                {selectedUser.role !== 'admin' && (
                  <button
                    onClick={() => {
                      handleBan(selectedUser.id, selectedUser.disabled);
                    }}
                    disabled={banningId === selectedUser.id}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                      selectedUser.disabled
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-error-container text-on-error-container hover:bg-error hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {selectedUser.disabled ? 'lock_open' : 'block'}
                    </span>
                    {selectedUser.disabled ? 'فك الحظر' : 'حظر'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Reusable Info Item Component */
function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-surface-container/50 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="material-symbols-outlined text-outline text-sm">{icon}</span>
        <span className="text-[10px] font-bold text-outline">{label}</span>
      </div>
      <p className="text-sm font-semibold text-on-surface truncate" title={value}>
        {value}
      </p>
    </div>
  );
}

/* Reusable Stat Card Component */
function StatCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="bg-surface-container/50 rounded-lg p-3 text-center">
      <span className="material-symbols-outlined text-primary-container text-xl">{icon}</span>
      <p className="text-lg font-bold text-on-surface mt-0.5">{value}</p>
      <p className="text-[10px] text-on-surface-variant">{label}</p>
    </div>
  );
}
