'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, Heart, Award, ArrowRight, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { AccountNav } from '@/components/account/AccountNav';
import { useAuth } from '@/lib/auth';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';
import { products } from '@/data/products';
import { playClickSound, playHoverSound } from '@/lib/sound';

export default function AccountDashboardPage() {
  const { user } = useAuth();
  const wishlistItems = useWishlistStore((state) => state.items);
  const getFormattedPrice = useCartStore((state) => state.getFormattedPrice);

  const firstName = user?.firstName || 'MEMBER';
  const wishlistedProducts = products.filter((p) => wishlistItems.includes(p.id));

  // Mocked recent orders
  const mockOrders = [
    {
      id: 'MNC-84920',
      date: 'SEPTEMBER 04, 2026',
      status: 'DELIVERED',
      items: [
        { name: 'QUIET MENACE OVERSIZED TEE', color: 'Bone', size: 'L', price: 2499 },
      ],
      total: 2499,
      tracking: 'BLUEDART // 489218491',
    },
    {
      id: 'MNC-81044',
      date: 'AUGUST 18, 2026',
      status: 'DELIVERED',
      items: [
        { name: 'ACID TRIP WAFFLE TEE', color: 'Acid Green', size: 'XL', price: 2699 },
      ],
      total: 2699,
      tracking: 'DELHIVERY // 729184012',
    },
  ];

  return (
    <div className="min-h-screen bg-base-black text-off-white pt-24 pb-28 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation & Header */}
        <AccountNav />

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
              <span className="font-display text-4xl text-off-white">02</span>
              <p className="font-mono text-[11px] text-muted-grey mt-1">LIFETIME DELIVERED</p>
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
              <span className="font-display text-4xl text-acid-green">280</span>
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
                <span className="text-xs font-mono text-muted-grey">(02)</span>
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

            <div className="space-y-3">
              {mockOrders.map((order) => (
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
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-acid-green/10 border border-acid-green/30 text-acid-green">
                      {order.status}
                    </span>
                  </div>

                  <div className="border-t border-border/40 pt-3 flex items-center justify-between">
                    <div>
                      <p className="font-display text-sm uppercase text-off-white tracking-wide">
                        {order.items[0].name}
                      </p>
                      <p className="font-mono text-xs text-muted-grey mt-0.5">
                        {order.items[0].color} • Size {order.items[0].size}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-bold text-off-white">
                      {getFormattedPrice(order.total)}
                    </span>
                  </div>

                  <div className="border-t border-border/40 pt-2 flex items-center justify-between text-[11px] font-mono text-muted-grey">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{order.tracking}</span>
                    </span>
                    <span className="text-off-white/80 uppercase">Doorstep Verified</span>
                  </div>
                </div>
              ))}
            </div>
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
                    className="p-4 rounded-xl bg-surface border border-border/80 hover:border-acid-green/50 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-display text-sm uppercase text-off-white group-hover:text-acid-green transition-colors">
                        {item.name}
                      </p>
                      <p className="font-mono text-xs text-muted-grey mt-0.5">
                        {item.vibeName} // 280 GSM
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-acid-green">
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
                As an active Menace member, your account is queued 2 hours ahead of public release.
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
