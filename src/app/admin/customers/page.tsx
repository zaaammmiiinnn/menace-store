import React from 'react';
import { getCustomers } from '@/lib/admin/queries';
import { CustomersTable } from '@/components/admin/CustomersTable';

export default async function AdminCustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F5F1E8]">Customer Directory</h1>
        <p className="text-[13px] text-[#8A8A8A] font-mono mt-0.5">
          VIP members, order frequencies, lifetime spend, and customer profiles.
        </p>
      </div>

      <CustomersTable customers={customers} />
    </div>
  );
}
