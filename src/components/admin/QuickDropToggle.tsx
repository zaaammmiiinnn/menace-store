'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toggleDropStatusAction } from '@/lib/admin/actions';
import { Flame, Lock, Loader2, ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface QuickDropToggleProps {
  dropId: string;
  dropName: string;
  initialStatus: 'live' | 'upcoming' | 'archived';
}

export function QuickDropToggle({ dropId, dropName, initialStatus }: QuickDropToggleProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<string | null>(null);

  const isLive = status === 'live';

  const handleToggle = () => {
    const nextStatus = isLive ? 'upcoming' : 'live';
    setStatus(nextStatus);

    startTransition(async () => {
      try {
        const res = await toggleDropStatusAction(dropId, nextStatus);
        if (res?.success) {
          setNotification(
            nextStatus === 'live'
              ? '⚡ Drop is now LIVE! "BUY NOW" is active on the storefront.'
              : '🔒 Drop set to UPCOMING. Storefront cart is locked.'
          );
          router.refresh();
          setTimeout(() => setNotification(null), 4000);
        } else {
          setStatus(initialStatus);
        }
      } catch (e) {
        setStatus(initialStatus);
      }
    });
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-300 ${
        isLive
          ? 'bg-gradient-to-r from-[#0D1F0D] via-[#0E150E] to-[#0A0A0A] border-[#C6FF00]/40 shadow-[0_0_25px_rgba(198,255,0,0.06)]'
          : 'bg-[#111111] border-[#222222]'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-lg shrink-0 ${
              isLive ? 'bg-[#C6FF00]/15 text-[#C6FF00]' : 'bg-[#1C1C1C] text-[#8A8A8A]'
            }`}
          >
            {isLive ? <Flame className="w-5 h-5 fill-current" /> : <Lock className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                  isLive
                    ? 'bg-[#C6FF00]/20 text-[#C6FF00] border border-[#C6FF00]/30'
                    : 'bg-[#222222] text-[#8A8A8A]'
                }`}
              >
                {isLive ? 'STOREFRONT STATUS: LIVE' : 'STOREFRONT STATUS: UPCOMING'}
              </span>
              <span className="text-xs font-mono text-[#8A8A8A]">• {dropName}</span>
            </div>
            <p className="text-xs text-[#F5F1E8] font-sans mt-0.5">
              {isLive ? (
                <span>
                  Tees are available to purchase. Customers can click{' '}
                  <strong className="text-[#C6FF00]">"BUY NOW"</strong> and{' '}
                  <strong className="text-[#C6FF00]">"ADD TO BAG"</strong>.
                </span>
              ) : (
                <span>
                  Storefront is currently in radar pre-order mode ({' '}
                  <strong className="text-[#F5F1E8]">"NOTIFY ME WHEN LIVE"</strong> ).
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Toggle Button & Link */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleToggle}
            disabled={isPending}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isLive
                ? 'bg-[#1C1111] hover:bg-[#281515] text-[#FF5555] border border-red-500/30 hover:border-red-500/60'
                : 'bg-[#C6FF00] hover:bg-[#b0e600] text-[#0A0A0A] shadow-[0_0_15px_rgba(198,255,0,0.25)]'
            } disabled:opacity-50`}
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>SAVING...</span>
              </>
            ) : isLive ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>SET UPCOMING (LOCK CART)</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>MAKE LIVE (ENABLE BUY NOW)</span>
              </>
            )}
          </button>

          <Link
            href="/admin/drops"
            className="text-xs font-mono text-[#8A8A8A] hover:text-[#F5F1E8] flex items-center gap-1 shrink-0"
          >
            <span>All Drops</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {notification && (
        <div className="mt-3 pt-3 border-t border-[#1C1C1C] flex items-center gap-2 text-xs font-mono text-[#C6FF00]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
}

export default QuickDropToggle;
