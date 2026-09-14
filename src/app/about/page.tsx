"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Sparkles, Layers, ShieldCheck, Flame, ArrowRight } from "lucide-react";

export default function AboutPage() {
  const manifestoPoints = [
    {
      number: "01",
      title: "ANTI-CORPORATE BY DESIGN.",
      desc: "We don't do seasonal pitch decks or 6-month focus groups. When we want a heavyweight waffle tee with dropped shoulders and a collar that never distorts, we draft the pattern, dye the yarn, and release it.",
    },
    {
      number: "02",
      title: "NOT FOR EVERYONE.",
      desc: "If our boxy drape looks 'too wide' to your uncle, good. If our acid green print turns heads at the airport, perfect. We make clothes for people who know their silhouette and don't ask for permission.",
    },
    {
      number: "03",
      title: "FABRIC FIRST. ALWAYS.",
      desc: "Most hype brands print garbage graphics on paper-thin 160 GSM blanks. Every Menance tee is custom-knit from 280+ GSM combed cotton with a high-density thermal waffle weave that retains structure for years.",
    },
    {
      number: "04",
      title: "DEADPAN & UNBOTHERED.",
      desc: "No fake scarcity countdowns. No cringe corporate hustle slogans. Just honest garments, honest measurements, and pure construction.",
    },
  ];

  const timelineEvents = [
    {
      phase: "PHASE 00",
      date: "WINTER 2025",
      title: "THE PROTOTYPE OBSESSION",
      desc: "14 failed waffle knit samples discarded. We tweaked collar ribbing density 8 times until it survived 50 wash tests with zero neck stretching.",
    },
    {
      phase: "PHASE 01",
      date: "OCTOBER 2026",
      title: "DROP 001 // NOT FOR EVERYONE",
      desc: "The public release of our 6 core waffle SKUs in sizes XS to 4XL. Pure unisex boxy architecture.",
    },
    {
      phase: "PHASE 02",
      date: "EARLY 2027",
      title: "PROTOCOL: HEAVY FLEECE",
      desc: "500 GSM waffle-lined zip hoodies and heavyweight unstructured dad caps currently undergoing field testing.",
    },
  ];

  return (
    <div className="min-h-screen bg-base-black text-off-white pt-24 pb-32 px-4 md:px-8 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-acid-green/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-28">
        {/* Header / Hero */}
        <div className="text-center space-y-6 pt-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border"
          >
            <span className="w-2 h-2 rounded-full bg-acid-green animate-pulse" />
            <span className="text-xs font-mono tracking-widest uppercase text-off-white">
              ABOUT MENANCE APPAREL
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display text-5xl sm:text-7xl md:text-9xl uppercase tracking-tighter text-off-white leading-none"
          >
            NOT FOR <br />
            <span className="text-acid-green">EVERYONE.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-sans text-base sm:text-xl text-muted-grey max-w-2xl mx-auto leading-relaxed"
          >
            We are the anti-brand for the unbothered. Heavyweight, drop-shoulder, boxy-fit waffle tees engineered for people who appreciate pure silhouette.
          </motion.p>
        </div>

        {/* The 4 Manifesto Tenets */}
        <section id="manifesto" className="space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-border pb-6 gap-2">
            <h2 className="font-display text-3xl sm:text-5xl uppercase text-off-white">
              THE MANIFESTO
            </h2>
            <span className="font-mono text-xs text-acid-green tracking-widest uppercase">
              // 4 NON-NEGOTIABLE TENETS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {manifestoPoints.map((point) => (
              <div
                key={point.number}
                className="p-8 rounded-2xl bg-surface border border-border/80 space-y-4 hover:border-acid-green/40 transition-colors group"
              >
                <div className="flex justify-between items-start">
                  <span className="font-display text-4xl text-acid-green group-hover:scale-110 transition-transform inline-block">
                    {point.number}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-acid-green transition-colors" />
                </div>
                <h3 className="font-display text-2xl uppercase tracking-wide text-off-white">
                  {point.title}
                </h3>
                <p className="font-sans text-sm text-muted-grey leading-relaxed">
                  {point.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Fabric Breakdown Deep Dive */}
        <section className="p-8 sm:p-12 rounded-3xl bg-surface border border-border space-y-8 relative overflow-hidden">
          <div className="flex items-center gap-2 text-acid-green font-mono text-xs uppercase tracking-widest">
            <Layers size={16} />
            <span>FABRIC ANATOMY</span>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-4xl sm:text-6xl uppercase text-off-white leading-none">
              THE 280–300 GSM WAFFLE SPECIFICATION
            </h2>
            <p className="font-sans text-sm sm:text-base text-muted-grey max-w-2xl leading-relaxed">
              Why waffle knit? Standard jersey clings and shows sweat. Our micro thermal honeycomb weave traps airflow, creates natural structured drape, and holds an architectural boxy silhouette that never collapses against your body.
            </p>
          </div>

          {/* Real Waffle Knit & Oversized Silhouette Visual Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/80 group">
              <img
                src="/images/products/heavy-waffle-1.jpg"
                alt="Heavy Waffle Knit Honeycomb Weave"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-base-black/90 via-base-black/20 to-transparent flex flex-col justify-end p-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-acid-green font-bold">
                  TEXTURE MATRIX
                </span>
                <p className="font-display text-xl uppercase text-off-white">
                  300 GSM THERMAL HONEYCOMB WAFFLE
                </p>
                <p className="text-xs font-mono text-muted-grey">
                  Micro-air pocket insulation with zero distortion.
                </p>
              </div>
            </div>

            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/80 group">
              <img
                src="/images/products/heavy-waffle-2.jpg"
                alt="Oversized Boxy Silhouette Cut"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-base-black/90 via-base-black/20 to-transparent flex flex-col justify-end p-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-acid-green font-bold">
                  PATTERN ARCHITECTURE
                </span>
                <p className="font-display text-xl uppercase text-off-white">
                  DROP-SHOULDER OVERSIZED BOXY FIT
                </p>
                <p className="text-xs font-mono text-muted-grey">
                  Cut wide and relaxed with 1.25&quot; high-density collar ribbing.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
            <div className="p-4 rounded-xl bg-base-black border border-border text-center">
              <span className="font-display text-2xl sm:text-3xl text-acid-green block">280–300</span>
              <span className="font-mono text-[10px] text-muted-grey uppercase tracking-widest">GSM Weight</span>
            </div>
            <div className="p-4 rounded-xl bg-base-black border border-border text-center">
              <span className="font-display text-2xl sm:text-3xl text-off-white block">100%</span>
              <span className="font-mono text-[10px] text-muted-grey uppercase tracking-widest">Combed Cotton</span>
            </div>
            <div className="p-4 rounded-xl bg-base-black border border-border text-center">
              <span className="font-display text-2xl sm:text-3xl text-acid-green block">1.25&quot;</span>
              <span className="font-mono text-[10px] text-muted-grey uppercase tracking-widest">Ribbed Collar</span>
            </div>
            <div className="p-4 rounded-xl bg-base-black border border-border text-center">
              <span className="font-display text-2xl sm:text-3xl text-off-white block">XS–4XL</span>
              <span className="font-mono text-[10px] text-muted-grey uppercase tracking-widest">Unisex Range</span>
            </div>
          </div>
        </section>

        {/* Interactive Roadmap Timeline */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-border pb-6 gap-2">
            <h2 className="font-display text-3xl sm:text-5xl uppercase text-off-white">
              THE TIMELINE
            </h2>
            <span className="font-mono text-xs text-acid-green tracking-widest uppercase">
              // ARCHIVAL PROGRESSION
            </span>
          </div>

          <div className="space-y-6">
            {timelineEvents.map((evt, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-2xl bg-surface border border-border/80 flex flex-col sm:flex-row gap-6 sm:items-center justify-between hover:border-acid-green/30 transition-colors"
              >
                <div className="sm:w-48 shrink-0">
                  <span className="text-acid-green font-mono text-xs uppercase tracking-widest block font-bold">
                    {evt.phase}
                  </span>
                  <span className="text-muted-grey font-mono text-[11px] uppercase">
                    {evt.date}
                  </span>
                </div>

                <div className="flex-1 space-y-1">
                  <h3 className="font-display text-xl sm:text-2xl uppercase text-off-white">
                    {evt.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-muted-grey leading-relaxed">
                    {evt.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="text-center p-12 rounded-3xl bg-surface border border-acid-green/30 space-y-6">
          <h2 className="font-display text-4xl sm:text-6xl uppercase text-off-white">
            READY TO JOIN THE ROTATION?
          </h2>
          <p className="font-mono text-xs text-muted-grey uppercase tracking-widest max-w-md mx-auto">
            Drop 001 is now open. Pick your vibe and experience the waffle knit difference.
          </p>
          <div className="pt-2">
            <MagneticButton href="/shop" variant="primary" size="xl">
              SHOP ALL TEES NOW
            </MagneticButton>
          </div>
        </div>
      </div>
    </div>
  );
}
