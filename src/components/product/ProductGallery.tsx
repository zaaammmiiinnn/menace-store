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

  const getImageSrc = (index: number) => {
    const key = `${activeImageList[index]}_${index}`;
    if (failedImages[key] || !activeImageList[index]) {
      // Fallback to placeholder or original images
      return images[index] || '/products/placeholder.svg';
    }
    return activeImageList[index];
  };

  const handleImageError = (index: number) => {
    const key = `${activeImageList[index]}_${index}`;
    setFailedImages((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Hero Viewer */}
      <div className="relative aspect-[4/5] w-full bg-[#0A0A0A] border border-[#1C1C1C] overflow-hidden">
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
            className="w-full h-full object-cover object-center select-none relative z-10"
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
                    ? 'top-[30%] left-[64%] -translate-x-1/2 -translate-y-1/2'
                    : 'top-[31%] left-1/2 -translate-x-1/2 -translate-y-1/2'
                }`}
              >
                <img
                  src={artworkSrc}
                  alt="Custom Print Artwork"
                  className={`object-contain transition-all duration-200 ${
                    customArtwork?.placement === 'front_chest'
                      ? customArtwork?.scale === 'small'
                        ? 'w-12 max-h-12'
                        : customArtwork?.scale === 'large'
                        ? 'w-24 max-h-24'
                        : 'w-16 max-h-16'
                      : customArtwork?.placement === 'back'
                      ? customArtwork?.scale === 'small'
                        ? 'w-48 sm:w-56 max-h-40'
                        : customArtwork?.scale === 'large'
                        ? 'w-72 sm:w-84 max-h-64'
                        : 'w-60 sm:w-72 max-h-52'
                      : customArtwork?.scale === 'small'
                      ? 'w-32 max-h-28'
                      : customArtwork?.scale === 'large'
                      ? 'w-64 sm:w-72 max-h-60'
                      : 'w-48 sm:w-56 max-h-44'
                  }`}
                  style={{
                    filter: 'contrast(1.05) drop-shadow(0px 2px 5px rgba(0,0,0,0.4))',
                  }}
                />

              </div>
            )}
          </div>
        )}

        {/* View Indicator Badge */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[9px] font-mono tracking-widest uppercase bg-[#0A0A0A]/85 text-[#C6FF00] border border-[#1C1C1C] backdrop-blur-md">
              {VIEW_LABELS[selectedIndex] || '01 // FRONT'}
            </span>
            {!isPlain && !artworkSrc && selectedIndex === 1 && (
              <span className="px-2.5 py-1 text-[9px] font-mono tracking-wider uppercase bg-[#C6FF00] text-[#0A0A0A] font-bold">
                "{backQuote}"
              </span>
            )}
            {isPlain && !artworkSrc && (
              <span className="px-2.5 py-1 text-[9px] font-mono tracking-widest uppercase bg-[#141414] text-[#F5F1E8] border border-[#333333]">
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
