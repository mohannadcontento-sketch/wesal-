'use client';

import Image from 'next/image';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-wesal-cream">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-wesal-sky/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-wesal-ice to-transparent" />
      </div>

      {/* Logo */}
      <div className="relative z-10 animate-fade-in-up">
        <div className="relative h-14 w-40 mx-auto mb-8">
          <Image src="/logo.png" alt="وصال" width={196} height={67} className="object-contain" priority />
        </div>

        {/* Animated dots loader */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div
            className="w-2.5 h-2.5 rounded-full bg-wesal-dark animate-bounce"
            style={{ animationDelay: '0ms', animationDuration: '0.8s' }}
          />
          <div
            className="w-2.5 h-2.5 rounded-full bg-wesal-medium animate-bounce"
            style={{ animationDelay: '150ms', animationDuration: '0.8s' }}
          />
          <div
            className="w-2.5 h-2.5 rounded-full bg-wesal-sky animate-bounce"
            style={{ animationDelay: '300ms', animationDuration: '0.8s' }}
          />
        </div>

        <p className="text-sm text-wesal-medium mt-4 text-center">جارٍ التحميل...</p>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-12 w-48 h-1 bg-gradient-to-r from-wesal-dark via-wesal-sky to-wesal-dark rounded-full animate-pulse" />
    </div>
  );
}
