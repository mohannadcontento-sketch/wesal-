'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { UserAvatar } from '@/components/avatars/UserAvatar';
import { AvatarPicker } from '@/components/avatars/AvatarPicker';
import { useAuthStore } from '@/stores/auth-store';

export function TopNavbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetch('/api/notifications')
        .then(r => r.json())
        .then(data => setUnreadCount(data.unreadCount || 0))
        .catch(() => {});
    }
  }, [user]);

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/doctors', label: 'الأطباء' },
    { href: '/events', label: 'الفعاليات' },
    { href: '/bookmarks', label: 'المحفوظات' },
  ];

  const handleLogout = async () => {
    setShowMenu(false);
    await logout();
  };

  const handleAvatarConfirm = (avatarUrl: string) => {
    setShowMenu(false);
    // Update auth store immediately with new avatar
    if (user) {
      useAuthStore.getState().setUser({ ...user, avatarUrl });
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-50 h-14 bg-wesal-cream/90 backdrop-blur-xl border-b border-wesal-ice/70 shadow-[0_1px_12px_rgba(0,67,70,0.04)]">
      <nav className="flex justify-between items-center w-full h-full max-w-screen-2xl mx-auto px-4 sm:px-6">
        {/* ── Right side: Logo + Nav links ── */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo.png"
              alt="وصال"
              width={93}
              height={32}
              className="object-contain flex-shrink-0"
              priority
            />
          </Link>
          <div className="hidden md:flex gap-2 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href === '/' && pathname === '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-wesal-dark bg-wesal-ice font-semibold'
                      : 'text-wesal-medium hover:text-wesal-dark hover:bg-wesal-ice/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Left side: User avatar / login ── */}
        <div className="flex items-center gap-2">
          {!loading && user ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-wesal-ice/50 transition-colors"
              >
                <span className="text-sm font-medium text-wesal-navy hidden sm:inline">
                  {user.realName || user.username || 'مستخدم'}
                </span>
                <UserAvatar
                  avatarUrl={user.avatarUrl}
                  username={user.realName || user.username}
                  size="sm"
                />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute left-0 top-full mt-1.5 z-50 w-64 bg-white rounded-2xl border border-wesal-ice/70 shadow-xl shadow-wesal-navy/8 animate-scale-in overflow-hidden">
                    {/* User Info Header */}
                    <div className="px-4 py-3.5 bg-gradient-to-l from-wesal-ice/40 to-transparent border-b border-wesal-ice/50">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          avatarUrl={user.avatarUrl}
                          username={user.realName || user.username}
                          size="md"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-wesal-dark truncate">{user.realName || user.username || 'مستخدم'}</p>
                          <p className="text-xs text-wesal-medium mt-0.5 truncate">@{user.username || 'user'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1.5">
                      {/* Notifications */}
                      <Link
                        href="/notifications"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-wesal-navy hover:bg-wesal-ice/50 transition-colors"
                        onClick={() => setShowMenu(false)}
                      >
                        <span className="relative material-symbols-outlined text-[20px] text-wesal-medium">
                          notifications
                          {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 min-w-[16px] h-4 flex items-center justify-center bg-red-500 rounded-full text-[9px] font-bold text-white px-1">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </span>
                        الإشعارات
                      </Link>

                      {/* Chats */}
                      <Link
                        href="/chat"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-wesal-navy hover:bg-wesal-ice/50 transition-colors"
                        onClick={() => setShowMenu(false)}
                      >
                        <span className="material-symbols-outlined text-[20px] text-wesal-medium">forum</span>
                        المحادثات
                      </Link>

                      {/* Profile */}
                      <Link
                        href={`/profile/${user.username || 'me'}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-wesal-navy hover:bg-wesal-ice/50 transition-colors"
                        onClick={() => setShowMenu(false)}
                      >
                        <span className="material-symbols-outlined text-[20px] text-wesal-medium">person</span>
                        الملف الشخصي
                      </Link>

                      {/* Change Avatar */}
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowAvatarPicker(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-wesal-navy hover:bg-wesal-ice/50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px] text-wesal-medium">face</span>
                        تغيير الصورة
                      </button>

                      {/* Admin */}
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-wesal-navy hover:bg-wesal-ice/50 transition-colors"
                          onClick={() => setShowMenu(false)}
                        >
                          <span className="material-symbols-outlined text-[20px] text-wesal-medium">admin_panel_settings</span>
                          لوحة الإدارة
                        </Link>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-wesal-ice/50">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : !loading ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-wesal-dark hover:bg-wesal-ice/50 transition-colors rounded-lg"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium bg-wesal-dark text-white rounded-lg shadow-lg shadow-wesal-dark/20 hover:bg-wesal-navy transition-all"
              >
                ابدأ الآن
              </Link>
            </div>
          ) : null}
        </div>
      </nav>

      {/* Avatar Picker (opens from dropdown) */}
      {user && (
        <AvatarPicker
          open={showAvatarPicker}
          onOpenChange={setShowAvatarPicker}
          currentAvatar={user.avatarUrl || undefined}
          onConfirm={handleAvatarConfirm}
        />
      )}
    </header>
  );
}
