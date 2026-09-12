'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  expectedWord?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  expectedWord,
  isDestructive = true,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  const [typedValue, setTypedValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTypedValue('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isRequirementMet = expectedWord ? typedValue.trim().toLowerCase() === expectedWord.trim().toLowerCase() : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-[#121212] border border-[#2E2E2E] rounded-lg shadow-2xl overflow-hidden text-[#F5F1E8]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="font-semibold text-[15px] text-[#F5F1E8]">{title}</span>
          </div>
          <button
            onClick={onCancel}
            className="text-[#666] hover:text-[#F5F1E8] transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-[13px]">
          <p className="text-[#A3A3A3] leading-relaxed">{description}</p>

          {expectedWord && (
            <div className="space-y-2 pt-1">
              <label className="block text-[11px] font-mono text-[#8A8A8A] uppercase">
                Type <span className="font-bold text-red-400">&quot;{expectedWord}&quot;</span> to confirm:
              </label>
              <input
                type="text"
                value={typedValue}
                onChange={(e) => setTypedValue(e.target.value)}
                placeholder={expectedWord}
                className="w-full bg-[#0A0A0A] border border-[#333] rounded px-3 py-2 text-[13px] text-[#F5F1E8] font-mono focus:outline-none focus:border-red-500 transition-colors"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 px-5 py-3 bg-[#0A0A0A] border-t border-[#222]">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-[12px] font-mono text-[#8A8A8A] hover:text-[#F5F1E8] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isRequirementMet || isLoading}
            className={`px-4 py-2 rounded text-[12px] font-mono font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              isDestructive
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40'
                : 'bg-[#C6FF00] hover:bg-[#b0e600] text-[#0A0A0A]'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
