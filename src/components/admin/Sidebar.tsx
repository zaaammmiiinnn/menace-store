'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Boxes,
  Tag,
  BarChart3,
  Settings,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface SidebarProps {
  userRole?: string;
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ userRole = 'admin', userName = 'Admin', userEmail = '' }: SidebarProps) {
  const pathname = usePathname();
  const { user: clientUser, signOut } = useAuth();

  const effectiveRole = clientUser?.role || userRole;
  const effectiveName = clientUser?.fullName || userName;
  const effectiveEmail = clientUser?.email || userEmail || 'admin@menance.store';

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, shortcut: 'G+D', staff: true },
    { label: 'Products', href: '/admin/products', icon: Package, shortcut: 'G+P', staff: false },
    { label: 'Drops', href: '/admin/drops', icon: Layers, shortcut: '', staff: false },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag, shortcut: 'G+O', staff: true },
    { label: 'Customers', href: '/admin/customers', icon: Users, shortcut: 'G+C', staff: true },
    { label: 'Inventory', href: '/admin/inventory', icon: Boxes, shortcut: '', staff: false },
    { label: 'Discounts', href: '/admin/discounts', icon: Tag, shortcut: '', staff: false },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, shortcut: '', staff: true },
    { label: 'Settings', href: '/admin/settings', icon: Settings, shortcut: '', staff: false },
  ];

  // Filter items if user is staff (read-only for orders/customers/dashboard)
  const accessibleItems = userRole === 'staff' ? navItems.filter((i) => i.staff) : navItems;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0D0D0D] border-r border-[#1F1F1F] min-h-screen text-[#F5F1E8] select-none">
        {/* Brand Header */}
        <div className="h-14 border-b border-[#1F1F1F] px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-heading tracking-wider text-lg text-[#F5F1E8]">MENANCE</span>
            <span className="text-[10px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/20 uppercase">
              {effectiveRole}
            </span>
          </div>
          <Link
            href="/"
            target="_blank"
            className="text-[#8A8A8A] hover:text-[#C6FF00] transition-colors p-1"
            title="View live storefront"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Navigation List */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono tracking-widest text-[#8A8A8A] uppercase">
            Operations
          </div>
          {accessibleItems.map((item) => {
            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between h-10 px-3 rounded-md text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1A1A1A] text-[#C6FF00] font-semibold'
                    : 'text-[#8A8A8A] hover:text-[#F5F1E8] hover:bg-[#141414]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#C6FF00]' : 'text-[#8A8A8A]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.shortcut && (
                  <span className="text-[10px] font-mono text-[#555] bg-[#111] px-1.5 py-0.5 rounded border border-[#222]">
                    {item.shortcut}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Footer & Signout */}
        <div className="p-3 border-t border-[#1F1F1F]">
          <div className="flex items-center justify-between p-2 rounded bg-[#141414]">
            <div className="min-w-0 pr-2">
              <div className="text-[12px] font-semibold text-[#F5F1E8] truncate">{effectiveName}</div>
              <div className="text-[11px] text-[#8A8A8A] truncate font-mono">{effectiveEmail}</div>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-[11px] text-[#8A8A8A] hover:text-red-400 font-mono transition-colors p-1 cursor-pointer"
              title="Sign out of admin"
            >
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0D0D0D] border-t border-[#1F1F1F] z-50 flex items-center justify-around px-2 text-[#8A8A8A]">
        {accessibleItems.slice(0, 5).map((item) => {
          const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 text-[10px] transition-colors ${
                isActive ? 'text-[#C6FF00] font-semibold' : 'hover:text-[#F5F1E8]'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
