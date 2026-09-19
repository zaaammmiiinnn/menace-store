'use client';

import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { CreditCard, Banknote, ShieldCheck, Zap, PackageCheck, Info, CheckCircle2 } from 'lucide-react';
import { CreateOrderInput } from '@/lib/validation/checkout';

interface PaymentMethodFormProps {
  register: UseFormRegister<CreateOrderInput>;
  setValue: UseFormSetValue<CreateOrderInput>;
  watch: UseFormWatch<CreateOrderInput>;
  errors?: FieldErrors<CreateOrderInput>;
}

export function PaymentMethodForm({
  register,
  setValue,
  watch,
  errors,
}: PaymentMethodFormProps) {
  const selectedMethod = watch('paymentMethod') || 'prepaid';

  const selectMethod = (method: 'prepaid' | 'cod') => {
    setValue('paymentMethod', method, { shouldValidate: true });
  };

  return (
    <div className="border border-[#1C1C1C] bg-[#0A0A0A] p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
        <h2 className="font-display text-xl uppercase tracking-wider text-[#F5F1E8]">
          03 // PAYMENT METHOD
        </h2>
        <span className="text-[10px] font-mono text-[#C6FF00] bg-[#C6FF00]/10 px-2 py-0.5 border border-[#C6FF00]/20 uppercase">
          CHOOSE SETTLEMENT
        </span>
      </div>

      <div className="space-y-3 font-mono">
        {/* Hidden Form Input Registration */}
        <input type="hidden" {...register('paymentMethod')} />

        {/* Option 1: Prepaid Online Payment */}
        <div
          onClick={() => selectMethod('prepaid')}
          className={`relative p-4 sm:p-5 border transition-all cursor-pointer select-none ${
            selectedMethod === 'prepaid'
              ? 'border-[#C6FF00] bg-[#141414] shadow-[0_0_20px_rgba(198,255,0,0.08)]'
              : 'border-[#222222] bg-[#0E0E0E] hover:border-[#333333] hover:bg-[#121212]'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              {/* Radio Indicator */}
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  selectedMethod === 'prepaid'
                    ? 'border-[#C6FF00] bg-[#C6FF00]'
                    : 'border-[#444444] bg-[#161616]'
                }`}
              >
                {selectedMethod === 'prepaid' && (
                  <div className="w-2 h-2 rounded-full bg-[#0A0A0A]" />
                )}
              </div>

              {/* Content */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-[#F5F1E8] uppercase tracking-wide">
                    ONLINE PAYMENT (PREPAID)
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-[#C6FF00] text-[#0A0A0A] uppercase tracking-wider">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-[11px] text-[#8A8A8A] leading-relaxed">
                  UPI (GPay, PhonePe, Paytm), Credit / Debit Cards, NetBanking, and Wallets via secure PayU gateway.
                </p>

                {/* Badges / Micro Perks */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px] text-[#8A8A8A]">
                  <span className="flex items-center gap-1 text-[#C6FF00]">
                    <Zap size={12} />
                    <span>Instant Order Confirmation</span>
                  </span>
                  <span className="flex items-center gap-1 text-[#8A8A8A]">
                    <ShieldCheck size={12} className="text-[#C6FF00]" />
                    <span>Zero Transaction Fee</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 hidden sm:flex items-center text-[#8A8A8A]">
              <CreditCard size={18} className={selectedMethod === 'prepaid' ? 'text-[#C6FF00]' : ''} />
            </div>
          </div>
        </div>

        {/* Option 2: Cash on Delivery (COD) */}
        <div
          onClick={() => selectMethod('cod')}
          className={`relative p-4 sm:p-5 border transition-all cursor-pointer select-none ${
            selectedMethod === 'cod'
              ? 'border-[#C6FF00] bg-[#141414] shadow-[0_0_20px_rgba(198,255,0,0.08)]'
              : 'border-[#222222] bg-[#0E0E0E] hover:border-[#333333] hover:bg-[#121212]'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              {/* Radio Indicator */}
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  selectedMethod === 'cod'
                    ? 'border-[#C6FF00] bg-[#C6FF00]'
                    : 'border-[#444444] bg-[#161616]'
                }`}
              >
                {selectedMethod === 'cod' && (
                  <div className="w-2 h-2 rounded-full bg-[#0A0A0A]" />
                )}
              </div>

              {/* Content */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-[#F5F1E8] uppercase tracking-wide">
                    CASH ON DELIVERY (COD)
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-[#1F1F1F] text-[#F5F1E8] border border-[#333333] uppercase tracking-wider">
                    PAY AT DOORSTEP
                  </span>
                </div>
                <p className="text-[11px] text-[#8A8A8A] leading-relaxed">
                  Pay with cash directly to the courier executive upon delivery at your shipping address.
                </p>

                {/* Badges / Micro Perks */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px] text-[#8A8A8A]">
                  <span className="flex items-center gap-1 text-[#C6FF00]">
                    <PackageCheck size={12} />
                    <span>Pay When Delivered</span>
                  </span>
                  <span className="flex items-center gap-1 text-[#8A8A8A]">
                    <CheckCircle2 size={12} className="text-[#C6FF00]" />
                    <span>7-Day Doorstep Exchange Valid</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 hidden sm:flex items-center text-[#8A8A8A]">
              <Banknote size={18} className={selectedMethod === 'cod' ? 'text-[#C6FF00]' : ''} />
            </div>
          </div>
        </div>

        {/* Informational callout for COD mode */}
        {selectedMethod === 'cod' && (
          <div className="p-3.5 bg-[#121212] border border-[#262626] flex items-start gap-2.5 text-[11px] text-[#8A8A8A]">
            <Info size={15} className="text-[#C6FF00] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[#F5F1E8] font-bold uppercase tracking-wider">
                CASH ON DELIVERY ADVISORY
              </p>
              <p>
                Please ensure exact cash amount is ready for the courier partner at the time of delivery. You will receive an SMS and email notification once your parcel is out for delivery.
              </p>
            </div>
          </div>
        )}

        {errors?.paymentMethod && (
          <p className="text-[10px] text-red-400 mt-1 font-mono">
            {errors.paymentMethod.message}
          </p>
        )}
      </div>
    </div>
  );
}
