"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { TeeScene } from "@/components/3d/tee-scene";
import { SplitFlap } from "@/components/ui/split-flap";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { getTimeRemaining } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { ArrowDown, Sparkles } from "lucide-react";
import { playClickSound, playHoverSound } from "@/lib/sound";

const HERO_SWATCHES = [
  { name: 'Vintage Mocha', hex: '#423129' },
  { name: 'Bone', hex: '#F5F1E8' },
  { name: 'Acid Green', hex: '#C6FF00' },
  { name: 'Base Black', hex: '#0A0A0A' },
  { name: 'Cement', hex: '#B5B5B5' },
];

const SIZES = [
  { label: 'XS', scale: 0.85 },
  { label: 'S', scale: 0.9 },
  { label: 'M', scale: 0.95 },
  { label: 'L', scale: 1.0 },
  { label: 'XL', scale: 1.05 },
  { label: '2XL', scale: 1.1 },
  { label: '4XL', scale: 1.16 },
];

export function HeroSection() {
  const [timeLeft, setTimeLeft] = useState({ days: 28, hours: 14, minutes: 35, seconds: 20 });
  const [activeColor, setActiveColor] = useState('#423129');
  const [activeSize, setActiveSize] = useState('L');
  const [activeScale, setActiveScale] = useState(1.0);

  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  
  // Parallax on scroll
  const heroY = useTransform(scrollY, [0, 600], [0, 100]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.4]);

  useEffect(() => {
    // Initial calculation and interval
    const updateCountdown = () => {
      const remaining = getTimeRemaining(siteConfig.dropDate);
      setTimeLeft(remaining);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSizeChange = (sizeObj: typeof SIZES[0]) => {
    setActiveSize(sizeObj.label);
    setActiveScale(sizeObj.scale);
    playClickSound();
  };

  const tagline = "NOT FOR EVERYONE.";

  return (
    <section className="relative w-full min-h-[92vh] flex flex-col items-center justify-between pt-4 pb-12 overflow-hidden">
      {/* Background ambient lighting glow */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full blur-[140px] pointer-events-none opacity-20 transition-colors duration-1000"
        style={{ backgroundColor: activeColor === '#0A0A0A' ? '#C6FF00' : activeColor }}
      />

      {/* Top Banner Hit */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border/80"
      >
        <span className="w-2 h-2 rounded-full bg-acid-green animate-pulse" />
        <span className="font-mono text-[11px] tracking-widest text-off-white uppercase">
          DROP 001 // 280–300 GSM OVERSIZED &amp; WAFFLE KNIT
        </span>
      </motion.div>

      {/* 3D Tee Centerpiece with Controls */}
      <motion.div 
        style={{ y: shouldReduceMotion ? 0 : heroY, opacity: shouldReduceMotion ? 1 : heroOpacity }}
        className="relative w-full max-w-2xl h-[48vh] md:h-[54vh] my-auto flex items-center justify-center z-20"
      >
        <TeeScene
          color={activeColor}
          scale={activeScale}
          interactive={true}
          productName="Drop 001 Hero Tee"
        />

        {/* Floating Swatches Selector (Left side on desktop, bottom overlay on mobile) */}
        <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30 p-2 rounded-xl bg-base-black/70 backdrop-blur-md border border-white/10 shadow-xl">
          <span className="text-[9px] font-mono tracking-widest text-muted-grey uppercase text-center">
            COLOR
          </span>
          {HERO_SWATCHES.map((swatch) => (
            <button
              key={swatch.name}
              onClick={() => {
                setActiveColor(swatch.hex);
                playClickSound();
              }}
              onMouseEnter={playHoverSound}
              className={`w-5 h-5 md:w-6 md:h-6 rounded-full transition-transform cursor-pointer border ${
                activeColor === swatch.hex
                  ? 'scale-125 border-acid-green ring-2 ring-acid-green/40'
                  : 'border-white/20 hover:scale-110'
              }`}
              style={{ backgroundColor: swatch.hex }}
              title={swatch.name}
              aria-label={`Select ${swatch.name}`}
            />
          ))}
        </div>

        {/* Floating Size Selector (Right side on desktop) */}
        <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-30 p-2 rounded-xl bg-base-black/70 backdrop-blur-md border border-white/10 shadow-xl">
          <span className="text-[9px] font-mono tracking-widest text-muted-grey uppercase text-center">
            FIT
          </span>
          {SIZES.map((s) => (
            <button
              key={s.label}
              onClick={() => handleSizeChange(s)}
              onMouseEnter={playHoverSound}
              className={`text-[10px] font-mono px-2 py-1 rounded transition-colors cursor-pointer ${
                activeSize === s.label
                  ? 'bg-acid-green text-base-black font-bold'
                  : 'text-off-white/70 hover:text-off-white hover:bg-white/5'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main Tagline & Countdown Box */}
      <div className="z-20 flex flex-col items-center gap-6 text-center px-4 max-w-4xl">
        {/* Typewriter Tagline */}
        <div className="overflow-hidden">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="font-display text-4xl sm:text-6xl md:text-8xl tracking-tight text-off-white uppercase"
          >
            {tagline}
          </motion.h1>
          <p className="font-mono text-xs sm:text-sm text-muted-grey tracking-widest uppercase mt-1">
            HEAVYWEIGHT BOXY OVERSIZED TEES. ZERO COMPROMISE.
          </p>
        </div>

        {/* Live Split-Flap Drop Countdown */}
        <div className="flex items-center gap-2 sm:gap-4 p-3 rounded-2xl bg-surface/90 border border-border/80 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col items-center">
            <SplitFlap value={timeLeft.days.toString().padStart(2, "0")} />
            <span className="text-muted-grey font-mono text-[9px] sm:text-[10px] mt-1.5 uppercase tracking-widest">
              Days
            </span>
          </div>
          <span className="text-xl font-display text-acid-green mb-4">:</span>
          <div className="flex flex-col items-center">
            <SplitFlap value={timeLeft.hours.toString().padStart(2, "0")} />
            <span className="text-muted-grey font-mono text-[9px] sm:text-[10px] mt-1.5 uppercase tracking-widest">
              Hours
            </span>
          </div>
          <span className="text-xl font-display text-acid-green mb-4">:</span>
          <div className="flex flex-col items-center">
            <SplitFlap value={timeLeft.minutes.toString().padStart(2, "0")} />
            <span className="text-muted-grey font-mono text-[9px] sm:text-[10px] mt-1.5 uppercase tracking-widest">
              Mins
            </span>
          </div>
          <span className="text-xl font-display text-acid-green mb-4">:</span>
          <div className="flex flex-col items-center">
            <SplitFlap value={timeLeft.seconds.toString().padStart(2, "0")} />
            <span className="text-muted-grey font-mono text-[9px] sm:text-[10px] mt-1.5 uppercase tracking-widest">
              Secs
            </span>
          </div>
        </div>

        {/* Magnetic Shop CTA Button */}
        <div className="flex items-center gap-4 mt-2">
          <MagneticButton href="/shop" variant="primary" size="lg" cursorLabel="ENTER">
            <span className="flex items-center gap-2">
              <span>SHOP THE DROP</span>
              <Sparkles size={16} />
            </span>
          </MagneticButton>
          
          <MagneticButton href="/lookbook" variant="secondary" size="lg" cursorLabel="LOOKS">
            VIEW LOOKBOOK
          </MagneticButton>
        </div>
      </div>

      {/* Subtle Scroll Down Prompt */}
      <div className="z-10 mt-6 flex flex-col items-center gap-1 text-muted-grey">
        <span className="text-[9px] font-mono tracking-widest uppercase">SCROLL TO EXPLORE</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown size={14} className="text-acid-green" />
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
