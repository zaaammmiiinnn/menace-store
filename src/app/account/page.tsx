'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  Heart,
  Award,
  ArrowRight,
  Clock,
  ShieldCheck,
  Sparkles,
  Shield,
  ShoppingBag,
  CheckCircle2,
  Truck,
} from 'lucide-react';
import { AccountNav } from '@/components/account/AccountNav';
import { useAuth } from '@/lib/auth';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';
import { products } from '@/data/products';
import { playClickSound, playHoverSound } from '@/lib/sound';

interface OrderItem {
  id: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  image: string;
  slug: string;
}

interface OrderRecord {
  id: string;
  date: string;
  status: string;
  trackingNumber: string;
  courier: string;
  total: number;
  items: OrderItem[];
}

export default function AccountDashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const wishlistItems = useWishlistStore((state) => state.items);
  const getFormattedPrice = useCartStore((state) => state.getFormattedPrice);

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);

  const firstName = user?.firstName || (user?.fullName && user.fullName !== 'MENANCE MEMBER' ? user.fullName.split(' ')[0] : 'MEMBER');
  const wishlistedProducts = products.filter((p) => wishlistItems.includes(p.id));

  useEffect(() => {
    async function fetchUserOrders() {
      if (!user?.email && !user?.id) {
        setIsOrdersLoading(false);
        return;
      }
      try {
        const params = new URLSearchParams();
        if (user.email) params.set('email', user.email);
        if (user.id) params.set('clerkUserId', user.id);

        const res = await fetch(`/api/account/orders?${params.toString()}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('[Account Dashboard] Failed to fetch orders:', err);
      } finally {
        setIsOrdersLoading(false);
      }
    }

    if (!isAuthLoading) {
      fetchUserOrders();
    }
  }, [user?.email, user?.id, isAuthLoading]);

  const totalSpent = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const fabricCredits = Math.max(100, Math.round(totalSpent * 0.1) + 180);

  return (
    <div className="min-h-screen bg-base-black text-off-white pt-24 pb-28 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation & Header */}
        <AccountNav />

        {/* Admin Clearance Quick Banner */}
        {user?.isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-2xl bg-acid-green/10 border border-acid-green/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(198,255,0,0.15)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-acid-green text-base-black flex items-center justify-center font-bold flex-shrink-0 shadow-[0_0_10px_rgba(198,255,0,0.4)]">
                <Shield size={20} />
              </div>
              <div>
                <p className="font-display text-lg uppercase tracking-wider text-off-white">
                  ADMINISTRATOR CLEARANCE RECOGNIZED
                </p>
                <p className="font-mono text-xs text-muted-grey uppercase">
                  Full operations access for Menance catalog, drop schedules, inventory & orders.
                </p>
              </div>
            </div>
            <Link
              href="/admin"
              onClick={playClickSound}
              onMouseEnter={playHoverSound}
              className="py-2.5 px-4 rounded-xl bg-acid-green text-base-black font-mono text-xs uppercase tracking-wider font-bold hover:bg-white transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(198,255,0,0.3)] flex-shrink-0 cursor-pointer"
            >
              <span>LAUNCH COCKPIT</span>
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        )}

        {/* Big Greeting */}
        <div className="mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl sm:text-6xl md:text-7xl uppercase tracking-tight text-off-white"
          >
            YO, {firstName}.
          </motion.h1>
          <p className="font-mono text-xs sm:text-sm text-muted-grey uppercase tracking-widest mt-1">
            DROP 001 COLLECTIVE // UNBOTHERED STATUS ACTIVE
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {/* Orders Stat */}
          <div className="p-6 rounded-2xl bg-surface/60 border border-border flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-muted-grey mb-4">
              <span className="font-mono text-xs uppercase tracking-widest">TOTAL DROPS</span>
              <Package size={18} className="text-acid-green" />
            </div>
            <div>
              <span className="font-display text-4xl text-off-white">
                {orders.length.toString().padStart(2, '0')}
              </span>
              <p className="font-mono text-[11px] text-muted-grey mt-1">LIFETIME ORDERS</p>
            </div>
          </div>

          {/* Wishlist Stat */}
          <div className="p-6 rounded-2xl bg-surface/60 border border-border flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-muted-grey mb-4">
              <span className="font-mono text-xs uppercase tracking-widest">SAVED PIECES</span>
              <Heart size={18} className="text-acid-green" />
            </div>
            <div>
              <span className="font-display text-4xl text-off-white">
                {wishlistItems.length.toString().padStart(2, '0')}
              </span>
              <p className="font-mono text-[11px] text-muted-grey mt-1">READY TO COP</p>
            </div>
          </div>

          {/* Reward Points Stat */}
          <div className="p-6 rounded-2xl bg-surface/60 border border-border flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-muted-grey mb-4">
              <span className="font-mono text-xs uppercase tracking-widest">FABRIC CREDITS</span>
              <Award size={18} className="text-acid-green" />
            </div>
            <div>
              <span className="font-display text-4xl text-acid-green">
                {fabricCredits}
              </span>
              <p className="font-mono text-[11px] text-muted-grey mt-1">GSM LEVEL TIERS</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout: Recent Orders & Wishlist Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Recent Orders */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl uppercase tracking-wider text-off-white">
                  RECENT DROPS
                </h2>
                <span className="text-xs font-mono text-muted-grey">
                  ({orders.length.toString().padStart(2, '0')})
                </span>
              </div>
              <Link
                href="/account/orders"
                onClick={playClickSound}
                onMouseEnter={playHoverSound}
                className="text-xs font-mono text-acid-green hover:underline uppercase flex items-center gap-1"
              >
                <span>VIEW ALL</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {isOrdersLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="p-5 rounded-xl bg-surface/50 border border-border animate-pulse space-y-3">
                    <div className="h-4 bg-white/10 rounded w-1/3" />
                    <div className="h-10 bg-white/5 rounded" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 rounded-xl bg-surface/40 border border-dashed border-border text-center space-y-3">
                <ShoppingBag size={24} className="text-muted-grey/40 mx-auto" />
                <p className="font-mono text-xs text-muted-grey uppercase">
                  NO RECENT DROPS ORDERED YET.
                </p>
                <Link
                  href="/shop"
                  onClick={playClickSound}
                  onMouseEnter={playHoverSound}
                  className="inline-block px-4 py-2 rounded-lg bg-acid-green text-base-black font-mono text-xs font-bold uppercase hover:bg-white transition-colors"
                >
                  EXPLORE DROP 001
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => {
                  const firstItem = order.items?.[0];
                  return (
                    <div
                      key={order.id}
                      className="p-5 rounded-xl bg-surface border border-border/80 hover:border-acid-green/40 transition-colors flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-xs font-bold text-off-white">
                            {order.id}
                          </span>
                          <span className="text-muted-grey text-xs font-mono ml-3">
                            {order.date}
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            order.status === 'PAID'
                              ? 'bg-acid-green/10 border border-acid-green/30 text-acid-green'
                              : order.status === 'SHIPPED'
                              ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'
                              : 'bg-white/10 border border-white/20 text-muted-grey'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      {firstItem && (
                        <div className="border-t border-border/40 pt-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {firstItem.image ? (
                              <img
                                src={firstItem.image}
                                alt={firstItem.name}
                                className="w-11 h-11 rounded-lg object-cover border border-border shrink-0 bg-base-black"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-lg bg-base-black border border-border flex items-center justify-center font-mono text-xs text-acid-green">
                                MNC
                              </div>
                            )}
                            <div>
                              <p className="font-display text-sm uppercase text-off-white tracking-wide">
                                {firstItem.name}
                              </p>
                              <p className="font-mono text-xs text-muted-grey mt-0.5">
                                {firstItem.color} • Size {firstItem.size}
                                {order.items.length > 1 && ` (+${order.items.length - 1} more)`}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono text-sm font-bold text-off-white">
                            {getFormattedPrice(order.total)}
                          </span>
                        </div>
                      )}

                      <div className="border-t border-border/40 pt-2 flex items-center justify-between text-[11px] font-mono text-muted-grey">
                        <span className="flex items-center gap-1.5 text-off-white/80">
                          {order.status === 'SHIPPED' ? (
                            <Truck size={12} className="text-cyan-400" />
                          ) : (
                            <Clock size={12} className="text-acid-green" />
                          )}
                          <span>
                            {order.courier}: {order.trackingNumber}
                          </span>
                        </span>
                        <Link
                          href="/account/orders"
                          className="text-acid-green hover:underline uppercase text-[10px]"
                        >
                          DETAILS →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Wishlist Quick Preview */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl uppercase tracking-wider text-off-white">
                  WISHLIST
                </h2>
                <span className="text-xs font-mono text-muted-grey">
                  ({wishlistItems.length})
                </span>
              </div>
              <Link
                href="/account/wishlist"
                onClick={playClickSound}
                onMouseEnter={playHoverSound}
                className="text-xs font-mono text-acid-green hover:underline uppercase flex items-center gap-1"
              >
                <span>MANAGE</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {wishlistedProducts.length === 0 ? (
              <div className="p-8 rounded-xl bg-surface/40 border border-dashed border-border text-center space-y-3">
                <Heart size={24} className="text-muted-grey/40 mx-auto" />
                <p className="font-mono text-xs text-muted-grey uppercase">
                  NO PIECES BOOKMARKED YET.
                </p>
                <Link
                  href="/shop"
                  onClick={playClickSound}
                  onMouseEnter={playHoverSound}
                  className="inline-block px-4 py-2 rounded-lg bg-acid-green text-base-black font-mono text-xs font-bold uppercase hover:bg-white transition-colors"
                >
                  EXPLORE DROP 001
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {wishlistedProducts.slice(0, 3).map((item) => (
                  <Link
                    key={item.id}
                    href={`/shop/${item.slug}`}
                    onClick={playClickSound}
                    onMouseEnter={playHoverSound}
                    className="p-3 rounded-xl bg-surface border border-border/80 hover:border-acid-green/50 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      {item.images && item.images[0] && (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0 bg-base-black"
                        />
                      )}
                      <div>
                        <p className="font-display text-sm uppercase text-off-white group-hover:text-acid-green transition-colors line-clamp-1">
                          {item.name}
                        </p>
                        <p className="font-mono text-xs text-muted-grey mt-0.5">
                          {item.vibeName} // {item.tags.includes('waffle') ? '300 GSM WAFFLE' : '280 GSM'}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-acid-green whitespace-nowrap">
                      {getFormattedPrice(item.price)}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* VIP Drop 002 Early Access Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-surface to-base-black border border-acid-green/30 relative overflow-hidden shadow-xl mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-acid-green" />
                <span className="font-mono text-xs uppercase font-bold text-acid-green tracking-widest">
                  DROP 002 VIP ACCESS
                </span>
              </div>
              <h3 className="font-display text-xl uppercase text-off-white mb-2">
                HOODIES & THERMAL PANTS
              </h3>
              <p className="font-mono text-xs text-muted-grey leading-relaxed mb-4">
                As an active Menance member, your account is queued 2 hours ahead of public release.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-acid-green font-bold">
                <ShieldCheck size={14} />
                <span>WHITELISTED ON CLOUDFLARE EDGE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
