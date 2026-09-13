"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { StaggerReveal } from "@/components/transitions/stagger-reveal";
import { useUiStore } from "@/store/ui-store";
import { ArrowUpRight } from "lucide-react";

const vibes = [
  {
    id: "quiet",
    name: "Quiet Menance",
    slug: "quiet",
    tagline: "NO LOGO. ZERO APOLOGIES.",
    description: "Subtle disrespect. Blank heavyweight waffle knit for when your silhouette speaks louder than any graphic.",
    accent: "#E8E0D0",
    gradient: "from-[#1F1F1F] to-[#0A0A0A]",
    skuCount: "2 STYLES",
    image: "/images/products/quiet-menace-1.jpg",
  },
  {
    id: "loud",
    name: "Loud Menance",
    slug: "loud",
    tagline: "ACID GREEN & STATEMENT GRAPHICS.",
    description: "Bold oversized prints engineered to cause an immediate scene. You either get it or you don't.",
    accent: "#C6FF00",
    gradient: "from-[#1A2600] to-[#0A0A0A]",
    skuCount: "2 STYLES",
    image: "/images/products/loud-menace-1.jpg",
  },
  {
    id: "midnight",
    name: "Midnight Menance",
    slug: "midnight",
    tagline: "OPERATE AFTER HOURS.",
    description: "Stealth blackout colorways. Tone-on-tone matte hits and pitch black fabric designed for nocturnal routines.",
    accent: "#333333",
    gradient: "from-[#141414] to-[#0A0A0A]",
    skuCount: "1 STYLE",
    image: "/images/products/midnight-menace-1.jpg",
  },
  {
    id: "sunday",
    name: "Sunday Menance",
    slug: "sunday",
    tagline: "DO NOT DISTURB ACTIVATED.",
    description: "Vintage enzyme-washed tees that feel broken-in from day one. Made for doing absolutely nothing with supreme confidence.",
    accent: "#8A8A8A",
    gradient: "from-[#22252A] to-[#0A0A0A]",
    skuCount: "1 STYLE",
    image: "/images/products/raw-edge-boxy-1.jpg",
  },
];

export function ShopByVibe() {
  const shouldReduceMotion = useReducedMotion();
  const setCursorType = useUiStore((state) => state.setCursorType);

  return (
    <section className="w-full py-24 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col items-center text-center mb-14">
        <span className="text-acid-green font-mono text-xs uppercase tracking-widest mb-2">
          CURATED ROTATIONS
        </span>
        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl text-off-white uppercase tracking-tight">
          SHOP BY VIBE
        </h2>
        <p className="font-mono text-xs text-muted-grey uppercase tracking-widest mt-2 max-w-md">
          Pick your frequency. Tap to flip or view the collection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vibes.map((vibe, index) => (
          <StaggerReveal key={vibe.id} delay={index * 0.1}>
            <div
              className="h-[360px] sm:h-[420px] w-full [perspective:1200px]"
              onMouseEnter={() => setCursorType("EXPLORE")}
              onMouseLeave={() => setCursorType("default")}
            >
              <Link href={`/shop?vibe=${vibe.slug}`} className="block w-full h-full">
                <motion.div
                  className="w-full h-full relative [transform-style:preserve-3d] cursor-pointer group"
                  whileHover={shouldReduceMotion ? {} : { rotateY: 180 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Front Face */}
                  <div
                    className={`absolute inset-0 [backface-visibility:hidden] rounded-2xl bg-gradient-to-br ${vibe.gradient} border border-border/80 p-8 flex flex-col justify-between overflow-hidden shadow-2xl group-hover:border-acid-green/40 transition-colors`}
                  >
                    {/* Real Product Backdrop Photo */}
                    <div className="absolute inset-0 select-none overflow-hidden">
                      <img
                        src={vibe.image}
                        alt={vibe.name}
                        className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 brightness-50 contrast-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-base-black via-base-black/60 to-base-black/30" />
                    </div>

                    {/* Background noise grid */}
                    <div 
                      className="absolute inset-0 opacity-15 pointer-events-none z-0"
                      style={{
                        backgroundImage: `radial-gradient(${vibe.accent} 1px, transparent 1px)`,
                        backgroundSize: '16px 16px',
                      }}
                    />

                    <div className="flex justify-between items-start z-10">
                      <span className="font-mono text-xs tracking-widest text-muted-grey uppercase">
                        VIBE 0{index + 1}
                      </span>
                      <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded bg-white/5 border border-white/10 text-off-white">
                        {vibe.skuCount}
                      </span>
                    </div>

                    <div className="z-10">
                      <h3 className="font-display text-4xl sm:text-6xl text-off-white uppercase leading-none tracking-tight">
                        {vibe.name}
                      </h3>
                      <p className="font-mono text-xs text-acid-green uppercase tracking-widest mt-2">
                        {vibe.tagline}
                      </p>
                    </div>

                    <div className="flex items-center justify-between z-10 pt-4 border-t border-white/10">
                      <span className="text-xs font-mono text-muted-grey uppercase tracking-widest">
                        HOVER TO REVEAL
                      </span>
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-off-white group-hover:bg-acid-green group-hover:text-base-black transition-colors">
                        <ArrowUpRight size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Back Face (Flipped) */}
                  <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl bg-off-white text-base-black p-8 flex flex-col justify-between border border-white/20 shadow-2xl">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs tracking-widest text-base-black/60 uppercase">
                        MANIFESTO // {vibe.name}
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-acid-green border border-base-black" />
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-base-black leading-none">
                        {vibe.name}
                      </h3>
                      <p className="font-sans text-sm text-base-black/80 leading-relaxed">
                        {vibe.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-base-black/15">
                      <span className="font-display text-sm uppercase tracking-wider text-base-black">
                        SHOP THIS ROTATION
                      </span>
                      <span className="px-4 py-2 bg-base-black text-off-white font-display text-xs uppercase tracking-wider rounded group-hover:bg-acid-green group-hover:text-base-black transition-colors flex items-center gap-1.5">
                        <span>EXPLORE</span>
                        <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </div>
          </StaggerReveal>
        ))}
      </div>
    </section>
  );
}

export default ShopByVibe;
