import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

// INR to USD exchange rate approx 1 USD = 85 INR
export const USD_EXCHANGE_RATE = 0.0118;
export const FREE_SHIPPING_THRESHOLD_INR = 1499;

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  currency: 'INR' | 'USD';
  promoCode: string | null;
  discountPercent: number;
  
  // Actions
  addItem: (product: Product, color?: string, size?: string) => void;
  removeItem: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setCurrency: (currency: 'INR' | 'USD') => void;
  toggleCurrency: () => void;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  
  // Computed helpers
  getItemCount: () => number;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  getFormattedPrice: (priceInInr: number) => string;
  cartCount: number;
  cartTotal: number;
  totalItems: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      currency: 'INR',
      promoCode: null,
      discountPercent: 0,
      cartCount: 0,
      cartTotal: 0,
      totalItems: 0,

      addItem: (product, colorName, sizeValue) => {
        const currentItems = get().items;
        const color = colorName || product.colorways[0]?.name || 'Black';
        const size = sizeValue || product.sizes[0]?.value || 'M';
        const id = `${product.id}-${color}-${size}`;

        const existingItemIndex = currentItems.findIndex(
          (item) => item.product.id === product.id && item.color === color && item.size === size
        );

        let updatedItems: CartItem[];
        if (existingItemIndex > -1) {
          updatedItems = [...currentItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + 1,
          };
        } else {
          const selectedColor = product.colorways.find((c) => c.name === color) || product.colorways[0];
          const selectedSize = product.sizes.find((s) => s.value === size) || product.sizes[0];
          const newItem: CartItem = {
            id,
            product,
            color,
            size,
            quantity: 1,
            selectedColor,
            selectedSize,
          };
          updatedItems = [...currentItems, newItem];
        }

        const count = updatedItems.reduce((acc, item) => acc + item.quantity, 0);
        const subtotal = updatedItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

        set({
          items: updatedItems,
          isOpen: true,
          cartCount: count,
          totalItems: count,
          cartTotal: subtotal,
        });
      },

      removeItem: (productId, color, size) => {
        const filtered = get().items.filter(
          (item) => !(item.product.id === productId && item.color === color && item.size === size)
        );
        const count = filtered.reduce((acc, item) => acc + item.quantity, 0);
        const subtotal = filtered.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

        set({
          items: filtered,
          cartCount: count,
          totalItems: count,
          cartTotal: subtotal,
        });
      },

      updateQuantity: (productId, color, size, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId, color, size);
          return;
        }
        const updated = get().items.map((item) =>
          item.product.id === productId && item.color === color && item.size === size
            ? { ...item, quantity }
            : item
        );
        const count = updated.reduce((acc, item) => acc + item.quantity, 0);
        const subtotal = updated.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

        set({
          items: updated,
          cartCount: count,
          totalItems: count,
          cartTotal: subtotal,
        });
      },

      clearCart: () => set({ items: [], cartCount: 0, totalItems: 0, cartTotal: 0, promoCode: null, discountPercent: 0 }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      setCurrency: (currency) => set({ currency }),
      toggleCurrency: () => set({ currency: get().currency === 'INR' ? 'USD' : 'INR' }),

      applyPromoCode: (code: string) => {
        const normalized = code.trim().toUpperCase();
        if (normalized === 'MENANCE10' || normalized === 'MENACE10' || normalized === 'NOTFOREVERYONE') {
          set({ promoCode: normalized, discountPercent: 10 });
          return true;
        }
        if (normalized === 'DROP001' || normalized === 'VIP20') {
          set({ promoCode: normalized, discountPercent: 20 });
          return true;
        }
        return false;
      },

      removePromoCode: () => set({ promoCode: null, discountPercent: 0 }),

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        const percent = get().discountPercent;
        return (subtotal * percent) / 100;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscountAmount();
        return Math.max(0, subtotal - discount);
      },

      getFormattedPrice: (priceInInr: number) => {
        const currency = get().currency;
        if (currency === 'USD') {
          const usd = priceInInr * USD_EXCHANGE_RATE;
          return `$${usd.toFixed(2)}`;
        }
        return `₹${priceInInr.toLocaleString('en-IN')}`;
      },
    }),
    {
      name: 'menace-cart-storage',
      partialize: (state) => ({
        items: state.items,
        currency: state.currency,
        promoCode: state.promoCode,
        discountPercent: state.discountPercent,
      }),
    }
  )
);
