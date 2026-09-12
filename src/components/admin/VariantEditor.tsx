'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, Minus } from 'lucide-react';
import { toast } from 'sonner';

export interface VariantItem {
  id?: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL' | '4XL';
  color: string;
  sku: string;
  stock: number;
  priceOverride?: number | null;
  imageUrl?: string | null;
}

interface VariantEditorProps {
  variants: VariantItem[];
  onChange: (variants: VariantItem[]) => void;
  productSlug?: string;
  basePrice?: number;
}

const ALL_SIZES: ('XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL' | '4XL')[] = [
  'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'
];

export function VariantEditor({ variants = [], onChange, productSlug = 'MNC', basePrice }: VariantEditorProps) {
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [colorInput, setColorInput] = useState('Base Black, Acid Green');

  const handleAutoGenerate = () => {
    const colors = colorInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    if (colors.length === 0 || selectedSizes.length === 0) {
      toast.error('Pick at least one size and enter at least one colorway.');
      return;
    }

    const prefix = (productSlug || 'MNC')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 4)
      .toUpperCase();

    const generated: VariantItem[] = [];

    colors.forEach((color) => {
      const colorCode = color.substring(0, 3).toUpperCase();
      selectedSizes.forEach((size) => {
        const sku = `MNC-${prefix}-${colorCode}-${size}`;
        // Preserve existing stock if matching SKU already exists
        const existing = variants.find((v) => v.sku === sku);
        generated.push({
          size: size as any,
          color,
          sku,
          stock: existing?.stock ?? 25,
          priceOverride: existing?.priceOverride ?? null,
        });
      });
    });

    onChange(generated);
    toast.success(`Generated ${generated.length} variants.`);
  };

  const handleUpdateVariant = (index: number, key: keyof VariantItem, val: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [key]: val };
    onChange(updated);
  };

  const handleRemoveVariant = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleAddSingle = () => {
    const newSku = `MNC-NEW-${Date.now().toString().slice(-4)}`;
    onChange([
      ...variants,
      {
        size: 'M',
        color: 'Black',
        sku: newSku,
        stock: 20,
        priceOverride: null,
      },
    ]);
  };

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Matrix Generator Bar */}
      <div className="p-4 rounded-lg bg-[#121212] border border-[#242424] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-mono text-[#8A8A8A] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C6FF00]" />
            Variant Matrix Generator
          </span>
          <button
            type="button"
            onClick={handleAutoGenerate}
            className="h-8 px-3 bg-[#C6FF00] hover:bg-[#b5eb00] text-[#0A0A0A] font-semibold text-[12px] font-mono rounded transition-colors"
          >
            Auto-Generate Matrix
          </button>
        </div>

        {/* Sizes checkboxes */}
        <div>
          <label className="block text-[11px] font-mono text-[#666] mb-1.5">Sizes to include:</label>
          <div className="flex flex-wrap gap-1.5">
            {ALL_SIZES.map((size) => {
              const isChecked = selectedSizes.includes(size);
              return (
                <button
                  type="button"
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-colors ${
                    isChecked
                      ? 'bg-[#C6FF00]/15 text-[#C6FF00] border-[#C6FF00]/40'
                      : 'bg-[#181818] text-[#8A8A8A] border-[#2A2A2A] hover:text-[#F5F1E8]'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Colors input */}
        <div>
          <label className="block text-[11px] font-mono text-[#666] mb-1">
            Colorways (comma-separated):
          </label>
          <input
            type="text"
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            placeholder="Base Black, Acid Green, Bone"
            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-3 py-1.5 text-[12px] text-[#F5F1E8] focus:outline-none focus:border-[#C6FF00]/40 font-mono"
          />
        </div>
      </div>

      {/* Variants List Table */}
      <div className="border border-[#222] rounded-md bg-[#0F0F0F] overflow-hidden">
        <div className="h-9 px-3 bg-[#161616] border-b border-[#222] flex items-center justify-between text-[11px] font-mono text-[#8A8A8A] uppercase">
          <span>Active Variants ({variants.length})</span>
          <button
            type="button"
            onClick={handleAddSingle}
            className="text-[#C6FF00] hover:underline flex items-center gap-1 normal-case font-mono"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Single
          </button>
        </div>

        <div className="divide-y divide-[#1A1A1A] max-h-72 overflow-y-auto">
          {variants.length === 0 ? (
            <div className="p-6 text-center text-[12px] text-[#666] font-mono">
              No variants defined. Click &quot;Auto-Generate Matrix&quot; above.
            </div>
          ) : (
            variants.map((v, idx) => (
              <div key={idx} className="p-2.5 flex items-center gap-3 text-[12px]">
                {/* Size Selector */}
                <select
                  value={v.size}
                  onChange={(e) => handleUpdateVariant(idx, 'size', e.target.value)}
                  className="bg-[#181818] border border-[#2E2E2E] rounded px-2 py-1 text-[#F5F1E8] font-mono text-[11px]"
                >
                  {ALL_SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                {/* Color Input */}
                <input
                  type="text"
                  value={v.color}
                  onChange={(e) => handleUpdateVariant(idx, 'color', e.target.value)}
                  placeholder="Color"
                  className="w-28 bg-[#181818] border border-[#2E2E2E] rounded px-2 py-1 text-[#F5F1E8] text-[12px]"
                />

                {/* SKU */}
                <input
                  type="text"
                  value={v.sku}
                  onChange={(e) => handleUpdateVariant(idx, 'sku', e.target.value.toUpperCase())}
                  placeholder="SKU"
                  className="flex-1 bg-[#181818] border border-[#2E2E2E] rounded px-2 py-1 text-[#C6FF00] font-mono text-[11px]"
                />

                {/* Stock Stepper */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleUpdateVariant(idx, 'stock', Math.max(0, v.stock - 1))}
                    className="p-1 rounded bg-[#1C1C1C] hover:bg-[#252525] text-[#8A8A8A] hover:text-[#F5F1E8]"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    value={v.stock}
                    onChange={(e) => handleUpdateVariant(idx, 'stock', Math.max(0, parseInt(e.target.value) || 0))}
                    className={`w-14 text-center bg-[#181818] border rounded py-1 font-mono text-[11px] tabular-nums ${
                      v.stock === 0
                        ? 'border-red-500/50 text-red-400'
                        : v.stock < 10
                        ? 'border-amber-500/50 text-amber-400'
                        : 'border-[#2E2E2E] text-[#F5F1E8]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdateVariant(idx, 'stock', v.stock + 1)}
                    className="p-1 rounded bg-[#1C1C1C] hover:bg-[#252525] text-[#8A8A8A] hover:text-[#F5F1E8]"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(idx)}
                  className="p-1 text-[#666] hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
