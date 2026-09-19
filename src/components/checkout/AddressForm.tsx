import React, { useState } from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { IndianStates, type CreateOrderInput } from '@/lib/validation/checkout';
import { CreditCard, Banknote, ShieldCheck, Zap, Info, CheckCircle2 } from 'lucide-react';

interface AddressFormProps {
  register: UseFormRegister<CreateOrderInput>;
  setValue: UseFormSetValue<CreateOrderInput>;
  watch?: UseFormWatch<CreateOrderInput>;
  errors: FieldErrors<CreateOrderInput>;
}

// 2-digit PIN code prefix mapper for major Indian cities
const PINCODE_MAP: Record<string, { city: string; state: string }> = {
  '11': { city: 'New Delhi', state: 'Delhi' },
  '12': { city: 'Gurugram', state: 'Haryana' },
  '13': { city: 'Faridabad', state: 'Haryana' },
  '14': { city: 'Ludhiana', state: 'Punjab' },
  '16': { city: 'Chandigarh', state: 'Punjab' },
  '20': { city: 'Noida', state: 'Uttar Pradesh' },
  '22': { city: 'Lucknow', state: 'Uttar Pradesh' },
  '30': { city: 'Jaipur', state: 'Rajasthan' },
  '38': { city: 'Ahmedabad', state: 'Gujarat' },
  '39': { city: 'Surat', state: 'Gujarat' },
  '40': { city: 'Mumbai', state: 'Maharashtra' },
  '41': { city: 'Pune', state: 'Maharashtra' },
  '44': { city: 'Nagpur', state: 'Maharashtra' },
  '50': { city: 'Hyderabad', state: 'Telangana' },
  '56': { city: 'Bengaluru', state: 'Karnataka' },
  '57': { city: 'Mangalore', state: 'Karnataka' },
  '60': { city: 'Chennai', state: 'Tamil Nadu' },
  '64': { city: 'Coimbatore', state: 'Tamil Nadu' },
  '68': { city: 'Kochi', state: 'Kerala' },
  '70': { city: 'Kolkata', state: 'West Bengal' },
};

export function AddressForm({ register, setValue, watch, errors }: AddressFormProps) {
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const selectedMethod = watch ? watch('paymentMethod') || 'prepaid' : 'prepaid';

  const handlePincodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 6);
    setValue('shipping.pincode', rawVal, { shouldValidate: true });

    if (rawVal.length >= 2) {
      const prefix = rawVal.substring(0, 2);
      if (PINCODE_MAP[prefix]) {
        setValue('shipping.city', PINCODE_MAP[prefix].city, { shouldValidate: true });
        setValue('shipping.state', PINCODE_MAP[prefix].state, { shouldValidate: true });
      }
    }
  };

  return (
    <div className="border border-[#1C1C1C] bg-[#0A0A0A] p-5 sm:p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
        <h2 className="font-display text-xl uppercase tracking-wider text-[#F5F1E8]">
          02 // SHIPPING & PAYMENT
        </h2>
        <span className="text-[10px] font-mono text-[#8A8A8A] uppercase">
          PAN-INDIA COURIER
        </span>
      </div>

      <div className="space-y-4 font-mono text-xs">
        {/* Line 1 */}
        <div>
          <label className="block text-[10px] text-[#8A8A8A] uppercase tracking-wider mb-1.5">
            Address Line 1 * (House/Flat No., Building, Street)
          </label>
          <input
            type="text"
            placeholder="FLAT 402, HORIZON TOWERS, BANDRA WEST"
            {...register('shipping.line1')}
            className={`w-full bg-[#121212] border px-3.5 py-3 text-xs text-[#F5F1E8] placeholder-[#444444] rounded-none outline-none transition-colors ${
              errors?.shipping && (errors.shipping as any)?.line1
                ? 'border-red-500'
                : 'border-[#262626] focus:border-[#C6FF00]'
            }`}
          />
          {errors?.shipping && (errors.shipping as any)?.line1 && (
            <p className="text-[10px] text-red-400 mt-1 font-mono">
              {(errors.shipping as any).line1.message}
            </p>
          )}
        </div>

        {/* Line 2 */}
        <div>
          <label className="block text-[10px] text-[#8A8A8A] uppercase tracking-wider mb-1.5">
            Address Line 2 (Apartment, Suite, Landmark — Optional)
          </label>
          <input
            type="text"
            placeholder="NEAR CARTER ROAD PROMENADE"
            {...register('shipping.line2')}
            className="w-full bg-[#121212] border border-[#262626] focus:border-[#C6FF00] px-3.5 py-3 text-xs text-[#F5F1E8] placeholder-[#444444] rounded-none outline-none transition-colors"
          />
        </div>

        {/* PIN code, City, State Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* PIN Code */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] text-[#8A8A8A] uppercase tracking-wider">
                PIN Code *
              </label>
              <span className="text-[9px] text-[#C6FF00] uppercase">Auto-Lookup</span>
            </div>
            <input
              type="text"
              maxLength={6}
              placeholder="400050"
              {...register('shipping.pincode')}
              onChange={handlePincodeInput}
              className={`w-full bg-[#121212] border px-3.5 py-3 text-xs text-[#F5F1E8] placeholder-[#444444] rounded-none outline-none transition-colors ${
                errors?.shipping && (errors.shipping as any)?.pincode
                  ? 'border-red-500'
                  : 'border-[#262626] focus:border-[#C6FF00]'
              }`}
            />
            {errors?.shipping && (errors.shipping as any)?.pincode && (
              <p className="text-[10px] text-red-400 mt-1 font-mono">
                {(errors.shipping as any).pincode.message}
              </p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-[10px] text-[#8A8A8A] uppercase tracking-wider mb-1.5">
              City *
            </label>
            <input
              type="text"
              placeholder="MUMBAI"
              {...register('shipping.city')}
              className={`w-full bg-[#121212] border px-3.5 py-3 text-xs text-[#F5F1E8] placeholder-[#444444] rounded-none outline-none transition-colors ${
                errors?.shipping && (errors.shipping as any)?.city
                  ? 'border-red-500'
                  : 'border-[#262626] focus:border-[#C6FF00]'
              }`}
            />
            {errors?.shipping && (errors.shipping as any)?.city && (
              <p className="text-[10px] text-red-400 mt-1 font-mono">
                {(errors.shipping as any).city.message}
              </p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="block text-[10px] text-[#8A8A8A] uppercase tracking-wider mb-1.5">
              State *
            </label>
            <select
              {...register('shipping.state')}
              className={`w-full bg-[#121212] border px-3.5 py-3 text-xs text-[#F5F1E8] rounded-none outline-none transition-colors cursor-pointer ${
                errors?.shipping && (errors.shipping as any)?.state
                  ? 'border-red-500'
                  : 'border-[#262626] focus:border-[#C6FF00]'
              }`}
            >
              <option value="">SELECT STATE</option>
              {IndianStates.map((st) => (
                <option key={st} value={st} className="bg-[#141414] text-[#F5F1E8]">
                  {st}
                </option>
              ))}
            </select>
            {errors?.shipping && (errors.shipping as any)?.state && (
              <p className="text-[10px] text-red-400 mt-1 font-mono">
                {(errors.shipping as any).state.message}
              </p>
            )}
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="block text-[10px] text-[#8A8A8A] uppercase tracking-wider mb-1.5">
            Country
          </label>
          <input
            type="text"
            readOnly
            value="India"
            {...register('shipping.country')}
            className="w-full bg-[#181818] border border-[#262626] px-3.5 py-3 text-xs text-[#8A8A8A] rounded-none outline-none cursor-not-allowed uppercase"
          />
        </div>

        {/* Billing same as shipping checkbox */}
        <div className="pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sameAsShipping}
              onChange={(e) => setSameAsShipping(e.target.checked)}
              className="accent-[#C6FF00] w-4 h-4 rounded-none bg-[#121212] border-[#262626]"
            />
            <span className="text-xs text-[#8A8A8A] uppercase tracking-wider">
              Billing address is same as shipping destination
            </span>
          </label>
        </div>

        {/* --- PAYMENT OPTIONS (IMMEDIATELY AFTER ADDRESS) --- */}
        <div className="pt-6 mt-6 border-t border-[#1C1C1C] space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono font-bold text-[#F5F1E8] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C6FF00]" />
              <span>CHOOSE PAYMENT MODE *</span>
            </div>
            <span className="text-[10px] font-mono text-[#C6FF00] bg-[#C6FF00]/10 px-2 py-0.5 border border-[#C6FF00]/20 uppercase font-bold">
              2 OPTIONS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Pay Online */}
            <div
              onClick={() => setValue('paymentMethod', 'prepaid', { shouldValidate: true })}
              className={`p-4 border transition-all cursor-pointer select-none relative ${
                selectedMethod === 'prepaid'
                  ? 'border-[#C6FF00] bg-[#141414] shadow-[0_0_20px_rgba(198,255,0,0.12)]'
                  : 'border-[#242424] bg-[#0C0C0C] hover:border-[#383838] hover:bg-[#111111]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    selectedMethod === 'prepaid'
                      ? 'border-[#C6FF00] bg-[#C6FF00]'
                      : 'border-[#444] bg-[#161616]'
                  }`}
                >
                  {selectedMethod === 'prepaid' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F5F1E8] uppercase tracking-wider">
                      1. PAY ONLINE
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#C6FF00] text-[#0A0A0A] uppercase">
                      PAYU
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8A8A8A]">
                    UPI (GPay / PhonePe), Cards, NetBanking. Instant dispatch.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Cash on Delivery (COD) */}
            <div
              onClick={() => setValue('paymentMethod', 'cod', { shouldValidate: true })}
              className={`p-4 border transition-all cursor-pointer select-none relative ${
                selectedMethod === 'cod'
                  ? 'border-[#C6FF00] bg-[#141414] shadow-[0_0_20px_rgba(198,255,0,0.12)]'
                  : 'border-[#242424] bg-[#0C0C0C] hover:border-[#383838] hover:bg-[#111111]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    selectedMethod === 'cod'
                      ? 'border-[#C6FF00] bg-[#C6FF00]'
                      : 'border-[#444] bg-[#161616]'
                  }`}
                >
                  {selectedMethod === 'cod' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F5F1E8] uppercase tracking-wider">
                      2. CASH ON DELIVERY
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#1F1F1F] text-[#F5F1E8] border border-[#333] uppercase">
                      COD
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8A8A8A]">
                    Pay in cash upon parcel delivery at your doorstep.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Context Advisory Notice */}
          {selectedMethod === 'cod' ? (
            <div className="p-3 bg-[#131313] border border-[#C6FF00]/40 text-[11px] text-[#8A8A8A] flex items-start gap-2.5">
              <Banknote size={15} className="text-[#C6FF00] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#F5F1E8] font-bold uppercase block mb-0.5">
                  CASH ON DELIVERY (COD) SELECTED
                </span>
                Your order will be booked directly without online prepayment. Please keep exact cash ready for the courier partner at delivery.
              </div>
            </div>
          ) : (
            <div className="p-3 bg-[#131313] border border-[#262626] text-[11px] text-[#8A8A8A] flex items-start gap-2.5">
              <ShieldCheck size={15} className="text-[#C6FF00] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#F5F1E8] font-bold uppercase block mb-0.5">
                  ONLINE PAYMENT SELECTED
                </span>
                Clicking Proceed will securely open the PayU payment portal for fast, zero-fee UPI, Debit/Credit Card, or NetBanking checkout.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

