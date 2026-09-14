'use client';

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import {
  createDiscountAction,
  toggleDiscountAction,
  deleteDiscountAction,
} from '@/lib/admin/actions';
import { toast } from 'sonner';
import { Plus, Copy, Trash2, Power, X } from 'lucide-react';

interface DiscountRow {
  id: string;
  code: string;
  type: string;
  value: number;
  min_order: number;
  max_uses: number | null;
  uses: number;
  expires_at: number | null;
  active: number;
}

interface DiscountsManagerProps {
  discounts: DiscountRow[];
}

export function DiscountsManager({ discounts: initialDiscounts }: DiscountsManagerProps) {
  const [discounts, setDiscounts] = useState<DiscountRow[]>(initialDiscounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DiscountRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Code Form State
  const [newCode, setNewCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState(15);
  const [minOrder, setMinOrder] = useState(1499);
  const [maxUses, setMaxUses] = useState(200);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied code "${code}" to clipboard.`);
  };

  const handleToggle = async (id: string, currentActive: number) => {
    const nextState = currentActive === 0;
    try {
      await toggleDiscountAction(id, nextState);
      setDiscounts((prev) =>
        prev.map((d) => (d.id === id ? { ...d, active: nextState ? 1 : 0 } : d))
      );
      toast.success(`Code ${nextState ? 'activated' : 'deactivated'}.`);
    } catch {
      toast.error('Failed to toggle code status.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteDiscountAction(deleteTarget.id);
      setDiscounts((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      toast.success(`Deleted code "${deleteTarget.code}".`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete discount.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) {
      toast.error('Enter a promo code.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await createDiscountAction({
        code: newCode.toUpperCase(),
        type,
        value,
        minOrder,
        maxUses,
        active: true,
      });

      setDiscounts((prev) => [
        {
          id: res.id,
          code: newCode.toUpperCase(),
          type,
          value,
          min_order: minOrder,
          max_uses: maxUses,
          uses: 0,
          expires_at: null,
          active: 1,
        },
        ...prev,
      ]);

      toast.success(`Created code "${newCode.toUpperCase()}".`);
      setIsModalOpen(false);
      setNewCode('');
    } catch (err: any) {
      toast.error(err.message || 'Error creating code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<DiscountRow>[] = [
    {
      accessorKey: 'code',
      header: 'Promo Code',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-[#C6FF00] tracking-wider text-[13px]">
              {item.code}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(item.code)}
              className="p-1 text-[#666] hover:text-[#F5F1E8] transition-colors"
              title="Copy code"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        );
      },
    },
    {
      accessorKey: 'value',
      header: 'Discount',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <span className="font-mono font-semibold text-[#F5F1E8]">
            {item.type === 'percentage' ? `${item.value}% OFF` : `₹${item.value} OFF`}
          </span>
        );
      },
    },
    {
      accessorKey: 'min_order',
      header: 'Min Order',
      cell: ({ row }) => (
        <span className="font-mono text-[12px] text-[#8A8A8A]">
          ₹{Number(row.getValue('min_order')).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'uses',
      header: 'Redemptions',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <span className="font-mono text-[12px] text-[#8A8A8A]">
            {item.uses} / {item.max_uses ?? '∞'}
          </span>
        );
      },
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('active') === 1;
        return (
          <span
            className={`inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
              isActive
                ? 'bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/20'
                : 'bg-[#1C1C1C] text-[#666] border border-[#2E2E2E]'
            }`}
          >
            {isActive ? 'Active' : 'Disabled'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const item = row.original;
        const isActive = item.active === 1;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggle(item.id, item.active)}
              className={`p-1.5 rounded transition-colors ${
                isActive ? 'text-[#C6FF00] hover:bg-[#1A1A1A]' : 'text-[#666] hover:text-[#F5F1E8]'
              }`}
              title={isActive ? 'Deactivate' : 'Activate'}
            >
              <Power className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeleteTarget(item)}
              className="p-1.5 text-[#666] hover:text-red-400 transition-colors"
              title="Delete discount"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 h-9 px-3.5 bg-[#C6FF00] hover:bg-[#b0e600] text-[#0A0A0A] font-semibold rounded-md text-[12px] font-mono transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Code</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={discounts}
        searchPlaceholder="Search discount codes..."
        emptyMessage="No promo codes created yet."
        exportFileName="menance-discount-codes.csv"
      />

      {/* Create Code Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#121212] border border-[#262626] rounded-lg shadow-2xl overflow-hidden text-[#F5F1E8]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
              <h3 className="font-semibold text-[15px] text-[#F5F1E8]">New Promo Code</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#666] hover:text-[#F5F1E8]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4 text-[13px]">
              <div>
                <label className="block text-[11px] font-mono text-[#8A8A8A] uppercase mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FLASH25"
                  className="w-full bg-[#0A0A0A] border border-[#2B2B2B] rounded px-3 py-2 text-[13px] text-[#C6FF00] font-mono uppercase focus:outline-none focus:border-[#C6FF00]/40"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#8A8A8A] uppercase mb-1">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-[#0A0A0A] border border-[#2B2B2B] rounded px-3 py-2 text-[13px] text-[#F5F1E8] font-mono focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed INR (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#8A8A8A] uppercase mb-1">
                    Value
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full bg-[#0A0A0A] border border-[#2B2B2B] rounded px-3 py-2 text-[13px] text-[#F5F1E8] font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#8A8A8A] uppercase mb-1">
                    Min Order (₹)
                  </label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    className="w-full bg-[#0A0A0A] border border-[#2B2B2B] rounded px-3 py-2 text-[13px] text-[#F5F1E8] font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#8A8A8A] uppercase mb-1">
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="w-full bg-[#0A0A0A] border border-[#2B2B2B] rounded px-3 py-2 text-[13px] text-[#F5F1E8] font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-[12px] font-mono text-[#8A8A8A] hover:text-[#F5F1E8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#C6FF00] hover:bg-[#b0e600] text-[#0A0A0A] font-semibold text-[12px] font-mono rounded transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Promo Code"
        description={`Permanently delete promo code "${deleteTarget?.code}"? Customers will no longer be able to redeem this discount.`}
        expectedWord={deleteTarget?.code}
        confirmText="Delete Code"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
