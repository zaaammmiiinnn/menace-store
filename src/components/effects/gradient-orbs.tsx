'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function GradientOrbs() {
  const [isReduced, setIsReduced] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReduced(mediaQuery.matches);
    
    const listener = (e: MediaQueryListEvent) => setIsReduced(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const variants = {
    animate1: {
      x: isReduced ? 0 : [0, 80, -40, 0],
      y: isReduced ? 0 : [0, -80, 40, 0],
      transition: { duration: 25, repeat: Infinity, ease: 'linear' as const }
    },
    animate2: {
      x: isReduced ? 0 : [0, -120, 80, 0],
      y: isReduced ? 0 : [0, 40, -120, 0],
      transition: { duration: 22, repeat: Infinity, ease: 'linear' as const }
    },
    animate3: {
      x: isReduced ? 0 : [0, 60, -100, 0],
      y: isReduced ? 0 : [0, 100, -60, 0],
      transition: { duration: 28, repeat: Infinity, ease: 'linear' as const }
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-base-black">
      {/* Acid Green Orb */}
      <motion.div
        variants={variants}
        animate="animate1"
        className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full blur-[140px] opacity-15 bg-[#C6FF00]"
      />
      {/* Dark Depth Orb */}
      <motion.div
        variants={variants}
        animate="animate2"
        className="absolute top-[40%] right-[10%] w-[600px] h-[600px] rounded-full blur-[160px] opacity-35 bg-[#000000]"
      />
      {/* Muted Green-Black Blend Orb */}
      <motion.div
        variants={variants}
        animate="animate3"
        className="absolute bottom-[-10%] left-[30%] w-[450px] h-[450px] rounded-full blur-[140px] opacity-20 bg-[#354300]"
      />
    </div>
  );
}

export default GradientOrbs;
