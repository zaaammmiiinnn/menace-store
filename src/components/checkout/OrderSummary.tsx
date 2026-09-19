'use client';

import React, { useState } from 'react';
import { Lock, ShieldCheck, ArrowRight, Banknote, PackageCheck, Tag, Check, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { useCartStore } from '@/store/cart-store';
import { useUiStore } from '@/store/ui-store';
import { playClickSound, playConfettiSound } from '@/lib/sound';

interface OrderSummaryProps {
  isProcessing: boolean;
  onSubmit: (e?: React.FormEvent) => void;
  error?: string | null;
  paymentMethod?: 'prepaid' | 'cod';
  onSelectPaymentMethod?: (method: 'prepaid' | 'cod') => void;
}

export function OrderSummary({
  isProcessing,
  onSubmit,
  error,
  paymentMethod = 'prepaid',
  onSelectPaymentMethod,
}: OrderSummaryProps) {
  const { items, getSubtotal, getShippingFee, getTotal } = useCart();
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

  const subtotal = getSubtotal();
  const shippingFee = getShippingFee();
  const total = getTotal();
  const promoDiscount = getDiscountAmount();

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

  return (
    <div className="border border-[#1C1C1C] bg-[#0A0A0A] p-5 sm:p-6 space-y-6 lg:sticky lg:top-24">
      <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
        <h3 className="font-display text-xl uppercase tracking-wider text-[#F5F1E8]">
          ORDER SUMMARY
        </h3>
        <span className="text-[10px] font-mono text-[#C6FF00] bg-[#C6FF00]/10 px-2 py-0.5 border border-[#C6FF00]/20 uppercase">
          LIVE BREAKDOWN
        </span>
      </div>

      {/* Mini item list */}
      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex items-center justify-between text-xs font-mono text-[#8A8A8A]"
          >
            <span className="truncate max-w-[200px] text-[#F5F1E8]">
              {item.name} <span className="text-[#8A8A8A]">({item.size}) x{item.quantity}</span>
            </span>
            <span className="shrink-0 text-[#F5F1E8]">
              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>

      {/* Promo / Coupon Code Input Box in Sidebar */}
      <div className="border-t border-[#1C1C1C] pt-4 space-y-2">
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

      {/* Price totals */}
      <div className="border-t border-[#1C1C1C] pt-4 space-y-2.5 font-mono text-xs">
        <div className="flex justify-between text-[#8A8A8A]">
          <span>SUBTOTAL ({items.reduce((s, i) => s + i.quantity, 0)} ITEMS)</span>
          <span className="text-[#F5F1E8]">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-[#8A8A8A]">
          <span>SHIPPING</span>
          <span className={shippingFee === 0 ? 'text-[#C6FF00] font-bold' : 'text-[#F5F1E8]'}>
            {shippingFee === 0 ? 'FREE EXPRESS' : `₹${shippingFee.toLocaleString('en-IN')}`}
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

        <div className="border-t border-[#1C1C1C] pt-3 flex justify-between items-baseline">
          <div>
            <span className="font-display text-lg uppercase text-[#F5F1E8] block">
              TOTAL DUE
            </span>
            <span className="text-[9px] text-[#8A8A8A] uppercase">
              {paymentMethod === 'cod' ? 'CASH DUE ON DELIVERY' : 'INCL. ALL TAXES & DUTIES'}
            </span>
          </div>
          <span className="font-display text-2xl text-[#C6FF00]">
            ₹{total.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Payment Mode Selector Box (Always visible directly in sidebar) */}
      <div className="border-t border-[#1C1C1C] pt-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A] font-bold">
            SELECT PAYMENT MODE *
          </label>
          <span className="text-[9px] font-mono text-[#C6FF00] uppercase font-bold">
            {paymentMethod === 'cod' ? 'CASH ON DELIVERY' : 'PAY ONLINE'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Option 1: Pay Online */}
          <button
            type="button"
            onClick={() => onSelectPaymentMethod?.('prepaid')}
            className={`p-3 text-left border font-mono transition-all cursor-pointer ${
              paymentMethod === 'prepaid'
                ? 'border-[#C6FF00] bg-[#141414] shadow-[0_0_15px_rgba(198,255,0,0.15)] ring-1 ring-[#C6FF00]'
                : 'border-[#242424] bg-[#0E0E0E] hover:border-[#383838] opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-2 h-2 rounded-full ${paymentMethod === 'prepaid' ? 'bg-[#C6FF00]' : 'bg-[#444]'}`} />
              <span className="text-xs font-bold text-[#F5F1E8] uppercase">1. ONLINE</span>
            </div>
            <p className="text-[10px] text-[#8A8A8A] leading-tight">UPI, Cards (PayU)</p>
          </button>

          {/* Option 2: COD */}
          <button
            type="button"
            onClick={() => onSelectPaymentMethod?.('cod')}
            className={`p-3 text-left border font-mono transition-all cursor-pointer ${
              paymentMethod === 'cod'
                ? 'border-[#C6FF00] bg-[#141414] shadow-[0_0_15px_rgba(198,255,0,0.15)] ring-1 ring-[#C6FF00]'
                : 'border-[#242424] bg-[#0E0E0E] hover:border-[#383838] opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-2 h-2 rounded-full ${paymentMethod === 'cod' ? 'bg-[#C6FF00]' : 'bg-[#444]'}`} />
              <span className="text-xs font-bold text-[#F5F1E8] uppercase">2. COD</span>
            </div>
            <p className="text-[10px] text-[#8A8A8A] leading-tight">Pay Cash at Door</p>
          </button>
        </div>
      </div>

      {/* Error alert directly in Order Summary */}
      {error && (
        <div className="p-3 bg-red-950/60 border border-red-500 text-red-200 font-mono text-xs leading-relaxed">
          <p className="font-bold uppercase mb-1 text-red-400">⚠️ Required Info Missing:</p>
          {error}
        </div>
      )}

      {/* Primary CTA button */}
      <div>
        <button
          type="button"
          onClick={() => onSubmit()}
          disabled={items.length === 0 || isProcessing}
          className="w-full h-14 bg-[#C6FF00] hover:bg-[#b5eb00] text-[#0A0A0A] font-mono text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(198,255,0,0.15)]"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
              <span>{paymentMethod === 'cod' ? 'CONFIRMING COD ORDER...' : 'CONNECTING TO PAYU...'}</span>
            </span>
          ) : paymentMethod === 'cod' ? (
            <span className="flex items-center gap-2">
              <PackageCheck size={16} />
              <span>CONFIRM CASH ON DELIVERY</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>PAY ONLINE VIA PAYU</span>
              <ArrowRight size={14} />
            </span>
          )}
        </button>

        <p className="mt-3 text-center text-[10px] font-mono text-[#8A8A8A] leading-relaxed">
          {paymentMethod === 'cod'
            ? `Pay ₹${total.toLocaleString('en-IN')} in cash upon parcel delivery. 100% verified courier dispatch.`
            : '100% Secure live payment via PayU portal. Instant dispatch.'}
        </p>
      </div>

      {/* Security guarantees */}
      <div className="border-t border-[#1C1C1C] pt-4 space-y-2 font-mono text-[10px] text-[#666]">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-[#C6FF00]" />
          <span>256-bit bank-grade SSL encrypted gateway</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock size={14} className="text-[#C6FF00]" />
          <span>Payment details never stored on server</span>
        </div>
      </div>
    </div>
  );
}
