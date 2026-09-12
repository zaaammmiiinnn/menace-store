'use client';

import React, { ReactNode, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from 'framer-motion';

export interface MarqueeProps {
  children: ReactNode;
  speed?: number; // Speed in pixels per second
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
  gap?: string; // e.g. "gap-4"
}

export function Marquee({
  children,
  speed = 50,
  direction = 'left',
  pauseOnHover = false,
  className,
  gap = 'gap-8',
}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!containerRef.current || !scrollerRef.current) return;
    const scrollerContent = Array.from(scrollerRef.current.children);
    scrollerContent.forEach((item) => {
      const duplicatedItem = item.cloneNode(true) as HTMLElement;
      if (scrollerRef.current) {
        scrollerRef.current.appendChild(duplicatedItem);
      }
    });

    setStart(true);
  }, []);

  const animationDuration = typeof window !== 'undefined' && scrollerRef.current
    ? (scrollerRef.current.scrollWidth / 2) / speed
    : 10;

  return (
    <div
      ref={containerRef}
      className={cn(
        'scroller relative z-20 overflow-hidden w-full',
        className
      )}
    >
      <div
        ref={scrollerRef}
        className={cn(
          'flex min-w-full shrink-0 w-max',
          gap,
          start && !shouldReduceMotion ? 'animate-scroll' : ''
        )}
        style={{
          '--animation-duration': `${animationDuration}s`,
          '--animation-direction': direction === 'left' ? 'forwards' : 'reverse',
          animationPlayState: pauseOnHover ? 'var(--play-state, running)' : 'running',
        } as React.CSSProperties}
        onMouseEnter={(e) => {
          if (pauseOnHover) {
            (e.currentTarget as HTMLElement).style.setProperty('--play-state', 'paused');
          }
        }}
        onMouseLeave={(e) => {
          if (pauseOnHover) {
            (e.currentTarget as HTMLElement).style.setProperty('--play-state', 'running');
          }
        }}
      >
        {children}
      </div>
      <style jsx global>{`
        @keyframes scroll {
          to {
            transform: translate(calc(-50% - (var(--gap) / 2)));
          }
        }
        .animate-scroll {
          animation: scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite;
        }
      `}</style>
    </div>
  );
}
