'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import {
  Bell,
  Heart,
  MessageCircle,
  BadgeCheck,
  Megaphone,
  Calendar,
  Check,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

const typeIconMap: Record<string, { icon: React.ElementType; color: string }> = {
  reaction: { icon: Heart, color: 'text-rose-500 bg-rose-50' },
  comment: { icon: MessageCircle, color: 'text-teal-600 bg-teal-50' },
  verification: { icon: BadgeCheck, color: 'text-amber-500 bg-amber-50' },
  system: { icon: Megaphone, color: 'text-amber-500 bg-amber-50' },
  appointment: { icon: Calendar, color: 'text-teal-600 bg-teal-50' },
  bookmark: { icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50' },
};

function getTypeIcon(type: string) {
  return typeIconMap[type] || { icon: Bell, color: 'text-teal-600 bg-teal-50' };
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
    // Optimistically update UI
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
    } catch {
      // Silently fail - UI is already updated
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
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">التنبيهات</h1>
              <p className="text-sm text-gray-500">
                {unreadCount > 0 ? `${unreadCount} غير مقروء` : 'كلها مقروءة'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-teal-600 hover:text-teal-700 gap-1"
              onClick={handleMarkAllRead}
            >
              <Check className="h-4 w-4" />
              <span>قرأت الكل</span>
            </Button>
          )}
        </div>

        {/* Auth check */}
        {!user ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50">
              <Bell className="h-7 w-7 text-teal-600/40" />
            </div>
            <p className="text-sm text-gray-500">سجل دخول الأول</p>
          </div>
        ) : loading ? (
          /* Loading skeleton */
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="rounded-2xl border-gray-200 bg-white p-4 animate-pulse">
                <CardContent className="p-0">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-3/4 rounded bg-gray-200" />
                      <div className="h-3 w-1/2 rounded bg-gray-200" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50">
              <Bell className="h-8 w-8 text-teal-600/30" />
            </div>
            <p className="text-sm font-medium text-gray-900">مفيش تنبيهات</p>
            <p className="mt-1.5 text-sm text-gray-500">
              هتظهر هنا أول ما تجي
            </p>
          </div>
        ) : (
          /* Notifications List */
          <div className="space-y-2.5">
            {notifications.map((n) => {
              const { icon: Icon, color } = getTypeIcon(n.type);
              return (
                <div key={n.id}>
                  {n.link ? (
                    <Link href={n.link} onClick={() => handleMarkRead(n.id)}>
                      <Card
                        className={`rounded-2xl p-4 transition-all cursor-pointer hover:shadow-sm ${
                          n.read
                            ? 'bg-white border-gray-200 opacity-70'
                            : 'bg-teal-50 border-teal-100'
                        }`}
                      >
                        <CardContent className="p-0 flex items-start gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-medium truncate ${n.read ? 'text-gray-900/60' : 'text-gray-900'}`}>
                                {n.title}
                              </p>
                              <span className="text-xs text-gray-500 shrink-0">{timeAgo(n.createdAt)}</span>
                            </div>
                            {n.body && (
                              <p className="text-sm text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                            )}
                          </div>
                          {!n.read && (
                            <div className="h-2.5 w-2.5 rounded-full bg-teal-600 shrink-0 mt-1.5" />
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ) : (
                    <Card
                      className={`rounded-2xl p-4 transition-all cursor-pointer ${
                        n.read
                          ? 'bg-white border-gray-200 opacity-70'
                          : 'bg-teal-50 border-teal-100'
                      }`}
                    >
                      <CardContent className="p-0 flex items-start gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-medium truncate ${n.read ? 'text-gray-900/60' : 'text-gray-900'}`}>
                              {n.title}
                            </p>
                            <span className="text-xs text-gray-500 shrink-0">{timeAgo(n.createdAt)}</span>
                          </div>
                          {n.body && (
                            <p className="text-sm text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                          )}
                        </div>
                        {!n.read && (
                          <div className="h-2.5 w-2.5 rounded-full bg-teal-600 shrink-0 mt-1.5" />
                        )}
                      </CardContent>
                    </Card>
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
