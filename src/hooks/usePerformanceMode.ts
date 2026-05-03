'use client';

import { useSyncExternalStore } from 'react';

export type PerformanceMode = 'high' | 'medium' | 'low';

function getPerformanceSnapshot(): PerformanceMode {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return 'low';

  const isMobile = window.innerWidth < 768;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;
  const connection = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
  const slowConnection =
    connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g';

  if (isMobile && (cores <= 4 || memory <= 2 || slowConnection)) return 'low';
  if (isMobile || cores <= 6) return 'medium';
  return 'high';
}

function subscribe(callback: () => void): () => void {
  // Listen for reduced-motion preference changes and other media query changes
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

const SERVER_SNAPSHOT: PerformanceMode = 'high';

export function usePerformanceMode(): PerformanceMode {
  return useSyncExternalStore(subscribe, getPerformanceSnapshot, () => SERVER_SNAPSHOT);
}
