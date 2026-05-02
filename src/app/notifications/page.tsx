'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  X,
} from 'lucide-react';
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

const typeIconMap: Record<string, { icon: React.ElementType; color: string }> = {
  reaction: { icon: Heart, color: 'text-rose-500 bg-rose-50' },
  comment: { icon: MessageCircle, color: 'text-primary bg-primary-light' },
  verification: { icon: BadgeCheck, color: 'text-accent bg-accent-light' },
  system: { icon: Megaphone, color: 'text-warm bg-warm-light' },
  appointment: { icon: Calendar, color: 'text-primary bg-primary-light' },
  bookmark: { icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50' },
};

function getTypeIcon(type: string) {
  return typeIconMap[type] || { icon: Bell, color: 'text-primary bg-primary-light' };
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
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full gradient-primary text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-h4 text-foreground font-heading">التنبيهات</h1>
              <p className="text-body-sm text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} غير مقروء` : 'كلها مقروءة'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              className="btn btn-ghost btn-sm text-primary gap-1"
              onClick={handleMarkAllRead}
            >
              <Check className="h-4 w-4" />
              <span>قرأت الكل</span>
            </button>
          )}
        </div>

        {/* Auth check */}
        {!user ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light">
              <Bell className="h-7 w-7 text-primary/40" />
            </div>
            <p className="text-body-md text-muted-foreground">سجل دخول الأول</p>
          </div>
        ) : loading ? (
          /* Loading skeleton */
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border-light bg-card p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light">
              <Bell className="h-8 w-8 text-primary/30" />
            </div>
            <p className="text-body-md font-medium text-foreground">مفيش تنبيهات</p>
            <p className="mt-1.5 text-body-sm text-muted-foreground">
              هتظهر هنا أول ما تجي
            </p>
          </div>
        ) : (
          /* Notifications List */
          <div className="space-y-2.5">
            {notifications.map((n, i) => {
              const { icon: Icon, color } = getTypeIcon(n.type);
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  {n.link ? (
                    <Link href={n.link} onClick={() => handleMarkRead(n.id)}>
                      <div
                        className={`flex items-start gap-3 rounded-2xl border p-4 transition-all cursor-pointer hover:shadow-sm ${
                          n.read
                            ? 'bg-card border-border-light opacity-70'
                            : 'bg-primary-50 border-primary/10'
                        }`}
                      >
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-body-md font-medium truncate ${n.read ? 'text-foreground/60' : 'text-foreground'}`}>
                              {n.title}
                            </p>
                            <span className="text-caption text-muted-foreground shrink-0">{timeAgo(n.createdAt)}</span>
                          </div>
                          {n.body && (
                            <p className="text-body-sm text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                          )}
                        </div>
                        {!n.read && (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0 mt-1.5" />
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div
                      className={`flex items-start gap-3 rounded-2xl border p-4 transition-all cursor-pointer ${
                        n.read
                          ? 'bg-card border-border-light opacity-70'
                          : 'bg-primary-50 border-primary/10'
                      }`}
                    >
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-body-md font-medium truncate ${n.read ? 'text-foreground/60' : 'text-foreground'}`}>
                            {n.title}
                          </p>
                          <span className="text-caption text-muted-foreground shrink-0">{timeAgo(n.createdAt)}</span>
                        </div>
                        {n.body && (
                          <p className="text-body-sm text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                        )}
                      </div>
                      {!n.read && (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
