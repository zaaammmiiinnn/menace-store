export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  colors?: { name: string; value: string }[];
  sizes?: string[];
  description?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color?: string;
  colorValue?: string;
  size?: string;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  currency: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface PaymentMethod {
  id: string;
  type: 'razorpay' | 'upi' | 'card';
  label: string;
  icon: string;
}

export interface ShippingRate {
  id: string;
  label: string;
  price: number;
  estimatedDays: string;
}

export interface CommerceProvider {
  products: {
    getAll(): Promise<Product[]>;
    getBySlug(slug: string): Promise<Product | null>;
    getByCategory(category: string): Promise<Product[]>;
  };
  cart: {
    get(): Promise<CartState>;
    addItem(item: CartItem): Promise<CartState>;
    removeItem(itemId: string): Promise<CartState>;
    updateQuantity(itemId: string, quantity: number): Promise<CartState>;
  };
  checkout: {
    create(cart: CartState): Promise<CheckoutSession>;
    getPaymentMethods(): Promise<PaymentMethod[]>;
  };
}

const mockProducts: Product[] = [
  { id: '1', slug: 'heavy-tee', name: 'Heavyweight Tee', price: 1999, category: 'tops', sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Black', value: '#0a0a0a' }] },
  { id: '2', slug: 'cargo-pants', name: 'Tactical Cargo', price: 3499, category: 'bottoms', sizes: ['30', '32', '34', '36'], colors: [{ name: 'Olive', value: '#556b2f' }] }
];

let mockCartState: CartState = {
  items: [],
  subtotal: 0,
  currency: 'INR'
};

const updateMockCartSubtotal = () => {
  mockCartState.subtotal = mockCartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

export const mockCommerceProvider: CommerceProvider = {
  products: {
    getAll: async () => mockProducts,
    getBySlug: async (slug: string) => mockProducts.find(p => p.slug === slug) || null,
    getByCategory: async (category: string) => mockProducts.filter(p => p.category === category)
  },
  cart: {
    get: async () => mockCartState,
    addItem: async (item: CartItem) => {
      const existing = mockCartState.items.find(i => i.productId === item.productId && i.color === item.color && i.size === item.size);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        mockCartState.items.push(item);
      }
      updateMockCartSubtotal();
      return mockCartState;
    },
    removeItem: async (itemId: string) => {
      mockCartState.items = mockCartState.items.filter(i => i.id !== itemId);
      updateMockCartSubtotal();
      return mockCartState;
    },
    updateQuantity: async (itemId: string, quantity: number) => {
      const item = mockCartState.items.find(i => i.id === itemId);
      if (item) {
        item.quantity = quantity;
      }
      updateMockCartSubtotal();
      return mockCartState;
    }
  },
  checkout: {
    create: async (cart: CartState) => ({
      id: 'mock-session-123',
      url: '/checkout/mock-session-123',
      status: 'pending'
    }),
    getPaymentMethods: async () => [
      { id: 'pm-1', type: 'razorpay', label: 'Razorpay / UPI', icon: 'razorpay-icon' }
    ]
  }
};
