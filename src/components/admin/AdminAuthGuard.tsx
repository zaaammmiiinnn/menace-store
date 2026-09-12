'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Shield } from 'lucide-react';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      router.replace('/admin/login');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0A0A0A] text-[#F5F1E8] font-mono">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#262626] border-t-[#C6FF00] animate-spin" />
          <Shield size={18} className="absolute text-[#C6FF00]" />
        </div>
        <p className="text-xs tracking-widest text-[#8A8A8A] uppercase animate-pulse">
          VERIFYING COCKPIT CLEARANCE...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0A0A0A] text-[#F5F1E8] font-mono p-4">
        <div className="p-6 rounded-2xl bg-[#141414] border border-red-500/30 text-center max-w-sm space-y-4">
          <Shield size={32} className="text-red-400 mx-auto" />
          <p className="text-sm uppercase tracking-wider text-red-400 font-bold">
            CLEARANCE REQUIRED
          </p>
          <p className="text-xs text-[#8A8A8A]">
            You need administrator clearance to access this operations cockpit.
          </p>
          <button
            type="button"
            onClick={() => router.push('/admin/login')}
            className="w-full py-2.5 px-4 rounded-lg bg-[#C6FF00] text-[#0A0A0A] font-bold text-xs uppercase cursor-pointer hover:bg-white transition-colors"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
