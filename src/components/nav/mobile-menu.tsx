'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '@/config/site';
import { useUiStore } from '@/store/ui-store';
import { useCartStore } from '@/store/cart-store';

export function MobileMenu() {
  const isMenuOpen = useUiStore((state) => state.isMenuOpen);
  const setIsMenuOpen = useUiStore((state) => state.setIsMenuOpen);
  const currency = useCartStore((state) => state.currency);
  const toggleCurrency = useCartStore((state) => state.toggleCurrency);

  const links = siteConfig.navLinks || siteConfig.navigation || [];

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
                  onClick={() => setIsMenuOpen(false)}
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

          {/* Bottom actions & socials */}
          <div className="pt-8 border-t border-border flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-grey uppercase tracking-widest">
                Currency
              </span>
              <button
                onClick={toggleCurrency}
                className="px-3 py-1.5 rounded bg-surface border border-border text-xs font-mono text-off-white hover:border-acid-green flex items-center gap-2"
              >
                <span>{currency === 'INR' ? '₹ INR (India)' : '$ USD (Global)'}</span>
                <span className="text-acid-green text-[10px]">TAP TO CHANGE</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-muted-grey">
              <span className="text-off-white">MENACE APPAREL</span>
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
