'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { deleteProductAction, toggleProductPurchaseModeAction } from '@/lib/admin/actions';
import { toast } from 'sonner';
import { Edit2, Trash2, ExternalLink, Zap, Lock, Loader2 } from 'lucide-react';

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  price_inr: number;
  category: string;
  status: string;
  purchase_mode?: string;
  purchaseMode?: string;
  dropName: string;
  totalStock: number;
  variantsCount: number;
  updated_at: number;
}

interface ProductsTableProps {
  products: ProductRow[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const [data, setData] = useState<ProductRow[]>(products);
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleTogglePurchaseMode = async (id: string, newMode: 'buy_now' | 'notify_only') => {
    setTogglingId(id);
    // Optimistic update
    setData((prev) =>
      prev.map((p) => (p.id === id ? { ...p, purchase_mode: newMode, purchaseMode: newMode } : p))
    );

    try {
      const res = await toggleProductPurchaseModeAction(id, newMode);
      if (res?.success) {
        toast.success(
          newMode === 'buy_now'
            ? '⚡ Buy Now enabled! Customers can immediately purchase this tee.'
            : '🔒 Product set to Notify Only. Cart locked on storefront.'
        );
      } else {
        toast.error('Failed to update purchase mode.');
      }
    } catch {
      toast.error('Server error updating purchase mode.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProductAction(deleteTarget.id);
      setData((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success(`Deleted product "${deleteTarget.name}".`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<ProductRow>[] = [
    {
      accessorKey: 'name',
      header: 'Product',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#1A1A1A] border border-[#2E2E2E] flex items-center justify-center font-mono text-[10px] text-[#C6FF00] shrink-0 uppercase">
              {item.name.substring(4, 6) || 'MN'}
            </div>
            <div>
              <Link
                href={`/admin/products/${item.id}`}
                prefetch={false}
                className="font-medium text-[#F5F1E8] hover:text-[#C6FF00] transition-colors"
              >
                {item.name}
              </Link>
              <div className="text-[11px] font-mono text-[#666]">{item.slug}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="font-mono text-[11px] uppercase text-[#8A8A8A]">
          {row.getValue('category')}
        </span>
      ),
    },
    {
      accessorKey: 'price_inr',
      header: 'Price',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-[#F5F1E8]">
          ₹{Number(row.getValue('price_inr')).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'totalStock',
      header: 'Stock / Variants',
      cell: ({ row }) => {
        const stock = row.original.totalStock;
        const variantsCount = row.original.variantsCount;
        return (
          <div className="font-mono text-[12px]">
            <span
              className={`font-semibold ${
                stock === 0
                  ? 'text-red-400'
                  : stock < 15
                  ? 'text-amber-400'
                  : 'text-[#F5F1E8]'
              }`}
            >
              {stock} units
            </span>
            <span className="text-[#666] text-[10px] ml-1">({variantsCount} SKUs)</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <span
            className={`inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
              status === 'active'
                ? 'bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/20'
                : status === 'draft'
                ? 'bg-[#1F1F1F] text-[#8A8A8A] border border-[#2E2E2E]'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'purchase_mode',
      header: 'Buy Now Mode',
      cell: ({ row }) => {
        const item = row.original;
        const isBuyNow = (item.purchase_mode || item.purchaseMode) !== 'notify_only';
        const isPending = togglingId === item.id;

        return (
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleTogglePurchaseMode(item.id, isBuyNow ? 'notify_only' : 'buy_now')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              isBuyNow
                ? 'bg-[#C6FF00]/15 hover:bg-[#C6FF00]/25 text-[#C6FF00] border border-[#C6FF00]/30 font-bold shadow-[0_0_10px_rgba(198,255,0,0.1)]'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
            } disabled:opacity-50`}
            title={isBuyNow ? 'Click to switch to Notify Only' : 'Click to enable Buy Now'}
          >
            {isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : isBuyNow ? (
              <Zap className="w-3 h-3 fill-current" />
            ) : (
              <Lock className="w-3 h-3" />
            )}
            <span>{isBuyNow ? '⚡ Buy Now' : '🔒 Notify'}</span>
          </button>
        );
      },
    },
    {
      accessorKey: 'dropName',
      header: 'Collection',
      cell: ({ row }) => (
        <span className="text-[11px] font-mono text-[#8A8A8A] truncate max-w-[120px] block">
          {row.getValue('dropName')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link
              href={`/shop/${item.slug}`}
              target="_blank"
              prefetch={false}
              className="p-1 text-[#666] hover:text-[#C6FF00] transition-colors"
              title="View on live store"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href={`/admin/products/${item.id}`}
              prefetch={false}
              className="p-1 text-[#666] hover:text-[#F5F1E8] transition-colors"
              title="Edit product"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setDeleteTarget(item)}
              className="p-1 text-[#666] hover:text-red-400 transition-colors"
              title="Delete product"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search products by title, SKU, or category..."
        emptyMessage="No products found in the catalog."
        exportFileName="menance-products.csv"
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Product"
        description={`Are you sure you want to permanently delete "${deleteTarget?.name}"? All related variants, inventory logs, and imagery will be deleted immediately.`}
        confirmText="Delete Product"
        expectedWord={deleteTarget?.name}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </>
  );
}
