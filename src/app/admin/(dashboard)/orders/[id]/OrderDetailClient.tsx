'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { updateOrderStatusAction } from '@/lib/admin/actions';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  AlertCircle,
  Package,
  User,
  Clock,
  RotateCcw,
  Printer,
} from 'lucide-react';

interface OrderDetailClientProps {
  order: any;
}

export function OrderDetailClient({ order: initialOrder }: OrderDetailClientProps) {
  const [order, setOrder] = useState(initialOrder);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [internalNote, setInternalNote] = useState(order.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  const handleUpdateStatus = async (newStatus: any) => {
    setIsUpdating(true);
    try {
      await updateOrderStatusAction(order.id, newStatus, trackingNumber, internalNote);
      setOrder({ ...order, status: newStatus, tracking_number: trackingNumber, notes: internalNote });
      toast.success(`Order status updated to ${newStatus}.`);
    } catch {
      toast.error('Failed to update order status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsUpdating(true);
    try {
      await updateOrderStatusAction(order.id, order.status, trackingNumber, internalNote);
      toast.success('Notes and tracking saved.');
    } catch {
      toast.error('Failed to save order updates.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefund = async () => {
    setIsUpdating(true);
    try {
      await updateOrderStatusAction(order.id, 'cancelled', order.tracking_number, `${internalNote} [REFUNDED]`);
      setOrder({ ...order, status: 'cancelled' });
      toast.success(`Refund recorded for ${order.id}.`);
      setIsRefundModalOpen(false);
    } catch {
      toast.error('Refund processing failed.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-[12px] font-mono text-[#8A8A8A] hover:text-[#F5F1E8] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono tracking-tight text-[#F5F1E8]">{order.id}</h1>
            <span
              className={`text-[11px] font-mono uppercase px-2.5 py-0.5 rounded font-semibold ${
                order.status === 'delivered'
                  ? 'bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/20'
                  : order.status === 'shipped'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : order.status === 'paid'
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {order.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 h-9 px-3 bg-[#141414] hover:bg-[#1E1E1E] text-[#8A8A8A] hover:text-[#F5F1E8] border border-[#2B2B2B] rounded text-[12px] font-mono transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Packing Slip</span>
          </button>
          <button
            onClick={() => setIsRefundModalOpen(true)}
            className="flex items-center gap-1.5 h-9 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[12px] font-mono transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refund Order</span>
          </button>
        </div>
      </div>

      {/* Two Column Order Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Items and Fulfillment (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Order Items List */}
          <div className="p-5 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F] space-y-4">
            <h2 className="text-[13px] font-mono uppercase tracking-wider text-[#8A8A8A] border-b border-[#1A1A1A] pb-2 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#C6FF00]" />
              Purchased Items ({order.items?.length || 0})
            </h2>

            <div className="divide-y divide-[#181818]">
              {order.items?.map((item: any) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-[#181818] border border-[#282828] flex items-center justify-center font-mono text-[11px] text-[#C6FF00]">
                      {item.variant?.size || 'M'}
                    </div>
                    <div>
                      <div className="font-medium text-[#F5F1E8]">{item.productName}</div>
                      <div className="text-[11px] font-mono text-[#666]">
                        {item.variant?.color} • Size {item.variant?.size} • SKU: {item.variant?.sku}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-[#F5F1E8] font-semibold tabular-nums">
                      ₹{(item.price_at_purchase * item.quantity).toLocaleString()}
                    </div>
                    <div className="text-[11px] text-[#8A8A8A]">
                      Qty: {item.quantity} × ₹{item.price_at_purchase}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Calculation Summary */}
            <div className="pt-3 border-t border-[#1C1C1C] space-y-1.5 text-[12px] font-mono text-right">
              <div className="text-[#8A8A8A]">Subtotal: ₹{order.total_inr.toLocaleString()}</div>
              <div className="text-[#8A8A8A]">Shipping: Free (Over ₹2,999)</div>
              <div className="text-[15px] font-bold text-[#C6FF00] pt-1">
                Grand Total: ₹{order.total_inr.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Fulfillment Tracking Form */}
          <div className="p-5 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F] space-y-4">
            <h2 className="text-[13px] font-mono uppercase tracking-wider text-[#8A8A8A] border-b border-[#1A1A1A] pb-2 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#C6FF00]" />
              Fulfillment & Carrier Tracking
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-[#8A8A8A] mb-1">
                  Airway Bill / Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. BLUEDART-48921"
                  className="w-full bg-[#141414] border border-[#2B2B2B] rounded px-3 py-2 text-[13px] text-[#F5F1E8] font-mono focus:outline-none focus:border-[#C6FF00]/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8A8A8A] mb-1">
                  Update Stage
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus('shipped')}
                    className="flex-1 py-2 bg-[#1A1A1A] hover:bg-[#252525] text-blue-400 text-[11px] font-mono rounded border border-blue-500/30 transition-colors"
                  >
                    Mark Shipped
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus('delivered')}
                    className="flex-1 py-2 bg-[#1A1A1A] hover:bg-[#252525] text-[#C6FF00] text-[11px] font-mono rounded border border-[#C6FF00]/30 transition-colors"
                  >
                    Mark Delivered
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#8A8A8A] mb-1">
                Internal Ops Notes (Staff Only)
              </label>
              <textarea
                rows={2}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Dispatched via express air cargo. Customer requested stealth bag."
                className="w-full bg-[#141414] border border-[#2B2B2B] rounded px-3 py-2 text-[12px] text-[#F5F1E8] focus:outline-none focus:border-[#C6FF00]/40"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveNotes}
              disabled={isUpdating}
              className="px-4 py-2 bg-[#C6FF00] hover:bg-[#b0e600] text-[#0A0A0A] font-semibold text-[12px] font-mono rounded transition-colors"
            >
              {isUpdating ? 'Saving...' : 'Save Tracking & Notes'}
            </button>
          </div>
        </div>

        {/* Right Column: Customer & Delivery Address (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Customer Card */}
          <div className="p-5 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F] space-y-3">
            <h2 className="text-[13px] font-mono uppercase tracking-wider text-[#8A8A8A] border-b border-[#1A1A1A] pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[#C6FF00]" />
              Customer
            </h2>

            <div className="text-[13px] space-y-1">
              <div className="font-semibold text-[#F5F1E8]">{order.customer?.name || 'Customer'}</div>
              <div className="text-[#8A8A8A] font-mono text-[12px]">{order.customer?.email}</div>
              <div className="text-[11px] font-mono text-[#666] pt-1">
                Lifetime Spend: ₹{order.customer?.total_spent?.toLocaleString() || '0'}
              </div>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="p-5 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F] space-y-3">
            <h2 className="text-[13px] font-mono uppercase tracking-wider text-[#8A8A8A] border-b border-[#1A1A1A] pb-2">
              Delivery Address
            </h2>

            <p className="text-[13px] text-[#D4D4D4] leading-relaxed font-sans">
              {order.shipping_address}
            </p>
          </div>

          {/* Timeline */}
          <div className="p-5 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F] space-y-3">
            <h2 className="text-[13px] font-mono uppercase tracking-wider text-[#8A8A8A] border-b border-[#1A1A1A] pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C6FF00]" />
              Timeline
            </h2>

            <div className="space-y-3 text-[12px] font-mono">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C6FF00] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[#F5F1E8]">Order Placed</div>
                  <div className="text-[10px] text-[#666]">
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {order.fulfilled_at && (
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[#F5F1E8]">Dispatched</div>
                    <div className="text-[10px] text-[#666]">
                      {new Date(order.fulfilled_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Refund Modal */}
      <ConfirmDialog
        isOpen={isRefundModalOpen}
        title={`Refund Order ${order.id}`}
        description={`This will cancel order ${order.id} and mark ₹${order.total_inr} as refunded. Customer will be notified.`}
        expectedWord="REFUND"
        confirmText="Execute Refund"
        onConfirm={handleRefund}
        onCancel={() => setIsRefundModalOpen(false)}
        isLoading={isUpdating}
      />
    </div>
  );
}
