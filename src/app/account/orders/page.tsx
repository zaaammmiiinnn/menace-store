'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AccountNav } from '@/components/account/AccountNav';
import { useAuth } from '@/lib/auth';
import { useCartStore } from '@/store/cart-store';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { playClickSound, playHoverSound } from '@/lib/sound';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  image: string;
  sku: string;
  slug: string;
}

interface OrderRecord {
  id: string;
  date: string;
  createdAt: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'FAILED' | 'REFUNDED' | string;
  deliveredOn: string | null;
  trackingNumber: string;
  courier: string;
  total: number;
  subtotal: number;
  shipping: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  paymentMethod: string;
  items: OrderItem[];
}

export default function AccountOrdersPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const getFormattedPrice = useCartStore((state) => state.getFormattedPrice);

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user?.email && !user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (user.email) params.set('email', user.email);
      if (user.id) params.set('clerkUserId', user.id);

      const res = await fetch(`/api/account/orders?${params.toString()}`, {
        cache: 'no-store',
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('[Account Orders] Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      fetchOrders();
    }
  }, [user?.email, user?.id, isAuthLoading]);

  const copyTracking = (tracking: string) => {
    navigator.clipboard.writeText(tracking);
    setCopiedId(tracking);
    playClickSound();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case 'PAID':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-acid-green/10 border border-acid-green/40 text-acid-green flex items-center gap-1.5 shadow-[0_0_10px_rgba(198,255,0,0.15)]">
            <CheckCircle2 size={13} />
            <span>PAID // CONFIRMED</span>
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
            <Truck size={13} />
            <span>DISPATCHED // EN ROUTE</span>
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 size={13} />
            <span>DELIVERED</span>
          </span>
        );
      case 'FAILED':
      case 'REFUNDED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-rose-500/10 border border-rose-500/40 text-rose-400 flex items-center gap-1.5">
            <AlertCircle size={13} />
            <span>{s}</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center gap-1.5">
            <Clock size={13} />
            <span>{s}</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-base-black text-off-white pt-24 pb-28 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <AccountNav />

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-off-white">
              ORDER ARCHIVE
            </h1>
            <p className="font-mono text-xs text-muted-grey uppercase tracking-widest mt-1">
              VERIFIED ORDERS // DOORSTEP EXCHANGE VALID FOR 7 DAYS POST DELIVERY
            </p>
          </div>

          <button
            onClick={() => {
              playClickSound();
              fetchOrders();
            }}
            disabled={isLoading}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-surface border border-border/80 hover:border-acid-green/50 text-xs font-mono text-muted-grey hover:text-off-white transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin text-acid-green' : ''} />
            <span>REFRESH STATUS</span>
          </button>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-surface/50 border border-border p-6 animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-white/10 rounded w-36" />
                  <div className="h-6 bg-white/10 rounded-full w-24" />
                </div>
                <div className="h-16 bg-white/5 rounded-xl" />
                <div className="h-6 bg-white/10 rounded w-48" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl bg-surface/40 border border-dashed border-border/80 p-12 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-muted-grey">
              <ShoppingBag size={28} />
            </div>
            <div>
              <h3 className="font-display text-2xl uppercase tracking-wider text-off-white">
                NO ORDERS ARCHIVED YET
              </h3>
              <p className="font-mono text-xs text-muted-grey uppercase mt-1 max-w-md mx-auto">
                Any orders placed with <strong className="text-off-white">{user?.email || 'your account'}</strong> will appear here automatically with live dispatch tracking.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/shop"
                onClick={playClickSound}
                onMouseEnter={playHoverSound}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-acid-green text-base-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors shadow-[0_0_20px_rgba(198,255,0,0.3)] cursor-pointer"
              >
                <span>EXPLORE DROP 001</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          /* Real Orders List */
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl bg-surface border border-border/80 overflow-hidden shadow-2xl hover:border-acid-green/30 transition-all duration-300"
              >
                {/* Top Order Metadata Bar */}
                <div className="p-5 md:px-6 bg-surface-elevated/50 border-b border-border flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
                    <div>
                      <span className="text-muted-grey uppercase text-[10px] block">ORDER ID</span>
                      <span className="text-off-white font-bold text-sm tracking-wide">{order.id}</span>
                    </div>
                    <div>
                      <span className="text-muted-grey uppercase text-[10px] block">DATE PLACED</span>
                      <span className="text-off-white">{order.date}</span>
                    </div>
                    <div>
                      <span className="text-muted-grey uppercase text-[10px] block">TOTAL</span>
                      <span className="text-acid-green font-bold text-sm">
                        {getFormattedPrice(order.total)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Items List */}
                <div className="p-5 md:p-6 space-y-4">
                  {order.items.length === 0 ? (
                    <p className="font-mono text-xs text-muted-grey italic">
                      Order details recorded // Items processing
                    </p>
                  ) : (
                    order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/40 last:border-b-0 last:pb-0"
                      >
                        <div className="flex items-center gap-4">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 rounded-xl object-cover border border-border shrink-0 bg-base-black"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-base-black border border-border flex items-center justify-center font-display text-lg text-acid-green uppercase shrink-0">
                              MNC
                            </div>
                          )}
                          <div>
                            <Link
                              href={`/shop/${item.slug}`}
                              onClick={playClickSound}
                              onMouseEnter={playHoverSound}
                              className="font-display text-lg uppercase text-off-white hover:text-acid-green transition-colors"
                            >
                              {item.name}
                            </Link>
                            <p className="font-mono text-xs text-muted-grey mt-0.5">
                              COLOR: <span className="text-off-white">{item.color}</span> • SIZE: <span className="text-off-white">{item.size}</span> • QTY: <span className="text-off-white">{item.quantity}</span>
                            </p>
                            <p className="font-mono text-[10px] text-muted-grey/60 mt-0.5">
                              SKU: {item.sku}
                            </p>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                          <span className="font-mono text-sm font-bold text-off-white">
                            {getFormattedPrice(item.price * item.quantity)}
                          </span>
                          <Link
                            href={`/shop/${item.slug}`}
                            onClick={playClickSound}
                            onMouseEnter={playHoverSound}
                            className="text-xs font-mono text-acid-green uppercase hover:underline flex items-center gap-1"
                          >
                            <span>BUY AGAIN</span>
                            <ArrowRight size={12} />
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Shipping Destination Summary */}
                {order.shippingAddress?.line1 && (
                  <div className="px-6 py-3 bg-base-black/40 border-t border-border/50 text-[11px] font-mono text-muted-grey flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-off-white font-bold uppercase mr-1">DESTINATION:</span>
                      <span>
                        {order.shippingAddress.line1}
                        {order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ''}
                        {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}
                        {order.shippingAddress.pincode ? ` - ${order.shippingAddress.pincode}` : ''}
                      </span>
                    </div>
                    <div className="text-acid-green font-bold uppercase text-[10px]">
                      SHIPPING: {order.shipping}
                    </div>
                  </div>
                )}

                {/* Order Footer & Tracking Details */}
                <div className="p-4 px-6 bg-base-black/70 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-muted-grey">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1.5 text-off-white">
                      <Truck size={13} className="text-acid-green" />
                      <span>{order.courier}:</span>
                      <strong className="text-acid-green font-bold tracking-wider">{order.trackingNumber}</strong>
                    </span>
                    {order.trackingNumber && order.trackingNumber !== 'TRK-MNC-PROCESSING' && (
                      <button
                        onClick={() => copyTracking(order.trackingNumber)}
                        className="p-1 rounded hover:bg-white/10 text-muted-grey hover:text-off-white transition-colors cursor-pointer"
                        title="Copy Tracking Number"
                      >
                        {copiedId === order.trackingNumber ? (
                          <Check size={12} className="text-acid-green" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    )}
                    <span>•</span>
                    <span className="text-[11px]">{order.paymentMethod}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        playClickSound();
                        window.print();
                      }}
                      className="hover:text-acid-green transition-colors flex items-center gap-1 text-[11px] uppercase cursor-pointer"
                    >
                      <FileText size={13} />
                      <span>PRINT INVOICE</span>
                    </button>
                    <span>•</span>
                    <Link
                      href="/shipping"
                      onClick={playClickSound}
                      className="hover:text-acid-green transition-colors text-[11px] uppercase"
                    >
                      EXCHANGE POLICY
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
