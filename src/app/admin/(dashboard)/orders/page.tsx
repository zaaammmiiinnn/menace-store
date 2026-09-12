import React from 'react';
import { getOrders } from '@/lib/admin/queries';
import { OrdersTable } from '@/components/admin/OrdersTable';

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F5F1E8]">Order Management</h1>
        <p className="text-[13px] text-[#8A8A8A] font-mono mt-0.5">
          Live fulfillment pipeline, tracking dispatch, customer orders, and status timelines.
        </p>
      </div>

      <OrdersTable orders={orders} />
    </div>
  );
}
