'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  if (loading || !user) return null;

  const links = [
    { href: '/community', label: 'الرئيسية', icon: 'home' },
    { href: '/community', label: 'المجتمع', icon: 'group' },
    { href: '/doctors', label: 'الأطباء', icon: 'medical_services' },
    { href: '/notifications', label: 'التنبيهات', icon: 'notifications' },
    {
      href: `/profile/${user.username || 'me'}`,
      label: 'الملف الشخصي',
      icon: 'person',
      matchPath: '/profile',
    },
  ];

  const isActive = (link: (typeof links)[0]) => {
    if (link.matchPath) return pathname.startsWith(link.matchPath);
    return pathname === link.href;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe pt-2 bg-surface/90 backdrop-blur-lg rounded-t-2xl border-t border-outline-variant/20 shadow-[0_-4px_20px_0_rgba(0,67,70,0.05)] text-[11px] font-medium">
      {links.map((link) => {
        const active = isActive(link);
        return (
          <Link
            key={link.href + link.label}
            href={link.href}
            className={`flex flex-col items-center justify-center px-3 py-1.5 transition-all duration-200 ${
              active
                ? 'text-primary-container bg-[#D6F3F4] dark:bg-primary-container/40 rounded-xl scale-90'
                : 'text-outline hover:bg-[#D6F3F4]/50 dark:hover:bg-surface-container-high'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[24px] mb-0.5 ${
                active ? 'filled' : ''
              }`}
            >
              {link.icon}
            </span>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
