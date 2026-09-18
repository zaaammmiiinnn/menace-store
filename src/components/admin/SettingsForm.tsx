'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  updateStoreSettingsAction,
  inviteStaffAction,
  revokeStaffAction,
} from '@/lib/admin/actions';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { toast } from 'sonner';
import { Save, UserPlus, Trash2, Key, ShieldCheck, Download, AlertTriangle } from 'lucide-react';

interface SettingsFormProps {
  initialSettings: any;
  auditLogs: any[];
}

export function SettingsForm({ initialSettings, auditLogs }: SettingsFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [staffList, setStaffList] = useState<any[]>(initialSettings.staffRoles || []);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'staff' | 'admin'>('staff');

  const [deleteStaffTarget, setDeleteStaffTarget] = useState<string | null>(null);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      storeName: initialSettings.storeName || 'MENANCE',
      tagline: initialSettings.tagline || 'Not for everyone.',
      primaryCurrency: initialSettings.primaryCurrency || 'INR',
      freeShippingThreshold: initialSettings.freeShippingThreshold || 2999,
      standardShippingRate: initialSettings.standardShippingRate || 149,
      gstPercentage: initialSettings.gstPercentage || 18,
    },
  });

  const onSubmit = async (values: any) => {
    setIsSaving(true);
    try {
      const res = await updateStoreSettingsAction(values);
      if (res?.success) {
        toast.success('Store settings saved successfully.');
        router.refresh();
      } else {
        toast.error(res?.error || 'Failed to save settings.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffEmail.trim() || !newStaffName.trim()) {
      toast.error('Provide both name and email.');
      return;
    }

    try {
      await inviteStaffAction({
        name: newStaffName,
        email: newStaffEmail,
        role: newStaffRole,
      });

      setStaffList((prev) => [
        ...prev,
        { name: newStaffName, email: newStaffEmail, role: newStaffRole },
      ]);
      setNewStaffEmail('');
      setNewStaffName('');
      toast.success(`Role "${newStaffRole}" assigned to ${newStaffEmail}.`);
    } catch {
      toast.error('Failed to invite staff member.');
    }
  };

  const handleRevokeStaff = async () => {
    if (!deleteStaffTarget) return;
    try {
      await revokeStaffAction(deleteStaffTarget);
      setStaffList((prev) => prev.filter((s) => s.email !== deleteStaffTarget));
      toast.success(`Access revoked for ${deleteStaffTarget}.`);
      setDeleteStaffTarget(null);
    } catch {
      toast.error('Failed to revoke access.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Store Configuration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="p-6 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F] space-y-4">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <div>
              <h2 className="text-[14px] font-semibold text-[#F5F1E8]">General Store Configuration</h2>
              <p className="text-[11px] font-mono text-[#8A8A8A]">Store naming, thresholds, and tax compliance</p>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 h-8 px-3.5 bg-[#C6FF00] hover:bg-[#b0e600] text-[#0A0A0A] font-semibold rounded text-[12px] font-mono transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-[#8A8A8A] mb-1">Store Brand Name</label>
              <input
                type="text"
                {...register('storeName')}
                className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-2 text-[13px] text-[#F5F1E8] focus:outline-none focus:border-[#C6FF00]/40"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#8A8A8A] mb-1">Brand Tagline</label>
              <input
                type="text"
                {...register('tagline')}
                className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-2 text-[13px] text-[#F5F1E8] focus:outline-none focus:border-[#C6FF00]/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-mono text-[#8A8A8A] mb-1">Free Shipping Threshold (₹)</label>
              <input
                type="number"
                {...register('freeShippingThreshold', { valueAsNumber: true })}
                className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-2 text-[13px] text-[#F5F1E8] font-mono tabular-nums focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#8A8A8A] mb-1">Standard Shipping Flat Rate (₹)</label>
              <input
                type="number"
                {...register('standardShippingRate', { valueAsNumber: true })}
                className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-2 text-[13px] text-[#F5F1E8] font-mono tabular-nums focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#8A8A8A] mb-1">Apparel GST Rate (%)</label>
              <input
                type="number"
                {...register('gstPercentage', { valueAsNumber: true })}
                className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-2 text-[13px] text-[#F5F1E8] font-mono tabular-nums focus:outline-none"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Staff Role Management Card */}
      <div className="p-6 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F] space-y-4">
        <div className="border-b border-[#1A1A1A] pb-3">
          <h2 className="text-[14px] font-semibold text-[#F5F1E8] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C6FF00]" />
            Staff & Role Access Control
          </h2>
          <p className="text-[11px] font-mono text-[#8A8A8A]">
            Manage team members with restricted read-only or full administrative privileges.
          </p>
        </div>

        {/* Existing staff list */}
        <div className="divide-y divide-[#1A1A1A]">
          {staffList.map((member) => (
            <div key={member.email} className="py-3 flex items-center justify-between text-[13px]">
              <div>
                <div className="font-medium text-[#F5F1E8]">{member.name}</div>
                <div className="text-[11px] font-mono text-[#666]">{member.email}</div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                    member.role === 'admin'
                      ? 'bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}
                >
                  {member.role}
                </span>
                <button
                  type="button"
                  onClick={() => setDeleteStaffTarget(member.email)}
                  className="p-1 text-[#666] hover:text-red-400 transition-colors"
                  title="Revoke access"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Invite New Member form */}
        <form onSubmit={handleInviteStaff} className="pt-3 border-t border-[#1C1C1C] flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-mono text-[#8A8A8A] mb-1">Name</label>
            <input
              type="text"
              value={newStaffName}
              onChange={(e) => setNewStaffName(e.target.value)}
              placeholder="e.g. Kai Takahashi"
              className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-1.5 text-[12px] text-[#F5F1E8] focus:outline-none"
            />
          </div>

          <div className="flex-1">
            <label className="block text-[11px] font-mono text-[#8A8A8A] mb-1">Email</label>
            <input
              type="email"
              value={newStaffEmail}
              onChange={(e) => setNewStaffEmail(e.target.value)}
              placeholder="staff@menance.store"
              className="w-full bg-[#141414] border border-[#262626] rounded px-3 py-1.5 text-[12px] text-[#F5F1E8] focus:outline-none"
            />
          </div>

          <div className="w-28">
            <label className="block text-[11px] font-mono text-[#8A8A8A] mb-1">Role</label>
            <select
              value={newStaffRole}
              onChange={(e) => setNewStaffRole(e.target.value as any)}
              className="w-full bg-[#141414] border border-[#262626] rounded px-2 py-1.5 text-[12px] text-[#F5F1E8] font-mono focus:outline-none"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="h-8 px-3 bg-[#1A1A1A] hover:bg-[#252525] text-[#C6FF00] border border-[#2E2E2E] rounded text-[12px] font-mono transition-colors flex items-center gap-1.5 shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Grant Access</span>
          </button>
        </form>
      </div>

      {/* Audit Log Card */}
      <div className="p-6 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F] space-y-4">
        <div className="border-b border-[#1A1A1A] pb-3">
          <h2 className="text-[14px] font-semibold text-[#F5F1E8]">Audit Log (Last 20 Operations)</h2>
          <p className="text-[11px] font-mono text-[#8A8A8A]">
            Immutable record of all mutations, inventory changes, and order status updates.
          </p>
        </div>

        <div className="divide-y divide-[#181818] max-h-60 overflow-y-auto font-mono text-[11px]">
          {auditLogs.length === 0 ? (
            <div className="py-4 text-[#666]">No recent audit logs.</div>
          ) : (
            auditLogs.map((log: any) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-[#F5F1E8]">
                    <span className="text-[#C6FF00] font-bold mr-2">[{log.action}]</span>
                    {log.details || log.entity}
                  </div>
                  <div className="text-[10px] text-[#666]">Operator: {log.user_email || 'system'}</div>
                </div>
                <div className="text-[10px] text-[#666] shrink-0">
                  {new Date(log.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-lg bg-red-950/10 border border-red-500/20 space-y-3">
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-4 h-4" />
          <h2 className="text-[13px] font-mono font-bold uppercase tracking-wider">Danger Zone</h2>
        </div>
        <p className="text-[12px] text-[#8A8A8A]">
          Export complete database backup in JSON or trigger production schema re-index.
        </p>
        <button
          type="button"
          onClick={() => {
            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(initialSettings));
            const dl = document.createElement('a');
            dl.setAttribute('href', dataStr);
            dl.setAttribute('download', 'menance-store-backup.json');
            dl.click();
            toast.success('Store configuration exported.');
          }}
          className="flex items-center gap-1.5 h-8 px-3 bg-[#1A1A1A] hover:bg-[#252525] text-red-400 border border-red-500/30 rounded text-[11px] font-mono transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Store Backup</span>
        </button>
      </div>

      {/* Revoke Staff Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteStaffTarget)}
        title="Revoke Staff Access"
        description={`Are you sure you want to revoke access for ${deleteStaffTarget}? They will no longer be able to view or edit the admin panel.`}
        expectedWord="REVOKE"
        confirmText="Revoke Access"
        onConfirm={handleRevokeStaff}
        onCancel={() => setDeleteStaffTarget(null)}
      />
    </div>
  );
}
