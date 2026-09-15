'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, RefreshCw, MessageCircle } from 'lucide-react';

function FailureContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'Transaction was cancelled or declined by your bank.';
  const orderId = searchParams.get('order');

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F1E8] flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background brutalist grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1A1A1A_1px,transparent_1px)] [background-size:32px_32px] opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full border border-red-950/60 bg-[#0E0E0E] p-6 sm:p-10 text-center space-y-8 shadow-[0_0_80px_rgba(255,50,50,0.06)]">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-full bg-red-950/30 border border-red-500/50 flex items-center justify-center mx-auto text-red-400 shadow-[0_0_20px_rgba(255,0,0,0.15)]">
          <AlertTriangle size={32} />
        </div>

        {/* Hero title */}
        <div className="space-y-3">
          {orderId && (
            <span className="font-mono text-xs uppercase tracking-widest text-red-400 bg-red-950/20 px-3 py-1 border border-red-500/30 inline-block">
              ATTEMPT REF: {orderId}
            </span>
          )}
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-[#F5F1E8]">
            SOMETHING BROKE.
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#8A8A8A] max-w-sm mx-auto leading-relaxed">
            Your card or payment channel did not settle. Your silhouettes remain allocated in your bag.
          </p>
        </div>

        {/* Failure reason card */}
        <div className="border border-[#222222] bg-[#0A0A0A] p-4 text-left font-mono text-xs space-y-2">
          <span className="text-[10px] text-[#8A8A8A] uppercase block">
            DECLINE TELEMETRY:
          </span>
          <p className="text-red-300 break-words">{reason}</p>
        </div>

        {/* Action CTAs */}
        <div className="space-y-4 pt-2">
          <Link
            href="/checkout"
            className="w-full h-14 bg-[#C6FF00] hover:bg-[#b5eb00] text-[#0A0A0A] font-mono text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>TRY AGAIN</span>
          </Link>

          <a
            href="https://instagram.com/menance.wear"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[11px] font-mono text-[#8A8A8A] hover:text-[#C6FF00] transition-colors"
          >
            <MessageCircle size={13} />
            <span>Still stuck? DM us @menance.wear</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutFailurePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0A0A] text-[#F5F1E8] flex items-center justify-center font-mono text-xs">
          LOADING...
        </div>
      }
    >
      <FailureContent />
    </Suspense>
  );
}
