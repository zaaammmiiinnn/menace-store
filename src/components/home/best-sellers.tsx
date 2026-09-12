"use client";

import React from "react";
import { StaggerReveal } from "@/components/ui/stagger-reveal";
import { ProductCard } from "@/components/ui/product-card";
import { products } from "@/data/products";
import Link from "next/link";
import { motion } from "framer-motion";

export function BestSellers() {
  // Mock best sellers by taking the first 4
  const bestSellers = products.slice(0, 4);

  return (
    <section className="py-24 px-4 md:px-10 bg-base-black">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <StaggerReveal>
          <h2 className="font-anton text-5xl md:text-8xl text-off-white uppercase leading-none">
            BEST SELLERS
          </h2>
        </StaggerReveal>
        
        <Link 
          href="/shop"
          className="font-inter text-muted-grey hover:text-acid-green transition-colors uppercase tracking-widest text-sm font-semibold border-b border-muted-grey hover:border-acid-green pb-1"
        >
          VIEW ALL
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {bestSellers.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
