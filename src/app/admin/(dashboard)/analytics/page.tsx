import React from 'react';
import { AnalyticsView } from '@/components/admin/AnalyticsView';

export default async function AdminAnalyticsPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F5F1E8]">Store Analytics</h1>
        <p className="text-[13px] text-[#8A8A8A] font-mono mt-0.5">
          Real-time sales velocity, conversion funnels, AOV trajectory, and size/colorway distribution.
        </p>
      </div>

      <AnalyticsView />
    </div>
  );
}
