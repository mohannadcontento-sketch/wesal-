'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function SideNav() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  if (loading || !user) return null;

  const navItems = [
    { href: '/', label: 'الرئيسية', icon: 'home' },
    { href: '/doctors', label: 'الأطباء', icon: 'medical_services' },
    { href: '/bookmarks', label: 'المحفوظات', icon: 'bookmark' },
    { href: '/notifications', label: 'التنبيهات', icon: 'notifications' },
    {
      href: `/profile/${user.username || 'me'}`,
      label: 'الملف الشخصي',
      icon: 'person',
    },
  ];

  const isActive = (href: string, icon: string) => {
    if (icon === 'person') return pathname.startsWith('/profile');
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="hidden md:flex fixed top-0 bottom-0 right-0 w-64 flex-col p-5 z-40 glass-panel border-l border-wesal-ice shadow-xl">
      {/* ── Logo ── */}
      <div className="mb-8 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-wesal-dark flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-lg">spa</span>
        </div>
        <span className="text-lg font-bold text-wesal-dark">وصال</span>
      </div>

      {/* ── Navigation Items ── */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = isActive(item.href, item.icon);
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-wesal-ice text-wesal-dark font-semibold'
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
      </nav>

      {/* ── Reputation Card ── */}
      <div className="mb-4 p-4 rounded-xl bg-gradient-to-bl from-wesal-ice/40 via-wesal-ice/10 to-transparent border border-wesal-ice">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined filled text-wesal-dark text-lg">stars</span>
          <span className="text-sm font-semibold text-wesal-dark">نقاط السمعة</span>
        </div>
        <div className="text-2xl font-bold text-wesal-dark">1,500</div>
        <div className="text-xs text-wesal-medium">مستوى بلاتيني</div>
      </div>

      {/* ── Logout ── */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium border border-transparent hover:border-red-100"
      >
        <span className="material-symbols-outlined text-[20px]">logout</span>
        تسجيل الخروج
      </button>
    </aside>
  );
}
