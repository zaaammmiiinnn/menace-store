import React from 'react';
import Link from 'next/link';
import { getDashboardStats, getDrops } from '@/lib/admin/queries';
import { StatCard } from '@/components/admin/StatCard';
import { DashboardCharts } from '@/components/admin/DashboardCharts';
import { QuickDropToggle } from '@/components/admin/QuickDropToggle';
import { Plus, ExternalLink, ArrowRight, Package, ShoppingBag } from 'lucide-react';

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  const drops = await getDrops();
  const primaryDrop = drops.find((d: any) => d.id === 'drop_001') || drops[0] || {
    id: 'drop_001',
    name: 'DROP 001 — NOT FOR EVERYONE',
    status: 'upcoming',
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F1E8]">Dashboard</h1>
          <p className="text-[13px] text-[#8A8A8A] font-mono mt-0.5">
            Overview of Drop 001 velocity, active orders, and inventory health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 h-9 px-3.5 bg-[#141414] hover:bg-[#1F1F1F] text-[#8A8A8A] hover:text-[#F5F1E8] border border-[#262626] rounded-md text-[12px] font-mono transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Store</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5 h-9 px-3.5 bg-[#C6FF00] hover:bg-[#b0e600] text-[#0A0A0A] font-semibold rounded-md text-[12px] font-mono transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* 1-Click Storefront Availability Switcher */}
      <QuickDropToggle
        dropId={primaryDrop.id}
        dropName={primaryDrop.name}
        initialStatus={primaryDrop.status || 'upcoming'}
      />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Revenue Today"
          value={stats.revenueToday.toLocaleString()}
          prefix="₹"
          trend={stats.revenueTrend}
          trendLabel="vs previous 24h"
        />
        <StatCard
          title="Orders Today"
          value={stats.ordersToday}
          trend={stats.ordersTrend}
          trendLabel="vs yesterday"
        />
        <StatCard
          title="Store Conversion"
          value={stats.conversionRate}
          suffix="%"
          trend={stats.conversionTrend}
          trendLabel="session-to-checkout"
        />
        <StatCard
          title="Low Stock SKUs"
          value={stats.lowStockCount}
          isAlert={stats.lowStockCount > 0}
          trendLabel="variants below 10 units"
        />
      </div>

      {/* Charts Section */}
      <DashboardCharts
        revenueChart={stats.revenueChart}
        ordersByStatus={stats.ordersByStatus}
      />

      {/* Two Lists: Recent Orders & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Orders List */}
        <div className="rounded-lg bg-[#0F0F0F] border border-[#1F1F1F] overflow-hidden">
          <div className="h-12 px-5 bg-[#141414] border-b border-[#1F1F1F] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#C6FF00]" />
              <h3 className="text-[13px] font-semibold text-[#F5F1E8]">Recent Orders</h3>
            </div>
            <Link
              href="/admin/orders"
              className="text-[11px] font-mono text-[#8A8A8A] hover:text-[#C6FF00] flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-[#181818]">
            {stats.recentOrders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="p-3.5 flex items-center justify-between hover:bg-[#141414] transition-colors block text-[13px]"
              >
                <div>
                  <div className="font-mono text-[#F5F1E8] font-semibold">{order.id}</div>
                  <div className="text-[11px] text-[#8A8A8A]">{order.customerName}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-[#F5F1E8] tabular-nums">
                    ₹{order.total_inr.toLocaleString()}
                  </div>
                  <span
                    className={`inline-block text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                      order.status === 'delivered'
                        ? 'bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/20'
                        : order.status === 'shipped'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="rounded-lg bg-[#0F0F0F] border border-[#1F1F1F] overflow-hidden">
          <div className="h-12 px-5 bg-[#141414] border-b border-[#1F1F1F] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#C6FF00]" />
              <h3 className="text-[13px] font-semibold text-[#F5F1E8]">Top Performing SKUs</h3>
            </div>
            <Link
              href="/admin/products"
              className="text-[11px] font-mono text-[#8A8A8A] hover:text-[#C6FF00] flex items-center gap-1"
            >
              <span>Catalog</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-[#181818]">
            {stats.topProducts.map((prod) => (
              <div key={prod.name} className="p-3.5 flex items-center justify-between text-[13px]">
                <div>
                  <div className="font-medium text-[#F5F1E8]">{prod.name}</div>
                  <div className="text-[11px] font-mono text-[#666]">{prod.sku}</div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-[#F5F1E8] tabular-nums">
                    ₹{prod.revenue.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-[#8A8A8A]">{prod.units} units sold</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
