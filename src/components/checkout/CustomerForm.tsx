'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { CustomerInfo } from '@/lib/validation/checkout';

interface CustomerFormProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export function CustomerForm({ register, errors }: CustomerFormProps) {
  return (
    <div className="border border-[#1C1C1C] bg-[#0A0A0A] p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
        <h2 className="font-display text-xl uppercase tracking-wider text-[#F5F1E8]">
          01 // CUSTOMER IDENTITY
        </h2>
        <span className="text-[10px] font-mono text-[#8A8A8A] uppercase">
          REQUIRED SPEC
        </span>
      </div>

      <div className="space-y-4 font-mono text-xs">
        {/* Full Name */}
        <div>
          <label className="block text-[10px] text-[#8A8A8A] uppercase tracking-wider mb-1.5">
            Full Name *
          </label>
          <input
            type="text"
            placeholder="KABIR VERMA"
            {...register('customer.name')}
            className={`w-full bg-[#121212] border px-3.5 py-3 text-xs text-[#F5F1E8] placeholder-[#444444] rounded-none outline-none transition-colors ${
              errors?.customer && (errors.customer as any)?.name
                ? 'border-red-500'
                : 'border-[#262626] focus:border-[#C6FF00]'
            }`}
          />
          {errors?.customer && (errors.customer as any)?.name && (
            <p className="text-[10px] text-red-400 mt-1 font-mono">
              {(errors.customer as any).name.message}
            </p>
          )}
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-[#8A8A8A] uppercase tracking-wider mb-1.5">
              Email Address * (For Dispatch Tracking)
            </label>
            <input
              type="email"
              placeholder="kabir@domain.com"
              {...register('customer.email')}
              className={`w-full bg-[#121212] border px-3.5 py-3 text-xs text-[#F5F1E8] placeholder-[#444444] rounded-none outline-none transition-colors ${
                errors?.customer && (errors.customer as any)?.email
                  ? 'border-red-500'
                  : 'border-[#262626] focus:border-[#C6FF00]'
              }`}
            />
            {errors?.customer && (errors.customer as any)?.email && (
              <p className="text-[10px] text-red-400 mt-1 font-mono">
                {(errors.customer as any).email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[10px] text-[#8A8A8A] uppercase tracking-wider mb-1.5">
              Mobile Number * (10 Digits / WhatsApp Updates)
            </label>
            <div className="relative flex">
              <span className="inline-flex items-center px-3 bg-[#181818] border border-r-0 border-[#262626] text-[#8A8A8A] text-xs font-mono select-none">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder="9876543210"
                {...register('customer.phone')}
                className={`w-full bg-[#121212] border px-3.5 py-3 text-xs text-[#F5F1E8] placeholder-[#444444] rounded-none outline-none transition-colors ${
                  errors?.customer && (errors.customer as any)?.phone
                    ? 'border-red-500'
                    : 'border-[#262626] focus:border-[#C6FF00]'
                }`}
              />
            </div>
            {errors?.customer && (errors.customer as any)?.phone && (
              <p className="text-[10px] text-red-400 mt-1 font-mono">
                {(errors.customer as any).phone.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
