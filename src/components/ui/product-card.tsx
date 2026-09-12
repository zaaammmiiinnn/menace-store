'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/ui-store';
import { useCartStore } from '@/store/cart-store';
import { Product } from '@/types';
import { ShoppingBag, Eye, Heart } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlist-store';

export interface ProductCardProps {
  product: Product;
  index?: number;
  className?: string;
}

export function ProductCard({ product, index = 0, className }: ProductCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const setCursor = useUiStore((state) => state.setCursorType);
  const triggerConfetti = useUiStore((state) => state.triggerConfetti);
  const showToast = useUiStore((state) => state.showToast);
  const addToCart = useCartStore((state) => state.addItem);
  const getFormattedPrice = useCartStore((state) => state.getFormattedPrice);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(product.id));
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colorways?.[0]?.name || 'Black');
  const [selectedSize, setSelectedSize] = useState<string>('M');

  // 3D Tilt calculation
  const x = useSpring(0, { stiffness: 200, damping: 20 });
  const y = useSpring(0, { stiffness: 200, damping: 20 });

  const rotateX = useTransform(y, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(x, [-0.5, 0.5], ['-10deg', '10deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCursor('default');
    x.set(0);
    y.set(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setCursor('VIEW');
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, selectedColor, selectedSize);
    triggerConfetti();
    showToast(`Added ${product.name} (${selectedSize}) to cart`);
  };

  const activeColorway = product.colorways.find((c) => c.name === selectedColor) || product.colorways[0];
  const primaryColorHex = activeColorway?.hex || '#1A1A1A';

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 35 }}
      whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={cn('group relative flex flex-col', className)}
    >
      <div className="relative">
        <Link href={`/shop/${product.slug}`} className="block">
          <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={shouldReduceMotion ? {} : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
            className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-surface border border-border/80 group-hover:border-acid-green/60 transition-colors duration-300"
          >
            {/* Ambient dynamic background gradient matching colorway */}
            <div
              className="absolute inset-0 transition-all duration-700 opacity-30 group-hover:opacity-60"
              style={{
                background: `radial-gradient(circle at 50% 30%, ${primaryColorHex} 0%, #0A0A0A 85%)`,
              }}
            />

            {/* Graphic Silhouette Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 select-none">
              {/* Graphic Mockup Tee Render */}
              <div 
                className="relative w-40 h-48 rounded-lg flex flex-col items-center justify-center transition-transform duration-500 group-hover:scale-105 shadow-2xl"
                style={{
                  backgroundColor: primaryColorHex,
                  boxShadow: `0 20px 40px -15px ${primaryColorHex}40`,
                }}
              >
                {/* Waffle Knit texture simulation */}
                <div 
                  className="absolute inset-0 opacity-25 mix-blend-overlay rounded-lg"
                  style={{
                    backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
                    backgroundSize: '8px 8px',
                  }}
                />
                
                {/* Brand label hit */}
                <span 
                  className="font-display text-xs tracking-widest uppercase z-10 px-2 py-0.5 rounded"
                  style={{ 
                    color: primaryColorHex === '#0A0A0A' || primaryColorHex === '#1A1A1A' ? '#F5F1E8' : '#0A0A0A',
                    backgroundColor: primaryColorHex === '#0A0A0A' || primaryColorHex === '#1A1A1A' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' 
                  }}
                >
                  {product.vibeName || 'MENANCE'}
                </span>
                <span className="text-[9px] font-mono tracking-widest text-muted-grey mt-1">
                  280 GSM WAFFLE
                </span>
              </div>

              {/* Tag / Badge */}
              <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                {product.isNew && (
                  <span className="px-2 py-0.5 text-[10px] font-display uppercase tracking-wider bg-acid-green text-base-black rounded">
                    NEW
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-off-white/10 text-off-white border border-off-white/20 rounded">
                    TOP SKU
                  </span>
                )}
              </div>

              {/* Wishlist Heart Icon */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
                className="absolute top-3 right-3 p-2 rounded-full bg-base-black/60 backdrop-blur-md text-off-white hover:text-acid-green border border-white/10 transition-colors z-10 cursor-pointer"
                aria-label="Save to wishlist"
              >
                <Heart size={14} className={isWishlisted ? 'fill-acid-green text-acid-green' : ''} />
              </button>
            </div>

            {/* Quick Add Tray on Hover */}
            <motion.div
              initial={false}
              animate={{ y: isHovered ? '0%' : '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="absolute bottom-0 inset-x-0 p-3 bg-base-black/95 backdrop-blur-md border-t border-border flex flex-col gap-2 z-20"
            >
              {/* Size Selector */}
              <div className="flex items-center justify-between gap-1 overflow-x-auto hide-scrollbar py-0.5">
                {product.sizes?.slice(0, 6).map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedSize(size.value);
                    }}
                    className={cn(
                      'text-[10px] font-mono px-2 py-1 rounded transition-colors cursor-pointer',
                      selectedSize === size.value
                        ? 'bg-acid-green text-base-black font-bold'
                        : 'bg-surface text-off-white/80 hover:bg-border'
                    )}
                  >
                    {size.value}
                  </button>
                ))}
              </div>

              {/* Quick Add CTA */}
              <button
                type="button"
                onClick={handleQuickAdd}
                className="w-full py-2 px-3 bg-off-white text-base-black hover:bg-acid-green transition-colors font-display text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded cursor-pointer"
              >
                <ShoppingBag size={13} />
                <span>Quick Add ({selectedSize})</span>
              </button>
            </motion.div>
          </motion.div>
        </Link>
      </div>

      {/* Product Information */}
      <div className="mt-3 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/shop/${product.slug}`} className="group-hover:text-acid-green transition-colors">
            <h3 className="font-display text-base tracking-wide uppercase text-off-white line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <span className="font-mono text-xs text-acid-green font-bold whitespace-nowrap">
            {getFormattedPrice(product.price)}
          </span>
        </div>

        {/* Colorway Swatches */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {product.colorways?.map((cw) => (
              <button
                key={cw.name}
                type="button"
                onClick={() => setSelectedColor(cw.name)}
                className={cn(
                  'w-3.5 h-3.5 rounded-full transition-transform cursor-pointer border',
                  selectedColor === cw.name
                    ? 'scale-125 border-acid-green ring-1 ring-acid-green/50'
                    : 'border-white/20 hover:scale-110'
                )}
                style={{ backgroundColor: cw.hex }}
                title={cw.name}
                aria-label={`Select ${cw.name} color`}
              />
            ))}
          </div>

          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-grey">
            {selectedColor}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default ProductCard;
