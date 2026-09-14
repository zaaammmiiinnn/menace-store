"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { products } from "@/data/products";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { ShoppingBag, ArrowRight, X, Sparkles } from "lucide-react";

interface LookItem {
  id: number;
  title: string;
  subtitle: string;
  tagline: string;
  slug: string;
  productName: string;
  price: number;
  colorName: string;
  colorHex: string;
  image: string;
  hotspots: { x: number; y: number; label: string; item: string }[];
}

const LOOKS: LookItem[] = [
  {
    id: 1,
    title: "THE QUIET DISRESPECT",
    subtitle: "BLANK ARCHITECTURE",
    tagline: "NO LOGO. NO NOISE. DROP-SHOULDER BOXY SILHOUETTE.",
    slug: "quiet-menace",
    productName: "The Quiet Menace Tee",
    price: 1299,
    colorName: "Pitch Black",
    colorHex: "#0A0A0A",
    image: "/images/products/quiet-menace-1.jpg",
    hotspots: [
      { x: 50, y: 45, label: "280 GSM Combed Cotton", item: "The Quiet Menace Tee" },
      { x: 52, y: 28, label: "1.25\" High-Density Rib Collar", item: "Neckline Detail" },
    ],
  },
  {
    id: 2,
    title: "ACID REACTION",
    subtitle: "STATEMENT GRAPHIC",
    tagline: "BOLD OVERSIZED SCREENPRINT WITH DISRUPTIVE CONTRAST.",
    slug: "loud-menace",
    productName: "The Loud Menace Tee",
    price: 1499,
    colorName: "Acid Green",
    colorHex: "#C6FF00",
    image: "/images/products/loud-menace-1.jpg",
    hotspots: [
      { x: 48, y: 48, label: "Screenprinted Front Hit", item: "The Loud Menace Tee" },
      { x: 65, y: 55, label: "Oversized Elbow-Length Sleeve", item: "Sleeve Cut" },
    ],
  },
  {
    id: 3,
    title: "NOCTURNAL PROTOCOL",
    subtitle: "BLACKOUT ROTATION",
    tagline: "PITCH BLACK TEXTURE FOR 3:00 AM OPERATIONS.",
    slug: "midnight-menace",
    productName: "The Midnight Menace Tee",
    price: 1399,
    colorName: "Pitch Black",
    colorHex: "#000000",
    image: "/images/products/midnight-menace-1.jpg",
    hotspots: [
      { x: 50, y: 42, label: "Stealth Tone-on-Tone Dye", item: "The Midnight Menace Tee" },
      { x: 45, y: 65, label: "Seamless Side Venting", item: "Boxy Hem" },
    ],
  },
  {
    id: 4,
    title: "SUNDAY AFTERMATH",
    subtitle: "ENZYME WASHED",
    tagline: "LIVED-IN COMFORT FOR DOING ABSOLUTELY NOTHING.",
    slug: "sunday-menace",
    productName: "The Raw Edge Boxy Tee",
    price: 1299,
    colorName: "Cement Grey",
    colorHex: "#B5B5B5",
    image: "/images/products/raw-edge-boxy-1.jpg",
    hotspots: [
      { x: 50, y: 44, label: "Raw Edge Roll Hem", item: "The Raw Edge Tee" },
      { x: 52, y: 28, label: "Vintage Pre-Shrunk Finish", item: "Collar Detail" },
    ],
  },
  {
    id: 5,
    title: "THE HEAVY WAFFLE",
    subtitle: "HONEYCOMB WEAVE",
    tagline: "300 GSM THERMAL WAFFLE KNIT. ARCHITECTURAL DRAPE THAT NEVER COLLAPSES.",
    slug: "soft-menace",
    productName: "The Oversized Heavy Waffle Tee",
    price: 1599,
    colorName: "Bone Cream",
    colorHex: "#E8E0D0",
    image: "/images/products/heavy-waffle-1.jpg",
    hotspots: [
      { x: 50, y: 42, label: "300 GSM Thermal Honeycomb Waffle Weave", item: "The Heavy Waffle Tee" },
      { x: 55, y: 60, label: "Relaxed Boxy Cropped Cut", item: "Waist Hem" },
    ],
  },
  {
    id: 6,
    title: "CYBERNETIC ACID",
    subtitle: "LUMINESCENT PROTOCOL",
    tagline: "HIGH-VISIBILITY ACID GREEN ENGINEERED FOR FLASH PHOTOGRAPHY.",
    slug: "public-menace",
    productName: "The Acid Menace Tee",
    price: 1499,
    colorName: "Acid Green",
    colorHex: "#C6FF00",
    image: "/images/products/acid-menace-1.jpg",
    hotspots: [
      { x: 50, y: 45, label: "High-Visibility Cyber Typography", item: "The Acid Menace Tee" },
      { x: 62, y: 35, label: "Sealed Contrast Seams", item: "Shoulder Construction" },
    ],
  },
];

function LookSection({ look }: { look: LookItem }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const [activeHotspot, setActiveHotspot] = useState<typeof look.hotspots[0] | null>(null);

  const product = products.find((p) => p.slug === look.slug);
  const addToCart = useCartStore((state) => state.addItem);
  const getFormattedPrice = useCartStore((state) => state.getFormattedPrice);
  const triggerConfetti = useUiStore((state) => state.triggerConfetti);
  const showToast = useUiStore((state) => state.showToast);

  const handleQuickAdd = () => {
    if (product) {
      addToCart(product, look.colorName, 'L');
      triggerConfetti();
      showToast(`Added ${product.name} (Size L) to bag`);
    }
  };

  return (
    <div ref={ref} className="relative min-h-[90vh] md:min-h-screen w-full overflow-hidden flex items-center justify-center p-4 border-b border-border/60">
      {/* Parallax Background Visual */}
      <motion.div 
        style={{ y }}
        className="absolute inset-[-15%] z-0"
      >
        <div 
          className="w-full h-full"
          style={{
            background: `radial-gradient(ellipse at center, ${look.colorHex}22 0%, #0A0A0A 80%)`,
          }}
        />
        {/* Subtle grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </motion.div>

      {/* High-Resolution Editorial Streetwear Lookbook Photo Backdrop */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none opacity-30 md:opacity-45 select-none"
      >
        <div className="relative w-80 sm:w-96 md:w-[480px] aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
          <img
            src={look.image}
            alt={look.productName}
            className="w-full h-full object-cover object-center brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-base-black via-base-black/40 to-base-black/10" />
        </div>
      </motion.div>

      {/* Interactive Hotspot Pins */}
      {look.hotspots.map((h, i) => (
        <div
          key={i}
          className="absolute z-30"
          style={{ left: `${h.x}%`, top: `${h.y}%` }}
        >
          <button
            onClick={() => setActiveHotspot(activeHotspot?.label === h.label ? null : h)}
            className="relative flex items-center justify-center w-7 h-7 rounded-full bg-base-black/80 border border-acid-green text-acid-green hover:scale-125 transition-transform cursor-pointer shadow-[0_0_15px_rgba(198,255,0,0.4)]"
            aria-label="View product hotspot"
          >
            <span className="w-2 h-2 rounded-full bg-acid-green animate-ping absolute" />
            <span className="text-[10px] font-mono font-bold">+</span>
          </button>
        </div>
      ))}

      {/* Hotspot Popover Card */}
      <AnimatePresence>
        {activeHotspot && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute z-40 p-4 rounded-xl bg-base-black/95 backdrop-blur-xl border border-acid-green/60 shadow-2xl max-w-xs"
            style={{
              left: `${activeHotspot.x}%`,
              top: `${activeHotspot.y + 6}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="flex justify-between items-start gap-3 mb-2">
              <span className="font-mono text-[10px] text-acid-green uppercase tracking-widest font-bold">
                FEATURED SPOTLIGHT
              </span>
              <button
                onClick={() => setActiveHotspot(null)}
                className="text-muted-grey hover:text-off-white"
              >
                <X size={14} />
              </button>
            </div>
            <h4 className="font-display text-base uppercase text-off-white">
              {activeHotspot.label}
            </h4>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
              <span className="font-mono text-xs text-acid-green font-bold">
                {getFormattedPrice(look.price)}
              </span>
              <button
                onClick={handleQuickAdd}
                className="px-3 py-1 bg-acid-green text-base-black font-display text-[10px] uppercase rounded hover:bg-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ShoppingBag size={11} />
                <span>QUICK ADD</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Centerpiece Content */}
      <div className="relative z-20 text-center flex flex-col items-center max-w-3xl px-4">
        <span className="font-mono text-acid-green tracking-[0.3em] text-xs font-bold uppercase mb-3 flex items-center gap-1.5">
          <Sparkles size={13} />
          <span>LOOK 0{look.id} // {look.subtitle}</span>
        </span>

        <h2 className="font-display text-5xl sm:text-7xl md:text-9xl text-off-white uppercase tracking-tight leading-none mb-4">
          {look.title}
        </h2>

        <p className="font-mono text-xs sm:text-sm text-muted-grey uppercase tracking-widest max-w-lg mb-8 leading-relaxed">
          {look.tagline}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href={`/shop/${look.slug}`}>
            <MagneticButton variant="primary" size="lg" cursorLabel="VIEW">
              <span>SHOP THIS FIT ({getFormattedPrice(look.price)})</span>
              <ArrowRight size={16} />
            </MagneticButton>
          </Link>

          <button
            onClick={handleQuickAdd}
            className="px-6 py-3.5 rounded-xl bg-surface border border-border hover:border-acid-green text-xs font-display uppercase tracking-widest text-off-white transition-colors cursor-pointer flex items-center gap-2"
          >
            <ShoppingBag size={14} />
            <span>QUICK ADD (SIZE L)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LookbookPage() {
  return (
    <div className="bg-base-black text-off-white min-h-screen pt-20">
      {/* Intro Header */}
      <div className="py-16 px-4 md:px-8 text-center max-w-4xl mx-auto space-y-4">
        <span className="font-mono text-xs tracking-widest text-acid-green uppercase">
          STYLING ARCHIVE // DROP 001
        </span>
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-display text-6xl sm:text-8xl md:text-[10rem] uppercase tracking-tighter leading-none"
        >
          LOOKBOOK
        </motion.h1>
        <p className="font-mono text-xs sm:text-sm text-muted-grey uppercase tracking-widest max-w-md mx-auto">
          Tap hotspot plus markers on the fits to preview specifications and add to your rotation.
        </p>
      </div>
      
      {/* Continuous Parallax Lookbook List */}
      <div className="flex flex-col w-full">
        {LOOKS.map((look) => (
          <LookSection key={look.id} look={look} />
        ))}
      </div>
    </div>
  );
}
