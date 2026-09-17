'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Trash2,
  CheckCircle2,
  Sparkles,
  Type,
  Image as ImageIcon,
  Quote,
  RotateCcw,
} from 'lucide-react';

export type PrintPlacement = 'front_center' | 'front_chest' | 'back';
export type PrintScale = 'small' | 'medium' | 'large';

export interface CustomDesignConfig {
  artworkUrl: string;
  artworkName?: string;
  placement: PrintPlacement;
  scale: PrintScale;
  customQuoteText?: string;
  mode?: 'quote' | 'image';
}

interface CustomPrintStudioProps {
  config: CustomDesignConfig | null;
  onChange: (config: CustomDesignConfig | null) => void;
  productColor?: string;
  defaultQuote?: string;
}

export const SIGNATURE_QUOTES = [
  'NOT FOR EVERYONE.',
  'MIND YOUR BUSINESS.',
  'SPEAK LESS. WEAR THIS.',
  'TAKE UP MORE SPACE.',
  'LOOKS SOFT. ACTS HARD.',
  'MOVE DIFFERENT.',
  'NO EXPLANATIONS.',
  'STAY IN YOUR LANE.',
] as const;

function generateQuoteSvg(quote: string, textColor: string = '#EFEBE1'): string {
  const clean = quote.trim().toUpperCase();
  const words = clean.split(/\s+/);
  let line1 = clean;
  let line2 = '';

  if (words.length >= 3) {
    const mid = Math.ceil(words.length / 2);
    line1 = words.slice(0, mid).join(' ');
    line2 = words.slice(mid).join(' ');
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360" width="800" height="360">
  <defs>
    <filter id="distress" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
  <style>
    .quote-text {
      font-family: 'Impact', 'Arial Black', -apple-system, sans-serif;
      font-weight: 900;
      letter-spacing: 5px;
      fill: ${textColor};
      text-anchor: middle;
      filter: url(#distress);
    }
  </style>
  ${
    line2
      ? `<text x="400" y="160" font-size="90" class="quote-text">${line1}</text>
         <text x="400" y="270" font-size="90" class="quote-text">${line2}</text>`
      : `<text x="400" y="210" font-size="94" class="quote-text">${line1}</text>`
  }
</svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function CustomPrintStudio({
  config,
  onChange,
  productColor = 'Off-White',
  defaultQuote = 'NOT FOR EVERYONE.',
}: CustomPrintStudioProps) {
  const [activeTab, setActiveTab] = useState<'quote' | 'image'>(config?.mode || 'quote');
  const [typedQuote, setTypedQuote] = useState(config?.customQuoteText || defaultQuote);
  const [quoteColor, setQuoteColor] = useState<'cream' | 'black' | 'lime'>(
    productColor.toLowerCase().includes('white') ? 'cream' : 'cream'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getTextColorHex = (c: 'cream' | 'black' | 'lime') => {
    switch (c) {
      case 'black':
        return '#141414';
      case 'lime':
        return '#C6FF00';
      case 'cream':
      default:
        return '#F0EBE1';
    }
  };

  // Apply quote change
  const applyQuote = (quoteText: string, color: 'cream' | 'black' | 'lime') => {
    const text = quoteText.trim();
    if (!text) return;
    const svgUrl = generateQuoteSvg(text, getTextColorHex(color));
    onChange({
      artworkUrl: svgUrl,
      artworkName: `Back Quote // ${text}`,
      placement: config?.placement || 'back',
      scale: config?.scale || 'medium',
      customQuoteText: text,
      mode: 'quote',
    });
  };

  const handleSelectPreset = (quote: string) => {
    setTypedQuote(quote);
    applyQuote(quote, quoteColor);
  };

  const handleCustomQuoteSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    applyQuote(typedQuote, quoteColor);
  };

  const handleColorChange = (newColor: 'cream' | 'black' | 'lime') => {
    setQuoteColor(newColor);
    if (activeTab === 'quote' && typedQuote) {
      applyQuote(typedQuote, newColor);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      onChange({
        artworkUrl: url,
        artworkName: file.name,
        placement: config?.placement || 'front_center',
        scale: config?.scale || 'medium',
        mode: 'image',
      });
    };
    reader.readAsDataURL(file);
  };

  const setPlacement = (placement: PrintPlacement) => {
    if (!config) return;
    onChange({ ...config, placement });
  };

  const setScale = (scale: PrintScale) => {
    if (!config) return;
    onChange({ ...config, scale });
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 sm:p-5 bg-[#0E0E0E] border border-[#C6FF00]/40 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C6FF00]" />
          <h3 className="font-mono text-xs uppercase tracking-widest text-[#F5F1E8] font-bold">
            CUSTOM PRINT STUDIO // ARCHIVAL SPEC
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#C6FF00] bg-[#C6FF00]/10 px-2 py-0.5 border border-[#C6FF00]/30">
          PRINT ON DEMAND
        </span>
      </div>

      {/* Tabs: Choose Quote vs Upload Artwork */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-[#141414] border border-[#222222]">
        <button
          type="button"
          onClick={() => {
            setActiveTab('quote');
            if (typedQuote) applyQuote(typedQuote, quoteColor);
          }}
          className={`py-2 px-3 text-center font-mono text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'quote'
              ? 'bg-[#C6FF00] text-[#0A0A0A] font-bold shadow-[0_0_10px_rgba(198,255,0,0.2)]'
              : 'text-[#8A8A8A] hover:text-[#F5F1E8]'
          }`}
        >
          <Quote size={13} />
          <span>SIGNATURE QUOTES</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('image')}
          className={`py-2 px-3 text-center font-mono text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'image'
              ? 'bg-[#C6FF00] text-[#0A0A0A] font-bold shadow-[0_0_10px_rgba(198,255,0,0.2)]'
              : 'text-[#8A8A8A] hover:text-[#F5F1E8]'
          }`}
        >
          <ImageIcon size={13} />
          <span>UPLOAD YOUR ARTWORK</span>
        </button>
      </div>

      {/* Tab 1: Signature Quotes & Custom Text */}
      {activeTab === 'quote' && (
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-[#8A8A8A] uppercase tracking-wider mb-2">
              1. SELECT A SIGNATURE ARCHIVE QUOTE:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
              {SIGNATURE_QUOTES.map((q) => {
                const isSelected = typedQuote === q && config?.mode === 'quote';
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSelectPreset(q)}
                    className={`p-2.5 text-left font-mono text-[10px] sm:text-[11px] border uppercase transition-all cursor-pointer truncate ${
                      isSelected
                        ? 'border-[#C6FF00] bg-[#C6FF00]/15 text-[#C6FF00] font-bold'
                        : 'border-[#222222] bg-[#0A0A0A] text-[#8A8A8A] hover:text-[#F5F1E8] hover:border-[#444444]'
                    }`}
                  >
                    "{q}"
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#8A8A8A] uppercase tracking-wider mb-2">
              OR TYPE YOUR OWN CUSTOM QUOTE:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={typedQuote}
                onChange={(e) => setTypedQuote(e.target.value)}
                placeholder="e.g. NOT FOR EVERYONE."
                className="flex-1 bg-[#0A0A0A] border border-[#222222] focus:border-[#C6FF00] text-xs font-mono px-3 py-2 text-[#F5F1E8] uppercase placeholder-[#555555] outline-none"
              />
              <button
                type="button"
                onClick={() => handleCustomQuoteSubmit()}
                className="px-4 py-2 bg-[#C6FF00] text-[#0A0A0A] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#b8f000] cursor-pointer"
              >
                APPLY
              </button>
            </div>
          </div>

          {/* Ink Tone Choice */}
          <div className="pt-2 border-t border-[#1C1C1C] flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#8A8A8A] uppercase">PRINT INK TONE:</span>
            <div className="flex items-center gap-2">
              {[
                { id: 'cream', label: 'Raw Cream (Authentic)', hex: '#F0EBE1' },
                { id: 'black', label: 'Pitch Black', hex: '#141414' },
                { id: 'lime', label: 'Menance Lime', hex: '#C6FF00' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleColorChange(c.id as any)}
                  className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono border cursor-pointer ${
                    quoteColor === c.id
                      ? 'border-[#C6FF00] bg-[#1C1C1C] text-[#F5F1E8]'
                      : 'border-[#2A2A2A] text-[#8A8A8A]'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/20"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Upload Artwork */}
      {activeTab === 'image' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/svg+xml"
            className="hidden"
            onChange={handleFileChange}
          />

          {!config?.artworkUrl || config.mode === 'quote' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-[#333333] hover:border-[#C6FF00] bg-[#0A0A0A] p-6 text-center cursor-pointer transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-[#141414] group-hover:bg-[#C6FF00]/10 border border-[#222222] group-hover:border-[#C6FF00] flex items-center justify-center mx-auto text-[#8A8A8A] group-hover:text-[#C6FF00] transition-colors mb-3">
                <Upload size={20} />
              </div>
              <p className="font-mono text-xs uppercase tracking-wider text-[#F5F1E8] font-bold">
                UPLOAD YOUR ARTWORK / GRAPHIC / LOGO
              </p>
              <p className="font-mono text-[10px] text-[#8A8A8A] mt-1">
                PNG (transparent recommended), JPG, SVG • Max 15MB
              </p>
              <p className="text-[10px] font-mono text-[#C6FF00] mt-3 font-bold">
                Click to browse files &rarr;
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-[#141414] p-3 border border-[#222222]">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 border border-[#333333] bg-[#0A0A0A] shrink-0 p-1 flex items-center justify-center">
                  <img
                    src={config.artworkUrl}
                    alt="Artwork Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-xs text-[#F5F1E8] truncate font-bold">
                    {config.artworkName || 'Custom Artwork'}
                  </p>
                  <p className="font-mono text-[10px] text-[#C6FF00] flex items-center gap-1">
                    <CheckCircle2 size={11} />
                    <span>Artwork loaded & ready for mockup</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2 py-1 text-[10px] font-mono border border-[#333333] hover:border-[#F5F1E8] text-[#8A8A8A] hover:text-[#F5F1E8] transition-colors cursor-pointer"
                >
                  REPLACE
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1 text-[#8A8A8A] hover:text-red-400 transition-colors cursor-pointer"
                  title="Remove artwork"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Placement & Scale Controls (Visible whenever artwork is active) */}
      {config?.artworkUrl && (
        <div className="space-y-4 pt-3 border-t border-[#1C1C1C]">
          {/* Placement Selector */}
          <div>
            <div className="text-[11px] font-mono text-[#8A8A8A] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>PRINT PLACEMENT:</span>
              <span className="text-[#C6FF00] font-bold">
                {config.placement === 'back'
                  ? 'UPPER BACK // SIGNATURE'
                  : config.placement === 'front_center'
                  ? 'FRONT // CENTER CHEST'
                  : 'FRONT // LEFT CHEST HIT'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPlacement('back')}
                className={`py-2 px-1 text-center font-mono text-[10px] border uppercase transition-all cursor-pointer ${
                  config.placement === 'back'
                    ? 'border-[#C6FF00] bg-[#C6FF00]/15 text-[#C6FF00] font-bold'
                    : 'border-[#222222] bg-[#0A0A0A] text-[#8A8A8A] hover:text-[#F5F1E8]'
                }`}
              >
                UPPER BACK
              </button>
              <button
                type="button"
                onClick={() => setPlacement('front_center')}
                className={`py-2 px-1 text-center font-mono text-[10px] border uppercase transition-all cursor-pointer ${
                  config.placement === 'front_center'
                    ? 'border-[#C6FF00] bg-[#C6FF00]/15 text-[#C6FF00] font-bold'
                    : 'border-[#222222] bg-[#0A0A0A] text-[#8A8A8A] hover:text-[#F5F1E8]'
                }`}
              >
                FRONT CENTER
              </button>
              <button
                type="button"
                onClick={() => setPlacement('front_chest')}
                className={`py-2 px-1 text-center font-mono text-[10px] border uppercase transition-all cursor-pointer ${
                  config.placement === 'front_chest'
                    ? 'border-[#C6FF00] bg-[#C6FF00]/15 text-[#C6FF00] font-bold'
                    : 'border-[#222222] bg-[#0A0A0A] text-[#8A8A8A] hover:text-[#F5F1E8]'
                }`}
              >
                LEFT CHEST
              </button>
            </div>
          </div>

          {/* Scale Selector */}
          <div>
            <div className="text-[11px] font-mono text-[#8A8A8A] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>PRINT SCALE:</span>
              <span className="text-[#C6FF00] font-bold">{config.scale.toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['small', 'medium', 'large'] as PrintScale[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScale(s)}
                  className={`py-1.5 px-2 text-center font-mono text-[10px] border uppercase transition-all cursor-pointer ${
                    config.scale === s
                      ? 'border-[#C6FF00] bg-[#C6FF00]/15 text-[#C6FF00] font-bold'
                      : 'border-[#222222] bg-[#0A0A0A] text-[#8A8A8A] hover:text-[#F5F1E8]'
                  }`}
                >
                  {s === 'small' ? 'COMPACT' : s === 'medium' ? 'STANDARD' : 'OVERSIZED'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
