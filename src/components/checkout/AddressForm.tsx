'use client';

import React, { useState } from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { IndianStates, type ShippingAddress } from '@/lib/validation/checkout';

interface AddressFormProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
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

export function AddressForm({ register, setValue, errors }: AddressFormProps) {
  const [sameAsShipping, setSameAsShipping] = useState(true);

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
    <div className="border border-[#1C1C1C] bg-[#0A0A0A] p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
        <h2 className="font-display text-xl uppercase tracking-wider text-[#F5F1E8]">
          02 // SHIPPING DESTINATION
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
        <div className="pt-2">
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

          {!sameAsShipping && (
            <div className="mt-3 p-3.5 bg-[#141414] border border-[#262626] text-[11px] text-[#8A8A8A]">
              GST invoice will be generated matching the customer name and contact details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
