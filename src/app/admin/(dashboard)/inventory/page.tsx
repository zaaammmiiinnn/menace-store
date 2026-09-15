import React from 'react';
import { getInventory } from '@/lib/admin/queries';
import { InventoryTable } from '@/components/admin/InventoryTable';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminInventoryPage() {
  const variants = await getInventory();

  const lowStockCount = variants.filter((v: any) => v.stock < 10).length;
  const outOfStockCount = variants.filter((v: any) => v.stock === 0).length;
  const totalUnits = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F5F1E8]">Inventory Tracker</h1>
        <p className="text-[13px] text-[#8A8A8A] font-mono mt-0.5">
          Real-time stock counts by size SKU, inline adjusters, and low-inventory warnings.
        </p>
      </div>

      {/* Summary Chips */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="px-3.5 py-1.5 rounded bg-[#121212] border border-[#262626] text-[12px] font-mono text-[#8A8A8A]">
          Total Stock Units:{' '}
          <span className="text-[#F5F1E8] font-bold tabular-nums">{totalUnits}</span>
        </div>
        <div className="px-3.5 py-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-[12px] font-mono text-amber-400">
          Low Stock (&lt;10): <span className="font-bold tabular-nums">{lowStockCount}</span>
        </div>
        <div className="px-3.5 py-1.5 rounded bg-red-500/10 border border-red-500/30 text-[12px] font-mono text-red-400">
          Out of Stock: <span className="font-bold tabular-nums">{outOfStockCount}</span>
        </div>
      </div>

      <InventoryTable variants={variants} />
    </div>
  );
}
