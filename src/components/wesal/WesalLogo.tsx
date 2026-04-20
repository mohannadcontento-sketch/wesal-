'use client';

import { Heart } from 'lucide-react';

interface WesalLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'light' | 'dark';
}

export function WesalLogo({ size = 'md', showText = true, variant = 'dark' }: WesalLogoProps) {
  const sizeClasses = {
    sm: { icon: 24, arabic: 'text-lg', english: 'text-xs', gap: 'gap-1.5' },
    md: { icon: 32, arabic: 'text-2xl', english: 'text-sm', gap: 'gap-2' },
    lg: { icon: 44, arabic: 'text-4xl', english: 'text-base', gap: 'gap-3' },
  };

  const colors = variant === 'light'
    ? { icon: 'text-[#A8D0E6]', arabic: 'text-white', english: 'text-white/70' }
    : { icon: 'text-[#508991]', arabic: 'text-[#004346]', english: 'text-[#508991]' };

  return (
    <div className={`flex items-center ${sizeClasses[size].gap}`} dir="ltr">
      <Heart
        size={sizeClasses[size].icon}
        className={colors.icon}
        fill="currentColor"
        strokeWidth={0}
      />
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${sizeClasses[size].arabic} font-bold ${colors.arabic}`} dir="rtl">
            وصال
          </span>
          <span className={`${sizeClasses[size].english} ${colors.english} font-medium tracking-wider`}>
            WESAL
          </span>
        </div>
      )}
    </div>
  );
}
