'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Home, Users, Stethoscope, Bell, User } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const links = [
    { href: '/community', label: 'الرئيسية', icon: Home },
    { href: '/community', label: 'المجتمع', icon: Users },
    { href: '/doctors', label: 'الأطباء', icon: Stethoscope },
    { href: '/notifications', label: 'التنبيهات', icon: Bell },
    { href: `/profile/${user.username || 'me'}`, label: 'الملف', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-white border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex justify-around items-center px-1 pt-2 pb-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            link.icon === User
              ? pathname.startsWith('/profile')
              : link.icon === Home
                ? pathname === '/community'
                : pathname === link.href;

          return (
            <Link
              key={link.href + link.label}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-2xl transition-all duration-200 min-w-[56px] py-1.5 px-2 ${
                isActive ? 'text-teal-600' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div
                className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-teal-50' : ''
                }`}
              >
                <Icon
                  className="w-[20px] h-[20px]"
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                {isActive && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-600" />
                )}
              </div>
              <span
                className={`text-[10px] font-medium leading-tight ${
                  isActive ? 'font-bold' : ''
                }`}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
