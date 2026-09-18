import React from 'react';
import Link from 'next/link';
import { getCustomerById } from '@/lib/admin/queries';
import { notFound } from 'next/navigation';
import { ArrowLeft, User, ShoppingBag, CreditCard, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1.5 text-[12px] font-mono text-[#8A8A8A] hover:text-[#F5F1E8] transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Customers</span>
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F1E8]">{customer.name}</h1>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/20 font-semibold">
            MEMBER
          </span>
        </div>
        <p className="text-[12px] font-mono text-[#8A8A8A] mt-0.5">{customer.email}</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F]">
          <div className="text-[11px] font-mono text-[#8A8A8A] uppercase">Total Spent</div>
          <div className="text-2xl font-bold font-mono text-[#C6FF00] mt-1 tabular-nums">
            ₹{customer.totalSpent.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F]">
          <div className="text-[11px] font-mono text-[#8A8A8A] uppercase">Total Orders</div>
          <div className="text-2xl font-bold font-mono text-[#F5F1E8] mt-1 tabular-nums">
            {customer.ordersCount}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F]">
          <div className="text-[11px] font-mono text-[#8A8A8A] uppercase">Average Order Value (AOV)</div>
          <div className="text-2xl font-bold font-mono text-[#F5F1E8] mt-1 tabular-nums">
            ₹{customer.aov.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="rounded-lg bg-[#0F0F0F] border border-[#1F1F1F] overflow-hidden">
        <div className="h-12 px-5 bg-[#141414] border-b border-[#1F1F1F] flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-[#F5F1E8] flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#C6FF00]" />
            Order History
          </h2>
        </div>

        <div className="divide-y divide-[#181818]">
          {customer.orders?.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-[#8A8A8A]">
              No orders placed yet.
            </div>
          ) : (
            customer.orders?.map((order: any) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="p-4 flex items-center justify-between hover:bg-[#141414] transition-colors block text-[13px]"
              >
                <div>
                  <div className="font-mono font-bold text-[#F5F1E8]">{order.id}</div>
                  <div className="text-[11px] font-mono text-[#666]">
                    {new Date(order.created_at).toLocaleDateString()} • Status: {order.status}
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-semibold text-[#F5F1E8] tabular-nums">
                    ₹{order.total_inr?.toLocaleString()}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
