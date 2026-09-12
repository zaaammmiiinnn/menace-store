'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export function AnalyticsView() {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Realistic mock data reflecting Drop 001 momentum
  const timelineData = [
    { date: 'Day 1', revenue: 42000, orders: 28, aov: 1500 },
    { date: 'Day 5', revenue: 38000, orders: 25, aov: 1520 },
    { date: 'Day 10', revenue: 65000, orders: 42, aov: 1547 },
    { date: 'Day 15', revenue: 51000, orders: 34, aov: 1500 },
    { date: 'Day 20', revenue: 89000, orders: 58, aov: 1534 },
    { date: 'Day 25', revenue: 74000, orders: 48, aov: 1541 },
    { date: 'Day 30', revenue: 98000, orders: 62, aov: 1580 },
  ];

  const funnelData = [
    { step: 'Sessions', count: 18450, dropOff: '100%' },
    { step: 'Product Views', count: 12200, dropOff: '66.1%' },
    { step: 'Add to Cart', count: 3120, dropOff: '25.6%' },
    { step: 'Checkout Started', count: 1480, dropOff: '47.4%' },
    { step: 'Purchased', count: 620, dropOff: '41.9%' },
  ];

  const sizeRevenue = [
    { size: 'M', revenue: 42, color: '#C6FF00' },
    { size: 'L', revenue: 31, color: '#A0CC00' },
    { size: 'XL', revenue: 15, color: '#7E9F00' },
    { size: 'S', revenue: 8, color: '#F5F1E8' },
    { size: '2XL+', revenue: 4, color: '#8A8A8A' },
  ];

  const colorRevenue = [
    { name: 'Base Black', value: 48, color: '#0A0A0A' },
    { name: 'Acid Green', value: 26, color: '#C6FF00' },
    { name: 'Bone', value: 16, color: '#E8E0D0' },
    { name: 'Cement', value: 10, color: '#8A8A8A' },
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1C1C1C]">
        <div className="text-[13px] font-mono text-[#8A8A8A]">
          Displaying performance telemetry for Drop 001
        </div>
        <div className="flex items-center gap-1 bg-[#121212] p-1 rounded-md border border-[#222]">
          {(['7d', '30d', '90d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded text-[11px] font-mono uppercase transition-colors ${
                range === r
                  ? 'bg-[#1F1F1F] text-[#C6FF00] font-bold'
                  : 'text-[#8A8A8A] hover:text-[#F5F1E8]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Top Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue Velocity (Area) */}
        <div className="p-5 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F]">
          <h3 className="text-[13px] font-semibold text-[#F5F1E8] mb-1">Gross Revenue Timeline</h3>
          <p className="text-[11px] font-mono text-[#8A8A8A] mb-4">Total revenue in INR over time</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C6FF00" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C6FF00" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#444" tick={{ fill: '#777', fontSize: 10 }} />
                <YAxis stroke="#444" tick={{ fill: '#777', fontSize: 10 }} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="bg-[#141414] border border-[#2B2B2B] p-2 rounded text-[12px] font-mono text-[#C6FF00]">
                        ₹{Number(payload[0].value).toLocaleString()}
                      </div>
                    ) : null
                  }
                />
                <Area type="monotone" dataKey="revenue" stroke="#C6FF00" fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Volume (Bar) */}
        <div className="p-5 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F]">
          <h3 className="text-[13px] font-semibold text-[#F5F1E8] mb-1">Order Volume</h3>
          <p className="text-[11px] font-mono text-[#8A8A8A] mb-4">Completed order count per period</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData}>
                <XAxis dataKey="date" stroke="#444" tick={{ fill: '#777', fontSize: 10 }} />
                <YAxis stroke="#444" tick={{ fill: '#777', fontSize: 10 }} />
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="bg-[#141414] border border-[#2B2B2B] p-2 rounded text-[12px] font-mono text-[#F5F1E8]">
                        {payload[0].value} orders
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="orders" fill="#C6FF00" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="p-5 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F]">
        <h3 className="text-[13px] font-semibold text-[#F5F1E8] mb-1">Storefront Conversion Funnel</h3>
        <p className="text-[11px] font-mono text-[#8A8A8A] mb-4">Drop visit to successful payment</p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {funnelData.map((f, i) => (
            <div key={f.step} className="p-3.5 rounded bg-[#141414] border border-[#1F1F1F] text-[12px] font-mono">
              <div className="text-[10px] text-[#8A8A8A] uppercase">{f.step}</div>
              <div className="text-xl font-bold text-[#F5F1E8] mt-1 tabular-nums">
                {f.count.toLocaleString()}
              </div>
              <div className="text-[10px] text-[#C6FF00] mt-1">
                {i === 0 ? 'Base' : `${f.dropOff} conversion`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sizing & Colorway Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue by Size */}
        <div className="p-5 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F]">
          <h3 className="text-[13px] font-semibold text-[#F5F1E8] mb-1">Sales by Garment Size</h3>
          <p className="text-[11px] font-mono text-[#8A8A8A] mb-4">Percentage volume by silhouette fit</p>

          <div className="space-y-2.5">
            {sizeRevenue.map((item) => (
              <div key={item.size} className="space-y-1">
                <div className="flex items-center justify-between text-[12px] font-mono">
                  <span className="text-[#F5F1E8] font-semibold">Size {item.size}</span>
                  <span className="text-[#8A8A8A]">{item.revenue}%</span>
                </div>
                <div className="w-full h-2 bg-[#181818] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C6FF00] rounded-full"
                    style={{ width: `${item.revenue}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Colorway */}
        <div className="p-5 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F]">
          <h3 className="text-[13px] font-semibold text-[#F5F1E8] mb-1">Sales by Colorway</h3>
          <p className="text-[11px] font-mono text-[#8A8A8A] mb-4">Customer preference distribution</p>

          <div className="space-y-2.5">
            {colorRevenue.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-[12px] font-mono">
                  <span className="text-[#F5F1E8] font-semibold">{item.name}</span>
                  <span className="text-[#8A8A8A]">{item.value}%</span>
                </div>
                <div className="w-full h-2 bg-[#181818] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C6FF00] rounded-full"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
