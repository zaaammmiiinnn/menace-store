import React from 'react';
import { getDrops } from '@/lib/admin/queries';
import { DropsManager } from '@/components/admin/DropsManager';
import { Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDropsPage() {
  const rawDrops = await getDrops();
  
  // Format drops for DropsManager
  const drops = rawDrops.map((d: any) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    launch_at: d.launch_at || d.launchAt,
    launchAt: d.launch_at || d.launchAt,
    status: d.status || 'upcoming',
    productsCount: d.productsCount || 8,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F1E8]">Drop Collections</h1>
          <p className="text-[13px] text-[#8A8A8A] font-mono mt-0.5">
            Toggle drop release availability, enable "Buy Now" on the storefront, and manage release schedules.
          </p>
        </div>
      </div>

      {/* Interactive Drops Manager */}
      <DropsManager initialDrops={drops} />
    </div>
  );
}
