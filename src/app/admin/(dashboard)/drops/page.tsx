import React from 'react';
import { getDrops } from '@/lib/admin/queries';
import { Calendar, Clock, Layers, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDropsPage() {
  const drops = await getDrops();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F1E8]">Drop Collections</h1>
          <p className="text-[13px] text-[#8A8A8A] font-mono mt-0.5">
            Manage release dates, inventory drops, VIP early-access schedules, and countdown timers.
          </p>
        </div>
      </div>

      {/* Drops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {drops.map((drop: any) => {
          const isLive = drop.status === 'live';
          return (
            <div
              key={drop.id}
              className="p-6 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F] space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className={`inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded mb-2 ${
                      isLive
                        ? 'bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/20'
                        : 'bg-[#1C1C1C] text-[#8A8A8A] border border-[#2E2E2E]'
                    }`}
                  >
                    {drop.status}
                  </span>
                  <h2 className="text-lg font-bold text-[#F5F1E8]">{drop.name}</h2>
                </div>
                <div className="p-2 rounded bg-[#141414] border border-[#262626] text-[#C6FF00]">
                  <Layers className="w-5 h-5" />
                </div>
              </div>

              <p className="text-[13px] text-[#8A8A8A] leading-relaxed">
                {drop.description}
              </p>

              <div className="grid grid-cols-2 gap-3 p-3 rounded bg-[#141414] border border-[#1F1F1F] text-[12px] font-mono">
                <div>
                  <div className="text-[10px] text-[#666] uppercase flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Launch Date
                  </div>
                  <div className="text-[#F5F1E8] font-medium mt-0.5">
                    {new Date(drop.launch_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-[#666] uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Attached SKUs
                  </div>
                  <div className="text-[#C6FF00] font-semibold mt-0.5">
                    {drop.productsCount || 6} Silhouettes
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1C1C1C]">
                <span className="text-[11px] font-mono text-[#666]">ID: {drop.id}</span>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded bg-[#171717] hover:bg-[#222] text-[12px] font-mono text-[#F5F1E8] border border-[#2E2E2E] transition-colors"
                >
                  Manage Drop
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
