'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export function TopNavbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  const navLinks = [
    { href: '/', label: 'الرئيسية', icon: 'home' },
    { href: '/doctors', label: 'الأطباء', icon: 'medical_services' },
    { href: '/bookmarks', label: 'المحفوظات', icon: 'bookmark' },
  ];

  const handleLogout = async () => {
    setShowLogoutMenu(false);
    await logout();
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-50 h-14 bg-wesal-cream/90 backdrop-blur-xl border-b border-wesal-ice/70 shadow-[0_1px_12px_rgba(0,67,70,0.04)]">
      <nav className="flex justify-between items-center w-full h-full max-w-screen-2xl mx-auto px-4 sm:px-6">
        {/* ── Right side: Logo + Nav links ── */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo.png"
              alt="وصال"
              width={93}
              height={32}
              className="object-contain flex-shrink-0 rounded-lg ring-1 ring-wesal-ice/50 group-hover:ring-wesal-sky/60 transition-all duration-300"
              priority
            />
          </Link>
          <div className="hidden md:flex gap-1 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href === '/' && pathname === '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-wesal-dark bg-wesal-ice font-semibold'
                      : 'text-wesal-medium hover:text-wesal-dark hover:bg-wesal-ice/50'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${isActive ? 'filled' : ''}`}>{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Left side: Actions ── */}
        <div className="flex items-center gap-2">
          {!loading && user ? (
            <>
              <Link
                href="/notifications"
                className="relative text-wesal-medium hover:text-wesal-dark transition-colors p-2 rounded-xl hover:bg-wesal-ice/50"
                aria-label="التنبيهات"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-wesal-cream" />
              </Link>

              {/* Profile / Logout Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowLogoutMenu(!showLogoutMenu)}
                  className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-wesal-ice/50 transition-colors"
                >
                  <span className="text-sm font-medium text-wesal-navy hidden sm:inline">
                    {user.realName || user.username || 'مستخدم'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-wesal-dark to-wesal-medium flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {user.realName?.charAt(0) || '?'}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showLogoutMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowLogoutMenu(false)} />
                    <div className="absolute left-0 top-full mt-1.5 z-50 w-56 bg-white rounded-2xl border border-wesal-ice/70 shadow-xl shadow-wesal-navy/8 animate-scale-in overflow-hidden">
                      {/* User Info */}
                      <div className="px-4 py-3.5 bg-gradient-to-l from-wesal-ice/40 to-transparent border-b border-wesal-ice/50">
                        <p className="text-sm font-semibold text-wesal-dark">{user.realName || user.username || 'مستخدم'}</p>
                        <p className="text-xs text-wesal-medium mt-0.5">@{user.username || 'user'}</p>
                      </div>
                      <div className="py-1.5">
                        <Link
                          href={`/profile/${user.username || 'me'}`}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-wesal-navy hover:bg-wesal-ice/50 transition-colors"
                          onClick={() => setShowLogoutMenu(false)}
                        >
                          <span className="material-symbols-outlined text-[20px] text-wesal-medium">person</span>
                          الملف الشخصي
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-wesal-navy hover:bg-wesal-ice/50 transition-colors"
                            onClick={() => setShowLogoutMenu(false)}
                          >
                            <span className="material-symbols-outlined text-[20px] text-wesal-medium">admin_panel_settings</span>
                            لوحة الإدارة
                          </Link>
                        )}
                        <Link
                          href={`/profile/${user.username || 'me'}`}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-wesal-navy hover:bg-wesal-ice/50 transition-colors"
                          onClick={() => setShowLogoutMenu(false)}
                        >
                          <span className="material-symbols-outlined text-[20px] text-wesal-medium">settings</span>
                          الإعدادات
                        </Link>
                      </div>
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
            </>
          ) : !loading ? (
            <div className="hidden sm:flex items-center gap-2">
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
    </header>
  );
}
