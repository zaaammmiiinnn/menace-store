'use client';

import React, { useState } from 'react';
import { Ruler, X } from 'lucide-react';

interface SizeSelectorProps {
  selectedSize: string;
  onSelectSize: (size: string) => void;
  sizes?: string[];
  stockMap?: Record<string, number>;
}

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];

export function SizeSelector({
  selectedSize,
  onSelectSize,
  sizes = DEFAULT_SIZES,
  stockMap = {},
}: SizeSelectorProps) {
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-[#8A8A8A] uppercase tracking-wider">
          SELECT SIZE // <span className="text-[#F5F1E8] font-bold">{selectedSize}</span>
        </span>
        <button
          type="button"
          onClick={() => setShowSizeGuide(true)}
          className="inline-flex items-center gap-1.5 text-[#C6FF00] hover:text-[#F5F1E8] transition-colors cursor-pointer text-[11px] uppercase tracking-wider"
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>Size Guide</span>
        </button>
      </div>

      {/* Sizes Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {sizes.map((size) => {
          const isSelected = selectedSize === size;
          const stock = stockMap[size] ?? 0;

          return (
            <button
              key={size}
              type="button"
              onClick={() => onSelectSize(size)}
              className={`py-3 px-2 flex flex-col items-center justify-center border font-mono text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-[#C6FF00] text-[#0A0A0A] border-[#C6FF00] font-bold shadow-[0_0_15px_rgba(198,255,0,0.25)]'
                  : 'bg-[#0E0E0E] text-[#F5F1E8] border-[#1C1C1C] hover:border-[#333333]'
              }`}
            >
              <span className="text-sm font-bold">{size}</span>
              <span
                className={`text-[9px] mt-0.5 ${
                  isSelected ? 'text-[#0A0A0A]/80' : 'text-[#8A8A8A]'
                }`}
              >
                {stock > 0 ? `${stock} left` : 'DROP 1'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-lg bg-[#0E0E0E] border border-[#1C1C1C] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1C]">
              <div>
                <h4 className="font-display text-lg uppercase tracking-tight text-[#F5F1E8]">
                  BOXY OVERSIZED FIT MATRIX
                </h4>
                <p className="text-[11px] font-mono text-[#8A8A8A]">
                  240 GSM WAFFLE KNIT // DROP SHOULDER SILHOUETTE
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSizeGuide(false)}
                className="p-1 text-[#8A8A8A] hover:text-[#F5F1E8] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left font-mono text-xs text-[#F5F1E8]">
                <thead>
                  <tr className="border-b border-[#1C1C1C] text-[#8A8A8A] text-[10px]">
                    <th className="py-2 pr-3">SIZE</th>
                    <th className="py-2 px-3">CHEST (INCHES)</th>
                    <th className="py-2 px-3">LENGTH (INCHES)</th>
                    <th className="py-2 pl-3">SHOULDER (INCHES)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1C1C]/60 text-[11px]">
                  <tr><td className="py-2 font-bold text-[#C6FF00]">S</td><td className="py-2 px-3">44"</td><td className="py-2 px-3">28.5"</td><td className="py-2 pl-3">21.5"</td></tr>
                  <tr><td className="py-2 font-bold text-[#C6FF00]">M</td><td className="py-2 px-3">46"</td><td className="py-2 px-3">29.5"</td><td className="py-2 pl-3">22.5"</td></tr>
                  <tr><td className="py-2 font-bold text-[#C6FF00]">L</td><td className="py-2 px-3">48"</td><td className="py-2 px-3">30.5"</td><td className="py-2 pl-3">23.5"</td></tr>
                  <tr><td className="py-2 font-bold text-[#C6FF00]">XL</td><td className="py-2 px-3">50"</td><td className="py-2 px-3">31.5"</td><td className="py-2 pl-3">24.5"</td></tr>
                  <tr><td className="py-2 font-bold text-[#C6FF00]">2XL</td><td className="py-2 px-3">52"</td><td className="py-2 px-3">32.5"</td><td className="py-2 pl-3">25.5"</td></tr>
                  <tr><td className="py-2 font-bold text-[#C6FF00]">3XL</td><td className="py-2 px-3">54"</td><td className="py-2 px-3">33.0"</td><td className="py-2 pl-3">26.5"</td></tr>
                  <tr><td className="py-2 font-bold text-[#C6FF00]">4XL</td><td className="py-2 px-3">56"</td><td className="py-2 px-3">33.5"</td><td className="py-2 pl-3">27.5"</td></tr>
                </tbody>
              </table>
            </div>

            <p className="text-[11px] font-mono text-[#8A8A8A] mt-4 pt-4 border-t border-[#1C1C1C]">
              * Engineered with generous drop shoulder and roomy chest volume. For true boxy fit, stay true to size. For standard fitted look, order one size down.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SizeSelector;
