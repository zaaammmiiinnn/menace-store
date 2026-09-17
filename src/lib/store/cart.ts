import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const FREE_SHIPPING_THRESHOLD_INR = 1499;
export const STANDARD_SHIPPING_INR = 99;

export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  slug?: string;
  edition?: 'archive' | 'plain' | 'custom';
  customArtworkUrl?: string;
  customPlacement?: 'front_chest' | 'front_center' | 'back';
  customScale?: 'small' | 'medium' | 'large';
  customQuoteText?: string;
}



export interface CartStoreState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computed Helpers
  getSubtotal: () => number;
  getShippingFee: () => number;
  getTotal: () => number;
  getItemCount: () => number;
  getFreeShippingDifference: () => number;
}

export const useCart = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (incomingItem) => {
        const currentItems = get().items;
        const quantityToAdd = incomingItem.quantity && incomingItem.quantity > 0 ? incomingItem.quantity : 1;

        const existingIndex = currentItems.findIndex(
          (item) => item.variantId === incomingItem.variantId
        );

        if (existingIndex > -1) {
          const updated = [...currentItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantityToAdd,
          };
          set({ items: updated, isOpen: true });
        } else {
          const newItem: CartItem = {
            ...incomingItem,
            quantity: quantityToAdd,
            imageUrl: incomingItem.imageUrl || '/products/placeholder.svg',
          };
          set({ items: [...currentItems, newItem], isOpen: true });
        }
      },

      removeItem: (variantId) => {
        set({
          items: get().items.filter((item) => item.variantId !== variantId),
        });
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.variantId === variantId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [], isOpen: false });
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      getSubtotal: () => {
        return get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      },

      getShippingFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal >= FREE_SHIPPING_THRESHOLD_INR ? 0 : STANDARD_SHIPPING_INR;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal + get().getShippingFee();
      },

      getItemCount: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },

      getFreeShippingDifference: () => {
        const subtotal = get().getSubtotal();
        return Math.max(0, FREE_SHIPPING_THRESHOLD_INR - subtotal);
      },
    }),
    {
      name: 'menance_cart_v2',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
