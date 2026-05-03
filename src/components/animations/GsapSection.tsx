'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface GsapSectionProps {
  children: React.ReactNode;
  className?: string;
  /** Parallax speed for the background layer (0 = none, 1 = full) */
  parallaxSpeed?: number;
  /** Scale-in on scroll (e.g. 0.95 → 1) */
  scaleFrom?: number;
  /** Opacity at start (0 → 1) */
  opacityFrom?: number;
  /** ScrollTrigger start position */
  start?: string;
  /** ScrollTrigger end position */
  end?: string;
  /** Disable animation entirely */
  disabled?: boolean;
}

export function GsapSection({
  children,
  className = '',
  parallaxSpeed = 0,
  scaleFrom = 1,
  opacityFrom = 1,
  start = 'top 80%',
  end = 'bottom 20%',
  disabled = false,
}: GsapSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const inner = innerRef.current;
    if (!section || !inner || disabled) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Parallax background effect
      if (parallaxSpeed > 0) {
        gsap.to(inner, {
          y: () => parallaxSpeed * 100,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // Scale & opacity transition
      if (scaleFrom < 1 || opacityFrom < 1) {
        gsap.fromTo(
          inner,
          { scale: scaleFrom, opacity: opacityFrom },
          {
            scale: 1,
            opacity: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start,
              end,
              scrub: false,
              toggleActions: 'play none none reverse',
            },
          },
        );
      }
    }, section);

    return () => ctx.revert();
  }, [parallaxSpeed, scaleFrom, opacityFrom, start, end, disabled]);

  return (
    <div ref={sectionRef} className={className}>
      <div ref={innerRef}>{children}</div>
    </div>
  );
}
