import { useMemo, useCallback } from 'react';
import { useCartStore, FREE_SHIPPING_THRESHOLD_INR, STANDARD_SHIPPING_INR } from '@/store/cart-store';
import { Product } from '@/types';

export { FREE_SHIPPING_THRESHOLD_INR, STANDARD_SHIPPING_INR };

export interface CartItem {
  variantId: string;
  id?: string;
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

export function useCart() {
  const store = useCartStore();

  const normalizedItems: CartItem[] = useMemo(() => {
    return store.items.map((item) => {
      const price = item.product.price || (item.product as any).priceInr || 1499;
      const imageUrl = item.product.images?.[0] || '/products/placeholder.svg';
      return {
        variantId: item.id,
        id: item.id,
        productId: item.product.id,
        name: item.product.name,
        size: item.size,
        color: item.color,
        price,
        quantity: item.quantity,
        imageUrl,
        slug: item.product.slug,
        edition: item.edition,
        customArtworkUrl: item.customArtworkUrl,
        customPlacement: item.customPlacement,
        customScale: item.customScale,
        customQuoteText: item.customQuoteText,
      };
    });
  }, [store.items]);

  return {
    items: normalizedItems,
    isOpen: store.isOpen,
    addItem: (incomingItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
      const pseudoProduct: Product = {
        id: incomingItem.productId,
        slug: incomingItem.slug || incomingItem.productId,
        name: incomingItem.name,
        description: '',
        price: incomingItem.price,
        priceInr: incomingItem.price,
        priceUsd: 49,
        images: [incomingItem.imageUrl || '/products/placeholder.svg'],
        category: 'tees',
        tags: ['tees'],
        isBestSeller: false,
        isNew: true,
        vibeName: 'DROP 001',
        colorways: [{ name: incomingItem.color, hex: '#0A0A0A', materialColor: '#0A0A0A' }],
        sizes: [{ value: incomingItem.size as any, label: incomingItem.size, scale: 1, inStock: true }],
      };

      store.addItem(
        pseudoProduct,
        incomingItem.color,
        incomingItem.size,
        {
          edition: incomingItem.edition,
          customArtworkUrl: incomingItem.customArtworkUrl,
          customPlacement: incomingItem.customPlacement,
          customScale: incomingItem.customScale,
          customQuoteText: incomingItem.customQuoteText,
        },
        incomingItem.quantity || 1
      );
    },
    removeItem: (variantId: string) => {
      store.removeItemById(variantId);
    },
    updateQuantity: (variantId: string, quantity: number) => {
      store.updateQuantityById(variantId, quantity);
    },
    clearCart: () => store.clearCart(),
    openCart: () => store.openCart(),
    closeCart: () => store.closeCart(),
    toggleCart: () => store.toggleCart(),
    getSubtotal: () => store.getSubtotal(),
    getShippingFee: () => store.getShippingFee(),
    getTotal: () => store.getTotal(),
    getItemCount: () => store.getItemCount(),
    getFreeShippingDifference: () => store.getFreeShippingDifference(),
  };
}

