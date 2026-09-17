'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FormattedProduct } from '@/lib/products/queries';
import { ProductCard } from '@/components/product/ProductCard';
import { Calendar, Bell, Check, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

interface DropsViewClientProps {
  products: FormattedProduct[];
  drop: {
    id: string;
    name: string;
    launchAt: string;
    status: string;
    description?: string | null;
  };
}

export function DropsViewClient({ products, drop }: DropsViewClientProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 24, hours: 13, minutes: 22, seconds: 40 });
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const targetDate = new Date(drop.launchAt).getTime() || Date.now() + 21 * 86400000;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, targetDate - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [drop.launchAt]);

  const handleEarlyAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16">
      {/* Header Telemetry */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111111] border border-[#1C1C1C]">
          <Calendar className="w-3.5 h-3.5 text-[#C6FF00]" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#F5F1E8]">
            RELEASE TELEMETRY // {drop.name}
          </span>
        </div>

        <h1 className="font-display text-5xl sm:text-7xl md:text-9xl uppercase tracking-tighter text-[#F5F1E8] leading-none">
          DROP 001.
        </h1>

        <p className="font-mono text-xs sm:text-sm text-[#8A8A8A] max-w-xl mx-auto leading-relaxed">
          {drop.description || 'First collection of 240 GSM heavyweight waffle knit oversized silhouettes. All 8 editions feature custom back quote typography and small chest insignias.'}
        </p>
      </div>

      {/* Brutalist Countdown Timer Block */}
      <div className="max-w-3xl mx-auto p-6 sm:p-8 bg-[#0E0E0E] border border-[#1C1C1C] relative">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#1C1C1C] text-[10px] font-mono tracking-widest uppercase text-[#8A8A8A]">
          <span>
            {drop.status === 'live'
              ? 'STATUS: LIVE COMMERCE // DISPATCHING ORDERS'
              : 'TARGET RELEASE: OCTOBER 10, 2026 // 10:00 AM IST'}
          </span>
          <span className="text-[#C6FF00] flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF00] animate-ping" />
            {drop.status === 'live' ? 'COMMERCE ACTIVE' : 'LIVE RADAR'}
          </span>
        </div>

        {drop.status === 'live' && (
          <div className="mb-6 p-4 bg-[#0E1A0E] border border-[#C6FF00]/30 rounded flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-[#C6FF00] uppercase font-bold tracking-wider">
                ⚡ PUBLIC DROP LIVE
              </span>
              <p className="text-sm font-display uppercase tracking-wide text-[#F5F1E8]">
                All 8 Silhouettes are unlocked for instant purchase
              </p>
            </div>
            <Link
              href="/shop/zamin-askari-rizvi"
              className="px-4 py-2 bg-[#C6FF00] text-[#0A0A0A] font-display text-xs uppercase tracking-wider font-bold rounded hover:bg-[#F5F1E8] transition-colors whitespace-nowrap"
            >
              BUY NOW // TEE 001
            </Link>
          </div>
        )}

        <div className="grid grid-cols-4 gap-3 sm:gap-6 text-center">
          <div className="p-3 sm:p-4 bg-[#0A0A0A] border border-[#1C1C1C]">
            <span className="font-display text-3xl sm:text-6xl text-[#F5F1E8] tabular-nums">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="block text-[9px] font-mono uppercase text-[#8A8A8A] tracking-wider mt-1">
              DAYS
            </span>
          </div>
          <div className="p-3 sm:p-4 bg-[#0A0A0A] border border-[#1C1C1C]">
            <span className="font-display text-3xl sm:text-6xl text-[#F5F1E8] tabular-nums">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="block text-[9px] font-mono uppercase text-[#8A8A8A] tracking-wider mt-1">
              HOURS
            </span>
          </div>
          <div className="p-3 sm:p-4 bg-[#0A0A0A] border border-[#1C1C1C]">
            <span className="font-display text-3xl sm:text-6xl text-[#F5F1E8] tabular-nums">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="block text-[9px] font-mono uppercase text-[#8A8A8A] tracking-wider mt-1">
              MINS
            </span>
          </div>
          <div className="p-3 sm:p-4 bg-[#0A0A0A] border border-[#1C1C1C]">
            <span className="font-display text-3xl sm:text-6xl text-[#C6FF00] tabular-nums">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="block text-[9px] font-mono uppercase text-[#8A8A8A] tracking-wider mt-1">
              SECS
            </span>
          </div>
        </div>

        {/* Early Access Email Form */}
        <div className="mt-8 pt-6 border-t border-[#1C1C1C]">
          {submitted ? (
            <div className="p-4 bg-[#0A0A0A] border border-[#C6FF00]/40 flex items-center justify-center gap-3 text-center">
              <Check className="w-5 h-5 text-[#C6FF00]" />
              <div className="text-left font-mono text-xs">
                <p className="font-bold text-[#F5F1E8]">EARLY ACCESS RESERVED</p>
                <p className="text-[#8A8A8A]">Your pass will be sent prior to public release.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEarlyAccessSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                required
                placeholder="Enter email for VIP password..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 bg-[#0A0A0A] border border-[#1C1C1C] focus:border-[#C6FF00] font-mono text-xs text-[#F5F1E8] outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#C6FF00] hover:bg-[#F5F1E8] text-[#0A0A0A] font-display text-xs uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>GET EARLY ACCESS</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Catalog Preview: All 8 Silhouettes */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-[#1C1C1C]">
          <div>
            <h2 className="font-display text-2xl sm:text-4xl uppercase tracking-tight text-[#F5F1E8]">
              COMPLETE DROP 001 LINEUP ({products.length} SILHOUETTES)
            </h2>
            <p className="text-xs font-mono text-[#8A8A8A]">
              Click any piece to preview quote typography and specifications.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#C6FF00] hover:underline uppercase"
          >
            <span>VIEW FULL CATALOG</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {products.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DropsViewClient;
