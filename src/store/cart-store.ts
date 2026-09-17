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
  discountType: 'percentage' | 'fixed';
  discountValue: number;

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
  applyPromoCode: (code: string) => Promise<{ success: boolean; message: string }>;
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
      discountType: 'percentage',
      discountValue: 0,
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

      clearCart: () =>
        set({
          items: [],
          cartCount: 0,
          totalItems: 0,
          cartTotal: 0,
          promoCode: null,
          discountPercent: 0,
          discountType: 'percentage',
          discountValue: 0,
        }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      setCurrency: (currency) => set({ currency }),
      toggleCurrency: () => set({ currency: get().currency === 'INR' ? 'USD' : 'INR' }),

      applyPromoCode: async (code: string) => {
        const normalized = code.trim().toUpperCase();
        if (!normalized) {
          return { success: false, message: 'Please enter a promo code.' };
        }

        const subtotal = get().getSubtotal();

        try {
          const res = await fetch('/api/promo/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: normalized, subtotal }),
          });

          const data = await res.json();
          if (res.ok && data.valid) {
            set({
              promoCode: normalized,
              discountType: data.type || 'percentage',
              discountValue: data.value,
              discountPercent: data.type === 'percentage' ? data.value : 0,
            });
            return {
              success: true,
              message: data.message || `Promo code "${normalized}" applied!`,
            };
          } else {
            return {
              success: false,
              message: data.message || 'Invalid promo code.',
            };
          }
        } catch (err) {
          // Offline / network fallback
          if (normalized === 'MENANCE10' || normalized === 'NOTFOREVERYONE') {
            set({
              promoCode: normalized,
              discountType: 'percentage',
              discountValue: 10,
              discountPercent: 10,
            });
            return { success: true, message: `Promo code "${normalized}" applied! (10% OFF)` };
          }
          if (normalized === 'DROP001' || normalized === 'VIP20') {
            set({
              promoCode: normalized,
              discountType: 'percentage',
              discountValue: 20,
              discountPercent: 20,
            });
            return { success: true, message: `Promo code "${normalized}" applied! (20% OFF)` };
          }
          return { success: false, message: 'Failed to connect to promo validation service.' };
        }
      },

      removePromoCode: () =>
        set({
          promoCode: null,
          discountPercent: 0,
          discountType: 'percentage',
          discountValue: 0,
        }),

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        if (subtotal <= 0) return 0;
        const type = get().discountType || 'percentage';
        const value = get().discountValue || get().discountPercent || 0;
        if (type === 'fixed') {
          return Math.min(subtotal, value);
        }
        return Math.round((subtotal * value) / 100);
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
      name: 'menance-cart-storage',
      partialize: (state) => ({
        items: state.items,
        currency: state.currency,
        promoCode: state.promoCode,
        discountPercent: state.discountPercent,
        discountType: state.discountType,
        discountValue: state.discountValue,
      }),
    }
  )
);
