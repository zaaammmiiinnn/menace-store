'use client';

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/admin/DataTable';
import { updateStockAction } from '@/lib/admin/actions';
import { toast } from 'sonner';
import { Plus, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface VariantRow {
  id: string;
  product_id: string;
  productName: string;
  productSlug: string;
  productPrice: number;
  sku: string;
  size: string;
  color: string;
  stock: number;
}

interface InventoryTableProps {
  variants: VariantRow[];
}

export function InventoryTable({ variants: initialVariants }: InventoryTableProps) {
  const [data, setData] = useState<VariantRow[]>(initialVariants);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAdjustStock = async (variantId: string, change: number) => {
    setLoadingId(variantId);
    try {
      const res = await updateStockAction(variantId, change, 'Inline stepper adjust');
      setData((prev) =>
        prev.map((v) => (v.id === variantId ? { ...v, stock: res.newStock } : v))
      );
      toast.success(`Stock updated (${change > 0 ? '+' : ''}${change}).`);
    } catch {
      toast.error('Failed to update stock.');
    } finally {
      setLoadingId(null);
    }
  };

  const columns: ColumnDef<VariantRow>[] = [
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-[#C6FF00] text-[12px]">
          {row.getValue('sku')}
        </span>
      ),
    },
    {
      accessorKey: 'productName',
      header: 'Silhouette',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-[#F5F1E8]">{row.original.productName}</div>
          <div className="text-[11px] font-mono text-[#666]">
            {row.original.color} • Size {row.original.size}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'stock',
      header: 'Units in Stock',
      cell: ({ row }) => {
        const stock = row.original.stock;
        const isOutOfStock = stock === 0;
        const isLow = stock > 0 && stock < 10;

        return (
          <div className="flex items-center gap-2 font-mono">
            <span
              className={`px-2 py-0.5 rounded text-[12px] font-bold tabular-nums ${
                isOutOfStock
                  ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                  : isLow
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-[#F5F1E8]'
              }`}
            >
              {stock} units
            </span>
            {isOutOfStock && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
            {isLow && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
          </div>
        );
      },
    },
    {
      id: 'quickAdjust',
      header: 'Inline Adjust (+ / -)',
      cell: ({ row }) => {
        const item = row.original;
        const isLoading = loadingId === item.id;

        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleAdjustStock(item.id, -5)}
              disabled={isLoading || item.stock <= 0}
              className="px-2 py-1 bg-[#1A1A1A] hover:bg-[#252525] text-[#8A8A8A] hover:text-[#F5F1E8] border border-[#2B2B2B] rounded text-[11px] font-mono transition-colors disabled:opacity-30"
              title="Decrease by 5"
            >
              -5
            </button>
            <button
              onClick={() => handleAdjustStock(item.id, -1)}
              disabled={isLoading || item.stock <= 0}
              className="p-1.5 bg-[#1A1A1A] hover:bg-[#252525] text-[#8A8A8A] hover:text-[#F5F1E8] border border-[#2B2B2B] rounded transition-colors disabled:opacity-30"
              title="Decrease by 1"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleAdjustStock(item.id, 1)}
              disabled={isLoading}
              className="p-1.5 bg-[#1A1A1A] hover:bg-[#252525] text-[#C6FF00] border border-[#2B2B2B] rounded transition-colors disabled:opacity-30"
              title="Increase by 1"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleAdjustStock(item.id, 10)}
              disabled={isLoading}
              className="px-2 py-1 bg-[#1A1A1A] hover:bg-[#252525] text-[#C6FF00] border border-[#2B2B2B] rounded text-[11px] font-mono transition-colors disabled:opacity-30"
              title="Restock +10"
            >
              +10
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search inventory by SKU, silhouette name, or color..."
      emptyMessage="No variant inventory logged."
      exportFileName="menance-inventory.csv"
    />
  );
}
