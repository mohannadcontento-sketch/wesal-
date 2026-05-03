'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { usePerformanceMode } from '@/hooks/usePerformanceMode';

// Lazy load — never SSR
const ParticleFieldCanvas = dynamic(() => import('./ParticleFieldCanvas'), {
  ssr: false,
});

interface ParticleFieldProps {
  className?: string;
  /** Override particle count */
  count?: number;
  /** Background color (CSS value) */
  background?: string;
}

export function ParticleField({
  className = '',
  count,
  background = 'transparent',
}: ParticleFieldProps) {
  const performance = usePerformanceMode();

  // Fallback for low-performance: subtle CSS radial gradient instead of 3D particles
  if (performance === 'low') {
    return (
      <div
        className={className}
        style={{
          position: 'absolute',
          inset: 0,
          background,
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 30% 40%, rgba(115,179,206,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(214,243,244,0.06) 0%, transparent 50%)',
          }}
        />
      </div>
    );
  }

  return (
    <Suspense fallback={<div className={className} style={{ background }} />}>
      <ParticleFieldCanvas
        className={className}
        count={count}
        background={background}
      />
    </Suspense>
  );
}
