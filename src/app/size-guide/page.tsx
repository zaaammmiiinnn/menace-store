"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { TeeScene } from "@/components/3d/tee-scene";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Ruler, Sparkles, Check, ArrowRight } from "lucide-react";

const SIZES = [
  { size: "XS", scale: 0.85, chestCm: "54", lengthCm: "70", chestIn: "21.2", lengthIn: "27.5", rec: "Recommended for 5'2\" - 5'6\" (Slim fit)" },
  { size: "S", scale: 0.90, chestCm: "56", lengthCm: "72", chestIn: "22.0", lengthIn: "28.3", rec: "Recommended for 5'5\" - 5'8\" (Relaxed)" },
  { size: "M", scale: 0.95, chestCm: "58", lengthCm: "74", chestIn: "22.8", lengthIn: "29.1", rec: "Recommended for 5'8\" - 5'11\" (True Boxy)" },
  { size: "L", scale: 1.00, chestCm: "60", lengthCm: "76", chestIn: "23.6", lengthIn: "30.0", rec: "Recommended for 5'10\" - 6'1\" (Core Menance Fit)" },
  { size: "XL", scale: 1.06, chestCm: "62", lengthCm: "78", chestIn: "24.4", lengthIn: "30.7", rec: "Recommended for 6'0\" - 6'3\" (Heavy Drop)" },
  { size: "2XL", scale: 1.11, chestCm: "64", lengthCm: "80", chestIn: "25.2", lengthIn: "31.5", rec: "Recommended for 6'2\"+ or Max Volume" },
  { size: "3XL", scale: 1.15, chestCm: "66", lengthCm: "82", chestIn: "26.0", lengthIn: "32.2", rec: "Ultra Baggy Heavy Drape" },
  { size: "4XL", scale: 1.18, chestCm: "68", lengthCm: "84", chestIn: "26.8", lengthIn: "33.0", rec: "Maximum Oversized Silhouette" },
];

export default function SizeGuidePage() {
  const [sizeIndex, setSizeIndex] = useState(3); // Default L
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');

  const currentSize = SIZES[sizeIndex];

  return (
    <div className="min-h-screen bg-base-black text-off-white pt-24 pb-32 px-4 md:px-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border">
            <Ruler size={14} className="text-acid-green" />
            <span className="text-xs font-mono tracking-widest uppercase text-off-white">
              INTERACTIVE FIT ENGINE
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl uppercase tracking-tighter text-off-white leading-none">
            HOW IT FITS.
          </h1>

          <p className="font-sans text-sm sm:text-base text-muted-grey max-w-xl mx-auto">
            Drag the slider to preview silhouette scale on the 3D tee. Built boxy with dropped shoulders.
          </p>
        </div>

        {/* Interactive 3D Scale Slider Box */}
        <div className="p-6 sm:p-10 rounded-3xl bg-surface border border-border/80 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: 3D Tee that scales with slider */}
          <div className="lg:col-span-6 w-full h-[380px] sm:h-[420px] rounded-2xl bg-base-black border border-border overflow-hidden relative">
            <TeeScene
              color="#C6FF00"
              scale={currentSize.scale}
              interactive={true}
              productName="Menance Sizing Silhouette"
            />
            <div className="absolute top-4 left-4 z-10 font-mono text-xs text-acid-green bg-base-black/80 px-2.5 py-1 rounded border border-acid-green/30">
              SCALE: {(currentSize.scale * 100).toFixed(0)}%
            </div>
            <div className="absolute bottom-4 left-4 z-10 font-mono text-xs text-off-white bg-base-black/80 px-2.5 py-1 rounded border border-white/10">
              CURRENT SIZE: <span className="text-acid-green font-bold">{currentSize.size}</span>
            </div>
          </div>

          {/* Right: Slider & Recommendations */}
          <div className="lg:col-span-6 space-y-8">
            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-2">
                <span className="text-muted-grey uppercase tracking-widest">DRAG TO PREVIEW FIT</span>
                <span className="text-acid-green font-bold text-sm">{currentSize.size}</span>
              </div>

              {/* Slider Input */}
              <input
                type="range"
                min="0"
                max={SIZES.length - 1}
                value={sizeIndex}
                onChange={(e) => setSizeIndex(Number(e.target.value))}
                className="w-full h-2 bg-base-black rounded-lg appearance-none cursor-pointer accent-acid-green"
              />

              {/* Size marks */}
              <div className="flex justify-between font-mono text-xs text-muted-grey mt-2">
                {SIZES.map((s, idx) => (
                  <button
                    key={s.size}
                    onClick={() => setSizeIndex(idx)}
                    className={`cursor-pointer transition-colors ${
                      idx === sizeIndex ? 'text-acid-green font-bold scale-125' : 'hover:text-off-white'
                    }`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="p-5 rounded-2xl bg-base-black border border-border/80 space-y-3">
              <div className="flex items-center gap-2 text-acid-green font-mono text-xs uppercase tracking-wider font-bold">
                <Sparkles size={15} />
                <span>FIT GUIDANCE FOR SIZE {currentSize.size}</span>
              </div>
              <p className="font-sans text-sm text-off-white leading-relaxed">
                {currentSize.rec}
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/60 text-xs font-mono">
                <div>
                  <span className="text-muted-grey block">Chest Width:</span>
                  <span className="text-off-white font-bold text-sm">
                    {unit === 'cm' ? `${currentSize.chestCm} cm` : `${currentSize.chestIn} in`}
                  </span>
                </div>
                <div>
                  <span className="text-muted-grey block">Body Length:</span>
                  <span className="text-off-white font-bold text-sm">
                    {unit === 'cm' ? `${currentSize.lengthCm} cm` : `${currentSize.lengthIn} in`}
                  </span>
                </div>
              </div>
            </div>

            {/* Fit Rule summary */}
            <div className="p-4 rounded-xl bg-acid-green/10 border border-acid-green/30 text-xs font-mono text-acid-green">
              <strong>PRO TIP:</strong> If you want true 90s boxy drape, stay true to size. If you want a more standard tailored fit, size down by one.
            </div>
          </div>
        </div>

        {/* Complete Measurements Table with Unit Switcher */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <h2 className="font-display text-3xl sm:text-4xl uppercase text-off-white">
              DETAILED MEASUREMENTS (XS TO 4XL)
            </h2>

            {/* Unit Toggle: CM vs IN */}
            <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border text-xs font-mono">
              <button
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  unit === 'cm' ? 'bg-acid-green text-base-black font-bold' : 'text-muted-grey hover:text-off-white'
                }`}
              >
                CENTIMETERS
              </button>
              <button
                onClick={() => setUnit('in')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  unit === 'in' ? 'bg-acid-green text-base-black font-bold' : 'text-muted-grey hover:text-off-white'
                }`}
              >
                INCHES
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-surface border border-border/80">
            <table className="w-full text-left border-collapse min-w-[620px] font-mono text-xs">
              <thead>
                <tr className="border-b border-border bg-base-black text-muted-grey uppercase">
                  <th className="py-4 px-6 font-display text-base text-off-white">SIZE</th>
                  <th className="py-4 px-6">CHEST WIDTH</th>
                  <th className="py-4 px-6">BODY LENGTH</th>
                  <th className="py-4 px-6">SHOULDER DROP</th>
                  <th className="py-4 px-6">RECOMMENDED HEIGHT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {SIZES.map((s, idx) => (
                  <tr
                    key={s.size}
                    onClick={() => setSizeIndex(idx)}
                    className={`transition-colors cursor-pointer ${
                      idx === sizeIndex
                        ? 'bg-acid-green/15 text-acid-green font-bold'
                        : 'hover:bg-white/5 text-off-white/80'
                    }`}
                  >
                    <td className="py-4 px-6 font-display text-lg text-off-white">{s.size}</td>
                    <td className="py-4 px-6">{unit === 'cm' ? `${s.chestCm} cm` : `${s.chestIn} in`}</td>
                    <td className="py-4 px-6">{unit === 'cm' ? `${s.lengthCm} cm` : `${s.lengthIn} in`}</td>
                    <td className="py-4 px-6">{unit === 'cm' ? `${Number(s.chestCm) - 4} cm` : `${(Number(s.chestIn) - 1.5).toFixed(1)} in`}</td>
                    <td className="py-4 px-6 text-muted-grey text-[11px]">{s.rec.split('(')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-6">
          <MagneticButton href="/shop" variant="primary" size="lg">
            FIND YOUR FIT IN THE SHOP
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}
