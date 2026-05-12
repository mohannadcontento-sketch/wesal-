'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  if (loading || !user) return null;

  const links = [
    { href: '/', label: 'الرئيسية', icon: 'home' },
    { href: '/doctors', label: 'الأطباء', icon: 'medical_services' },
    { href: '/supporters', label: 'الداعمون', icon: 'volunteer_activism' },
    { href: '/events', label: 'الفعاليات', icon: 'event' },
    { href: '/bookmarks', label: 'المحفوظات', icon: 'bookmark' },
  ];

  const isActive = (link: (typeof links)[0]) => {
    return pathname === link.href;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-2 pb-[env(safe-area-inset-bottom)] pt-2 bg-wesal-cream/95 backdrop-blur-lg rounded-t-2xl border-t border-wesal-ice shadow-[0_-4px_20px_0_rgba(0,67,70,0.06)] text-[10px] font-medium">
      {links.map((link) => {
        const active = isActive(link);
        return (
          <Link
            key={link.href + link.label}
            href={link.href}
            className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all duration-200 ${
              active
                ? 'text-wesal-dark bg-wesal-ice'
                : 'text-wesal-medium hover:bg-wesal-ice/30'
            }`}
          >
            <span className={`material-symbols-outlined text-[22px] mb-0.5 ${active ? 'filled' : ''}`}>
              {link.icon}
            </span>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
