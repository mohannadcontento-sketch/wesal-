'use client';

import { TopNavbar } from './TopNavbar';
import { SideNav } from './SideNav';
import { MobileBottomNav } from './MobileBottomNav';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-wesal-cream flex flex-col">
      {/* ── Fixed Top Navbar (h-14 = 56px) ── */}
      <TopNavbar />

      {/* ── Desktop Side Navigation (right side in RTL, below header) ── */}
      <SideNav />

      {/* ── Main Content Area ── */}
      <main className="w-full max-w-screen-2xl mx-auto flex-1 pt-14 px-4 md:px-8 md:pr-[272px] pb-24 md:pb-8">
        {children}
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <MobileBottomNav />
    </div>
  );
}
