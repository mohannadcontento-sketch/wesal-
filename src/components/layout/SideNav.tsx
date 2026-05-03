'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function SideNav() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  if (loading || !user) return null;

  const navItems = [
    { href: '/community', label: 'المجتمع', icon: 'forum' },
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
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="hidden md:flex fixed top-0 bottom-0 right-0 w-64 flex-col p-6 z-40 glass-panel border-l border-outline-variant/20 shadow-2xl shadow-primary/5">
      {/* ── Reputation Card ── */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-secondary-container flex items-center justify-center mb-3">
          <span className="material-symbols-outlined text-3xl text-primary">
            shield
          </span>
        </div>
        <h2 className="text-lg font-semibold text-on-surface font-[var(--font-heading)]">
          مركز السمعة
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">
          ١٥٠٠ نقطة • مستوى بلاتيني
        </p>
      </div>

      {/* ── Navigation Items ── */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = isActive(item.href, item.icon);
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span
                className={`material-symbols-outlined ${
                  active ? 'filled' : ''
                }`}
              >
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Logout ── */}
      <div className="mt-auto pt-4 border-t border-outline-variant/30">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-error hover:bg-error-container/50 rounded-lg transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
