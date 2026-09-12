import React from 'react';
import { getDiscounts } from '@/lib/admin/queries';
import { DiscountsManager } from '@/components/admin/DiscountsManager';

export default async function AdminDiscountsPage() {
  const discounts = await getDiscounts();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F5F1E8]">Discount Codes</h1>
        <p className="text-[13px] text-[#8A8A8A] font-mono mt-0.5">
          Create percentage and fixed INR coupons, track redemptions, and control expiration.
        </p>
      </div>

      <DiscountsManager discounts={discounts} />
    </div>
  );
}
