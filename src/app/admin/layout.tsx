'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  FileCheck,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
} from 'lucide-react';

const navItems = [
  { label: 'لوحة التحكم', href: '/admin', icon: BarChart3 },
  { label: 'طلبات التوثيق', href: '/admin/verification', icon: FileCheck },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground">غير مصرح</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            هذه الصفحة متاحة للمديرين فقط
          </p>
          <Link href="/community">
            <Button className="mt-4 bg-teal-600 hover:bg-teal-700 text-white">
              العودة للمجتمع
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* ─── Desktop Sidebar ─── */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 right-0 h-screen z-40 bg-white border-l border-border shadow-sm transition-all duration-300 ${
          sidebarCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 h-16 px-4 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-foreground whitespace-nowrap">
                لوحة الإدارة
              </h1>
              <p className="text-[11px] text-muted-foreground">وصال</p>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-teal-50 text-teal-600'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${active ? 'text-teal-600' : ''}`}
                />
                {!sidebarCollapsed && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-border">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <>
                <ChevronRight className="w-5 h-5" />
                <span>طي القائمة</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ─── Mobile Sidebar Overlay ─── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar */}
          <aside className="absolute top-0 right-0 h-full w-72 bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-foreground">
                    لوحة الإدارة
                  </h1>
                  <p className="text-[11px] text-muted-foreground">وصال</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Nav */}
            <nav className="py-4 px-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-teal-50 text-teal-600'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 ${active ? 'text-teal-600' : ''}`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* ─── Main Content ─── */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:mr-[72px]' : 'lg:mr-64'
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center gap-3 h-14 px-4 sm:px-6">
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-white/70 hover:text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Breadcrumb area */}
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Shield className="w-4 h-4" />
              <span>إدارة</span>
              <span className="text-white/30">/</span>
              <span className="text-white font-medium">
                {pathname === '/admin'
                  ? 'لوحة التحكم'
                  : pathname === '/admin/verification'
                    ? 'طلبات التوثيق'
                    : ''}
              </span>
            </div>

            <div className="flex-1" />

            {/* Admin Badge */}
            <div className="flex items-center gap-2">
              <Badge className="bg-teal-600 text-white border-teal-600 text-xs">
                <Shield className="w-3 h-3" />
                مدير
              </Badge>
              <Link href="/community">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">المجتمع</span>
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
