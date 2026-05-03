'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

const typeConfig: Record<string, { icon: string; colorClass: string }> = {
  reaction: { icon: 'favorite', colorClass: 'bg-rose-50 text-rose-500' },
  comment: { icon: 'comment', colorClass: 'bg-teal-50 text-teal-600' },
  verification: { icon: 'verified', colorClass: 'bg-amber-50 text-amber-500' },
  system: { icon: 'campaign', colorClass: 'bg-amber-50 text-amber-500' },
  appointment: { icon: 'calendar_today', colorClass: 'bg-teal-50 text-teal-600' },
  bookmark: { icon: 'bookmark_added', colorClass: 'bg-emerald-50 text-emerald-500' },
};

function getTypeConfig(type: string) {
  return typeConfig[type] || { icon: 'notifications', colorClass: 'bg-teal-50 text-teal-600' };
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch('/api/notifications')
        .then(r => r.json())
        .then(data => {
          setNotifications(data.notifications || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${Math.floor(hours / 24)} يوم`;
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
    } catch {
      // Silently fail
    }
  };

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <MainLayout>
      <div className="px-5 py-4 space-y-5">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container-low text-primary-container">
              <span className="material-symbols-outlined text-xl">notifications</span>
              {unreadCount > 0 && (
                <div className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </div>
            <div>
              <h1 className="font-bold text-on-surface text-sm">التنبيهات</h1>
              <p className="text-sm text-on-surface-variant">
                {unreadCount > 0 ? `${unreadCount} غير مقروء` : 'كلها مقروءة'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-primary-container hover:bg-surface-container transition-colors"
              onClick={handleMarkAllRead}
            >
              <span className="material-symbols-outlined text-base">done_all</span>
              <span>قرأت الكل</span>
            </button>
          )}
        </div>

        {/* Auth check */}
        {!user ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container-low">
              <span className="material-symbols-outlined text-3xl text-outline-variant">notifications</span>
            </div>
            <p className="text-sm text-on-surface-variant">سجل دخول الأول</p>
          </div>
        ) : loading ? (
          /* Loading skeleton */
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-surface-container-high shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-3/4 rounded bg-surface-container-high" />
                    <div className="h-3 w-1/2 rounded bg-surface-container-high" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container-low">
              <span className="material-symbols-outlined text-4xl text-outline-variant">notifications_off</span>
            </div>
            <p className="text-sm font-medium text-on-surface">مفيش تنبيهات</p>
            <p className="mt-1.5 text-sm text-on-surface-variant">
              هتظهر هنا أول ما تجي
            </p>
          </div>
        ) : (
          /* Notifications List */
          <div className="space-y-2.5">
            {notifications.map((n) => {
              const config = getTypeConfig(n.type);
              return (
                <div key={n.id}>
                  {n.link ? (
                    <Link href={n.link} onClick={() => handleMarkRead(n.id)}>
                      <div className={`rounded-2xl p-4 transition-all cursor-pointer hover:shadow-sm border ${
                        n.read
                          ? 'bg-surface-container-lowest border-outline-variant/20 opacity-70'
                          : 'bg-primary-fixed/10 border-primary-fixed/30'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${config.colorClass}`}>
                            <span className="material-symbols-outlined text-lg">{config.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-medium truncate ${n.read ? 'text-on-surface/60' : 'text-on-surface'}`}>
                                {n.title}
                              </p>
                              <span className="text-xs text-on-surface-variant shrink-0">{timeAgo(n.createdAt)}</span>
                            </div>
                            {n.body && (
                              <p className="text-sm text-on-surface-variant mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                            )}
                          </div>
                          {!n.read && (
                            <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0 mt-1.5" />
                          )}
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className={`rounded-2xl p-4 transition-all cursor-pointer border ${
                      n.read
                        ? 'bg-surface-container-lowest border-outline-variant/20 opacity-70'
                        : 'bg-primary-fixed/10 border-primary-fixed/30'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${config.colorClass}`}>
                          <span className="material-symbols-outlined text-lg">{config.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-medium truncate ${n.read ? 'text-on-surface/60' : 'text-on-surface'}`}>
                              {n.title}
                            </p>
                            <span className="text-xs text-on-surface-variant shrink-0">{timeAgo(n.createdAt)}</span>
                          </div>
                          {n.body && (
                            <p className="text-sm text-on-surface-variant mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                          )}
                        </div>
                        {!n.read && (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0 mt-1.5" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
