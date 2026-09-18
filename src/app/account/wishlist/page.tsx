'use client';

import React from 'react';
import Link from 'next/link';
import { AccountNav } from '@/components/account/AccountNav';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';
import { useUiStore } from '@/store/ui-store';
import { products } from '@/data/products';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { playClickSound, playAddCartSound, playConfettiSound, playHoverSound } from '@/lib/sound';

export default function AccountWishlistPage() {
  const { items: wishlistIds, removeFromWishlist } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addItem);
  const getFormattedPrice = useCartStore((state) => state.getFormattedPrice);
  const triggerConfetti = useUiStore((state) => state.triggerConfetti);
  const showToast = useUiStore((state) => state.showToast);

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  const handleQuickAdd = (product: typeof products[0]) => {
    const color = product.colorways?.[0]?.name || (product as any).color || 'Black';
    addToCart(product, color, 'L');
    playAddCartSound();
    playConfettiSound();
    triggerConfetti();
    showToast(`Added ${product.name} (Size L) to bag`);
  };

  const handleRemove = (id: string, name: string) => {
    removeFromWishlist(id);
    playClickSound();
    showToast(`Removed ${name} from wishlist`);
  };

  return (
    <div className="min-h-screen bg-base-black text-off-white pt-24 pb-28 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <AccountNav />

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-off-white">
              YOUR WISHLIST
            </h1>
            <p className="font-mono text-xs text-muted-grey uppercase tracking-widest mt-1">
              SAVED SILHOUETTES // QUICK COP READY
            </p>
          </div>
          <span className="font-mono text-xs text-acid-green font-bold">
            {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'ITEM' : 'ITEMS'}
          </span>
        </div>

        {wishlistedProducts.length === 0 ? (
          <div className="p-16 rounded-2xl bg-surface/40 border border-dashed border-border text-center space-y-4 my-8">
            <Heart size={36} className="text-muted-grey/30 mx-auto" />
            <h2 className="font-display text-2xl uppercase text-off-white">
              YOUR VAULT IS EMPTY.
            </h2>
            <p className="font-mono text-xs text-muted-grey max-w-sm mx-auto">
              Spot something in Drop 001 you like? Tap the heart icon to pin it to your personal roster.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                onClick={playClickSound}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-acid-green text-base-black font-mono text-xs font-bold uppercase hover:bg-white transition-colors"
              >
                <span>EXPLORE ALL TEES</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistedProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl bg-surface border border-border hover:border-acid-green/40 transition-all flex flex-col justify-between overflow-hidden group shadow-lg"
              >
                <div className="p-5">
                  <div className="relative aspect-[4/3] rounded-xl bg-base-black border border-border/60 overflow-hidden mb-4">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-display text-4xl text-white/10 uppercase select-none">
                          MENANCE
                        </span>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest bg-acid-green text-base-black font-bold z-10">
                      {product.vibeName}
                    </span>
                    <button
                      onClick={() => handleRemove(product.id, product.name)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-base-black/80 hover:bg-red-500 text-muted-grey hover:text-white transition-colors cursor-pointer z-10"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <Link href={`/shop/${product.slug}`} className="block">
                    <h3 className="font-display text-xl uppercase text-off-white group-hover:text-acid-green transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="font-mono text-xs text-muted-grey mt-1 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                    <span className="font-mono text-base font-bold text-acid-green">
                      {getFormattedPrice(product.price)}
                    </span>
                    <span className="font-mono text-[10px] text-muted-grey uppercase">
                      {product.tags.includes('waffle') ? '300 GSM WAFFLE' : '280 GSM HEAVYWEIGHT'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-surface-elevated/40 border-t border-border flex items-center gap-2">
                  <button
                    onClick={() => handleQuickAdd(product)}
                    onMouseEnter={playHoverSound}
                    className="flex-1 py-2.5 px-3 rounded-lg bg-acid-green text-base-black font-mono text-xs font-bold uppercase hover:bg-white transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={14} />
                    <span>ADD TO BAG (SIZE L)</span>
                  </button>
                  <Link
                    href={`/shop/${product.slug}`}
                    onClick={playClickSound}
                    className="p-2.5 rounded-lg bg-base-black border border-border hover:border-acid-green text-off-white hover:text-acid-green transition-colors"
                    title="View Product Details"
                  >
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
