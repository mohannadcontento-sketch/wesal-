'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { label: 'طلبات التحقق', href: '/admin', icon: 'verified_user' },
  { label: 'إدارة المستخدمين', href: '/admin/verification', icon: 'group' },
  { label: 'البلاغات', href: '#', icon: 'report' },
  { label: 'إعدادات النظام', href: '#', icon: 'settings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-error-container">
            <span className="material-symbols-outlined text-3xl text-error">shield</span>
          </div>
          <h2 className="text-xl font-bold text-on-surface">غير مصرح</h2>
          <p className="text-on-surface-variant mt-2 text-sm">
            هذه الصفحة متاحة للمديرين فقط
          </p>
          <Link
            href="/community"
            className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
            العودة للمجتمع
          </Link>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-surface flex" dir="rtl">
      {/* Desktop Admin Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-20 h-[calc(100vh-5rem)] flex-col p-6 z-40 bg-white/60 backdrop-blur-2xl w-72 rounded-r-2xl border-r border-white/20 shadow-2xl shadow-primary/5">
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined filled text-3xl">shield_person</span>
          </div>
          <h2 className="text-xl font-semibold text-primary-container">الإدارة العليا</h2>
          <p className="text-xs text-outline">صلاحيات كاملة</p>
        </div>
        <nav className="flex flex-col gap-2 flex-grow">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg flex items-center gap-3 px-4 py-3 text-base font-medium hover:translate-x-1 transition-transform ${
                  active
                    ? 'bg-gradient-to-r from-slate-900 to-primary-container text-white shadow-md'
                    : 'text-on-surface-variant hover:bg-surface-container-low/50'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute top-0 right-0 h-full w-72 bg-white shadow-xl p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined filled text-2xl">shield_person</span>
                </div>
                <span className="text-sm font-semibold text-primary">الإدارة</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`rounded-lg flex items-center gap-3 px-4 py-3 text-sm font-medium ${
                      active
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Top Navbar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-white/40 backdrop-blur-md border-b border-white/20 shadow-[0_8px_32px_0_rgba(0,67,70,0.1)]">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="وصال"
              width={100}
              height={34}
              className="object-contain rounded-lg"
              priority
            />
          </Link>
          <span className="hidden sm:inline text-xs font-medium text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">لوحة الإدارة</span>
        </div>
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/community" className="text-sm font-medium text-on-surface-variant hover:text-primary-container hover:opacity-80 transition-all">
            المجتمع
          </Link>
          <Link href="/doctors" className="text-sm font-medium text-on-surface-variant hover:text-primary-container hover:opacity-80 transition-all">
            الأطباء
          </Link>
          <span className="text-sm font-medium text-primary-container border-b-2 border-primary-container pb-1">
            لوحة الإدارة
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container rounded-full"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <Link href="/community" className="text-sm font-medium text-primary-container hover:opacity-80 transition-all">
            تسجيل الخروج
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow md:mr-72 p-8 md:p-6 overflow-y-auto pt-24 md:pt-24">
        {children}
      </main>
    </div>
  );
}
