import React from 'react';
import { requireStaff } from '@/lib/admin/auth';
import { Sidebar } from '@/components/admin/Sidebar';
import { CommandPalette } from '@/components/admin/CommandPalette';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'MENACE Admin — Operations',
  description: 'Operations control panel for MENACE storefront.',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side RBAC guard: enforces staff or admin access
  const user = await requireStaff();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F1E8] font-sans antialiased flex">
      {/* Desktop Sidebar + Mobile Bottom Navigation */}
      <Sidebar
        userRole={user.role}
        userName={user.name}
        userEmail={user.email}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        {/* Top Operational Bar */}
        <header className="h-14 border-b border-[#1F1F1F] bg-[#0D0D0D] px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-mono text-[#8A8A8A] uppercase tracking-wider">
              Control Panel
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181818] text-[#8A8A8A] border border-[#262626]">
              {user.role.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={undefined}
              className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-md bg-[#171717] border border-[#292929] text-[12px] text-[#8A8A8A] hover:text-[#F5F1E8] transition-colors"
            >
              <span>Search or jump to...</span>
              <kbd className="text-[10px] font-mono bg-[#111] px-1.5 py-0.5 rounded border border-[#333]">
                ⌘K
              </kbd>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette />

      {/* Action Toasts */}
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#121212',
            border: '1px solid #292929',
            color: '#F5F1E8',
            fontFamily: 'var(--font-inter), monospace',
            fontSize: '13px',
          },
        }}
      />
    </div>
  );
}
