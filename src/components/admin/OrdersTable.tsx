'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/admin/DataTable';
import { updateOrderStatusAction } from '@/lib/admin/actions';
import { toast } from 'sonner';
import { ExternalLink, Check, Truck } from 'lucide-react';

interface OrderRow {
  id: string;
  customer_id: string;
  customerName: string;
  customerEmail: string;
  status: string;
  total_inr: number;
  itemsCount: number;
  created_at: number;
  tracking_number?: string | null;
}

interface OrdersTableProps {
  orders: OrderRow[];
}

export function OrdersTable({ orders: initialOrders }: OrdersTableProps) {
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const handleQuickShip = async (orderId: string) => {
    try {
      const tracking = `MNC-TRK-${Math.floor(100000 + Math.random() * 900000)}`;
      await updateOrderStatusAction(orderId, 'shipped', tracking);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'shipped', tracking_number: tracking } : o))
      );
      toast.success(`Order ${orderId} marked as Shipped (${tracking}).`);
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const columns: ColumnDef<OrderRow>[] = [
    {
      accessorKey: 'id',
      header: 'Order ID',
      cell: ({ row }) => (
        <Link
          href={`/admin/orders/${row.original.id}`}
          className="font-mono font-bold text-[#F5F1E8] hover:text-[#C6FF00] transition-colors"
        >
          {row.original.id}
        </Link>
      ),
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-[#F5F1E8]">{row.original.customerName}</div>
          <div className="text-[11px] font-mono text-[#666]">{row.original.customerEmail}</div>
        </div>
      ),
    },
    {
      accessorKey: 'total_inr',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-[#F5F1E8]">
          ₹{Number(row.getValue('total_inr')).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'itemsCount',
      header: 'Units',
      cell: ({ row }) => (
        <span className="font-mono text-[12px] text-[#8A8A8A]">
          {row.original.itemsCount} item(s)
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Fulfillment',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <span
            className={`inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
              status === 'delivered'
                ? 'bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/20'
                : status === 'shipped'
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : status === 'paid'
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                : status === 'pending'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-[#8A8A8A]">
          {new Date(row.original.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
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
            {item.status === 'paid' && (
              <button
                onClick={() => handleQuickShip(item.id)}
                className="flex items-center gap-1 px-2 py-1 bg-[#1A1A1A] hover:bg-[#262626] text-[#C6FF00] rounded text-[11px] font-mono border border-[#2E2E2E] transition-colors"
                title="Mark as Shipped"
              >
                <Truck className="w-3 h-3" />
                <span>Ship</span>
              </button>
            )}
            <Link
              href={`/admin/orders/${item.id}`}
              className="p-1 text-[#666] hover:text-[#F5F1E8] transition-colors"
              title="View Order Details"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-3">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1 rounded text-[11px] font-mono uppercase tracking-wider transition-colors ${
              statusFilter === tab
                ? 'bg-[#1C1C1C] text-[#C6FF00] border border-[#333]'
                : 'text-[#666] hover:text-[#F5F1E8]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredOrders}
        searchPlaceholder="Search orders by ID, customer name, email..."
        emptyMessage="No orders match the current criteria."
        exportFileName="menance-orders.csv"
      />
    </div>
  );
}
