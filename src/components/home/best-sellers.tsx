"use client";

import React, { useState, useEffect } from "react";
import { StaggerReveal } from "@/components/ui/stagger-reveal";
import { ProductCard } from "@/components/ui/product-card";
import { products } from "@/data/products";
import Link from "next/link";
import { motion } from "framer-motion";

export function BestSellers() {
  const [bestSellers, setBestSellers] = useState(products.slice(0, 4));

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data?.products && data.products.length > 0) {
          const active = data.products.filter((p: any) => p.status === 'active');
          if (active.length > 0) {
            setBestSellers(active.slice(0, 4));
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-14 sm:py-24 px-3 sm:px-6 md:px-10 bg-base-black max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4">
        <StaggerReveal>
          <h2 className="font-display text-4xl sm:text-6xl md:text-8xl text-off-white uppercase leading-none">
            BEST SELLERS
          </h2>
        </StaggerReveal>
        
        <Link 
          href="/shop"
          className="font-mono text-muted-grey hover:text-acid-green transition-colors uppercase tracking-widest text-xs sm:text-sm font-semibold border-b border-muted-grey hover:border-acid-green pb-1"
        >
          VIEW ALL TEES →
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {bestSellers.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default BestSellers;
