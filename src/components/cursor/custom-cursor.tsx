'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { useUiStore } from '@/store/ui-store';

export function CustomCursor() {
  const pathname = usePathname();
  const { cursorType, cursorVisible } = useUiStore();
  const [isPointerFine, setIsPointerFine] = useState(false);
  const [isOverInteractive, setIsOverInteractive] = useState(false);
  
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  const springX = useSpring(mouseX, { stiffness: 600, damping: 35, mass: 0.2 });
  const springY = useSpring(mouseY, { stiffness: 600, damping: 35, mass: 0.2 });

  const isCheckout = pathname?.startsWith('/checkout');

  useEffect(() => {
    const fineQuery = window.matchMedia('(pointer: fine)');
    setIsPointerFine(fineQuery.matches);
    const fineListener = (e: MediaQueryListEvent) => setIsPointerFine(e.matches);
    fineQuery.addEventListener('change', fineListener);

    return () => {
      fineQuery.removeEventListener('change', fineListener);
    };
  }, []);

  useEffect(() => {
    if (!isPointerFine || isCheckout) return;

    let lastOverInteractive = false;

    const handleMouseMove = (e: MouseEvent) => {
      // Direct motion values update without triggering React component re-renders
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target as HTMLElement | null;
      const isInteractive = !!target?.closest?.(
        'input, textarea, select, [contenteditable="true"], .cl-rootBox, .cl-card, [data-clerk-portal], [class*="cl-"]'
      );

      if (isInteractive !== lastOverInteractive) {
        lastOverInteractive = isInteractive;
        setIsOverInteractive(isInteractive);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPointerFine, isCheckout, mouseX, mouseY]);

  // Don't render custom cursor on checkout or mobile touch devices
  if (!isPointerFine || !cursorVisible || isCheckout) return null;

  const hasLabel = cursorType && cursorType !== 'default';
  const width = hasLabel ? 72 : 10;
  const height = hasLabel ? 26 : 10;

  return (
    <>
      <style>{`
        @media (pointer: fine) {
          body, a, button, [role="button"] {
            cursor: auto;
          }
          input, textarea, select, [contenteditable="true"] {
            cursor: text !important;
          }
        }
      `}</style>
      
      {/* Main Custom Cursor Dot */}
      <motion.div
        className={`fixed top-0 left-0 flex items-center justify-center rounded-full pointer-events-none z-[2147483647] overflow-hidden bg-acid-green text-base-black font-display text-[10px] tracking-widest uppercase font-bold shadow-[0_0_12px_rgba(198,255,0,0.5)] transition-opacity duration-150 ${
          isOverInteractive ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
        }`}
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
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {hasLabel && (
          <span className="select-none leading-none px-1">
            {cursorType}
          </span>
        )}
      </motion.div>
    </>
  );
}

export default CustomCursor;
