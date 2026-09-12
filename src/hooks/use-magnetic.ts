'use client';

import { useEffect, useState, useRef, RefObject } from 'react';
import { useReducedMotion } from './use-reduced-motion';
import { useMediaQuery } from './use-media-query';

interface UseMagneticOptions {
  strength?: number;
}

export function useMagnetic<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options: UseMagneticOptions = {}
) {
  const { strength = 0.3 } = options;
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const targetPosition = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion || isMobile) {
      if (element) {
        element.style.transform = '';
      }
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = element.getBoundingClientRect();
      
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      
      targetPosition.current = {
        x: (clientX - centerX) * strength,
        y: (clientY - centerY) * strength,
      };
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      targetPosition.current = { x: 0, y: 0 };
    };

    const render = () => {
      currentPosition.current.x += (targetPosition.current.x - currentPosition.current.x) * 0.1;
      currentPosition.current.y += (targetPosition.current.y - currentPosition.current.y) * 0.1;

      element.style.transform = `translate(${currentPosition.current.x}px, ${currentPosition.current.y}px)`;
      
      animationFrameId.current = requestAnimationFrame(render);
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
      element.style.transform = '';
    };
  }, [ref, strength, prefersReducedMotion, isMobile]);

  return { isHovered };
}
