'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShieldCheck, ArrowRight, Tag, Check } from 'lucide-react';
import { useCart, FREE_SHIPPING_THRESHOLD_INR, type CartItem } from '@/lib/store/cart';
import { useCartStore } from '@/store/cart-store';
import { useUiStore } from '@/store/ui-store';
import { playClickSound, playConfettiSound } from '@/lib/sound';

interface CartSummaryProps {
  onContinue?: () => void;
  collapsible?: boolean;
}

export function CartSummary({ onContinue, collapsible = false }: CartSummaryProps) {
  const {
    items,
    updateQuantity,
    removeItem,
    getSubtotal,
    getShippingFee,
    getTotal,
    getFreeShippingDifference,
  } = useCart();
  const {
    promoCode,
    discountType,
    discountValue,
    getDiscountAmount,
    applyPromoCode,
    removePromoCode,
  } = useCartStore();

  const showToast = useUiStore((state) => state.showToast);
  const triggerConfetti = useUiStore((state) => state.triggerConfetti);

  const [promoInput, setPromoInput] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim() || isApplyingPromo) return;

    setIsApplyingPromo(true);
    setPromoMessage(null);
    const result = await applyPromoCode(promoInput.trim());
    setIsApplyingPromo(false);

    if (result.success) {
      playConfettiSound();
      triggerConfetti();
      showToast(result.message);
      setPromoInput('');
      setPromoMessage({ text: result.message, type: 'success' });
    } else {
      playClickSound();
      showToast(result.message);
      setPromoMessage({ text: result.message, type: 'error' });
    }
  };

  const handleRemovePromo = () => {
    playClickSound();
    removePromoCode();
    setPromoMessage(null);
    showToast('Promo code removed.');
  };

  const subtotal = getSubtotal();
  const shippingFee = getShippingFee();
  const total = getTotal();
  const promoDiscount = getDiscountAmount();
  const diff = getFreeShippingDifference();
  const progressPercent = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD_INR) * 100)
  );

  if (items.length === 0) {
    return (
      <div className="p-8 rounded-none border border-[#1C1C1C] bg-[#0A0A0A] text-center space-y-4">
        <span className="font-mono text-xs uppercase tracking-widest text-[#8A8A8A]">
          // BAG IS CURRENTLY EMPTY
        </span>
        <h3 className="font-display text-2xl uppercase text-[#F5F1E8]">NO PIECES SELECTED</h3>
        <p className="font-sans text-xs text-[#8A8A8A] max-w-sm mx-auto">
          Explore Drop 001 silhouettes in 240 GSM waffle knit before allocation runs out.
        </p>
        <Link
          href="/shop"
          className="inline-block px-6 py-3 bg-[#C6FF00] text-[#0A0A0A] font-mono text-xs font-bold uppercase tracking-widest hover:bg-[#b0e600] transition-colors"
        >
          EXPLORE CATALOG
        </Link>
      </div>
    );
  }

  return (
    <div className="border border-[#1C1C1C] bg-[#0A0A0A] p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
        <h2 className="font-display text-xl uppercase tracking-wider text-[#F5F1E8]">
          CART SUMMARY ({items.length})
        </h2>
        <span className="text-[10px] font-mono uppercase text-[#C6FF00] bg-[#C6FF00]/10 px-2 py-0.5 border border-[#C6FF00]/20">
          DROP 001 ALLOCATION
        </span>
      </div>

      {/* Free shipping threshold progress bar */}
      <div className="p-3.5 bg-[#141414] border border-[#222222] space-y-2">
        <div className="flex justify-between text-[11px] font-mono">
          {diff === 0 ? (
            <span className="text-[#C6FF00] font-bold">
              ✓ QUALIFIED FOR FREE EXPRESS DISPATCH
            </span>
          ) : (
            <span className="text-[#F5F1E8]">
              Add <span className="text-[#C6FF00] font-bold">₹{diff.toLocaleString('en-IN')}</span> more for FREE Express Shipping
            </span>
          )}
          <span className="text-[#8A8A8A]">{progressPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#262626] overflow-hidden">
          <div
            className="h-full bg-[#C6FF00] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-4 divide-y divide-[#1C1C1C]">
        {items.map((item) => (
          <div key={item.variantId} className="pt-4 first:pt-0 flex gap-4 items-start">
            {/* Thumbnail */}
            <div className="w-20 h-24 sm:w-24 sm:h-28 bg-[#141414] border border-[#222222] shrink-0 overflow-hidden relative">
              <img
                src={item.imageUrl || '/products/placeholder.svg'}
                alt={item.name}
                className="w-full h-full object-contain p-1 object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/products/placeholder.svg';
                }}
              />
              {item.customArtworkUrl && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-1.5 backdrop-blur-[1px]">
                  <img
                    src={item.customArtworkUrl}
                    alt="Custom Print Artwork"
                    className="max-w-[85%] max-h-[85%] object-contain drop-shadow"
                  />
                </div>
              )}
            </div>

            {/* Meta */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex justify-between items-start gap-2">
                <h4 className="font-display text-sm sm:text-base uppercase text-[#F5F1E8] truncate">
                  {item.name}
                </h4>
                <span className="font-mono text-sm font-bold text-[#F5F1E8] shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Edition Badge */}
              {item.edition === 'plain' && (
                <span className="inline-block text-[9px] font-mono uppercase bg-[#1A1A1A] text-[#8A8A8A] px-1.5 py-0.5 border border-[#333333]">
                  RAW PLAIN BLANK
                </span>
              )}
              {item.edition === 'custom' && (
                <div className="space-y-0.5">
                  <span className="inline-block text-[9px] font-mono uppercase bg-[#C6FF00]/10 text-[#C6FF00] px-1.5 py-0.5 border border-[#C6FF00]/30 font-bold">
                    CUSTOM PRINT // {item.customPlacement?.replace('_', ' ').toUpperCase() || 'FRONT'}
                  </span>
                  {item.customQuoteText && (
                    <p className="text-[10px] font-mono text-[#F5F1E8] font-bold">
                      QUOTE: "{item.customQuoteText}"
                    </p>
                  )}
                </div>
              )}


              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-[#8A8A8A]">
                <span className="px-1.5 py-0.5 bg-[#141414] border border-[#262626] uppercase">
                  COLOR: {item.color}
                </span>
                <span className="px-1.5 py-0.5 bg-[#141414] border border-[#262626] uppercase">
                  SIZE: {item.size}
                </span>
                <span>@ ₹{item.price.toLocaleString('en-IN')}</span>
              </div>


              {/* Quantity controls + remove */}
              <div className="flex items-center justify-between pt-2">
                <div className="inline-flex items-center border border-[#262626] bg-[#141414]">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center text-[#8A8A8A] hover:text-[#F5F1E8] hover:bg-[#202020] transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center text-xs font-mono font-bold text-[#F5F1E8]">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-[#8A8A8A] hover:text-[#F5F1E8] hover:bg-[#202020] transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.variantId)}
                  className="text-[#8A8A8A] hover:text-red-400 p-1 transition-colors cursor-pointer"
                  title="Remove from bag"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Promo Code Box in Cart Summary */}
      <div className="pt-4 border-t border-[#1C1C1C] space-y-2">
        <label className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A] font-bold flex items-center justify-between">
          <span>PROMO CODE / VOUCHER</span>
          {promoCode && (
            <span className="text-[#C6FF00] font-normal flex items-center gap-1">
              <Check size={11} /> APPLIED
            </span>
          )}
        </label>

        {promoCode ? (
          <div className="flex items-center justify-between p-2.5 bg-[#141414] border border-[#C6FF00]/40">
            <div className="flex items-center gap-2 text-xs font-mono">
              <Tag size={13} className="text-[#C6FF00] shrink-0" />
              <div>
                <span className="font-bold text-[#C6FF00] uppercase tracking-wider">{promoCode}</span>
                <span className="text-[10px] text-[#8A8A8A] ml-2">
                  ({discountType === 'fixed' ? `₹${discountValue} OFF` : `${discountValue}% OFF`})
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemovePromo}
              className="text-[10px] font-mono text-[#8A8A8A] hover:text-red-400 uppercase tracking-wider cursor-pointer underline flex items-center gap-1"
            >
              <Trash2 size={11} /> REMOVE
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyPromo} className="space-y-1.5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value.toUpperCase());
                    setPromoMessage(null);
                  }}
                  placeholder="ENTER PROMO (e.g. MENANCE10)"
                  className="w-full bg-[#141414] border border-[#242424] focus:border-[#C6FF00] text-[#F5F1E8] text-xs font-mono pl-8 pr-2.5 py-2 uppercase outline-none placeholder:text-[#555]"
                />
              </div>
              <button
                type="submit"
                disabled={isApplyingPromo || !promoInput.trim()}
                className="px-4 py-2 bg-[#222222] hover:bg-[#C6FF00] text-[#F5F1E8] hover:text-[#0A0A0A] font-mono text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                {isApplyingPromo ? '...' : 'APPLY'}
              </button>
            </div>
            {promoMessage && (
              <p
                className={`text-[10px] font-mono ${
                  promoMessage.type === 'success' ? 'text-[#C6FF00]' : 'text-red-400'
                }`}
              >
                {promoMessage.text}
              </p>
            )}
          </form>
        )}
      </div>

      {/* Financial breakdown */}
      <div className="pt-4 border-t border-[#1C1C1C] space-y-2.5 font-mono text-xs">
        <div className="flex justify-between text-[#8A8A8A]">
          <span>SUBTOTAL</span>
          <span className="text-[#F5F1E8]">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-[#8A8A8A]">
          <span>ESTIMATED SHIPPING</span>
          <span className={shippingFee === 0 ? 'text-[#C6FF00] font-bold' : 'text-[#F5F1E8]'}>
            {shippingFee === 0 ? 'FREE' : `₹${shippingFee.toLocaleString('en-IN')}`}
          </span>
        </div>
        {promoDiscount > 0 && (
          <div className="flex justify-between text-[#C6FF00]">
            <span>
              PROMO ({promoCode}{' '}
              {discountType === 'fixed'
                ? `₹${discountValue} OFF`
                : `${discountValue}% OFF`})
            </span>
            <span>-₹{promoDiscount.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-bold text-[#F5F1E8] pt-2 border-t border-[#1C1C1C]">
          <span>BAG TOTAL</span>
          <span className="text-[#C6FF00]">₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {onContinue && (
        <button
          type="button"
          onClick={onContinue}
          className="w-full h-12 bg-[#161616] hover:bg-[#222222] border border-[#262626] hover:border-[#C6FF00] text-[#F5F1E8] font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>PROCEED TO SHIPPING DETAILS</span>
          <ArrowRight size={14} className="text-[#C6FF00]" />
        </button>
      )}
    </div>
  );
}
