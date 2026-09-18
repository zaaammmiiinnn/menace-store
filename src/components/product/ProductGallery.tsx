'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CustomArtworkPreview {
  artworkUrl?: string;
  url?: string;
  placement: 'front_center' | 'front_chest' | 'back';
  scale: 'small' | 'medium' | 'large';
}

interface ProductGalleryProps {
  images: string[];
  plainImages?: string[];
  productName: string;
  backQuote: string;
  fabricGsm: number;
  isPlain?: boolean;
  customArtwork?: CustomArtworkPreview | null;
}

const VIEW_LABELS = [
  '01 // FRONT VIEW',
  '02 // BACK VIEW',
  '03 // WAFFLE KNIT DETAIL',
  '04 // NECK TAG SPEC',
];

export function ProductGallery({
  images,
  plainImages,
  productName,
  backQuote,
  fabricGsm,
  isPlain = false,
  customArtwork = null,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const artworkSrc = customArtwork?.artworkUrl || customArtwork?.url;

  const activeImageList =
    (isPlain || Boolean(artworkSrc)) && plainImages && plainImages.length > 0
      ? plainImages
      : images;

  // Auto switch front/back when custom print placement changes
  useEffect(() => {
    if (customArtwork?.placement === 'back') {
      setSelectedIndex(1);
    } else if (customArtwork?.placement) {
      setSelectedIndex(0);
    }
  }, [customArtwork?.placement]);

  // Keep selected index within active list range
  useEffect(() => {
    if (selectedIndex >= activeImageList.length) {
      setSelectedIndex(0);
    }
  }, [activeImageList.length, selectedIndex]);

  const getImageSrc = (index: number) => {
    const activeUrl = activeImageList[index];
    const key = `${activeUrl}_${index}`;
    if (failedImages[key] || !activeUrl) {
      // If plain is requested, do NOT fall back to printed graphics
      if (isPlain) {
        return (
          (plainImages && plainImages[index] && !failedImages[`${plainImages[index]}_${index}`]
            ? plainImages[index]
            : '/products/placeholder.svg')
        );
      }
      return images[index] || '/products/placeholder.svg';
    }
    return activeUrl;
  };

  const handleImageError = (index: number) => {
    const activeUrl = activeImageList[index];
    if (activeUrl) {
      const key = `${activeUrl}_${index}`;
      setFailedImages((prev) => ({ ...prev, [key]: true }));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Hero Viewer - Clean object-contain so full shirt is visible */}
      <div className="relative aspect-[4/5] w-full bg-[#111111] border border-[#1C1C1C] overflow-hidden p-4 sm:p-6 flex items-center justify-center shadow-2xl">
        {/* Subtle brutalist grid overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#1A1A1A_1px,transparent_1px)] [background-size:20px_20px] opacity-40 z-0" />

        <AnimatePresence mode="wait">
          <motion.img
            key={`${selectedIndex}_${isPlain}_${Boolean(artworkSrc)}`}
            src={getImageSrc(selectedIndex)}
            alt={`${productName} - ${VIEW_LABELS[selectedIndex] || 'View'}`}
            onError={() => handleImageError(selectedIndex)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full object-contain object-center select-none relative z-10 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
          />
        </AnimatePresence>

        {/* Live Custom Print Artwork Overlay */}
        {artworkSrc && (
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
            {((customArtwork?.placement === 'back' && selectedIndex === 1) ||
              (customArtwork?.placement !== 'back' && selectedIndex === 0)) && (
              <div
                className={`absolute transition-all duration-300 flex items-center justify-center ${
                  customArtwork?.placement === 'front_center'
                    ? 'top-[33%] left-1/2 -translate-x-1/2 -translate-y-1/2'
                    : customArtwork?.placement === 'front_chest'
                    ? 'top-[28%] left-[64%] -translate-x-1/2 -translate-y-1/2'
                    : 'top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2'
                }`}
                style={{
                  width:
                    customArtwork?.scale === 'small'
                      ? '18%'
                      : customArtwork?.scale === 'large'
                      ? '42%'
                      : '28%',
                }}
              >
                <img
                  src={artworkSrc}
                  alt="Custom Artwork Overlay"
                  className="w-full h-auto object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
                />
              </div>
            )}
          </div>
        )}

        {/* View Perspective Badge */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[9px] font-mono tracking-widest uppercase bg-[#0A0A0A]/90 text-[#C6FF00] border border-[#222222] backdrop-blur-md font-bold">
              {VIEW_LABELS[selectedIndex] || 'PERSPECTIVE'}
            </span>
            {isPlain && (
              <span className="px-2.5 py-1 text-[9px] font-mono tracking-widest uppercase bg-[#141414] text-[#F5F1E8] border border-[#262626] font-bold">
                RAW PLAIN BLANK
              </span>
            )}
          </div>

          {artworkSrc && (
            <span className="px-2 py-0.5 text-[8px] font-mono tracking-widest uppercase bg-[#C6FF00] text-[#0A0A0A] font-bold w-fit">
              LIVE CUSTOM MOCKUP // {customArtwork?.placement ? customArtwork.placement.replace('_', ' ').toUpperCase() : 'FRONT'}
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
        {activeImageList.slice(0, 4).map((img, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <button
              key={`${img}_${idx}`}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative aspect-[4/5] bg-[#111111] border transition-all duration-200 overflow-hidden cursor-pointer p-1.5 flex items-center justify-center ${
                isSelected
                  ? 'border-[#C6FF00] ring-1 ring-[#C6FF00]/50 shadow-md'
                  : 'border-[#1C1C1C] hover:border-[#333333] opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={getImageSrc(idx)}
                alt={`Thumbnail ${idx + 1}`}
                onError={() => handleImageError(idx)}
                className="w-full h-full object-contain object-center"
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
