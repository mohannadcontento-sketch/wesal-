'use client';

import React, { useRef, useEffect, useState, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';

interface StaggeredListProps {
  children: React.ReactNode[];
  /** Delay in seconds between each item */
  stagger?: number;
  /** Base delay before the first item appears */
  baseDelay?: number;
  /** Animation direction */
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  /** Duration per item in seconds */
  duration?: number;
  /** Additional class for each item wrapper */
  itemClassName?: string;
  /** Only animate once */
  once?: boolean;
  /** Viewport margin to trigger animation */
  viewportMargin?: string;
}

function subscribeToReducedMotion(cb: () => void): () => void {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}

function getReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function StaggeredList({
  children,
  stagger = 0.1,
  baseDelay = 0,
  direction = 'up',
  duration = 0.5,
  itemClassName = '',
  once = true,
  viewportMargin = '-80px',
}: StaggeredListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    () => false,
  );

  // If reduced motion is preferred, show everything immediately
  const shouldShow = prefersReducedMotion || visible;

  useEffect(() => {
    if (prefersReducedMotion) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Use requestAnimationFrame to avoid synchronous setState in effect
          requestAnimationFrame(() => setVisible(true));
          if (once) observer.disconnect();
        } else if (!once) {
          requestAnimationFrame(() => setVisible(false));
        }
      },
      { rootMargin: viewportMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, viewportMargin, prefersReducedMotion]);

  // Direction-based offset values
  const offset = (() => {
    switch (direction) {
      case 'up': return { x: 0, y: 30 };
      case 'down': return { x: 0, y: -30 };
      case 'left': return { x: 30, y: 0 };   // RTL: coming from left
      case 'right': return { x: -30, y: 0 };
      case 'fade': return { x: 0, y: 0 };
    }
  })();

  return (
    <div ref={containerRef}>
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, ...offset }}
          animate={shouldShow ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...offset }}
          transition={{
            duration,
            delay: baseDelay + index * stagger,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className={itemClassName}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
