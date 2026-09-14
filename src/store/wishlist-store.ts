import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  items: string[];
  toggleWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleWishlist: (productId) => {
        const currentItems = get().items;
        if (currentItems.includes(productId)) {
          set({ items: currentItems.filter((id) => id !== productId) });
        } else {
          set({ items: [...currentItems, productId] });
        }
      },

      removeFromWishlist: (productId) => {
        set({ items: get().items.filter((id) => id !== productId) });
      },

      isWishlisted: (productId) => {
        return get().items.includes(productId);
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'menance-wishlist',
    }
  )
);
