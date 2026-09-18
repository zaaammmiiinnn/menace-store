'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { FormattedProduct } from '@/lib/products/queries';
import { ArrowUpRight } from 'lucide-react';

interface ProductCardProps {
  product: FormattedProduct;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [imgSrc, setImgSrc] = useState(product.images[0] || '/products/placeholder.svg');
  const [isHovered, setIsHovered] = useState(false);

  // When hovered, show back view showing quote if available
  const currentImage = isHovered && product.images[1] ? product.images[1] : imgSrc;

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 25 }}
      whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      className="group relative flex flex-col bg-[#0E0E0E] border border-[#1C1C1C] hover:border-[#C6FF00]/50 transition-colors duration-300 rounded-none overflow-hidden shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/shop/${product.slug}`} className="block relative aspect-[4/5] bg-[#111111] overflow-hidden p-3 sm:p-4 flex items-center justify-center">
        {/* Subtle brutalist grain/mesh overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#1E1E1E_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

        {/* Product Image - Clean object-contain so full shirt is visible */}
        <motion.img
          src={currentImage}
          alt={product.name}
          onError={() => setImgSrc('/products/placeholder.svg')}
          animate={shouldReduceMotion ? {} : { scale: isHovered ? 1.04 : 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full object-contain object-center select-none filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] relative z-0"
        />

        {/* Badges / Tags */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          <span className="px-2 py-0.5 text-[9px] font-mono font-bold tracking-widest uppercase bg-[#C6FF00] text-[#0A0A0A] shadow-md">
            NOT FOR EVERYONE
          </span>
          <span className="px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-[#0A0A0A]/90 text-[#F5F1E8] border border-[#222222]">
            {product.fabricGsm} GSM
          </span>
        </div>

        {/* Back Quote Preview Ribbon on Hover */}
        <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent flex items-center justify-between text-[#F5F1E8] z-10">
          <span className="text-[10px] font-mono text-[#8A8A8A] uppercase tracking-wider line-clamp-1">
            "{product.backQuote}"
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#C6FF00] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>

      {/* Info Block */}
      <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 bg-[#0E0E0E] border-t border-[#1C1C1C]">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <Link href={`/shop/${product.slug}`} className="hover:text-[#C6FF00] transition-colors">
              <h3 className="font-display text-sm sm:text-base uppercase tracking-tight text-[#F5F1E8] line-clamp-1">
                {product.name}
              </h3>
            </Link>
            <span className="font-mono text-xs sm:text-sm font-bold text-[#C6FF00] tabular-nums whitespace-nowrap">
              ₹{product.priceInr.toLocaleString('en-IN')}
            </span>
          </div>

          <p className="text-[10px] sm:text-[11px] font-mono text-[#8A8A8A] mt-1 line-clamp-1">
            {product.fabricType} • {product.fit}
          </p>
        </div>

        {/* Bottom meta: Color & Available Sizes */}
        <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-[#1C1C1C] flex items-center justify-between text-[10px] font-mono text-[#8A8A8A]">
          <span className="uppercase">{product.color}</span>
          <span className="text-[#C6FF00]/80 font-bold">S – 4XL</span>
        </div>
      </div>
    </motion.div>
  );
}

export default ProductCard;
