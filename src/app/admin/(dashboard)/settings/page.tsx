import React from 'react';
import { requireAdmin } from '@/lib/admin/auth';
import { getStoreSettings, getAuditLogs } from '@/lib/admin/queries';
import { SettingsForm } from '@/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getStoreSettings();
  const auditLogs = await getAuditLogs();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F5F1E8]">Settings & Access</h1>
        <p className="text-[13px] text-[#8A8A8A] font-mono mt-0.5">
          Store parameters, shipping thresholds, staff access control, and mutation audit logs.
        </p>
      </div>

      <SettingsForm initialSettings={settings} auditLogs={auditLogs} />
    </div>
  );
}
