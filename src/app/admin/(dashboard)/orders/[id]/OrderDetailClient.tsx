'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateOrderStatusAction, deleteOrderAction } from '@/lib/admin/actions';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { toast } from 'sonner';
import { CustomPrintWorkshopCard } from '@/components/admin/CustomPrintWorkshopCard';
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
  Trash2,
  Sparkles,
  Banknote,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

interface OrderDetailClientProps {
  order: any;
}

export function OrderDetailClient({ order: initialOrder }: OrderDetailClientProps) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [internalNote, setInternalNote] = useState(order.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateStatus = async (newStatus: any) => {
    setIsUpdating(true);
    try {
      await updateOrderStatusAction(order.id, newStatus, trackingNumber, internalNote);
      setOrder({ ...order, status: newStatus, tracking_number: trackingNumber, notes: internalNote });
      if (newStatus === 'paid') {
        toast.success(`Order ${order.id} marked as Packed. Email sent to customer.`);
      } else if (newStatus === 'shipped') {
        toast.success(`Order ${order.id} marked as Shipped. Shipping email sent to customer.`);
      } else {
        toast.success(`Order status updated to ${newStatus}.`);
      }
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

  const handleDeleteOrder = async () => {
    setIsDeleting(true);
    try {
      await deleteOrderAction(order.id);
      toast.success(`Order ${order.id} permanently deleted.`);
      router.push('/admin/orders');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete order.');
      setIsDeleting(false);
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
            <h1 className="text-xl font-bold font-mono text-[#F5F1E8]">Order #{order.id}</h1>
            <span
              className={`px-2.5 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider ${
                order.status === 'paid'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : order.status === 'shipped'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : order.status === 'delivered'
                  ? 'bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/20'
                  : order.status === 'cancelled'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
              }`}
            >
              {order.status === 'paid' ? 'PACKED' : order.status}
            </span>
            {((order.notes || '').includes('CASH ON DELIVERY') || (order.notes || '').includes('COD')) && (
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                CASH ON DELIVERY
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-[#141414] hover:bg-[#1C1C1C] text-[#F5F1E8] text-[12px] font-mono rounded border border-[#262626] transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-[#8A8A8A]" />
            <span>Print Invoice</span>
          </button>
          {order.status !== 'cancelled' && (
            <button
              onClick={() => setIsRefundModalOpen(true)}
              className="px-3 py-1.5 bg-[#141414] hover:bg-[#1C1C1C] text-yellow-400 text-[12px] font-mono rounded border border-yellow-500/30 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refund</span>
            </button>
          )}
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-3 py-1.5 bg-[#141414] hover:bg-red-950/40 text-red-400 text-[12px] font-mono rounded border border-red-500/30 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Two Column Order Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Items and Fulfillment (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Order Items List */}
          <div className="p-5 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F] space-y-4">
            <h2 className="text-[13px] font-mono uppercase tracking-wider text-[#8A8A8A] border-b border-[#1A1A1A] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#C6FF00]" />
                Purchased Items ({order.items?.length || 0})
              </span>
            </h2>

            <div className="divide-y divide-[#1A1A1A]">
              {order.items?.map((item: any) => {
                const isCustom = item.product_name?.toLowerCase().includes('custom') ||
                  item.productName?.toLowerCase().includes('custom') ||
                  item.name?.toLowerCase().includes('custom') ||
                  !!item.custom_artwork_url || !!item.customArtworkUrl ||
                  !!item.custom_quote_text || !!item.customQuoteText ||
                  order.notes?.includes('CUSTOM PRINT') || item.edition === 'custom';

                return (
                  <div key={item.id} className="py-4 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#F5F1E8] text-[14px] flex items-center gap-2">
                          <span>{item.productName || item.product_name || item.name || 'MENANCE Silhouette'}</span>
                          {isCustom && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/30 font-semibold tracking-wider">
                              <Sparkles className="w-2.5 h-2.5" /> CUSTOM PRINT
                            </span>
                          )}
                        </div>
                        <div className="text-[12px] font-mono text-[#8A8A8A] mt-0.5">
                          {item.color || item.variant?.color || 'Black'} • Size {item.size || item.variant?.size || 'M'} • SKU: {item.variant?.sku || `MNC-${item.size || 'M'}`}
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div className="text-[13px] text-[#F5F1E8]">
                          {item.quantity || 1} × ₹{(item.price_inr || item.priceInr || item.price_at_purchase || item.price || 0).toLocaleString()}
                        </div>
                        <div className="text-[12px] font-bold text-[#C6FF00]">
                          ₹{((item.quantity || 1) * (item.price_inr || item.priceInr || item.price_at_purchase || item.price || 0)).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Custom Print Workshop Card if custom print item */}
                    {isCustom && (
                      <CustomPrintWorkshopCard order={order} item={item} />
                    )}
                  </div>
                );
              })}
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
                    onClick={() => handleUpdateStatus('paid')}
                    disabled={isUpdating}
                    className={`flex-1 py-2 text-[11px] font-mono rounded border transition-colors flex items-center justify-center gap-1.5 ${
                      order.status === 'paid'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold'
                        : 'bg-[#1A1A1A] hover:bg-[#252525] text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    Mark Packed
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus('shipped')}
                    disabled={isUpdating}
                    className={`flex-1 py-2 text-[11px] font-mono rounded border transition-colors flex items-center justify-center gap-1.5 ${
                      order.status === 'shipped'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 font-bold'
                        : 'bg-[#1A1A1A] hover:bg-[#252525] text-blue-400 border-blue-500/30'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Mark Shipped
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus('delivered')}
                    disabled={isUpdating}
                    className={`flex-1 py-2 text-[11px] font-mono rounded border transition-colors flex items-center justify-center gap-1.5 ${
                      order.status === 'delivered'
                        ? 'bg-[#C6FF00]/20 text-[#C6FF00] border-[#C6FF00]/40 font-bold'
                        : 'bg-[#1A1A1A] hover:bg-[#252525] text-[#C6FF00] border-[#C6FF00]/30'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
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

          {/* Payment & Settlement Card */}
          {(() => {
            const notes = (order.notes || '').toUpperCase();
            const isCod = notes.includes('CASH ON DELIVERY') || notes.includes('COD') || order.payment_method === 'cod' || order.paymentMethod === 'cod';
            return (
              <div className="p-5 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F] space-y-3">
                <h2 className="text-[13px] font-mono uppercase tracking-wider text-[#8A8A8A] border-b border-[#1A1A1A] pb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {isCod ? <Banknote className="w-4 h-4 text-amber-400" /> : <CreditCard className="w-4 h-4 text-[#C6FF00]" />}
                    Payment Mode
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      isCod
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isCod ? 'COD (CASH ON DELIVERY)' : 'ONLINE PREPAID'}
                  </span>
                </h2>

                <div className="space-y-2 text-xs font-mono">
                  {isCod ? (
                    <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded space-y-1">
                      <div className="text-amber-300 font-bold flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5" />
                        <span>COLLECT CASH AT DOORSTEP</span>
                      </div>
                      <div className="text-[#D4D4D4] text-[11px]">
                        Courier partner must collect <span className="text-[#F5F1E8] font-bold">₹{order.total_inr.toLocaleString()}</span> in physical cash before handing over the parcel.
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded space-y-1">
                      <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>PRE-SETTLED ONLINE (PAYU)</span>
                      </div>
                      <div className="text-[#D4D4D4] text-[11px]">
                        Payment of <span className="text-[#F5F1E8] font-bold">₹{order.total_inr.toLocaleString()}</span> has been captured and verified via secure gateway. Zero cash collection required.
                      </div>
                    </div>
                  )}

                  {order.notes && (
                    <div className="text-[10px] text-[#666] pt-1">
                      System Note: {order.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

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

      {/* Confirm Delete Modal */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        title={`Delete Order ${order.id}`}
        description={`Are you sure you want to permanently delete order ${order.id}? This will remove all items and records for this order. This cannot be undone.`}
        confirmText="Delete Order"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteOrder}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
