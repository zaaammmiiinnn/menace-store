'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, User, Shield } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { useUiStore } from '@/store/ui-store';
import { useCartStore } from '@/store/cart-store';
import { useAuth } from '@/lib/auth';
import { playClickSound, playSwitchSound } from '@/lib/sound';

export function MobileMenu() {
  const isMenuOpen = useUiStore((state) => state.isMenuOpen);
  const setIsMenuOpen = useUiStore((state) => state.setIsMenuOpen);
  const soundEnabled = useUiStore((state) => state.soundEnabled);
  const toggleSound = useUiStore((state) => state.toggleSound);
  const currency = useCartStore((state) => state.currency);
  const toggleCurrency = useCartStore((state) => state.toggleCurrency);
  const { user, isAuthenticated } = useAuth();

  const links = siteConfig.navLinks || siteConfig.navigation || [];

  const handleLinkClick = () => {
    playClickSound();
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(12); } catch {}
    }
    setIsMenuOpen(false);
  };

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-30 flex flex-col bg-base-black/98 backdrop-blur-2xl px-6 pt-24 pb-12 overflow-y-auto lg:hidden"
        >
          {/* Menu links */}
          <nav className="flex flex-col space-y-6 my-auto">
            {links.map((link, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 + 0.1, duration: 0.3 }}
              >
                <Link
                  href={link.href}
                  onClick={handleLinkClick}
                  className="font-display text-4xl sm:text-5xl uppercase tracking-wider text-off-white hover:text-acid-green transition-colors flex items-center justify-between group"
                >
                  <span>{link.label || link.title}</span>
                  <span className="text-xs font-mono text-muted-grey group-hover:text-acid-green transition-colors">
                    0{index + 1}
                  </span>
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Bottom actions & settings */}
          <div className="pt-8 border-t border-border flex flex-col gap-4">
            {/* Admin Cockpit Quick Link for Authorized Users */}
            {user?.isAdmin && (
              <Link
                href="/admin"
                onClick={handleLinkClick}
                className="p-3.5 rounded-xl bg-acid-green text-base-black font-mono text-xs uppercase font-bold flex items-center justify-between shadow-[0_0_15px_rgba(198,255,0,0.3)] transition-transform active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5">
                  <Shield size={16} className="text-base-black" />
                  <span>OPERATIONS ADMIN COCKPIT</span>
                </div>
                <span className="text-[10px]">OPEN →</span>
              </Link>
            )}

            {/* Account Quick Banner */}
            <Link
              href={isAuthenticated ? "/account" : "/login"}
              onClick={handleLinkClick}
              className="p-3.5 rounded-xl bg-surface border border-border hover:border-acid-green flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-base-black border border-acid-green/60 flex items-center justify-center text-acid-green">
                  <User size={14} />
                </div>
                <span className="font-mono text-xs uppercase text-off-white font-bold">
                  {isAuthenticated ? "YOUR ACCOUNT" : "MEMBER SIGN IN"}
                </span>
              </div>
              <span className="font-mono text-[10px] text-acid-green uppercase">
                {isAuthenticated ? "DASHBOARD" : "GET IN"} →
              </span>
            </Link>

            {/* Admin Portal link for unauthenticated users */}
            {!isAuthenticated && (
              <Link
                href="/admin/login"
                onClick={handleLinkClick}
                className="text-center font-mono text-[11px] text-muted-grey hover:text-acid-green uppercase tracking-widest transition-colors py-1 flex items-center justify-center gap-1.5"
              >
                <Shield size={11} />
                <span>STAFF & ADMIN LOGIN</span>
              </Link>
            )}

            <div className="grid grid-cols-2 gap-3">
              {/* Currency Button */}
              <button
                onClick={() => {
                  toggleCurrency();
                  playSwitchSound();
                  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                    try { navigator.vibrate(10); } catch {}
                  }
                }}
                className="px-3 py-2.5 rounded bg-surface border border-border text-xs font-mono text-off-white hover:border-acid-green flex items-center justify-between"
              >
                <span className="text-muted-grey">CURRENCY</span>
                <span className="text-acid-green font-bold">{currency === 'INR' ? '₹ INR' : '$ USD'}</span>
              </button>

              {/* Sound FX Toggle */}
              <button
                onClick={() => {
                  toggleSound();
                  if (!soundEnabled) {
                    setTimeout(() => playSwitchSound(), 50);
                  }
                  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                    try { navigator.vibrate(10); } catch {}
                  }
                }}
                className={`px-3 py-2.5 rounded border text-xs font-mono flex items-center justify-between transition-colors ${
                  soundEnabled
                    ? 'bg-acid-green/10 border-acid-green text-acid-green'
                    : 'bg-surface border-border text-muted-grey'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  <span>SFX</span>
                </span>
                <span className="font-bold">{soundEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-muted-grey">
              <span className="text-off-white">MENANCE APPAREL</span>
              <span>DROP 001 // UNISEX</span>
            </div>

            {/* Social links */}
            <div className="flex items-center space-x-6">
              <a
                href={siteConfig.social?.instagram || 'https://instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-grey hover:text-acid-green transition-colors text-xs font-mono uppercase"
              >
                Instagram
              </a>
              <a
                href={siteConfig.social?.tiktok || 'https://tiktok.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-grey hover:text-acid-green transition-colors text-xs font-mono uppercase"
              >
                TikTok
              </a>
              <a
                href={siteConfig.social?.twitter || 'https://twitter.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-grey hover:text-acid-green transition-colors text-xs font-mono uppercase"
              >
                X (Twitter)
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default MobileMenu;
