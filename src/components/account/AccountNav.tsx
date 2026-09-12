'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, Heart, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { playClickSound, playHoverSound } from '@/lib/sound';

export function AccountNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navItems = [
    { label: 'OVERVIEW', href: '/account', icon: LayoutDashboard },
    { label: 'ORDERS', href: '/account/orders', icon: Package },
    { label: 'WISHLIST', href: '/account/wishlist', icon: Heart },
    { label: 'SETTINGS', href: '/account/settings', icon: Settings },
  ];

  const handleSignOut = () => {
    playClickSound();
    signOut();
  };

  return (
    <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border/80 mb-8">
      {/* User Header Profile */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-surface border-2 border-acid-green/60 overflow-hidden flex items-center justify-center font-display text-xl text-acid-green shadow-[0_0_15px_rgba(198,255,0,0.2)]">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt={user.fullName || 'User'} className="w-full h-full object-cover" />
          ) : (
            <span>{user?.firstName?.[0]?.toUpperCase() || 'M'}</span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl uppercase tracking-wider text-off-white">
              {user?.fullName || 'MENACE MEMBER'}
            </h2>
            <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-acid-green text-base-black font-bold rounded">
              VIP TIER
            </span>
          </div>
          <p className="font-mono text-xs text-muted-grey">
            {user?.email || 'member@menace.com'}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
        <div className="flex items-center p-1 rounded-xl bg-surface border border-border">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={playClickSound}
                onMouseEnter={playHoverSound}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                  isActive ? 'text-base-black font-bold' : 'text-muted-grey hover:text-off-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeAccountTab"
                    className="absolute inset-0 bg-acid-green rounded-lg -z-10 shadow-[0_0_12px_rgba(198,255,0,0.3)]"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                )}
                <Icon size={13} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          onMouseEnter={playHoverSound}
          className="px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-red-500/50 hover:text-red-400 text-xs font-mono uppercase tracking-wider text-muted-grey flex items-center gap-1.5 transition-colors cursor-pointer ml-auto md:ml-2"
          title="Sign out of Menace"
        >
          <LogOut size={13} />
          <span className="hidden sm:inline">SIGN OUT</span>
        </button>
      </div>
    </div>
  );
}

export default AccountNav;
