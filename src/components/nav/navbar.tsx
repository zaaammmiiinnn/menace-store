'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Heart, ShoppingBag, Menu, X, ArrowRight, Volume2, VolumeX, User } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { useCartStore } from '@/store/cart-store';
import { useUiStore } from '@/store/ui-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useAuth } from '@/lib/auth';
import { playClickSound, playSwitchSound, playHoverSound } from '@/lib/sound';
import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = useCartStore((state) => state.cartCount);
  const openCart = useCartStore((state) => state.openCart);
  const currency = useCartStore((state) => state.currency);
  const toggleCurrency = useCartStore((state) => state.toggleCurrency);

  const isMenuOpen = useUiStore((state) => state.isMenuOpen);
  const setIsMenuOpen = useUiStore((state) => state.setIsMenuOpen);
  const soundEnabled = useUiStore((state) => state.soundEnabled);
  const toggleSound = useUiStore((state) => state.toggleSound);
  const showToast = useUiStore((state) => state.showToast);
  const wishlistItems = useWishlistStore((state) => state.items);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = siteConfig.navLinks || siteConfig.navigation || [];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-base-black/90 backdrop-blur-xl border-b border-border/50 py-2.5'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="flex items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
        {/* Brand Wordmark */}
        <div className="flex items-center">
          <Link href="/" className="relative z-50 group flex items-center gap-2" aria-label="Menace Home">
            <motion.span
              className="font-display text-2xl md:text-3xl tracking-widest text-off-white group-hover:text-acid-green transition-colors"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            >
              MENACE
            </motion.span>
            <span className="hidden sm:inline-block text-[10px] font-mono tracking-widest text-muted-grey border border-muted-grey/30 px-1.5 py-0.5 rounded uppercase">
              DROP 001
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-7" aria-label="Main Navigation">
          {links.slice(0, 6).map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="group relative font-sans text-xs uppercase tracking-widest text-off-white/80 hover:text-off-white transition-colors"
            >
              <span className="inline-block transition-transform duration-300 group-hover:-translate-y-0.5">
                {link.label || link.title}
              </span>
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-acid-green transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Right actions: Sound Toggle, Currency Toggle, Search, Wishlist, Cart, Mobile Menu */}
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 relative z-50">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              toggleSound();
              if (!soundEnabled) {
                setTimeout(() => playSwitchSound(), 50);
                showToast('AUDIO ON — SFX ACTIVE');
              } else {
                showToast('AUDIO MUTED');
              }
            }}
            onMouseEnter={playHoverSound}
            className={`flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-acid-green/10 border-acid-green text-acid-green shadow-[0_0_10px_rgba(198,255,0,0.2)]'
                : 'bg-surface border-border text-muted-grey hover:border-off-white/40 hover:text-off-white'
            }`}
            title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
            aria-label="Toggle sound effects"
          >
            {soundEnabled ? (
              <>
                <Volume2 size={13} className="text-acid-green animate-pulse" />
                <span className="text-[10px] tracking-wider font-bold">SFX</span>
                <span className="flex items-center gap-0.5 h-2.5">
                  <span className="w-0.5 h-2 bg-acid-green animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-0.5 h-3 bg-acid-green animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-0.5 h-1.5 bg-acid-green animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </>
            ) : (
              <>
                <VolumeX size={13} />
                <span className="text-[10px] tracking-wider font-medium">SFX</span>
              </>
            )}
          </button>

          {/* Currency Toggle */}
          <button
            onClick={() => {
              toggleCurrency();
              playSwitchSound();
            }}
            onMouseEnter={playHoverSound}
            className="flex items-center gap-1 text-xs font-mono px-2 py-1 rounded bg-surface border border-border hover:border-acid-green text-off-white transition-all cursor-pointer"
            title={`Switch to ${currency === 'INR' ? 'USD' : 'INR'}`}
            aria-label="Toggle currency"
          >
            <span className={currency === 'INR' ? 'text-acid-green font-bold' : 'text-muted-grey'}>₹</span>
            <span className="text-muted-grey/50">/</span>
            <span className={currency === 'USD' ? 'text-acid-green font-bold' : 'text-muted-grey'}>$</span>
          </button>

          {/* Search Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setSearchOpen(!searchOpen);
                playClickSound();
              }}
              onMouseEnter={playHoverSound}
              className="p-1.5 text-off-white/80 hover:text-acid-green transition-colors cursor-pointer"
              aria-label="Search store"
            >
              <Search size={19} />
            </button>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 top-10 w-72 p-2 bg-surface-elevated border border-border rounded-lg shadow-2xl z-50"
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    playClickSound();
                    if (searchQuery.trim()) {
                      window.location.href = `/shop?q=${encodeURIComponent(searchQuery.trim())}`;
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Search tees, vibes, sizes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-base-black text-xs text-off-white px-3 py-2 rounded border border-border focus:border-acid-green outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-acid-green text-base-black rounded hover:bg-white transition-colors"
                  >
                    <ArrowRight size={14} />
                  </button>
                </form>
              </motion.div>
            )}
          </div>

          {/* Wishlist Link */}
          <Link
            href="/shop"
            className="p-1.5 text-off-white/80 hover:text-acid-green transition-colors relative hidden sm:block"
            aria-label="Wishlist"
          >
            <Heart size={19} />
            {mounted && wishlistItems.length > 0 && (
              <span className="absolute 0 top-0 right-0 flex h-2 w-2 rounded-full bg-acid-green" />
            )}
          </Link>

          {/* Clerk Auth Controls */}
          <div className="hidden sm:flex items-center gap-2">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button
                  onClick={playClickSound}
                  onMouseEnter={playHoverSound}
                  className="text-[11px] font-mono tracking-widest text-off-white/80 hover:text-acid-green px-2 py-1 rounded transition-colors uppercase cursor-pointer"
                >
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  onClick={playClickSound}
                  onMouseEnter={playHoverSound}
                  className="text-[11px] font-mono tracking-widest bg-acid-green/10 text-acid-green border border-acid-green/30 hover:border-acid-green px-2 py-1 rounded transition-colors uppercase cursor-pointer font-bold"
                >
                  Join
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <div className="flex items-center gap-2.5">
                <Link
                  href="/account"
                  onClick={playClickSound}
                  onMouseEnter={playHoverSound}
                  className="text-[11px] font-mono tracking-widest text-off-white/80 hover:text-acid-green transition-colors uppercase"
                >
                  Account
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: 'w-6 h-6 border border-acid-green/40 hover:border-acid-green transition-colors',
                    },
                  }}
                />
              </div>
            </Show>
          </div>

          {/* Cart Trigger */}
          <button
            onClick={() => {
              openCart();
              playClickSound();
            }}
            onMouseEnter={playHoverSound}
            className="p-1.5 text-off-white/80 hover:text-acid-green transition-colors relative cursor-pointer"
            aria-label="Open Cart"
          >
            <motion.div
              key={cartCount}
              animate={{ scale: cartCount > 0 ? [1, 1.25, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              <ShoppingBag size={20} />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-acid-green text-[10px] font-display text-base-black font-bold">
                  {cartCount}
                </span>
              )}
            </motion.div>
          </button>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-1.5 text-off-white/80 hover:text-acid-green transition-colors cursor-pointer"
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              playClickSound();
            }}
            onMouseEnter={playHoverSound}
            aria-label="Toggle mobile menu"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
export default Navbar;
