'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/ui-store';

export interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  cursorLabel?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
}

export function MagneticButton({
  children,
  className,
  href,
  onClick,
  cursorLabel = 'CLICK',
  variant = 'primary',
  size = 'md',
  disabled = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const setCursorType = useUiStore((state) => state.setCursorType);
  const shouldReduceMotion = useReducedMotion();
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const x = useSpring(0, { stiffness: 220, damping: 18, mass: 0.1 });
  const y = useSpring(0, { stiffness: 220, damping: 18, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !ref.current || disabled) return;
    
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    
    x.set(middleX * 0.25);
    y.set(middleY * 0.25);
  };

  const handleMouseLeave = () => {
    if (cursorLabel) setCursorType('default');
    x.set(0);
    y.set(0);
  };

  const handleMouseEnter = () => {
    if (cursorLabel && !disabled) setCursorType(cursorLabel);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    
    // Create ripple effect
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const rippleX = e.clientX - rect.left;
      const rippleY = e.clientY - rect.top;
      const id = Date.now();
      setRipples((prev) => [...prev, { id, x: rippleX, y: rippleY }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    }

    if (onClick) onClick(e);
  };

  const baseClasses = cn(
    'relative inline-flex items-center justify-center overflow-hidden font-display uppercase tracking-wider transition-all duration-300 select-none group',
    {
      'h-9 px-4 text-xs': size === 'sm',
      'h-12 px-7 text-sm': size === 'md',
      'h-14 px-9 text-base': size === 'lg',
      'h-16 px-12 text-lg': size === 'xl',
    },
    {
      'bg-acid-green text-base-black hover:bg-off-white hover:text-base-black shadow-[0_0_25px_rgba(198,255,0,0.25)]': variant === 'primary',
      'border border-off-white/40 text-off-white hover:bg-off-white hover:text-base-black': variant === 'secondary',
      'border border-acid-green/40 text-acid-green hover:bg-acid-green hover:text-base-black': variant === 'outline',
      'text-off-white hover:text-acid-green': variant === 'ghost',
      'opacity-50 cursor-not-allowed pointer-events-none': disabled,
    },
    className
  );

  const content = (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{ x, y }}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      className="relative z-10 w-full h-full flex items-center justify-center gap-2"
    >
      {children}

      {/* Touch ripple circles */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 30,
            height: 30,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </motion.div>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={baseClasses} onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={handleClick} className={baseClasses} disabled={disabled}>
      {content}
    </button>
  );
}

export default MagneticButton;
