'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function TopNavbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const navLinks = [
    { href: '/community', label: 'المجتمع' },
    { href: '/doctors', label: 'الأطباء' },
    { href: '/bookmarks', label: 'المحفوظات' },
  ];

  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/20 shadow-sm">
      <nav className="flex justify-between items-center w-full max-w-screen-2xl mx-auto px-6 py-4">
        {/* ── Right side: Logo + Nav links ── */}
        <div className="flex items-center gap-8">
          <Link
            href={user ? '/community' : '/'}
            className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity"
          >
            وصال
          </Link>
          <div className="hidden md:flex gap-6 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors ${
                    isActive
                      ? 'text-primary border-b-2 border-primary pb-1'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50 px-2 py-1 rounded-lg'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Left side: Actions ── */}
        <div className="flex items-center gap-4">
          {!loading && user ? (
            <>
              <Link
                href="/notifications"
                className="text-on-surface-variant hover:text-primary transition-colors"
                aria-label="التنبيهات"
              >
                <span className="material-symbols-outlined text-[24px]">
                  notifications
                </span>
              </Link>
              <Link
                href={`/profile/${user.username || 'me'}`}
                className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/20 hover:border-primary/30 transition-colors"
              >
                <div className="w-full h-full bg-primary-container flex items-center justify-center text-on-primary text-sm font-bold">
                  {user.realName?.charAt(0) || '?'}
                </div>
              </Link>
            </>
          ) : !loading ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container transition-colors rounded-lg"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium bg-primary text-on-primary rounded-lg shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
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
