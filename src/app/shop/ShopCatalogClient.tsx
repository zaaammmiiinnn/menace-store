'use client';

import React, { useState } from 'react';
import { FormattedProduct } from '@/lib/products/queries';
import { ProductCard } from '@/components/product/ProductCard';
import { Search, SlidersHorizontal } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface ShopCatalogClientProps {
  initialProducts: FormattedProduct[];
}

export function ShopCatalogClient({ initialProducts }: ShopCatalogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Featured');

  const uniqueCategories = Array.from(
    new Set(
      initialProducts
        .map((p) => {
          if (!p.category) return null;
          const c = p.category.trim();
          return c.charAt(0).toUpperCase() + c.slice(1);
        })
        .filter(Boolean) as string[]
    )
  );

  const categories = Array.from(new Set(['All', 'Tees', ...uniqueCategories, 'Henleys', 'Waffle Tees', 'Waffle Full Sleeve']));

  const filteredProducts = initialProducts
    .filter((p) => {
      const pCat = (p.category || '').toLowerCase();
      const selCat = selectedCategory.toLowerCase();
      const matchCat =
        selectedCategory === 'All' ||
        pCat === selCat ||
        (selCat === 'tees' && (pCat === 'tees' || pCat === 'tee' || pCat.includes('tee')));

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.backQuote && p.backQuote.toLowerCase().includes(q)) ||
        pCat.includes(q);

      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.priceInr - b.priceInr;
      if (sortBy === 'Price: High to Low') return b.priceInr - a.priceInr;
      return 0;
    });

  return (
    <div className="space-y-8">
      {/* Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 p-3 bg-[#0E0E0E] border border-[#1C1C1C]">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#C6FF00] text-[#0A0A0A] font-bold shadow-[0_0_12px_rgba(198,255,0,0.25)]'
                    : 'bg-[#0A0A0A] text-[#8A8A8A] border border-[#1C1C1C] hover:text-[#F5F1E8] hover:border-[#333333]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
            <input
              type="text"
              placeholder="Search quotes, cuts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#0A0A0A] border border-[#1C1C1C] focus:border-[#C6FF00] text-xs font-mono text-[#F5F1E8] outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#8A8A8A]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#0A0A0A] border border-[#1C1C1C] text-xs font-mono text-[#F5F1E8] py-1.5 px-2.5 focus:border-[#C6FF00] outline-none cursor-pointer"
            >
              <option value="Featured">Featured</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-mono text-[#8A8A8A]">
        <span>
          DISPLAYING {filteredProducts.length} OF {initialProducts.length} SILHOUETTES
        </span>
        {(selectedCategory !== 'All' || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="text-[#C6FF00] hover:underline uppercase"
          >
            RESET FILTERS
          </button>
        )}
      </div>

      {/* Responsive Grid: 2 cols mobile, 3 cols tablet, 4 cols desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
            >
              <ProductCard product={product} index={idx} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-20 text-center bg-[#0E0E0E] border border-[#1C1C1C] p-8 space-y-4">
          <h3 className="font-display text-2xl uppercase tracking-tight text-[#F5F1E8]">
            NO PIECES MATCH YOUR SEARCH.
          </h3>
          <p className="text-xs font-mono text-[#8A8A8A]">
            Try another keyword or category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="px-6 py-2.5 bg-[#C6FF00] text-[#0A0A0A] font-display text-xs uppercase tracking-wider cursor-pointer font-bold hover:bg-[#F5F1E8]"
          >
            SHOW ALL DROP 001
          </button>
        </div>
      )}
    </div>
  );
}
