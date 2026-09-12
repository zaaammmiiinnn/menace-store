'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LazyMotion, domAnimation } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

const ReducedMotionContext = createContext<boolean>(false);

export const useMotionSafe = () => {
  const reduced = useContext(ReducedMotionContext);
  return !reduced;
};

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    
    // Add event listener (legacy support for older browsers uses addListener but addEventListener is preferred)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    // Configure GSAP Defaults
    gsap.defaults({
      ease: 'power3.out',
      duration: 0.8,
    });

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return (
    <ReducedMotionContext.Provider value={reducedMotion}>
      <LazyMotion features={domAnimation}>
        {children}
      </LazyMotion>
    </ReducedMotionContext.Provider>
  );
}
