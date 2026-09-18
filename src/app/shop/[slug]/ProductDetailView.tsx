'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FormattedProduct } from '@/lib/products/queries';
import { ProductGallery } from '@/components/product/ProductGallery';
import { SizeSelector } from '@/components/product/SizeSelector';
import { NotifyMeButton } from '@/components/product/NotifyMeButton';
import { ShieldCheck, Truck, RotateCcw, Sparkles } from 'lucide-react';

import { CustomPrintStudio, type CustomDesignConfig } from '@/components/product/CustomPrintStudio';

interface ProductDetailViewProps {
  product: FormattedProduct;
  isDropLive?: boolean;
}

export function ProductDetailView({ product, isDropLive = true }: ProductDetailViewProps) {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(product.color);
  const [edition, setEdition] = useState<'archive' | 'plain' | 'custom'>('archive');
  const [customDesign, setCustomDesign] = useState<CustomDesignConfig | null>(null);

  const priceFormatted =
    currency === 'INR'
      ? `₹${product.priceInr.toLocaleString('en-IN')}`
      : `$${product.priceUsd}`;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F1E8] pt-24 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#8A8A8A] uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-[#C6FF00] transition-colors">
            HOME
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#C6FF00] transition-colors">
            CATALOG
          </Link>
          <span>/</span>
          <span className="text-[#F5F1E8] font-bold">{product.name}</span>
        </div>

        {/* 2-Column Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column: Product Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery
              images={product.images}
              plainImages={product.plainImages}
              productName={product.name}
              backQuote={product.backQuote}
              fabricGsm={product.fabricGsm}
              isPlain={edition === 'plain' || edition === 'custom'}
              customArtwork={edition === 'custom' ? customDesign : null}
            />
          </div>


          {/* Right Column: Buy Box & Specs */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header: Title + Price + Currency Toggle */}
            <div className="space-y-3 pb-6 border-b border-[#1C1C1C]">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 text-[9px] font-mono font-bold tracking-widest uppercase bg-[#C6FF00] text-[#0A0A0A]">
                  DROP 001 // UNITEE
                </span>

                {/* Currency Toggle (INR / USD) */}
                <div className="flex items-center gap-1 bg-[#141414] border border-[#1C1C1C] p-0.5">
                  <button
                    type="button"
                    onClick={() => setCurrency('INR')}
                    className={`px-2 py-0.5 text-[10px] font-mono tracking-wider transition-colors cursor-pointer ${
                      currency === 'INR'
                        ? 'bg-[#C6FF00] text-[#0A0A0A] font-bold'
                        : 'text-[#8A8A8A] hover:text-[#F5F1E8]'
                    }`}
                  >
                    INR (₹)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`px-2 py-0.5 text-[10px] font-mono tracking-wider transition-colors cursor-pointer ${
                      currency === 'USD'
                        ? 'bg-[#C6FF00] text-[#0A0A0A] font-bold'
                        : 'text-[#8A8A8A] hover:text-[#F5F1E8]'
                    }`}
                  >
                    USD ($)
                  </button>
                </div>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#F5F1E8]">
                {product.name}
              </h1>

              <div className="flex items-baseline justify-between">
                <span className="font-mono text-2xl sm:text-3xl font-bold text-[#C6FF00] tabular-nums">
                  {priceFormatted}
                </span>
                <span className="text-[11px] font-mono text-[#8A8A8A]">
                  {isDropLive ? 'INCL. TAXES // READY TO SHIP // EXPRESS DISPATCH' : 'INCL. TAXES // SHIPS WITH DROP 001'}
                </span>
              </div>
            </div>

            {/* Edition / Style Selector */}
            <div className="space-y-2 pb-2">
              <div className="text-xs font-mono text-[#8A8A8A] uppercase tracking-wider flex items-center justify-between">
                <span>SILHOUETTE EDITION:</span>
                <span className="text-[#C6FF00] font-bold">
                  {edition === 'archive'
                    ? 'MENANCE SIGNATURE // WITH QUOTE'
                    : edition === 'plain'
                    ? 'RAW MINIMALIST BLANK'
                    : 'CUSTOM PRINT // YOUR DESIGN'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setEdition('archive')}
                  className={`py-2 px-1 text-center font-mono text-[10px] sm:text-xs border uppercase transition-all cursor-pointer ${
                    edition === 'archive'
                      ? 'border-[#C6FF00] bg-[#C6FF00] text-[#0A0A0A] font-bold shadow-[0_0_15px_rgba(198,255,0,0.2)]'
                      : 'border-[#222222] bg-[#0E0E0E] text-[#8A8A8A] hover:text-[#F5F1E8] hover:border-[#444444]'
                  }`}
                >
                  SIGNATURE
                </button>
                <button
                  type="button"
                  onClick={() => setEdition('plain')}
                  className={`py-2 px-1 text-center font-mono text-[10px] sm:text-xs border uppercase transition-all cursor-pointer ${
                    edition === 'plain'
                      ? 'border-[#C6FF00] bg-[#C6FF00] text-[#0A0A0A] font-bold shadow-[0_0_15px_rgba(198,255,0,0.2)]'
                      : 'border-[#222222] bg-[#0E0E0E] text-[#8A8A8A] hover:text-[#F5F1E8] hover:border-[#444444]'
                  }`}
                >
                  PLAIN BLANK
                </button>
                <button
                  type="button"
                  onClick={() => setEdition('custom')}
                  className={`py-2 px-1 text-center font-mono text-[10px] sm:text-xs border uppercase transition-all cursor-pointer ${
                    edition === 'custom'
                      ? 'border-[#C6FF00] bg-[#C6FF00] text-[#0A0A0A] font-bold shadow-[0_0_15px_rgba(198,255,0,0.2)]'
                      : 'border-[#222222] bg-[#0E0E0E] text-[#8A8A8A] hover:text-[#F5F1E8] hover:border-[#444444]'
                  }`}
                >
                  CUSTOM PRINT
                </button>
              </div>
            </div>

            {/* Conditional Display Based on Edition */}
            {edition === 'archive' && (
              <div className="p-4 bg-[#0E0E0E] border-l-2 border-[#C6FF00] border-y border-r border-[#1C1C1C]">
                <div className="text-[10px] font-mono text-[#C6FF00] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>BACK QUOTE ARCHITECTURE</span>
                </div>
                <div className="font-display text-xl sm:text-2xl uppercase tracking-tight text-[#F5F1E8]">
                  "{product.backQuote}"
                </div>
                <p className="text-[11px] font-mono text-[#8A8A8A] mt-1">
                  Printed across the upper rear shoulder blades in high-density archival ink.
                </p>
              </div>
            )}

            {edition === 'plain' && (
              <div className="p-4 bg-[#0E0E0E] border-l-2 border-[#8A8A8A] border-y border-r border-[#1C1C1C]">
                <div className="text-[10px] font-mono text-[#8A8A8A] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <span>RAW MINIMALIST BLANK</span>
                </div>
                <div className="font-display text-lg uppercase tracking-tight text-[#F5F1E8]">
                  ZERO GRAPHICS // PURE THERMAL DRAPE
                </div>
                <p className="text-[11px] font-mono text-[#8A8A8A] mt-1">
                  Solid clean 240 GSM waffle knit without any front chest logo or back typography. Essential silhouette.
                </p>
              </div>
            )}

            {edition === 'custom' && (
              <CustomPrintStudio
                config={customDesign}
                onChange={setCustomDesign}
                productColor={selectedColor}
              />
            )}

            {/* Fabric Details Highlight */}
            <div className="p-3 bg-[#111111] border border-[#1C1C1C] flex items-center justify-between text-xs font-mono">
              <span className="text-[#8A8A8A] uppercase">FABRIC SPEC:</span>
              <span className="text-[#F5F1E8] font-bold">
                {product.fabricGsm} GSM {product.fabricType} • {product.fit}
              </span>
            </div>

            {/* Color Swatch */}
            <div className="space-y-2">
              <div className="text-xs font-mono text-[#8A8A8A] uppercase tracking-wider">
                COLORWAY: <span className="text-[#F5F1E8] font-bold">{selectedColor}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedColor(product.color)}
                  className="px-3 py-1.5 text-xs font-mono border border-[#C6FF00] bg-[#0E0E0E] text-[#F5F1E8] flex items-center gap-2 cursor-pointer"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        product.color.toLowerCase().includes('white')
                          ? '#F5F1E8'
                          : product.color.toLowerCase().includes('brown')
                          ? '#5A3D28'
                          : product.color.toLowerCase().includes('grey') || product.color.toLowerCase().includes('acid')
                          ? '#4A4E51'
                          : '#0A0A0A',
                    }}
                  />
                  <span>{product.color}</span>
                </button>
              </div>
            </div>

            {/* Size Selector */}
            <SizeSelector
              selectedSize={selectedSize}
              onSelectSize={setSelectedSize}
            />

            {/* Notify Me / Add to Cart CTA */}
            <NotifyMeButton
              productName={product.name}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              product={product}
              isDropLive={isDropLive}
              edition={edition}
              customDesign={customDesign}
            />


            {/* Editorial Description in Menance Voice */}
            <div className="pt-4 border-t border-[#1C1C1C] space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-widest text-[#8A8A8A]">
                SILHOUETTE NOTE
              </h4>
              <p className="text-sm font-sans text-[#F5F1E8]/90 leading-relaxed">
                {product.description}
              </p>
              <p className="text-xs font-mono text-[#8A8A8A] leading-relaxed pt-2">
                Front features our signature minimal {product.frontLogo} hit. Built with custom waffle knit engineered for drape without cling.
              </p>
            </div>

            {/* Logistics & Return Policy Summary */}
            <div className="pt-4 border-t border-[#1C1C1C] grid grid-cols-1 gap-3 text-xs font-mono text-[#8A8A8A]">
              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#C6FF00] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F5F1E8]">Dispatches within 48h</strong> once Drop 001 goes live. Free express courier pan-India.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <RotateCcw className="w-4 h-4 text-[#C6FF00] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F5F1E8]">7-Day Size Exchange</strong>. Limited release items can be swapped for alternative sizes if stock permits.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#C6FF00] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F5F1E8]">Unitee Official Certified</strong> heavyweight textile warranty against de-shaping.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailView;
