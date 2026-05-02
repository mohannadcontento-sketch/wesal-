'use client';

import { Navbar } from './Navbar';
import { MobileBottomNav } from './MobileBottomNav';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="w-full max-w-5xl mx-auto flex-1 px-4 sm:px-6">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
