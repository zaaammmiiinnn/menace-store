"use client";

import React, { useRef, useState, useEffect } from "react";
import { products } from "@/data/products";
import { ProductCard } from "@/components/ui/product-card";
import { ArrowLeft, ArrowRight, Flame } from "lucide-react";
import Link from "next/link";
import { playClickSound } from "@/lib/sound";

export function FeaturedDrop() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dropProducts, setDropProducts] = useState(products.slice(0, 12));

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data?.products && data.products.length > 0) {
          const active = data.products.filter((p: any) => p.status === 'active');
          if (active.length > 0) {
            setDropProducts(active.slice(0, 12));
          }
        }
      })
      .catch(() => {});
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
      playClickSound();
    }
  };

  return (
    <section className="w-full py-12 sm:py-20 px-3 sm:px-6 md:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-10 gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-acid-green font-mono text-[10px] sm:text-xs uppercase tracking-widest mb-1.5">
            <Flame size={14} />
            <span>DROP 001 // LAUNCH COLLECTION</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl md:text-7xl uppercase tracking-tighter text-off-white">
            THE 8 DROP 001 SILHOUETTES
          </h2>
        </div>

        {/* Carousel Navigation Arrows & View All link */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
          <Link
            href="/shop"
            className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-muted-grey hover:text-acid-green transition-colors"
          >
            VIEW ALL TEES →
          </Link>
          
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 sm:p-3 rounded-full bg-surface border border-border text-off-white hover:border-acid-green hover:text-acid-green transition-colors cursor-pointer shadow-md"
              aria-label="Previous tees"
            >
              <ArrowLeft size={14} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 sm:p-3 rounded-full bg-surface border border-border text-off-white hover:border-acid-green hover:text-acid-green transition-colors cursor-pointer shadow-md"
              aria-label="Next tees"
            >
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 sm:pb-6 hide-scrollbar cursor-grab active:cursor-grabbing"
      >
        {dropProducts.map((product, i) => (
          <div
            key={product.id}
            className="w-[260px] sm:w-[300px] md:w-[340px] shrink-0 snap-start"
          >
            <ProductCard product={product} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedDrop;
