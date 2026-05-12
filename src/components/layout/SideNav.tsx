'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';

export function SideNav() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [supporterStatus, setSupporterStatus] = useState<{
    isSupporter: boolean;
    status: string | null;
  } | null>(null);

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'doctor') {
      fetch('/api/supporters/apply')
        .then((r) => r.json())
        .then((data) => {
          setSupporterStatus({
            isSupporter: data.isSupporter || false,
            status: data.status || null,
          });
        })
        .catch(() => {});
    }
  }, [user]);

  if (loading || !user) return null;

  const navItems = [
    { href: '/', label: 'الرئيسية', icon: 'home' },
    { href: '/doctors', label: 'الأطباء', icon: 'medical_services' },
    { href: '/supporters', label: 'الداعمون', icon: 'volunteer_activism' },
    { href: '/events', label: 'الفعاليات', icon: 'event' },
    { href: '/bookmarks', label: 'المحفوظات', icon: 'bookmark' },
    { href: '/notifications', label: 'التنبيهات', icon: 'notifications' },
    {
      href: `/profile/${user.username || 'me'}`,
      label: 'الملف الشخصي',
      icon: 'person',
    },
  ];

  const doctorItems = user.role === 'doctor'
    ? [{ href: '/doctor', label: 'لوحة الطبيب', icon: 'stethoscope' }]
    : [];

  const hasApprovedSupporter = supporterStatus?.isSupporter && supporterStatus?.status === 'approved';

  const supporterItems = hasApprovedSupporter
    ? [{ href: '/supporters', label: 'لوحة الداعم', icon: 'volunteer_activism' }]
    : [];

  const adminItems = user.role === 'admin'
    ? [{ href: '/admin', label: 'لوحة الإدارة', icon: 'admin_panel_settings' }]
    : [];

  // Show promotion card if user has enough reputation and is not an approved supporter
  const showPromoCard =
    user.role !== 'admin' &&
    user.role !== 'doctor' &&
    (user.reputationScore || 0) >= 300 &&
    !hasApprovedSupporter;

  const hasPendingSupporter = supporterStatus?.isSupporter && supporterStatus?.status === 'pending';

  const isActive = (href: string, icon: string) => {
    if (icon === 'person') return pathname.startsWith('/profile');
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="hidden md:flex fixed top-14 bottom-0 right-0 w-[272px] flex-col bg-wesal-cream/95 backdrop-blur-xl border-l border-wesal-ice/70 shadow-[0_1px_12px_rgba(0,67,70,0.04)] z-40">
      {/* ── Logo ── */}
      <div className="p-5 pb-4 flex items-center">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="وصال"
            width={82}
            height={28}
            className="object-contain flex-shrink-0"
            priority
          />
        </Link>
      </div>

      {/* ── Navigation Items ── */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href, item.icon);
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-wesal-ice text-wesal-dark font-semibold shadow-sm'
                  : 'text-wesal-medium hover:bg-wesal-ice/40 hover:text-wesal-dark'
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${active ? 'filled' : ''}`}>
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}

        {/* ── Doctor Section ── */}
        {doctorItems.length > 0 && (
          <>
            <div className="my-2 mx-2 border-t border-wesal-ice/60" />
            {doctorItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-emerald-100 text-emerald-700 font-semibold shadow-sm'
                      : 'text-wesal-medium hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[22px] ${active ? 'filled' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </>
        )}

        {/* ── Supporter Section ── */}
        {supporterItems.length > 0 && (
          <>
            <div className="my-2 mx-2 border-t border-wesal-ice/60" />
            {supporterItems.map((item) => {
              const active = pathname.startsWith(item.href) && pathname !== '/supporters';
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-emerald-100 text-emerald-700 font-semibold shadow-sm'
                      : 'text-wesal-medium hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[22px] ${active ? 'filled' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </>
        )}

        {/* ── Admin Section ── */}
        {adminItems.length > 0 && (
          <>
            <div className="my-2 mx-2 border-t border-wesal-ice/60" />
            {adminItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-wesal-dark text-white font-semibold shadow-sm'
                      : 'text-wesal-medium hover:bg-wesal-dark/10 hover:text-wesal-dark'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[22px] ${active ? 'filled' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </>
        )}

        {/* ── Supporter Promotion Card ── */}
        {showPromoCard && (
          <div className="mt-4 mx-1">
            <div className="p-4 rounded-2xl bg-gradient-to-bl from-emerald-500/20 via-emerald-400/10 to-emerald-600/5 border border-emerald-300/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined filled text-emerald-600 text-lg">volunteer_activism</span>
                <span className="text-sm font-bold text-emerald-800">
                  {hasPendingSupporter ? 'طلبك قيد المراجعة' : 'أنت مؤهل لتكون داعم!'}
                </span>
              </div>
              {hasPendingSupporter ? (
                <p className="text-xs text-emerald-700/70 leading-relaxed mb-2">
                  هنراجع طلبك وهنرد عليك في أقرب وقت
                </p>
              ) : (
                <Link
                  href="/supporters/apply"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-700 transition-colors"
                >
                  قدّم الآن
                  <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── Reputation Card ── */}
      <div className="mx-3 mb-3 p-4 rounded-2xl bg-gradient-to-bl from-wesal-ice/60 via-wesal-ice/20 to-transparent border border-wesal-ice/50">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined filled text-wesal-dark text-lg">stars</span>
          <span className="text-sm font-semibold text-wesal-dark">نقاط السمعة</span>
        </div>
        <div className="text-2xl font-bold text-wesal-dark">{user.reputationScore || 0}</div>
        <div className="text-xs text-wesal-medium mb-2">
          {user.reputationScore >= 300 ? 'مؤهل للتوثيق' : user.reputationScore >= 150 ? 'مميز' : user.reputationScore >= 50 ? 'نشط' : 'مبتدئ'}
        </div>
        <div className="h-1.5 w-full bg-wesal-cream rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-wesal-sky to-wesal-dark rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, ((user.reputationScore || 0) % 50) / 50 * 100)}%` }}
          />
        </div>
      </div>

      {/* ── Logout ── */}
      <div className="p-3 pt-0">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
