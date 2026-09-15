import React from 'react';
import { getProducts } from '@/lib/products/queries';
import { ShopCatalogClient } from './ShopCatalogClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'CATALOG // DROP 001 — MENANCE',
  description: 'Heavyweight 240 GSM Waffle Knit tees and henleys. Boxy oversized fit. Unique back quote architecture. Not for everyone.',
  openGraph: {
    title: 'MENANCE // DROP 001 CATALOG',
    description: 'Not for everyone. Heavyweight 240 GSM Waffle Knit collection.',
    images: ['/products/the-henley-black/front.jpg'],
  },
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F1E8] pt-24 pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#8A8A8A] uppercase tracking-widest mb-4">
          <span>MENANCE®</span>
          <span>/</span>
          <span className="text-[#C6FF00]">CATALOG</span>
          <span>/</span>
          <span>DROP 001</span>
        </div>

        {/* Display Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-[#1C1C1C]">
          <div>
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl leading-none uppercase tracking-tighter text-[#F5F1E8]">
              DROP 001
            </h1>
            <p className="font-mono text-xs sm:text-sm text-[#8A8A8A] mt-2 tracking-wider">
              240 GSM HEAVYWEIGHT WAFFLE KNIT SILHOUETTES // 8 UNIQUE EDITIONS
            </p>
          </div>
          <div className="font-mono text-xs text-[#C6FF00] tracking-widest uppercase">
            STATUS: UPCOMING RELEASE // DRAFT ARCHIVE
          </div>
        </div>

        {/* Interactive Client Grid with Filters */}
        <ShopCatalogClient initialProducts={products} />
      </div>
    </div>
  );
}
