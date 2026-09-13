'use client';

import React from 'react';
import Link from 'next/link';
import { AccountNav } from '@/components/account/AccountNav';
import { useCartStore } from '@/store/cart-store';
import { Package, Truck, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { playClickSound, playHoverSound } from '@/lib/sound';

export default function AccountOrdersPage() {
  const getFormattedPrice = useCartStore((state) => state.getFormattedPrice);

  const orders = [
    {
      id: 'MNC-84920',
      date: 'SEPTEMBER 04, 2026',
      status: 'DELIVERED',
      deliveredOn: 'SEPTEMBER 07, 2026',
      trackingNumber: 'BLUEDART-489218491',
      courier: 'BlueDart Express',
      total: 2499,
      shipping: 'FREE (Threshold met)',
      paymentMethod: 'UPI // GPay Verified',
      items: [
        {
          name: 'QUIET MENANCE OVERSIZED TEE',
          slug: 'quiet-menace',
          color: 'Bone',
          size: 'L',
          price: 2499,
          quantity: 1,
          sku: 'MNC-TEE-001-BNE-L',
          image: '/images/products/quiet-menace-1.jpg',
        },
      ],
    },
    {
      id: 'MNC-81044',
      date: 'AUGUST 18, 2026',
      status: 'DELIVERED',
      deliveredOn: 'AUGUST 21, 2026',
      trackingNumber: 'DELHIVERY-729184012',
      courier: 'Delhivery Surface',
      total: 2699,
      shipping: 'FREE',
      paymentMethod: 'Razorpay Card Ending 4019',
      items: [
        {
          name: 'ACID TRIP WAFFLE TEE',
          slug: 'soft-menace',
          color: 'Acid Green',
          size: 'XL',
          price: 2699,
          quantity: 1,
          sku: 'MNC-TEE-002-ACD-XL',
          image: '/images/products/heavy-waffle-1.jpg',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-base-black text-off-white pt-24 pb-28 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <AccountNav />

        <div className="mb-8">
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-off-white">
            ORDER ARCHIVE
          </h1>
          <p className="font-mono text-xs text-muted-grey uppercase tracking-widest mt-1">
            VERIFIED ORDERS // DOORSTEP EXCHANGE VALID FOR 7 DAYS POST DELIVERY
          </p>
        </div>

        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl bg-surface border border-border/80 overflow-hidden shadow-xl"
            >
              {/* Top Order Metadata Bar */}
              <div className="p-5 md:px-6 bg-surface-elevated/50 border-b border-border flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-muted-grey uppercase text-[10px] block">ORDER ID</span>
                    <span className="text-off-white font-bold">{order.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-grey uppercase text-[10px] block">DATE PLACED</span>
                    <span className="text-off-white">{order.date}</span>
                  </div>
                  <div>
                    <span className="text-muted-grey uppercase text-[10px] block">TOTAL</span>
                    <span className="text-acid-green font-bold">{getFormattedPrice(order.total)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-acid-green/10 border border-acid-green/40 text-acid-green flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    <span>{order.status}</span>
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="p-5 md:p-6 space-y-4">
                {order.items.map((item, idx) => (
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
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-base-black border border-border flex items-center justify-center font-display text-lg text-acid-green uppercase shrink-0">
                          280g
                        </div>
                      )}
                      <div>
                        <Link
                          href={`/shop/${item.slug}`}
                          className="font-display text-lg uppercase text-off-white hover:text-acid-green transition-colors"
                        >
                          {item.name}
                        </Link>
                        <p className="font-mono text-xs text-muted-grey mt-0.5">
                          COLOR: {item.color} • SIZE: {item.size} • QTY: {item.quantity}
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
                ))}
              </div>

              {/* Order Footer & Tracking Details */}
              <div className="p-4 px-6 bg-base-black/60 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-muted-grey">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Truck size={13} className="text-acid-green" />
                    <span>{order.courier}: {order.trackingNumber}</span>
                  </span>
                  <span>•</span>
                  <span>{order.paymentMethod}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={playClickSound}
                    className="hover:text-acid-green transition-colors flex items-center gap-1 text-[11px] uppercase cursor-pointer"
                  >
                    <FileText size={13} />
                    <span>INVOICE PDF</span>
                  </button>
                  <span>•</span>
                  <Link href="/shipping" className="hover:text-acid-green transition-colors text-[11px] uppercase">
                    EXCHANGE POLICY
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
