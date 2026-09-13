import type { Product, SizeOption } from '@/types';

const defaultSizes: SizeOption[] = [
  { value: 'XS', label: 'X-Small', scale: 0.85, inStock: true },
  { value: 'S', label: 'Small', scale: 0.9, inStock: true },
  { value: 'M', label: 'Medium', scale: 0.95, inStock: true },
  { value: 'L', label: 'Large', scale: 1.0, inStock: true },
  { value: 'XL', label: 'X-Large', scale: 1.05, inStock: true },
  { value: '2XL', label: '2X-Large', scale: 1.1, inStock: true },
  { value: '3XL', label: '3X-Large', scale: 1.12, inStock: true },
  { value: '4XL', label: '4X-Large', scale: 1.15, inStock: true }
];

export const baseProducts: Product[] = [
  {
    id: 'prod_001',
    slug: 'quiet-menace',
    name: 'The Quiet Menace Tee',
    description: '280 GSM Luxury Heavyweight Compact Cotton. No loud branding. Just an uncompromising drop-shoulder, boxy architectural silhouette, pre-shrunk finish, and a thick 1.25" ribbed collar built to hold structure for years.',
    price: 1299,
    colorways: [
      { name: 'Pitch Black', hex: '#0A0A0A', materialColor: '#0A0A0A' },
      { name: 'Bone White', hex: '#E8E0D0', materialColor: '#E8E0D0' },
      { name: 'Charcoal', hex: '#333333', materialColor: '#333333' },
      { name: 'Cement Grey', hex: '#B5B5B5', materialColor: '#B5B5B5' }
    ],
    sizes: defaultSizes,
    images: ['/images/products/quiet-menace-1.jpg', '/images/products/quiet-menace-2.jpg'],
    category: 'tees',
    tags: ['essentials', 'heavyweight', 'blank', 'luxury'],
    isBestSeller: true,
    isNew: false,
    vibeName: 'quiet'
  },
  {
    id: 'prod_002',
    slug: 'loud-menace',
    name: 'The Loud Menace Tee',
    description: '280 GSM Mineral-Washed Heavyweight Cotton. Features our high-density cracked puff print "MENACE" arch graphic across the chest in radioactive acid green. Raw unfinished attitude tailored to an oversized Gen Z boxy drape.',
    price: 1499,
    colorways: [
      { name: 'Washed Black', hex: '#1A1A1A', materialColor: '#1A1A1A' },
      { name: 'Acid Green', hex: '#C6FF00', materialColor: '#C6FF00' },
      { name: 'Chalk White', hex: '#FFFFFF', materialColor: '#FFFFFF' },
      { name: 'Navy', hex: '#1B2838', materialColor: '#1B2838' }
    ],
    sizes: defaultSizes,
    images: ['/images/products/loud-menace-1.jpg', '/images/products/loud-menace-2.jpg'],
    category: 'tees',
    tags: ['graphic', 'loud', 'statement', 'streetwear'],
    isBestSeller: false,
    isNew: true,
    vibeName: 'loud'
  },
  {
    id: 'prod_003',
    slug: 'midnight-menace',
    name: 'The Midnight Menace Tee',
    description: 'Blacked-out nocturnal execution. 280 GSM combed cotton with stealth matte black silicone tonal micro-hit on the nape. For those who operate in the shadows after hours. Deep, non-reflective dye with zero colour fading.',
    price: 1399,
    colorways: [
      { name: 'Pitch Black', hex: '#0A0A0A', materialColor: '#0A0A0A' },
      { name: 'Washed Black', hex: '#1A1A1A', materialColor: '#1A1A1A' },
      { name: 'Charcoal', hex: '#333333', materialColor: '#333333' }
    ],
    sizes: defaultSizes,
    images: ['/images/products/midnight-menace-1.jpg', '/images/products/midnight-menace-2.jpg'],
    category: 'tees',
    tags: ['dark', 'stealth', 'night', 'minimalist'],
    isBestSeller: true,
    isNew: false,
    vibeName: 'midnight'
  },
  {
    id: 'prod_004',
    slug: 'soft-menace',
    name: 'The Oversized Heavy Waffle Tee',
    description: 'Signature 300 GSM thermal honeycomb waffle weave. Heavy tactile drape that breathes naturally while insulating against cool air. Cut wide and cropped slightly at the natural waist for relaxed streetwear stacking.',
    price: 1599,
    colorways: [
      { name: 'Bone Cream', hex: '#E8E0D0', materialColor: '#E8E0D0' },
      { name: 'Off-White', hex: '#F5F1E8', materialColor: '#F5F1E8' },
      { name: 'Cement', hex: '#B5B5B5', materialColor: '#B5B5B5' }
    ],
    sizes: defaultSizes,
    images: ['/images/products/heavy-waffle-1.jpg', '/images/products/heavy-waffle-2.jpg'],
    category: 'tees',
    tags: ['waffle', 'textured', 'thermal', 'heavyweight'],
    isBestSeller: true,
    isNew: true,
    vibeName: 'quiet'
  },
  {
    id: 'prod_005',
    slug: 'sunday-menace',
    name: 'The Raw Edge Boxy Tee',
    description: '260 GSM open-end vintage jersey with deliberate raw-cut hems that curl organically with each wear and wash. Ultra-soft silicone garment wash gives it a 10-year broken-in feel from day one. Zero break-in required.',
    price: 1299,
    colorways: [
      { name: 'Cement Grey', hex: '#B5B5B5', materialColor: '#B5B5B5' },
      { name: 'Washed Black', hex: '#1A1A1A', materialColor: '#1A1A1A' },
      { name: 'Bone', hex: '#E8E0D0', materialColor: '#E8E0D0' }
    ],
    sizes: defaultSizes,
    images: ['/images/products/raw-edge-boxy-1.jpg', '/images/products/raw-edge-boxy-2.jpg'],
    category: 'tees',
    tags: ['washed', 'raw-edge', 'distressed', 'vintage'],
    isBestSeller: false,
    isNew: false,
    vibeName: 'sunday'
  },
  {
    id: 'prod_006',
    slug: 'public-menace',
    name: 'The Acid Menace Tee',
    description: 'High-visibility luminescent acid green oversized tee. 280 GSM combed compact cotton engineered specifically for flash photography and club lighting. Front and back cybernetic stencil typography hits with sealed seams.',
    price: 1499,
    colorways: [
      { name: 'Acid Green', hex: '#C6FF00', materialColor: '#C6FF00' },
      { name: 'Pitch Black', hex: '#0A0A0A', materialColor: '#0A0A0A' },
      { name: 'Washed Black', hex: '#1A1A1A', materialColor: '#1A1A1A' }
    ],
    sizes: defaultSizes,
    images: ['/images/products/acid-menace-1.jpg', '/images/products/acid-menace-2.jpg'],
    category: 'tees',
    tags: ['loud', 'acid-green', 'cyber', 'statement'],
    isBestSeller: true,
    isNew: true,
    vibeName: 'loud'
  }
];

// Global dynamic product state synced with Admin Console
const dynamicProductsMap = new Map<string, Product>();

// Initialize map with base products
baseProducts.forEach(p => dynamicProductsMap.set(p.id, p));

export function getDynamicProducts(): Product[] {
  return Array.from(dynamicProductsMap.values());
}

export function upsertDynamicProduct(product: Partial<Product> & { id: string }): Product {
  const existing = dynamicProductsMap.get(product.id) || baseProducts.find(p => p.id === product.id || p.slug === product.slug);
  const merged: Product = {
    ...(existing || baseProducts[0]),
    ...product,
    id: product.id,
    slug: product.slug || existing?.slug || `prod-${product.id}`,
    name: product.name || existing?.name || 'Menace Tee',
    description: product.description || existing?.description || '',
    price: product.price ?? existing?.price ?? 1299,
    images: product.images && product.images.length > 0 ? product.images : (existing?.images || ['/images/products/quiet-menace-1.jpg']),
    colorways: product.colorways || existing?.colorways || [{ name: 'Black', hex: '#0A0A0A', materialColor: '#0A0A0A' }],
    sizes: product.sizes || existing?.sizes || defaultSizes,
    category: product.category || existing?.category || 'tees',
    tags: product.tags || existing?.tags || ['streetwear'],
    isBestSeller: product.isBestSeller ?? existing?.isBestSeller ?? false,
    isNew: product.isNew ?? existing?.isNew ?? true,
    vibeName: product.vibeName || existing?.vibeName || 'quiet',
  };
  dynamicProductsMap.set(product.id, merged);
  return merged;
}

export function deleteDynamicProduct(id: string): boolean {
  return dynamicProductsMap.delete(id);
}

// Proxied products array that always resolves latest dynamic values
export const products: Product[] = new Proxy(baseProducts, {
  get(target, prop, receiver) {
    const dynamicList = getDynamicProducts();
    if (prop === 'length') return dynamicList.length;
    if (typeof prop === 'string' && !isNaN(Number(prop))) {
      return dynamicList[Number(prop)];
    }
    const val = Reflect.get(dynamicList, prop);
    return typeof val === 'function' ? val.bind(dynamicList) : val;
  }
});

export const getProductBySlug = (slug: string): Product | undefined => {
  const list = getDynamicProducts();
  return list.find(p => p.slug === slug || p.id === slug);
};
