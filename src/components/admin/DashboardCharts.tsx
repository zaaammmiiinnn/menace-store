'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardChartsProps {
  revenueChart: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { name: string; value: number; color: string }[];
}

export function DashboardCharts({ revenueChart, ordersByStatus }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 30-Day Revenue Area Chart */}
      <div className="lg:col-span-2 p-5 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[14px] font-semibold text-[#F5F1E8]">Revenue Velocity (30 Days)</h2>
            <p className="text-[11px] font-mono text-[#8A8A8A]">Gross drop sales volume in INR</p>
          </div>
          <span className="text-[10px] font-mono text-[#C6FF00] bg-[#C6FF00]/10 border border-[#C6FF00]/20 px-2 py-0.5 rounded">
            LIVE METRICS
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="acidGreenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C6FF00" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#C6FF00" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#444"
                tick={{ fill: '#777', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
              />
              <YAxis
                stroke="#444"
                tick={{ fill: '#777', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#141414] border border-[#2B2B2B] p-2.5 rounded shadow-xl text-[12px] font-mono">
                        <div className="text-[#8A8A8A]">{label}</div>
                        <div className="text-[#C6FF00] font-bold mt-1">
                          ₹{payload[0].value?.toLocaleString()}
                        </div>
                        <div className="text-[#A3A3A3] text-[10px]">
                          {payload[0].payload.orders} orders
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#C6FF00"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#acidGreenGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders by Status Donut Chart */}
      <div className="p-5 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F] flex flex-col justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-[#F5F1E8]">Fulfillment Breakdown</h2>
          <p className="text-[11px] font-mono text-[#8A8A8A]">Active orders by stage</p>
        </div>

        <div className="h-48 w-full my-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ordersByStatus}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {ordersByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#141414] border border-[#2B2B2B] px-2 py-1 rounded text-[11px] font-mono text-[#F5F1E8]">
                        {payload[0].name}: {payload[0].value} orders
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1C1C1C]">
          {ordersByStatus.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-[11px] font-mono">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[#8A8A8A] truncate">{item.name}</span>
              <span className="text-[#F5F1E8] font-semibold ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
