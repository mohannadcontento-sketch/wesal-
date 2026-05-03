'use client';

import { TopNavbar } from './TopNavbar';
import { SideNav } from './SideNav';
import { MobileBottomNav } from './MobileBottomNav';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-wesal-cream flex flex-col">
      {/* ── Fixed Top Navbar ── */}
      <TopNavbar />

      {/* ── Desktop Side Navigation (right side in RTL) ── */}
      <SideNav />

      {/* ── Main Content Area ── */}
      <main className="w-full max-w-screen-2xl mx-auto flex-1 pt-[60px] px-4 md:px-8 md:pr-72 pb-24 md:pb-8">
        {children}
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <MobileBottomNav />
    </div>
  );
}
