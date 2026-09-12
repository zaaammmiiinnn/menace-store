"use client";

import React, { useState, use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getProductBySlug, products } from "@/data/products";
import { TeeScene } from "@/components/3d/tee-scene";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { ProductCard } from "@/components/ui/product-card";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { playClickSound, playAddCartSound, playConfettiSound, playHoverSound } from "@/lib/sound";
import { 
  Heart, 
  Share2, 
  Truck, 
  RefreshCw, 
  ShieldCheck, 
  Ruler, 
  Sparkles, 
  Check, 
  ChevronDown, 
  ArrowRight, 
  Layers 
} from "lucide-react";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const product = getProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const addToCart = useCartStore((state) => state.addItem);
  const getFormattedPrice = useCartStore((state) => state.getFormattedPrice);
  const triggerConfetti = useUiStore((state) => state.triggerConfetti);
  const showToast = useUiStore((state) => state.showToast);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(product.id));
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const [selectedColor, setSelectedColor] = useState(product.colorways[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[2] || product.sizes[0]); // default M
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('fit');

  const handleAddToCart = () => {
    addToCart(product, selectedColor.name, selectedSize.value);
    playAddCartSound();
    playConfettiSound();
    triggerConfetti();
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([15, 30, 20]); } catch {}
    }
    setAddedAnimation(true);
    showToast(`Added ${product.name} (${selectedColor.name}, ${selectedSize.value}) to bag`);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const relatedProducts = products
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-base-black text-off-white pt-24 pb-32 px-4 md:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-mono text-muted-grey uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-acid-green transition-colors">HOME</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-acid-green transition-colors">SHOP</Link>
          <span>/</span>
          <span className="text-off-white font-bold">{product.name}</span>
        </div>

        {/* Product Hero Grid (Left: 3D Tee Viewer, Right: Buy Box) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Full 3D Interactive Tee Viewer */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative w-full aspect-[4/5] sm:aspect-square md:aspect-[4/3] lg:aspect-square rounded-2xl bg-surface border border-border/80 overflow-hidden shadow-2xl">
              {/* Dynamic background radial glow based on selected color */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-25 transition-colors duration-700"
                style={{
                  background: `radial-gradient(circle at center, ${selectedColor.hex} 0%, transparent 70%)`
                }}
              />

              {/* 3D Scene */}
              <TeeScene
                color={selectedColor.hex}
                scale={selectedSize.scale}
                interactive={true}
                productName={product.name}
              />

              {/* Top floating badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest bg-acid-green text-base-black font-bold rounded">
                  280 GSM WAFFLE
                </span>
                {product.isBestSeller && (
                  <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest bg-off-white/15 text-off-white border border-white/20 rounded backdrop-blur-md">
                    DROP 001 BESTSELLER
                  </span>
                )}
              </div>

              {/* Fabric Detail Hit */}
              <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-base-black/70 border border-white/10 backdrop-blur-md text-[11px] font-mono text-muted-grey">
                <Layers size={13} className="text-acid-green" />
                <span>HEAVYWEIGHT WAFFLE WEAVE</span>
              </div>
            </div>

            {/* Micro Feature Callouts */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-surface border border-border text-center">
                <span className="font-display text-base uppercase text-off-white block">BOXY FIT</span>
                <span className="font-mono text-[10px] text-muted-grey uppercase">DROP SHOULDER</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border text-center">
                <span className="font-display text-base uppercase text-acid-green block">PRE-SHRUNK</span>
                <span className="font-mono text-[10px] text-muted-grey uppercase">ZERO DISTORTION</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border text-center">
                <span className="font-display text-base uppercase text-off-white block">UNISEX</span>
                <span className="font-mono text-[10px] text-muted-grey uppercase">SIZES XS–4XL</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Specs & Purchase Options */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-28">
            {/* Title & Price Header */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="font-mono text-xs uppercase tracking-widest text-acid-green">
                  DROP 001 // {product.vibeName.toUpperCase()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="p-2 rounded-full bg-surface border border-border hover:border-acid-green text-off-white hover:text-acid-green transition-colors cursor-pointer"
                    aria-label="Wishlist"
                  >
                    <Heart size={16} className={isWishlisted ? 'fill-acid-green text-acid-green' : ''} />
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        showToast('Link copied to clipboard');
                      }
                    }}
                    className="p-2 rounded-full bg-surface border border-border hover:border-acid-green text-off-white hover:text-acid-green transition-colors cursor-pointer"
                    aria-label="Share product"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-off-white leading-none">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mt-3">
                <span className="font-mono text-2xl font-bold text-acid-green">
                  {getFormattedPrice(product.price)}
                </span>
                <span className="text-xs font-mono text-muted-grey uppercase tracking-widest">
                  TAX INCLUDED • FREE SHIPPING &gt; ₹1,499
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="font-sans text-sm text-off-white/80 leading-relaxed">
              {product.description}
            </p>

            {/* Colorway Selection */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-muted-grey uppercase tracking-widest">COLORWAY</span>
                <span className="text-off-white font-bold uppercase">{selectedColor.name}</span>
              </div>

              <div className="flex flex-wrap gap-3">
                {product.colorways.map((colorway) => (
                  <button
                    key={colorway.name}
                    onClick={() => {
                      setSelectedColor(colorway);
                      playClickSound();
                    }}
                    onMouseEnter={playHoverSound}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                      selectedColor.name === colorway.name
                        ? 'border-acid-green bg-surface ring-1 ring-acid-green/40 shadow-lg'
                        : 'border-border bg-base-black hover:border-white/30'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: colorway.hex }}
                    />
                    <span className="font-mono text-xs uppercase text-off-white">
                      {colorway.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector with Live 3D Scale Hint */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex justify-between items-center text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-muted-grey uppercase tracking-widest">SELECT SIZE</span>
                  <span className="text-acid-green font-bold uppercase">({selectedSize.value})</span>
                </div>
                <Link
                  href="/size-guide"
                  className="flex items-center gap-1 text-muted-grey hover:text-acid-green transition-colors uppercase underline text-[11px]"
                >
                  <Ruler size={13} />
                  <span>Interactive Size Guide</span>
                </Link>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => {
                      setSelectedSize(size);
                      playClickSound();
                    }}
                    onMouseEnter={playHoverSound}
                    className={`py-3 rounded-lg font-mono text-xs uppercase font-bold transition-all cursor-pointer border ${
                      selectedSize.value === size.value
                        ? 'bg-acid-green text-base-black border-acid-green shadow-[0_0_15px_rgba(198,255,0,0.3)]'
                        : 'bg-surface text-off-white border-border hover:border-white/40'
                    }`}
                  >
                    {size.value}
                  </button>
                ))}
              </div>

              <p className="font-mono text-[11px] text-muted-grey flex items-center gap-1.5">
                <Sparkles size={12} className="text-acid-green" />
                <span>Drop shoulder silhouette. True to size for boxy; size down for standard.</span>
              </p>
            </div>

            {/* Main Add to Cart CTA */}
            <div className="space-y-3 pt-4">
              <MagneticButton
                onClick={handleAddToCart}
                variant="primary"
                size="xl"
                className="w-full flex items-center justify-center gap-2 text-lg shadow-2xl cursor-pointer"
              >
                {addedAnimation ? (
                  <span className="flex items-center gap-2">
                    <Check size={20} />
                    <span>ADDED TO BAG!</span>
                  </span>
                ) : (
                  <span>ADD TO BAG — {getFormattedPrice(product.price)}</span>
                )}
              </MagneticButton>

              <Link href="/checkout" onClick={() => addToCart(product, selectedColor.name, selectedSize.value)}>
                <button className="w-full py-3 rounded-xl bg-surface border border-border hover:border-off-white text-xs font-display uppercase tracking-widest text-off-white transition-colors cursor-pointer mt-2">
                  BUY IT NOW WITH 1-CLICK
                </button>
              </Link>
            </div>

            {/* Accordions: Fit & Specs, Fabric & Care, Delivery & Returns */}
            <div className="divide-y divide-border border-y border-border mt-4">
              {/* Accordion 1: Fit & Sizing */}
              <div>
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'fit' ? null : 'fit')}
                  className="w-full py-3.5 flex justify-between items-center text-left font-display uppercase text-sm tracking-wider text-off-white cursor-pointer"
                >
                  <span>FIT &amp; SILHOUETTE</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${openAccordion === 'fit' ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {openAccordion === 'fit' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pb-4 text-xs font-sans text-muted-grey space-y-2 leading-relaxed"
                    >
                      <p>• Heavyweight, relaxed drop shoulder construction.</p>
                      <p>• Thick 1.25-inch high-density ribbed collar that will never bacon.</p>
                      <p>• Unisex grading engineered from XS to 4XL.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accordion 2: Fabric & Care */}
              <div>
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'fabric' ? null : 'fabric')}
                  className="w-full py-3.5 flex justify-between items-center text-left font-display uppercase text-sm tracking-wider text-off-white cursor-pointer"
                >
                  <span>280 GSM WAFFLE SPECS &amp; CARE</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${openAccordion === 'fabric' ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {openAccordion === 'fabric' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pb-4 text-xs font-sans text-muted-grey space-y-2 leading-relaxed"
                    >
                      <p>• 100% Combed Heavy Cotton with micro thermal honeycomb weave.</p>
                      <p>• Reactive garment dye with silicone soft wash finish.</p>
                      <p>• Machine wash cold with like colors. Hang dry or tumble dry low.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accordion 3: Shipping & Returns */}
              <div>
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
                  className="w-full py-3.5 flex justify-between items-center text-left font-display uppercase text-sm tracking-wider text-off-white cursor-pointer"
                >
                  <span>SHIPPING &amp; 7-DAY EXCHANGE</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${openAccordion === 'shipping' ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {openAccordion === 'shipping' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pb-4 text-xs font-sans text-muted-grey space-y-2 leading-relaxed"
                    >
                      <p>• Free express shipping on all orders over ₹1,499.</p>
                      <p>• Dispatched within 24 hours from Mumbai hub.</p>
                      <p>• Hassle-free 7-day doorstep size exchanges.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Related Drops Section */}
        <div className="mt-28 pt-16 border-t border-border">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-acid-green font-mono text-xs uppercase tracking-widest">
                COMPLETE THE ROTATION
              </span>
              <h2 className="font-display text-3xl sm:text-5xl uppercase text-off-white">
                MORE FROM DROP 001
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-mono uppercase tracking-widest text-muted-grey hover:text-acid-green transition-colors hidden sm:block"
            >
              VIEW ALL →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile Purchase */}
      <div className="fixed bottom-0 inset-x-0 p-3 bg-base-black/95 backdrop-blur-md border-t border-border z-40 lg:hidden flex items-center justify-between gap-4">
        <div>
          <span className="font-display text-sm uppercase text-off-white block line-clamp-1">
            {product.name}
          </span>
          <span className="font-mono text-xs font-bold text-acid-green">
            {getFormattedPrice(product.price)} • {selectedSize.value}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          className="px-6 py-2.5 bg-acid-green text-base-black font-display text-xs uppercase tracking-wider rounded-lg font-bold hover:bg-white transition-colors cursor-pointer"
        >
          {addedAnimation ? 'ADDED!' : 'ADD TO BAG'}
        </button>
      </div>
    </div>
  );
}
