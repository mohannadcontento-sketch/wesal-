'use client';

import { Navbar } from './Navbar';
import { MobileBottomNav } from './MobileBottomNav';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="w-full max-w-3xl mx-auto px-4 flex-1">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
