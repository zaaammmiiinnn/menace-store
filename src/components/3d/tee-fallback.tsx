'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TeeFallbackProps {
  productName: string;
  color?: string;
  images?: string[];
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export default function TeeFallback({
  productName,
  color = '#F5F1E8',
  images = [],
}: TeeFallbackProps) {
  const resolvedImages = images.length > 0
    ? images
    : (productName.toLowerCase().includes('waffle')
        ? ['/images/products/heavy-waffle-1.jpg', '/images/products/heavy-waffle-2.jpg']
        : productName.toLowerCase().includes('loud')
        ? ['/images/products/loud-menance-1.jpg', '/images/products/loud-menance-2.jpg']
        : productName.toLowerCase().includes('acid')
        ? ['/images/products/acid-menance-1.jpg', '/images/products/acid-menance-2.jpg']
        : ['/images/products/quiet-menance-1.jpg', '/images/products/quiet-menance-2.jpg']);

  const [[page, direction], setPage] = useState([0, 0]);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const hasImages = resolvedImages && resolvedImages.length > 0;
  const slideCount = hasImages ? resolvedImages.length : 3;

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const currentIndex = ((page % slideCount) + slideCount) % slideCount;

  return (
    <div className="relative w-full h-full min-h-[450px] overflow-hidden bg-base-black flex items-center justify-center rounded-lg">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={!isReducedMotion ? slideVariants : undefined}
          initial={!isReducedMotion ? 'enter' : undefined}
          animate={!isReducedMotion ? 'center' : undefined}
          exit={!isReducedMotion ? 'exit' : undefined}
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(_, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="absolute inset-0 w-full h-full flex items-center justify-center p-8"
          role="img"
          aria-label={`${productName} view ${currentIndex + 1} of ${slideCount}`}
        >
          {hasImages ? (
            <img
              src={resolvedImages[currentIndex]}
              alt={`${productName} view ${currentIndex + 1}`}
              className="w-full h-full object-contain pointer-events-none rounded-xl"
            />
          ) : (
            <div
              className="w-full max-w-sm aspect-[3/4] rounded-2xl shadow-2xl pointer-events-none flex flex-col items-center justify-center p-6 border border-white/10"
              style={{
                background: `linear-gradient(145deg, ${color} 0%, rgba(10,10,10,0.95) 100%)`,
              }}
            >
              <span className="font-display text-2xl tracking-widest text-off-white uppercase">
                {productName}
              </span>
              <span className="font-mono text-xs tracking-widest text-acid-green mt-2">
                HEAVYWEIGHT WAFFLE
              </span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows (Desktop) */}
      <div className="hidden md:flex absolute inset-0 items-center justify-between p-4 pointer-events-none">
        <button
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur flex items-center justify-center pointer-events-auto transition-colors focus:outline-none focus:ring-2 focus:ring-acid-green"
          onClick={() => paginate(-1)}
          aria-label="Previous image"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur flex items-center justify-center pointer-events-auto transition-colors focus:outline-none focus:ring-2 focus:ring-acid-green"
          onClick={() => paginate(1)}
          aria-label="Next image"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {Array.from({ length: slideCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setPage([i, i > currentIndex ? 1 : -1]);
            }}
            className={`w-2 h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-acid-green ${
              i === currentIndex ? 'bg-acid-green w-4' : 'bg-white/40 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
