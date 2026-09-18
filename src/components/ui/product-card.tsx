'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/ui-store';
import { useCartStore } from '@/store/cart-store';
import { Product } from '@/types';
import { ShoppingBag, Heart } from 'lucide-react';
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
  const colorways = product.colorways && product.colorways.length > 0 
    ? product.colorways 
    : [{ name: (product as any).color || 'Black', hex: '#1A1A1A', materialColor: '#1A1A1A' }];
  const [selectedColor, setSelectedColor] = useState(colorways[0]?.name || 'Black');
  const sizes = product.sizes && product.sizes.length > 0 
    ? product.sizes 
    : (product as any).variants?.map((v: any) => ({ value: v.size, label: v.size, scale: 1.0, inStock: true })) || [
        { value: 'S', label: 'S', scale: 1.0, inStock: true },
        { value: 'M', label: 'M', scale: 1.0, inStock: true },
        { value: 'L', label: 'L', scale: 1.0, inStock: true },
        { value: 'XL', label: 'XL', scale: 1.0, inStock: true },
        { value: '2XL', label: '2XL', scale: 1.0, inStock: true },
      ];
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
    );
  }, []);

  // 3D Tilt calculation (only for mouse desktop devices)
  const x = useSpring(0, { stiffness: 200, damping: 20 });
  const y = useSpring(0, { stiffness: 200, damping: 20 });

  const rotateX = useTransform(y, [-0.5, 0.5], ['8deg', '-8deg']);
  const rotateY = useTransform(x, [-0.5, 0.5], ['-8deg', '8deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || isTouchDevice || !ref.current) return;
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
    if (!isTouchDevice) {
      setIsHovered(true);
      setCursor('VIEW');
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, selectedColor, selectedSize);
    triggerConfetti();
    showToast(`Added ${product.name} (${selectedSize}) to cart`);
  };

  const activeColorway = colorways.find((c) => c.name === selectedColor) || colorways[0];
  const primaryColorHex = activeColorway?.hex || '#1A1A1A';

  const productImages = product.images && product.images.length > 0 ? product.images : ['/products/placeholder.svg'];
  const mainImage = productImages[0] || '/products/placeholder.svg';
  const hoverImage = isHovered && productImages[1] ? productImages[1] : mainImage;

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 25 }}
      whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      className={cn('group relative flex flex-col', className)}
    >
      <div className="relative">
        <Link href={`/shop/${product.slug}`} className="block">
          <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={shouldReduceMotion || isTouchDevice ? {} : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
            className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#111111] border border-border/80 group-hover:border-acid-green/60 transition-colors duration-300 shadow-lg"
          >
            {/* Ambient dynamic background gradient matching colorway */}
            <div
              className="absolute inset-0 transition-all duration-700 opacity-20 group-hover:opacity-50 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 40%, ${primaryColorHex} 0%, #0A0A0A 85%)`,
              }}
            />

            {/* Real Garment Photo Display - Perfectly framed & never clipped */}
            <div className="absolute inset-0 flex items-center justify-center select-none overflow-hidden p-3 sm:p-4">
              <img
                src={hoverImage}
                alt={product.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/products/placeholder.svg';
                }}
                className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
              />
            </div>

            {/* Tag / Badge */}
            <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex gap-1.5 z-10">
              {product.isNew && (
                <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-display uppercase tracking-wider bg-acid-green text-base-black rounded font-bold shadow-md">
                  NEW
                </span>
              )}
              {product.isBestSeller && (
                <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider bg-off-white/10 text-off-white border border-off-white/20 rounded shadow-md">
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
              className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full bg-base-black/70 backdrop-blur-md text-off-white hover:text-acid-green border border-white/10 transition-colors z-10 cursor-pointer shadow-md"
              aria-label="Save to wishlist"
            >
              <Heart size={14} className={isWishlisted ? 'fill-acid-green text-acid-green' : ''} />
            </button>

            {/* Quick Add Tray on Desktop Hover */}
            <motion.div
              initial={false}
              animate={{ y: isHovered && !isTouchDevice ? '0%' : '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="hidden md:flex absolute bottom-0 inset-x-0 p-3 bg-base-black/95 backdrop-blur-md border-t border-border flex-col gap-2 z-20"
            >
              {/* Size Selector */}
              <div className="flex items-center justify-between gap-1 overflow-x-auto hide-scrollbar py-0.5">
                {sizes.slice(0, 6).map((size: any) => (
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
                className="w-full py-2 px-3 bg-off-white text-base-black hover:bg-acid-green transition-colors font-display text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded cursor-pointer font-bold"
              >
                <ShoppingBag size={13} />
                <span>Quick Add ({selectedSize})</span>
              </button>
            </motion.div>
          </motion.div>
        </Link>
      </div>

      {/* Product Information */}
      <div className="mt-2.5 sm:mt-3 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/shop/${product.slug}`} className="group-hover:text-acid-green transition-colors">
            <h3 className="font-display text-sm sm:text-base tracking-wide uppercase text-off-white line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <span className="font-mono text-xs text-acid-green font-bold whitespace-nowrap">
            {getFormattedPrice(product.price || product.priceInr || 0)}
          </span>
        </div>

        {/* Product Description Snippet */}
        {product.description && (
          <p className="text-[10px] sm:text-[11px] text-muted-grey line-clamp-2 leading-relaxed font-sans">
            {product.description}
          </p>
        )}

        {/* Colorway Swatches */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5">
            {colorways.map((cw) => (
              <button
                key={cw.name}
                type="button"
                onClick={() => setSelectedColor(cw.name)}
                className={cn(
                  'w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full transition-transform cursor-pointer border',
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

          <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-muted-grey">
            {selectedColor}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default ProductCard;
