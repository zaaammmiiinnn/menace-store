'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  isAlert?: boolean;
  prefix?: string;
  suffix?: string;
}

export function StatCard({
  title,
  value,
  trend,
  trendLabel = 'vs yesterday',
  isAlert = false,
  prefix = '',
  suffix = '',
}: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div className={`p-4 rounded-lg bg-[#0F0F0F] border transition-colors ${
      isAlert && Number(value) > 0 ? 'border-amber-500/40 bg-amber-500/5' : 'border-[#1F1F1F]'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-mono text-[#8A8A8A] uppercase tracking-wider">{title}</span>
        {isAlert && Number(value) > 0 ? (
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        ) : trend !== undefined ? (
          <span
            className={`flex items-center text-[11px] font-mono font-medium px-1.5 py-0.5 rounded ${
              isPositive
                ? 'bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3 mr-0.5 inline" />
            ) : (
              <ArrowDownRight className="w-3 h-3 mr-0.5 inline" />
            )}
            {isPositive ? `+${trend}%` : `${trend}%`}
          </span>
        ) : null}
      </div>

      <div className="flex items-baseline gap-1">
        {prefix && <span className="text-lg font-mono text-[#8A8A8A]">{prefix}</span>}
        <span className="text-2xl font-bold font-mono tracking-tight text-[#F5F1E8] tabular-nums">
          {value}
        </span>
        {suffix && <span className="text-sm font-mono text-[#8A8A8A]">{suffix}</span>}
      </div>

      <div className="mt-2 text-[11px] text-[#666] font-mono">
        {trendLabel}
      </div>
    </div>
  );
}
