'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toggleDropStatusAction } from '@/lib/admin/actions';
import {
  Flame,
  Lock,
  Layers,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react';

interface DropItem {
  id: string;
  name: string;
  description?: string;
  launch_at?: string;
  launchAt?: string;
  status: 'live' | 'upcoming' | 'archived';
  productsCount?: number;
}

interface DropsManagerProps {
  initialDrops: DropItem[];
}

export function DropsManager({ initialDrops }: DropsManagerProps) {
  const router = useRouter();
  const [drops, setDrops] = useState<DropItem[]>(initialDrops);
  const [isPending, startTransition] = useTransition();
  const [loadingDropId, setLoadingDropId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleToggleStatus = (dropId: string, currentStatus: 'live' | 'upcoming' | 'archived') => {
    const newStatus: 'live' | 'upcoming' = currentStatus === 'live' ? 'upcoming' : 'live';
    setLoadingDropId(dropId);
    setFeedbackMessage(null);

    // Optimistic UI update
    setDrops((prev) =>
      prev.map((d) => (d.id === dropId ? { ...d, status: newStatus } : d))
    );

    startTransition(async () => {
      try {
        const res = await toggleDropStatusAction(dropId, newStatus);
        if (res && res.success) {
          setFeedbackMessage({
            type: 'success',
            text:
              newStatus === 'live'
                ? `⚡ "${dropId}" is now LIVE! "BUY NOW" and "ADD TO BAG" are active on all tees.`
                : `🔒 "${dropId}" set to UPCOMING. Storefront cart is locked in VIP Radar mode.`,
          });
          router.refresh();
        } else {
          // Revert optimistic update on failure
          setDrops((prev) =>
            prev.map((d) => (d.id === dropId ? { ...d, status: currentStatus } : d))
          );
          setFeedbackMessage({
            type: 'error',
            text: 'Failed to update drop status. Please try again.',
          });
        }
      } catch (err: any) {
        console.error('Error toggling drop status:', err);
        setDrops((prev) =>
          prev.map((d) => (d.id === dropId ? { ...d, status: currentStatus } : d))
        );
        setFeedbackMessage({
          type: 'error',
          text: err?.message || 'Server error occurred while updating status.',
        });
      } finally {
        setLoadingDropId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-lg border text-xs font-mono flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
            feedbackMessage.type === 'success'
              ? 'bg-[#0E1E0E] border-[#C6FF00]/40 text-[#C6FF00]'
              : 'bg-[#1E0E0E] border-red-500/40 text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-[#8A8A8A] hover:text-[#F5F1E8] uppercase tracking-wider text-[10px]"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Drops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {drops.map((drop) => {
          const isLive = drop.status === 'live';
          const isLoadingThis = loadingDropId === drop.id && isPending;
          const launchDateStr = drop.launch_at || drop.launchAt || '2026-10-10T10:00:00+05:30';

          return (
            <div
              key={drop.id}
              className={`p-6 rounded-xl bg-[#0F0F0F] border transition-all duration-300 space-y-5 ${
                isLive
                  ? 'border-[#C6FF00]/50 shadow-[0_0_30px_rgba(198,255,0,0.08)]'
                  : 'border-[#1F1F1F]'
              }`}
            >
              {/* Header with Title & Status Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase px-2.5 py-1 rounded-full font-bold tracking-wider ${
                        isLive
                          ? 'bg-[#C6FF00]/15 text-[#C6FF00] border border-[#C6FF00]/40'
                          : 'bg-[#1F1F1F] text-[#A0A0A0] border border-[#2E2E2E]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isLive ? 'bg-[#C6FF00] animate-pulse' : 'bg-[#666666]'
                        }`}
                      />
                      {isLive ? 'LIVE • BUY NOW UNLOCKED' : 'UPCOMING • CART LOCKED'}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-[#F5F1E8] tracking-tight mt-2">
                    {drop.name}
                  </h2>
                </div>

                <div
                  className={`p-3 rounded-lg border shrink-0 ${
                    isLive
                      ? 'bg-[#C6FF00]/10 border-[#C6FF00]/30 text-[#C6FF00]'
                      : 'bg-[#141414] border-[#262626] text-[#666666]'
                  }`}
                >
                  <Layers className="w-5 h-5" />
                </div>
              </div>

              {/* Description */}
              <p className="text-[13px] text-[#8A8A8A] leading-relaxed">
                {drop.description ||
                  'First collection of 240 GSM heavyweight waffle knit oversized silhouettes. All pieces feature custom back quote typography.'}
              </p>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-[#141414] border border-[#1F1F1F] text-[12px] font-mono">
                <div>
                  <div className="text-[10px] text-[#666] uppercase flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Scheduled Launch
                  </div>
                  <div className="text-[#F5F1E8] font-medium mt-0.5">
                    {new Date(launchDateStr).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-[#666] uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Assigned SKUs
                  </div>
                  <div className="text-[#C6FF00] font-semibold mt-0.5">
                    {drop.productsCount || 8} Silhouettes
                  </div>
                </div>
              </div>

              {/* Storefront State Telemetry */}
              <div className="p-3 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A] space-y-1.5 text-xs font-mono">
                <div className="text-[#8A8A8A] text-[11px] uppercase tracking-wider flex items-center justify-between">
                  <span>Storefront Status:</span>
                  <span className={isLive ? 'text-[#C6FF00] font-bold' : 'text-[#8A8A8A]'}>
                    {isLive ? 'PUBLIC COMMERCE ACTIVE' : 'RADAR NOTIFY ONLY'}
                  </span>
                </div>
                <p className="text-[11px] text-[#666] leading-relaxed">
                  {isLive
                    ? 'Customers on the shop page can select their size and immediately click "BUY NOW" (direct to checkout) or "ADD TO BAG".'
                    : 'The storefront displays "NOTIFY ME WHEN LIVE" with email radar capture, and cart checkout is disabled.'}
                </p>
              </div>

              {/* Action Buttons: 1-Click Toggle + Storefront Preview */}
              <div className="pt-2 border-t border-[#1C1C1C] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(drop.id, drop.status)}
                  disabled={isLoadingThis}
                  className={`px-4 py-2.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${
                    isLive
                      ? 'bg-[#1E1414] hover:bg-[#2A1818] text-[#FF5555] border border-red-500/40 hover:border-red-500'
                      : 'bg-[#C6FF00] hover:bg-[#b0e600] text-[#0A0A0A] shadow-[0_0_20px_rgba(198,255,0,0.3)]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoadingThis ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>UPDATING CLOUDFLARE D1...</span>
                    </>
                  ) : isLive ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>LOCK CART // SET UPCOMING</span>
                    </>
                  ) : (
                    <>
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>MAKE LIVE // ENABLE BUY NOW</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 justify-end">
                  <Link
                    href="/shop/zamin-askari-rizvi"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141414] hover:bg-[#1A1A1A] text-[#8A8A8A] hover:text-[#F5F1E8] border border-[#242424] text-[11px] font-mono transition-colors"
                  >
                    <span>View Tee Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  <Link
                    href="/drops"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141414] hover:bg-[#1A1A1A] text-[#8A8A8A] hover:text-[#F5F1E8] border border-[#242424] text-[11px] font-mono transition-colors"
                  >
                    <span>Radar</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DropsManager;
