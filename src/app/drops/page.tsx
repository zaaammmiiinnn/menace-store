"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getTimeRemaining } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { SplitFlap } from "@/components/ui/split-flap";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { useUiStore } from "@/store/ui-store";
import { Bell, Lock, Calendar, Check, Flame, ArrowRight } from "lucide-react";
import { products } from "@/data/products";

interface DropEvent {
  number: string;
  name: string;
  tagline: string;
  status: 'live' | 'upcoming' | 'classified';
  dateLabel: string;
  skus: string;
  description: string;
}

const DROPS: DropEvent[] = [
  {
    number: "DROP 001",
    name: "NOT FOR EVERYONE.",
    tagline: "CORE WAFFLE ARCHITECTURE",
    status: "live",
    dateLabel: "NOW LIVE // OCTOBER 2026",
    skus: "6 WAFFLE SKUS",
    description: "Our inaugural release. The Quiet, Loud, Midnight, Soft, Sunday, and Public Menace tees in custom 280+ GSM waffle knit.",
  },
  {
    number: "DROP 002",
    name: "ACID PROTOCOL",
    tagline: "MUTED NEONS & THERMAL LAYERING",
    status: "upcoming",
    dateLabel: "NOVEMBER 28, 2026",
    skus: "4 LIMITED COLORWAYS",
    description: "Experimental acid wash dyes, hyper-reflective hit placement, and thermal waffle long-sleeves.",
  },
  {
    number: "DROP 003",
    name: "HEAVY FLEECE",
    tagline: "500 GSM WINTER ARMOR",
    status: "classified",
    dateLabel: "JANUARY 2027",
    skus: "HOODIES + WAFFLE PANTS",
    description: "Ultra-heavyweight French terry lined with micro-waffle knit. Drop-shoulder zip hoodies with zero chest drawstring clutter.",
  },
];

export default function DropsPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 28, hours: 14, minutes: 35, seconds: 20 });
  const [remindEmail, setRemindEmail] = useState("");
  const [remindModalDrop, setRemindModalDrop] = useState<string | null>(null);

  const showToast = useUiStore((state) => state.showToast);
  const triggerConfetti = useUiStore((state) => state.triggerConfetti);

  useEffect(() => {
    const update = () => {
      setTimeLeft(getTimeRemaining(siteConfig.dropDate));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRemindSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remindEmail.trim()) return;
    showToast(`VIP alert set for ${remindModalDrop}!`);
    triggerConfetti();
    setRemindModalDrop(null);
    setRemindEmail("");
  };

  return (
    <div className="min-h-screen bg-base-black text-off-white pt-24 pb-32 px-4 md:px-8 relative overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-20">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border">
            <Calendar size={14} className="text-acid-green" />
            <span className="text-xs font-mono tracking-widest uppercase text-off-white">
              RELEASE TIMELINE &amp; TELEMETRY
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl md:text-9xl uppercase tracking-tighter text-off-white leading-none">
            DROP RADAR.
          </h1>

          <p className="font-sans text-sm sm:text-base text-muted-grey max-w-md mx-auto">
            Strict small-batch releases. When an edition sells out, it enters the permanent archive.
          </p>
        </div>

        {/* Live Drop 001 Countdown Hero Box */}
        <div className="p-8 sm:p-12 rounded-3xl bg-surface border border-acid-green/40 shadow-[0_0_50px_rgba(198,255,0,0.1)] space-y-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div className="flex items-center gap-2 text-acid-green font-mono text-xs uppercase tracking-widest font-bold">
              <Flame size={18} />
              <span>CURRENT STATUS: ACTIVE DROP</span>
            </div>
            <span className="text-xs font-mono text-muted-grey uppercase tracking-widest">
              LIMITED RESTOCKS GUARANTEED
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div>
              <span className="font-mono text-xs uppercase text-acid-green font-bold">DROP 001</span>
              <h2 className="font-display text-4xl sm:text-6xl uppercase text-off-white leading-tight">
                NOT FOR EVERYONE.
              </h2>
              <p className="font-sans text-sm text-muted-grey max-w-md mt-2">
                All 6 oversized waffle knit tees in bone, acid green, midnight, and washed black are available now.
              </p>
            </div>

            {/* Split Flap Live Clock */}
            <div className="flex items-center gap-2 sm:gap-3 p-4 rounded-2xl bg-base-black border border-border">
              <div className="flex flex-col items-center">
                <SplitFlap value={timeLeft.days.toString().padStart(2, "0")} />
                <span className="text-[9px] font-mono text-muted-grey mt-1 uppercase">Days</span>
              </div>
              <span className="text-lg font-display text-acid-green mb-3">:</span>
              <div className="flex flex-col items-center">
                <SplitFlap value={timeLeft.hours.toString().padStart(2, "0")} />
                <span className="text-[9px] font-mono text-muted-grey mt-1 uppercase">Hours</span>
              </div>
              <span className="text-lg font-display text-acid-green mb-3">:</span>
              <div className="flex flex-col items-center">
                <SplitFlap value={timeLeft.minutes.toString().padStart(2, "0")} />
                <span className="text-[9px] font-mono text-muted-grey mt-1 uppercase">Mins</span>
              </div>
              <span className="text-lg font-display text-acid-green mb-3">:</span>
              <div className="flex flex-col items-center">
                <SplitFlap value={timeLeft.seconds.toString().padStart(2, "0")} />
                <span className="text-[9px] font-mono text-muted-grey mt-1 uppercase">Secs</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link href="/shop">
              <MagneticButton variant="primary" size="lg">
                <span>SHOP DROP 001 NOW</span>
                <ArrowRight size={16} />
              </MagneticButton>
            </Link>
          </div>

          {/* 6 Drop 001 Tees Visual Lookbook Gallery */}
          <div className="pt-6 border-t border-border/60">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-acid-green uppercase tracking-widest font-bold">
                DROP 001 LINEUP // 6 CORE SILHOUETTES
              </span>
              <span className="font-mono text-[10px] text-muted-grey uppercase">
                280–300 GSM ARCHITECTURE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/shop/${p.slug}`}
                  className="group rounded-xl overflow-hidden bg-base-black border border-border/80 hover:border-acid-green/60 transition-all flex flex-col"
                >
                  <div className="aspect-[4/5] relative overflow-hidden bg-surface">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
                    />
                    {p.tags.includes('waffle') && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-mono uppercase tracking-widest bg-acid-green text-base-black font-bold">
                        WAFFLE
                      </span>
                    )}
                  </div>
                  <div className="p-2.5 flex flex-col justify-between flex-1 gap-1">
                    <span className="font-display text-xs uppercase text-off-white line-clamp-1 group-hover:text-acid-green transition-colors">
                      {p.name}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-acid-green">
                      ₹{p.price.toLocaleString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Future Drops Timeline */}
        <div className="space-y-6">
          <h3 className="font-display text-2xl uppercase tracking-wider text-off-white border-b border-border pb-3">
            UPCOMING ARCHIVE
          </h3>

          <div className="space-y-4">
            {DROPS.slice(1).map((drop) => (
              <div
                key={drop.number}
                className="p-6 sm:p-8 rounded-2xl bg-surface border border-border/80 flex flex-col sm:flex-row justify-between sm:items-center gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-muted-grey uppercase">
                      {drop.number}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-acid-green uppercase">
                      {drop.dateLabel}
                    </span>
                  </div>

                  <h4 className="font-display text-2xl sm:text-3xl uppercase text-off-white">
                    {drop.name}
                  </h4>

                  <p className="font-sans text-xs sm:text-sm text-muted-grey max-w-lg leading-relaxed">
                    {drop.description}
                  </p>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => setRemindModalDrop(drop.number)}
                    className="px-5 py-3 rounded-xl bg-base-black border border-border hover:border-acid-green text-xs font-display uppercase tracking-widest text-off-white hover:text-acid-green transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Bell size={14} />
                    <span>NOTIFY ME</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Remind Modal */}
      <AnimatePresence>
        {remindModalDrop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md p-8 rounded-3xl bg-surface border border-border shadow-2xl space-y-6 text-center"
            >
              <Bell size={28} className="mx-auto text-acid-green" />
              <div>
                <span className="font-mono text-xs text-acid-green uppercase tracking-widest">
                  VIP EARLY PASS
                </span>
                <h3 className="font-display text-3xl uppercase text-off-white mt-1">
                  GET NOTIFIED FOR {remindModalDrop}
                </h3>
                <p className="font-sans text-xs text-muted-grey mt-2">
                  Receive a secret entry link 15 minutes before public drop launch.
                </p>
              </div>

              <form onSubmit={handleRemindSubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="ENTER YOUR EMAIL OR PHONE"
                  value={remindEmail}
                  onChange={(e) => setRemindEmail(e.target.value)}
                  className="w-full bg-base-black border border-border focus:border-acid-green px-4 py-3 text-xs font-mono text-off-white rounded-xl outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-3.5 bg-acid-green text-base-black font-display text-xs uppercase tracking-wider rounded-xl font-bold hover:bg-white transition-colors cursor-pointer"
                >
                  CONFIRM VIP REMINDER
                </button>
                <button
                  type="button"
                  onClick={() => setRemindModalDrop(null)}
                  className="text-xs font-mono text-muted-grey hover:text-off-white uppercase underline cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
