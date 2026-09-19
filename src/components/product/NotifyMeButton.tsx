'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, ShoppingBag, Lock, Zap, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useUiStore } from '@/store/ui-store';
import { playClickSound } from '@/lib/sound';
import { FormattedProduct } from '@/lib/products/queries';
import { Product } from '@/types';

export interface NotifyMeButtonProps {
  productName: string;
  selectedSize: string;
  selectedColor?: string;
  product?: FormattedProduct | any;
  isDropLive?: boolean;
  edition?: 'archive' | 'plain' | 'custom';
  customDesign?: {
    artworkUrl: string;
    artworkName?: string;
    placement: 'front_center' | 'front_chest' | 'back';
    scale: 'small' | 'medium' | 'large';
    customQuoteText?: string;
  } | null;
}


export function NotifyMeButton({
  productName,
  selectedSize,
  selectedColor = 'Black',
  product,
  isDropLive = true,
  edition = 'archive',
  customDesign = null,
}: NotifyMeButtonProps) {

  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Store hooks
  const addToCart = useCartStore((state) => state.addItem);
  const openCartDrawer = useCartStore((state) => state.openCart);
  const triggerConfetti = useUiStore((state) => state.triggerConfetti);
  const showToast = useUiStore((state) => state.showToast);

  // Determine variant stock if variants are passed
  const currentVariant = product?.variants?.find(
    (v: any) => v.size === selectedSize && (!selectedColor || v.color.toLowerCase() === selectedColor.toLowerCase())
  ) || product?.variants?.find((v: any) => v.size === selectedSize);

  const stockCount = currentVariant ? Number(currentVariant.stock) : (product?.variants && product.variants.length > 0 ? 0 : 25);
  const isOutOfStock = currentVariant ? Number(currentVariant.stock) <= 0 : false;

  // Helper to build typed cart product
  const getCartProduct = (): Product => {
    const rawImages =
      edition === 'plain' || edition === 'custom'
        ? product?.plainImages || product?.images || ['/products/placeholder.svg']
        : product?.images || ['/products/placeholder.svg'];

    const displayName =
      edition === 'plain'
        ? `${product?.name || productName} (Plain Blank)`
        : edition === 'custom' && customDesign?.artworkUrl
        ? `${product?.name || productName} (Custom: ${customDesign.customQuoteText ? `"${customDesign.customQuoteText}"` : customDesign.placement.replace('_', ' ').toUpperCase()})`
        : product?.name || productName;

    return {
      id: product?.id || `prod_${productName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      slug: product?.slug || productName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: displayName,
      description: product?.description || '',
      price: product?.priceInr || 1499,
      priceInr: product?.priceInr || 1499,
      priceUsd: product?.priceUsd || 49,
      images: rawImages,
      category: product?.category || 'tees',
      tags: ['tees', 'drop_001'],
      isBestSeller: false,
      isNew: true,
      vibeName: product?.backQuote || 'DROP 001',
      backQuote: product?.backQuote,
      frontLogo: product?.frontLogo,
      fabricGsm: product?.fabricGsm || 240,
      fabricType: product?.fabricType || 'Waffle Knit',
      fit: product?.fit || 'Boxy Oversized',
      sleeveType: product?.sleeveType || 'Drop Shoulder',
      colorways: [
        {
          name: selectedColor,
          hex: '#0A0A0A',
          materialColor: '#0A0A0A',
        },
      ],
      sizes: (product?.variants || []).map((v: any) => ({
        value: v.size as any,
        label: v.size,
        scale: 1,
        inStock: Number(v.stock) > 0,
      })),
    };
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock || isRedirecting) return;

    playClickSound();
    setIsRedirecting(true);

    const cartProd = getCartProduct();

    // Add to unified cart store (quantity 1)
    addToCart(
      cartProd,
      selectedColor,
      selectedSize,
      {
        edition,
        customArtworkUrl: customDesign?.artworkUrl,
        customPlacement: customDesign?.placement,
        customScale: customDesign?.scale,
        customQuoteText: customDesign?.customQuoteText,
      },
      1
    );

    showToast(`Redirecting to checkout...`);
    router.push('/checkout');
  };

  const handleAddToBag = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    playClickSound();

    const cartProd = getCartProduct();

    // Add to unified cart store (quantity 1)
    addToCart(
      cartProd,
      selectedColor,
      selectedSize,
      {
        edition,
        customArtworkUrl: customDesign?.artworkUrl,
        customPlacement: customDesign?.placement,
        customScale: customDesign?.scale,
        customQuoteText: customDesign?.customQuoteText,
      },
      1
    );

    triggerConfetti();
    showToast(`Added ${cartProd.name} (${selectedSize}) to bag`);
    openCartDrawer();
  };


  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsSubmitted(false);
      setEmail('');
    }, 2500);
  };

  // --- LIVE DROP STATE: BUY NOW & ADD TO BAG ARE AVAILABLE ---
  if (isDropLive) {
    if (isOutOfStock) {
      return (
        <div className="space-y-3">
          <button
            type="button"
            disabled
            className="w-full py-4 px-6 bg-[#171717] text-[#8A8A8A] border border-[#2A2A2A] font-display text-sm uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <span>OUT OF STOCK // {selectedSize}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="w-full py-3 px-4 bg-[#0F0F0F] hover:bg-[#1A1A1A] text-[#C6FF00] border border-[#C6FF00]/30 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>NOTIFY WHEN RESTOCKED IN {selectedSize}</span>
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {/* Primary Action Button: BUY NOW */}
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isRedirecting}
          className="w-full py-4 px-6 bg-[#C6FF00] hover:bg-[#b0e600] active:scale-[0.99] text-[#0A0A0A] font-display text-base uppercase tracking-widest transition-all flex items-center justify-center gap-2.5 cursor-pointer font-bold shadow-[0_0_25px_rgba(198,255,0,0.3)] disabled:opacity-75"
        >
          <Zap className="w-4 h-4 text-[#0A0A0A] fill-current" />
          <span>{isRedirecting ? 'INITIALIZING CHECKOUT...' : `BUY NOW // ${selectedSize}`}</span>
          <ArrowRight className="w-4 h-4 text-[#0A0A0A]" />
        </button>

        {/* Secondary Action Button: ADD TO BAG */}
        <button
          type="button"
          onClick={handleAddToBag}
          className="w-full py-3.5 px-6 bg-[#121212] hover:bg-[#1C1C1C] active:scale-[0.99] text-[#F5F1E8] hover:text-[#C6FF00] border border-[#262626] hover:border-[#C6FF00]/60 font-display text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2.5 cursor-pointer font-semibold"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>ADD TO BAG // {selectedSize}</span>
        </button>

        {/* Dispatch Guarantee Badge */}
        <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[#8A8A8A]">
          <span className="flex items-center gap-1.5 text-[#C6FF00]">
            <span className="w-2 h-2 rounded-full bg-[#C6FF00] animate-pulse" />
            IN STOCK & READY TO SHIP
          </span>
          <span>DISPATCHES IN 24-48H</span>
        </div>
      </div>
    );
  }

  // --- UPCOMING DROP STATE: CART LOCKED & NOTIFY ME MODAL ---
  return (
    <div className="space-y-2">
      {/* Primary Action Button: Notify Me */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full py-4 px-6 bg-[#C6FF00] hover:bg-[#F5F1E8] text-[#0A0A0A] font-display text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2.5 cursor-pointer font-bold shadow-[0_0_20px_rgba(198,255,0,0.2)]"
      >
        <Bell className="w-4 h-4 text-[#0A0A0A]" />
        <span>NOTIFY ME WHEN LIVE // {selectedSize}</span>
      </button>

      {/* Disabled Add to Cart placeholder showing locked status */}
      <button
        type="button"
        disabled
        className="w-full py-3 px-6 bg-[#141414] text-[#8A8A8A] border border-[#1C1C1C] font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed"
      >
        <Lock className="w-3.5 h-3.5 text-[#8A8A8A]" />
        <span>DROP 001 NOT LIVE YET — CART LOCKED</span>
      </button>

      {/* Email Capture Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#0E0E0E] border border-[#1C1C1C] p-6 shadow-2xl relative">
            <div className="text-center space-y-2 mb-5">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#C6FF00]">
                EARLY ACCESS PRIORITY
              </span>
              <h3 className="font-display text-2xl uppercase tracking-tight text-[#F5F1E8]">
                JOIN DROP 001 RADAR
              </h3>
              <p className="text-xs font-mono text-[#8A8A8A] leading-relaxed">
                Be the first to know when <strong className="text-[#F5F1E8]">{productName}</strong> ({selectedSize}) goes live. Stock is strictly limited.
              </p>
            </div>

            {isSubmitted ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2 text-center">
                <div className="w-10 h-10 rounded-full bg-[#C6FF00]/10 border border-[#C6FF00] flex items-center justify-center text-[#C6FF00]">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="font-display text-base text-[#F5F1E8] uppercase tracking-wide">
                  RADAR LOCKED
                </h4>
                <p className="text-xs font-mono text-[#8A8A8A]">
                  You will receive SMS / Email priority 15 minutes before public drop.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#1C1C1C] focus:border-[#C6FF00] text-xs font-mono text-[#F5F1E8] outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-[#C6FF00] hover:bg-[#F5F1E8] text-[#0A0A0A] font-display text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer"
                >
                  SET DROP 001 ALERT
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2 text-center font-mono text-[11px] text-[#8A8A8A] hover:text-[#F5F1E8] uppercase tracking-wider cursor-pointer"
                >
                  DISMISS
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotifyMeButton;
