'use client';

import { useEffect, useState, RefObject } from 'react';
import { useReducedMotion } from './use-reduced-motion';

interface UseScrollTriggerOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollTrigger<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options: UseScrollTriggerOptions = {}
) {
  const { threshold = 0, rootMargin = '0px', triggerOnce = true } = options;
  const [isInView, setIsInView] = useState(false);
  const [progress, setProgress] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsInView(true);
      setProgress(1);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const thresholdArray = Array.isArray(threshold) 
      ? threshold 
      : (threshold === 0 ? [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] : [threshold]);

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const isIntersecting = entry.isIntersecting;
        
        if (isIntersecting) {
          setIsInView(true);
          setProgress(entry.intersectionRatio);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else {
          if (!triggerOnce) {
            setIsInView(false);
          }
          setProgress(0);
        }
      },
      { threshold: thresholdArray, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, threshold, rootMargin, triggerOnce, prefersReducedMotion]);

  return { isInView, progress };
}
