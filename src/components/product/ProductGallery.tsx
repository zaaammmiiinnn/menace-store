'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  backQuote: string;
  fabricGsm: number;
}

const VIEW_LABELS = [
  '01 // FRONT VIEW',
  '02 // BACK VIEW (QUOTE)',
  '03 // WAFFLE KNIT DETAIL',
  '04 // NECK TAG SPEC',
];

export function ProductGallery({
  images,
  productName,
  backQuote,
  fabricGsm,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const getImageSrc = (index: number) => {
    if (failedImages[index] || !images[index]) {
      return '/products/placeholder.svg';
    }
    return images[index];
  };

  const handleImageError = (index: number) => {
    setFailedImages((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Hero Viewer */}
      <div className="relative aspect-[4/5] w-full bg-[#0A0A0A] border border-[#1C1C1C] overflow-hidden">
        {/* Subtle brutalist grid overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#1A1A1A_1px,transparent_1px)] [background-size:20px_20px] opacity-40 z-0" />

        <AnimatePresence mode="wait">
          <motion.img
            key={selectedIndex}
            src={getImageSrc(selectedIndex)}
            alt={`${productName} - ${VIEW_LABELS[selectedIndex] || 'View'}`}
            onError={() => handleImageError(selectedIndex)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full object-cover object-center select-none relative z-10"
          />
        </AnimatePresence>

        {/* View Indicator Badge */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          <span className="px-2.5 py-1 text-[9px] font-mono tracking-widest uppercase bg-[#0A0A0A]/85 text-[#C6FF00] border border-[#1C1C1C] backdrop-blur-md">
            {VIEW_LABELS[selectedIndex] || '01 // FRONT'}
          </span>
          {selectedIndex === 1 && (
            <span className="px-2.5 py-1 text-[9px] font-mono tracking-wider uppercase bg-[#C6FF00] text-[#0A0A0A] font-bold">
              "{backQuote}"
            </span>
          )}
        </div>

        {/* GSM & Fit Spec Badge */}
        <div className="absolute bottom-3 right-3 z-20">
          <span className="px-2.5 py-1 text-[9px] font-mono tracking-widest uppercase bg-[#0A0A0A]/85 text-[#8A8A8A] border border-[#1C1C1C] backdrop-blur-md">
            {fabricGsm} GSM WAFFLE
          </span>
        </div>
      </div>

      {/* 4-Thumbnail Strip */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {images.slice(0, 4).map((img, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative aspect-[4/5] bg-[#0A0A0A] border transition-all duration-200 overflow-hidden cursor-pointer ${
                isSelected
                  ? 'border-[#C6FF00] ring-1 ring-[#C6FF00]/50'
                  : 'border-[#1C1C1C] hover:border-[#333333] opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={getImageSrc(idx)}
                alt={`Thumbnail ${idx + 1}`}
                onError={() => handleImageError(idx)}
                className="w-full h-full object-cover object-center"
              />
              <span className="absolute bottom-1 left-1 px-1 py-0.5 text-[8px] font-mono bg-[#0A0A0A]/90 text-[#F5F1E8]">
                0{idx + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ProductGallery;
