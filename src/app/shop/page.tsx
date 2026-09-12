"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/ui/product-card";
import { TeeScene } from "@/components/3d/tee-scene";
import { products } from "@/data/products";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";

export default function ShopPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-base-black text-off-white" />}>
      <ShopContent />
    </React.Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const initialVibe = searchParams.get("vibe") || "All";
  const searchQueryParam = searchParams.get("q") || "";
  
  const [activeVibe, setActiveVibe] = useState(initialVibe);
  const [searchQuery, setSearchQuery] = useState(searchQueryParam);
  const [sortBy, setSortBy] = useState("Featured");

  const vibes = ["All", "Quiet", "Loud", "Midnight", "Sunday"];
  const sortOptions = ["Featured", "Price: Low to High", "Price: High to Low", "Newest"];

  useEffect(() => {
    if (searchParams.get("vibe")) {
      setActiveVibe(searchParams.get("vibe") || "All");
    }
    if (searchParams.get("q")) {
      setSearchQuery(searchParams.get("q") || "");
    }
  }, [searchParams]);

  const filteredProducts = products.filter((p) => {
    // Vibe filter
    const matchesVibe = 
      activeVibe.toLowerCase() === "all" ||
      p.vibeName.toLowerCase() === activeVibe.toLowerCase() ||
      (p.vibe && p.vibe.toLowerCase() === activeVibe.toLowerCase());

    // Search query filter
    const matchesSearch = 
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesVibe && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === "Price: Low to High") return a.price - b.price;
    if (sortBy === "Price: High to Low") return b.price - a.price;
    if (sortBy === "Newest") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
  });

  return (
    <div className="min-h-screen bg-base-black text-off-white pt-24 pb-28 px-4 md:px-8 relative overflow-hidden">
      {/* Idle 3D Tee rotating in the top-right corner */}
      <div className="absolute top-20 right-4 md:right-12 w-48 h-48 md:w-64 md:h-64 pointer-events-none opacity-40 hidden lg:block select-none z-0">
        <TeeScene color="#C6FF00" scale={0.75} interactive={false} showHint={false} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Breadcrumb & Subheading */}
        <div className="flex items-center gap-2 text-xs font-mono text-muted-grey uppercase tracking-widest mb-3">
          <span>MENACE</span>
          <span>/</span>
          <span className="text-acid-green">CATALOG</span>
          <span>/</span>
          <span>DROP 001</span>
        </div>

        {/* Big Display Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-5xl sm:text-7xl md:text-9xl leading-none uppercase tracking-tighter mb-10"
        >
          ALL TEES
        </motion.h1>

        {/* Filter Bar & Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6 p-4 rounded-xl bg-surface border border-border/80">
          {/* Vibe Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-muted-grey mr-2 hidden sm:inline uppercase">
              Vibe:
            </span>
            {vibes.map((vibe) => (
              <button
                key={vibe}
                onClick={() => setActiveVibe(vibe)}
                className={`px-4 py-1.5 rounded-full font-display text-xs uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
                  activeVibe.toLowerCase() === vibe.toLowerCase() 
                    ? "bg-acid-green text-base-black border-acid-green font-bold shadow-[0_0_15px_rgba(198,255,0,0.3)]" 
                    : "bg-base-black text-muted-grey border-border hover:border-off-white hover:text-off-white"
                }`}
              >
                {vibe}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            {/* Search input */}
            <div className="relative flex-1 sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-grey" />
              <input
                type="text"
                placeholder="Search styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-base-black text-xs font-mono text-off-white rounded-lg border border-border focus:border-acid-green outline-none"
              />
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-muted-grey" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-base-black border border-border text-off-white font-mono text-xs uppercase tracking-wider py-1.5 px-3 rounded-lg focus:border-acid-green outline-none cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-base-black">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Product Count & Active Filters Indicator */}
        <div className="flex items-center justify-between text-xs font-mono text-muted-grey mb-6">
          <span>SHOWING {filteredProducts.length} STYLES</span>
          {(activeVibe.toLowerCase() !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setActiveVibe("All");
                setSearchQuery("");
              }}
              className="text-acid-green hover:underline uppercase"
            >
              CLEAR FILTERS
            </button>
          )}
        </div>

        {/* Product Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <ProductCard product={product} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-24 rounded-2xl bg-surface border border-border my-8">
            <h3 className="font-display text-3xl uppercase text-off-white mb-2">
              NO TEES MATCH THIS FREQUENCY.
            </h3>
            <p className="font-mono text-xs text-muted-grey mb-6">
              Try adjusting your vibe or search keywords.
            </p>
            <button
              onClick={() => {
                setActiveVibe("All");
                setSearchQuery("");
              }}
              className="px-6 py-2.5 bg-acid-green text-base-black font-display text-xs uppercase tracking-wider rounded cursor-pointer hover:bg-off-white transition-colors"
            >
              RESET ALL FILTERS
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
