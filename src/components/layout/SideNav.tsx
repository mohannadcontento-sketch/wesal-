'use client';

import Link from 'next/link';
import Image from 'next/image';
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
    <aside className="hidden md:flex fixed top-14 bottom-0 right-0 w-[272px] flex-col bg-wesal-cream/95 backdrop-blur-xl border-l border-wesal-ice/70 shadow-[0_1px_12px_rgba(0,67,70,0.04)] z-40">
      {/* ── Logo ── */}
      <div className="p-5 pb-4 flex items-center">
        <div className="relative h-7 w-auto flex-shrink-0 rounded-lg ring-1 ring-wesal-ice/50">
          <Image src="/logo.png" alt="وصال" fill className="object-contain" />
        </div>
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
      </nav>

      {/* ── Reputation Card ── */}
      <div className="mx-3 mb-3 p-4 rounded-2xl bg-gradient-to-bl from-wesal-ice/60 via-wesal-ice/20 to-transparent border border-wesal-ice/50">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined filled text-wesal-dark text-lg">stars</span>
          <span className="text-sm font-semibold text-wesal-dark">نقاط السمعة</span>
        </div>
        <div className="text-2xl font-bold text-wesal-dark">1,500</div>
        <div className="text-xs text-wesal-medium mb-2">مستوى بلاتيني</div>
        <div className="h-1.5 w-full bg-wesal-cream rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-l from-wesal-sky to-wesal-dark rounded-full w-[72%]" />
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
