'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Trash2, Plus, Minus, Tag, Check, ArrowRight } from 'lucide-react';
import { useCartStore, FREE_SHIPPING_THRESHOLD_INR } from '@/store/cart-store';
import { useUiStore } from '@/store/ui-store';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { playClickSound, playAddCartSound, playConfettiSound } from '@/lib/sound';

export function CartDrawer() {
  const {
    isOpen,
    items,
    closeCart,
    updateQuantity,
    removeItem,
    cartTotal,
    cartCount,
    getFormattedPrice,
    promoCode,
    discountPercent,
    applyPromoCode,
    removePromoCode,
    getTotal,
    getDiscountAmount,
  } = useCartStore();

  const showToast = useUiStore((state) => state.showToast);
  const triggerConfetti = useUiStore((state) => state.triggerConfetti);
  const shouldReduceMotion = useReducedMotion();

  const [inputCode, setInputCode] = useState('');
  const [promoError, setPromoError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const success = applyPromoCode(inputCode.trim());
    if (success) {
      playConfettiSound();
      triggerConfetti();
      showToast(`Promo ${inputCode.toUpperCase()} applied!`);
      setInputCode('');
      setPromoError(false);
    } else {
      playClickSound();
      setPromoError(true);
      showToast('Invalid promo code. Try MENACE10 or VIP20');
    }
  };

  const freeShippingProgress = Math.min(100, Math.round((cartTotal / FREE_SHIPPING_THRESHOLD_INR) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD_INR - cartTotal);

  const drawerVariants = {
    closed: { 
      x: '100%', 
      transition: { 
        duration: shouldReduceMotion ? 0 : 0.35, 
        ease: [0.76, 0, 0.24, 1] as [number, number, number, number] 
      } 
    },
    open: { 
      x: 0, 
      transition: { 
        duration: shouldReduceMotion ? 0 : 0.45, 
        ease: [0.76, 0, 0.24, 1] as [number, number, number, number] 
      } 
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-base-black/75 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            key="drawer"
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-surface-elevated border-l border-border shadow-2xl sm:max-w-md"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping Bag"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl tracking-wide uppercase text-off-white">
                  YOUR BAG
                </h2>
                <span className="text-xs font-mono font-bold bg-acid-green text-base-black px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-muted-grey hover:text-acid-green transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Free Shipping Progress Meter */}
            <div className="px-6 py-3 bg-base-black border-b border-border/70">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-off-white font-bold">
                  {remainingForFreeShipping === 0
                    ? '🎉 FREE SHIPPING UNLOCKED!'
                    : `Add ${getFormattedPrice(remainingForFreeShipping)} for FREE Shipping`}
                </span>
                <span className="text-muted-grey">{freeShippingProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-acid-green"
                  initial={{ width: 0 }}
                  animate={{ width: `${freeShippingProgress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center space-y-5 py-12">
                  <div className="w-16 h-16 rounded-full border border-dashed border-muted-grey/40 flex items-center justify-center text-muted-grey">
                    <X size={28} />
                  </div>
                  <div>
                    <p className="font-display text-2xl tracking-wide text-off-white uppercase">
                      NOTHING HERE YET.
                    </p>
                    <p className="font-mono text-xs text-muted-grey mt-1">
                      Start building your rotation.
                    </p>
                  </div>
                  <Link href="/shop" onClick={closeCart}>
                    <MagneticButton variant="primary" size="md">
                      EXPLORE TEES
                    </MagneticButton>
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => {
                    const colorway = item.product.colorways.find((c) => c.name === item.color) || item.product.colorways[0];
                    return (
                      <li
                        key={item.id}
                        className="flex gap-4 p-3 rounded-lg bg-surface border border-border/80 relative group"
                      >
                        {/* Mini Tee Visual Block */}
                        <div
                          className="h-20 w-16 shrink-0 rounded flex items-center justify-center relative overflow-hidden border border-white/10"
                          style={{ backgroundColor: colorway?.hex || '#1A1A1A' }}
                        >
                          <span 
                            className="font-display text-[9px] tracking-widest uppercase z-10"
                            style={{
                              color: colorway?.hex === '#0A0A0A' || colorway?.hex === '#1A1A1A' ? '#F5F1E8' : '#0A0A0A'
                            }}
                          >
                            MENACE
                          </span>
                        </div>

                        {/* Item Details */}
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <Link
                                href={`/shop/${item.product.slug}`}
                                onClick={closeCart}
                                className="font-display text-sm uppercase tracking-wide text-off-white hover:text-acid-green transition-colors line-clamp-1"
                              >
                                {item.product.name}
                              </Link>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[11px] font-mono text-muted-grey uppercase">
                                  {item.color}
                                </span>
                                <span className="text-muted-grey/40 text-xs">•</span>
                                <span className="text-[11px] font-mono text-acid-green font-bold uppercase">
                                  Size {item.size}
                                </span>
                              </div>
                            </div>
                            <span className="font-mono text-xs font-bold text-off-white whitespace-nowrap">
                              {getFormattedPrice(item.product.price * item.quantity)}
                            </span>
                          </div>

                          {/* Controls: Quantity and Delete */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border border-border rounded bg-base-black">
                              <button
                                onClick={() => {
                                  updateQuantity(item.product.id, item.color, item.size, item.quantity - 1);
                                  playClickSound();
                                }}
                                className="p-1.5 text-muted-grey hover:text-acid-green transition-colors cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="w-7 text-center text-xs font-mono text-off-white font-bold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => {
                                  updateQuantity(item.product.id, item.color, item.size, item.quantity + 1);
                                  playAddCartSound();
                                }}
                                className="p-1.5 text-muted-grey hover:text-acid-green transition-colors cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus size={13} />
                              </button>
                            </div>

                            <button
                              onClick={() => {
                                removeItem(item.product.id, item.color, item.size);
                                playClickSound();
                              }}
                              className="p-1.5 text-muted-grey hover:text-red-400 transition-colors cursor-pointer"
                              aria-label="Remove item"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer with Subtotal, Promo, and Checkout */}
            {items.length > 0 && (
              <div className="border-t border-border bg-base-black p-6 space-y-4">
                {/* Promo Code Form */}
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-grey" />
                    <input
                      type="text"
                      placeholder="Promo Code (e.g. MENACE10)"
                      value={inputCode}
                      onChange={(e) => {
                        setInputCode(e.target.value);
                        setPromoError(false);
                      }}
                      className={`w-full pl-8 pr-3 py-2 bg-surface text-xs font-mono text-off-white rounded border outline-none ${
                        promoError ? 'border-red-500' : 'border-border focus:border-acid-green'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-surface hover:bg-border text-xs font-display uppercase tracking-wider text-off-white rounded border border-border transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>

                {promoCode && (
                  <div className="flex items-center justify-between text-xs font-mono text-acid-green bg-acid-green/10 border border-acid-green/20 px-3 py-1.5 rounded">
                    <span className="flex items-center gap-1.5">
                      <Check size={13} /> {promoCode} ({discountPercent}% OFF)
                    </span>
                    <button
                      onClick={removePromoCode}
                      className="text-muted-grey hover:text-off-white text-[10px] uppercase underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Subtotal Calculation */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-mono text-muted-grey">
                    <span>Bag Subtotal</span>
                    <span>{getFormattedPrice(cartTotal)}</span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="flex justify-between text-xs font-mono text-acid-green">
                      <span>Discount ({discountPercent}%)</span>
                      <span>-{getFormattedPrice(getDiscountAmount())}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs font-mono text-muted-grey">
                    <span>Estimated Shipping</span>
                    <span>{remainingForFreeShipping === 0 ? 'FREE' : 'Calculated at checkout'}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="font-display text-lg tracking-wide uppercase text-off-white">
                      TOTAL
                    </span>
                    <span className="font-mono text-xl font-bold text-acid-green">
                      {getFormattedPrice(getTotal())}
                    </span>
                  </div>
                </div>

                {/* Proceed to Checkout CTA */}
                <Link href="/checkout" onClick={closeCart} className="block w-full">
                  <MagneticButton
                    variant="primary"
                    size="lg"
                    className="w-full flex items-center justify-center gap-2 text-base shadow-lg"
                  >
                    <span>CHECKOUT NOW</span>
                    <ArrowRight size={18} />
                  </MagneticButton>
                </Link>

                <div className="text-center">
                  <button
                    onClick={closeCart}
                    className="text-xs font-mono text-muted-grey hover:text-off-white transition-colors uppercase tracking-widest cursor-pointer"
                  >
                    ← Keep Browsing
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CartDrawer;
