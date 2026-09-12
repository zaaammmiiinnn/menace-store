'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SplitFlapProps {
  value: string;
  className?: string;
}

export function SplitFlap({ value, className }: SplitFlapProps) {
  const [currentValue, setCurrentValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [nextValue, setNextValue] = useState(value);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (value !== currentValue) {
      if (shouldReduceMotion) {
        setCurrentValue(value);
      } else {
        setNextValue(value);
        setIsAnimating(true);
      }
    }
  }, [value, currentValue, shouldReduceMotion]);

  const handleAnimationComplete = () => {
    setCurrentValue(nextValue);
    setIsAnimating(false);
  };

  const baseStyle = "absolute w-full h-[50%] overflow-hidden bg-[#1A1A1A] flex items-center justify-center font-anton text-[#F5F1E8]";

  return (
    <div 
      className={cn(
        "relative inline-flex flex-col w-12 h-16 sm:w-16 sm:h-24 text-3xl sm:text-5xl rounded-sm overflow-hidden",
        "perspective-1000",
        className
      )}
      style={{ perspective: '1000px' }}
    >
      {/* Background Top (Next Value) */}
      <div className={cn(baseStyle, "top-0 items-end pb-[1px] border-b border-[#333]")}>
        <span className="translate-y-[50%]">{isAnimating ? nextValue : currentValue}</span>
      </div>

      {/* Background Bottom (Current Value) */}
      <div className={cn(baseStyle, "bottom-0 items-start pt-[1px]")}>
        <span className="-translate-y-[50%]">{isAnimating ? nextValue : currentValue}</span>
      </div>

      {/* Flap Top (Animates down) */}
      {!shouldReduceMotion && isAnimating && (
        <motion.div
          initial={{ rotateX: 0 }}
          animate={{ rotateX: -90 }}
          transition={{ duration: 0.15, ease: 'easeIn' }}
          className={cn(baseStyle, "top-0 items-end pb-[1px] origin-bottom border-b border-[#333] z-10")}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="translate-y-[50%]">{currentValue}</span>
        </motion.div>
      )}

      {/* Flap Bottom (Animates into view) */}
      {!shouldReduceMotion && isAnimating && (
        <motion.div
          initial={{ rotateX: 90 }}
          animate={{ rotateX: 0 }}
          transition={{ duration: 0.15, delay: 0.15, ease: 'easeOut' }}
          onAnimationComplete={handleAnimationComplete}
          className={cn(baseStyle, "bottom-0 items-start pt-[1px] origin-top z-10")}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="-translate-y-[50%]">{nextValue}</span>
        </motion.div>
      )}

      {/* Center divider line overlay to make it look mechanical */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#0A0A0A] -translate-y-1/2 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
    </div>
  );
}
