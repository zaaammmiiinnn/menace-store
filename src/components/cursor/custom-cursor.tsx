'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { useUiStore } from '@/store/ui-store';

interface Particle {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

export function CustomCursor() {
  const { cursorType, cursorVisible } = useUiStore();
  const [isPointerFine, setIsPointerFine] = useState(false);
  const [isReduced, setIsReduced] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);
  
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  const springX = useSpring(mouseX, { stiffness: 450, damping: 32, mass: 0.4 });
  const springY = useSpring(mouseY, { stiffness: 450, damping: 32, mass: 0.4 });

  useEffect(() => {
    // Only enable on desktop pointer: fine devices
    const fineQuery = window.matchMedia('(pointer: fine)');
    setIsPointerFine(fineQuery.matches);
    const fineListener = (e: MediaQueryListEvent) => setIsPointerFine(e.matches);
    fineQuery.addEventListener('change', fineListener);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReduced(motionQuery.matches);
    const motionListener = (e: MediaQueryListEvent) => setIsReduced(e.matches);
    motionQuery.addEventListener('change', motionListener);
    
    return () => {
      fineQuery.removeEventListener('change', fineListener);
      motionQuery.removeEventListener('change', motionListener);
    };
  }, []);

  useEffect(() => {
    if (!isPointerFine) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      if (!isReduced && (cursorType === 'default' || !cursorType)) {
        particleIdRef.current += 1;
        const newParticle = {
          id: particleIdRef.current,
          x: e.clientX,
          y: e.clientY,
          timestamp: Date.now(),
        };
        
        setParticles((prev) => {
          const updated = [...prev, newParticle];
          if (updated.length > 15) return updated.slice(updated.length - 15);
          return updated;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPointerFine, isReduced, mouseX, mouseY, cursorType]);

  useEffect(() => {
    if (!isPointerFine || isReduced) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setParticles((prev) => prev.filter((p) => now - p.timestamp < 350));
    }, 60);
    return () => clearInterval(interval);
  }, [isPointerFine, isReduced]);

  if (!isPointerFine || !cursorVisible) return null;

  const hasLabel = cursorType && cursorType !== 'default';
  const width = hasLabel ? 72 : 12;
  const height = hasLabel ? 26 : 12;

  return (
    <>
      <style>{`
        @media (pointer: fine) {
          body, a, button, input, [role="button"] {
            cursor: none !important;
          }
        }
      `}</style>
      
      {/* Particle Trail */}
      {!isReduced && particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-acid-green pointer-events-none z-[9998]"
          style={{ x: p.x - 3, y: p.y - 3 }}
        />
      ))}

      {/* Main Custom Cursor */}
      <motion.div
        className="fixed top-0 left-0 flex items-center justify-center rounded-full pointer-events-none z-[9999] overflow-hidden bg-acid-green text-base-black font-display text-[10px] tracking-widest uppercase font-bold shadow-lg"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width,
          height,
          borderRadius: 9999,
        }}
        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
      >
        {hasLabel && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="select-none leading-none px-1"
          >
            {cursorType}
          </motion.span>
        )}
      </motion.div>
    </>
  );
}
export default CustomCursor;
