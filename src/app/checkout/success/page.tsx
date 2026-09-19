'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, MessageCircle } from 'lucide-react';

interface OrderDetails {
  id: string;
  customerName: string;
  customerEmail: string;
  totalInr: number;
  subtotalInr: number;
  shippingInr: number;
  status: string;
  createdAt: number;
  shippingAddress?: any;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order') || 'MNC-CONFIRMED';
  const method = searchParams.get('method');
  const isCod = method === 'cod';
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  // Confetti canvas animation (acid green #C6FF00 and off-white #F5F1E8)
  useEffect(() => {
    const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      vRot: number;
    }> = [];

    const colors = ['#C6FF00', '#F5F1E8', '#8A8A8A', '#1C1C1C'];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 3 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.8) * 14,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
      });
    }

    let animationFrameId: number;
    let frame = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.rotation += p.vRot;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (frame < 180) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-[#F5F1E8] flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden">
      {/* Canvas for celebratory confetti */}
      <canvas
        id="confetti-canvas"
        className="absolute inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* Background brutalist grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1A1A1A_1px,transparent_1px)] [background-size:32px_32px] opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-xl w-full border border-[#1C1C1C] bg-[#0E0E0E] p-6 sm:p-10 text-center space-y-8 shadow-[0_0_80px_rgba(198,255,0,0.08)]">
        {/* Status insignia */}
        <div className="w-16 h-16 rounded-full bg-[#C6FF00]/10 border border-[#C6FF00] flex items-center justify-center mx-auto text-[#C6FF00] shadow-[0_0_25px_rgba(198,255,0,0.25)]">
          <CheckCircle2 size={32} />
        </div>

        {/* Hero title */}
        <div className="space-y-3">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C6FF00] bg-[#C6FF00]/10 px-3 py-1 border border-[#C6FF00]/30 inline-block">
            {isCod ? `COD ALLOCATION CONFIRMED // ${orderId}` : `ALLOCATION LOCKED // ${orderId}`}
          </span>
          <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tight text-[#F5F1E8]">
            YOU&apos;RE IN.
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#8A8A8A] max-w-md mx-auto leading-relaxed">
            {isCod
              ? 'Your Cash on Delivery order is confirmed. Your 240 GSM waffle silhouettes are allocated and queued for dispatch.'
              : 'Your payment is verified. Your 240 GSM waffle silhouettes are allocated and queued for dispatch.'}
          </p>
        </div>

        {/* Order Details Spec Card */}
        <div className="border border-[#222222] bg-[#0A0A0A] p-5 text-left font-mono text-xs space-y-3">
          <div className="flex justify-between items-center pb-2.5 border-b border-[#1C1C1C]">
            <span className="text-[#8A8A8A]">ORDER NUMBER:</span>
            <span className="text-[#F5F1E8] font-bold select-all">{orderId}</span>
          </div>

          <div className="flex justify-between items-center pb-2.5 border-b border-[#1C1C1C]">
            <span className="text-[#8A8A8A]">FULFILLMENT STATUS:</span>
            <span className="text-[#C6FF00] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C6FF00] animate-pulse" />
              CONFIRMED &amp; PREPARING
            </span>
          </div>

          <div className="flex justify-between items-center pb-2.5 border-b border-[#1C1C1C]">
            <span className="text-[#8A8A8A]">ESTIMATED DISPATCH:</span>
            <span className="text-[#F5F1E8]">Within 24 Hours</span>
          </div>

          <div className="flex justify-between items-center pt-1 text-sm font-bold">
            <span className="text-[#8A8A8A]">PAYMENT METHOD:</span>
            <span className="text-[#C6FF00] uppercase">
              {isCod ? 'CASH ON DELIVERY (COD)' : 'PAID VIA PAYU'}
            </span>
          </div>

          {isCod && (
            <div className="mt-2 p-3 bg-[#141414] border border-[#262626] text-[11px] text-[#8A8A8A] font-sans leading-relaxed">
              <span className="text-[#F5F1E8] font-mono font-bold block mb-1">
                DOORSTEP CASH SETTLEMENT
              </span>
              Please keep the exact cash amount ready for the delivery courier upon arrival.
            </div>
          )}
        </div>

        <p className="font-mono text-xs text-[#8A8A8A]">
          We&apos;ll email you when it ships.
        </p>

        {/* Action CTAs */}
        <div className="space-y-4 pt-2">
          <Link
            href="/shop"
            className="w-full h-14 bg-[#C6FF00] hover:bg-[#b5eb00] text-[#0A0A0A] font-mono text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
          >
            <span>BACK TO HOME</span>
            <ArrowRight size={14} />
          </Link>

          <a
            href="https://instagram.com/menance.wear"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[11px] font-mono text-[#8A8A8A] hover:text-[#C6FF00] transition-colors"
          >
            <MessageCircle size={13} />
            <span>Questions? DM us @menance.wear</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0A0A] text-[#F5F1E8] flex items-center justify-center font-mono text-xs">
          LOADING ORDER CONFIRMATION...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
