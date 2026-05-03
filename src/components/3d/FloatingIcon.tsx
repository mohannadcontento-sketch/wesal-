'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { usePerformanceMode } from '@/hooks/usePerformanceMode';

// Lazy load Three.js components — never SSR
const FloatingIconCanvas = dynamic(() => import('./FloatingIconCanvas'), { ssr: false });

interface FloatingIconProps {
  icon?: React.ReactNode;
  color?: string;
  size?: number;
  className?: string;
}

export function FloatingIcon({
  icon,
  color = '#004346',
  size = 48,
  className = '',
}: FloatingIconProps) {
  const performance = usePerformanceMode();

  // Fallback: CSS-animated icon for low-performance devices
  if (performance === 'low') {
    return (
      <div
        className={`animate-float ${className}`}
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon || (
          <span
            className="material-symbols-outlined filled"
            style={{ fontSize: size * 0.6, color }}
          >
            psychology
          </span>
        )}
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div
          className="animate-pulse rounded-2xl"
          style={{
            width: size,
            height: size,
            background: 'rgba(214,243,244,0.5)',
          }}
        />
      }
    >
      <FloatingIconCanvas color={color} size={size} className={className} />
    </Suspense>
  );
}
