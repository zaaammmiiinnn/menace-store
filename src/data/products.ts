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

export const products: Product[] = [
  {
    id: 'prod_001',
    slug: 'quiet-menace',
    name: 'The Quiet Menace Tee',
    description: 'No logo. No noise. Just the best damn tee you will ever own. Drop-shoulder, heavy weight, boxy fit. Let the silhouette do the talking.',
    price: 1299,
    colorways: [
      { name: 'Black', hex: '#0A0A0A', materialColor: '#0A0A0A' },
      { name: 'Bone', hex: '#E8E0D0', materialColor: '#E8E0D0' },
      { name: 'Charcoal', hex: '#333333', materialColor: '#333333' },
      { name: 'Cement', hex: '#B5B5B5', materialColor: '#B5B5B5' }
    ],
    sizes: defaultSizes,
    images: ['/images/products/quiet-menace-1.jpg', '/images/products/quiet-menace-2.jpg'],
    category: 'tees',
    tags: ['essentials', 'heavyweight', 'blank'],
    isBestSeller: true,
    isNew: false,
    vibeName: 'quiet'
  },
  {
    id: 'prod_002',
    slug: 'loud-menace',
    name: 'The Loud Menace Tee',
    description: 'Big print, zero apologies. Front and center graphic that makes a statement before you even open your mouth. You either get it or you don\'t.',
    price: 1499,
    colorways: [
      { name: 'Washed Black', hex: '#1A1A1A', materialColor: '#1A1A1A' },
      { name: 'Acid Green', hex: '#C6FF00', materialColor: '#C6FF00' },
      { name: 'White', hex: '#FFFFFF', materialColor: '#FFFFFF' },
      { name: 'Navy', hex: '#1B2838', materialColor: '#1B2838' }
    ],
    sizes: defaultSizes,
    images: ['/images/products/loud-menace-1.jpg', '/images/products/loud-menace-2.jpg'],
    category: 'tees',
    tags: ['graphic', 'loud', 'statement'],
    isBestSeller: false,
    isNew: true,
    vibeName: 'loud'
  },
  {
    id: 'prod_003',
    slug: 'midnight-menace',
    name: 'The Midnight Menace Tee',
    description: 'Blacked out everything. For those who operate after hours. Stealth logo hit, premium heavy cotton.',
    price: 1399,
    colorways: [
      { name: 'Black', hex: '#0A0A0A', materialColor: '#0A0A0A' },
      { name: 'Washed Black', hex: '#1A1A1A', materialColor: '#1A1A1A' },
      { name: 'Charcoal', hex: '#333333', materialColor: '#333333' },
      { name: 'Pitch Black', hex: '#000000', materialColor: '#000000' }
    ],
    sizes: defaultSizes,
    images: ['/images/products/midnight-menace-1.jpg', '/images/products/midnight-menace-2.jpg'],
    category: 'tees',
    tags: ['dark', 'stealth', 'night'],
    isBestSeller: true,
    isNew: false,
    vibeName: 'midnight'
  },
  {
    id: 'prod_004',
    slug: 'soft-menace',
    name: 'The Soft Menace Tee',
    description: 'Heavyweight waffle texture. Soft on the skin, tough on the outside. Comfort without compromise.',
    price: 1599,
    colorways: [
      { name: 'Bone', hex: '#E8E0D0', materialColor: '#E8E0D0' },
      { name: 'Off-White', hex: '#F5F1E8', materialColor: '#F5F1E8' },
      { name: 'Cement', hex: '#B5B5B5', materialColor: '#B5B5B5' },
      { name: 'Forest', hex: '#2D3B2D', materialColor: '#2D3B2D' }
    ],
    sizes: defaultSizes,
    images: ['/images/products/soft-menace-1.jpg', '/images/products/soft-menace-2.jpg'],
    category: 'tees',
    tags: ['waffle', 'textured', 'cozy'],
    isBestSeller: false,
    isNew: true,
    vibeName: 'quiet'
  },
  {
    id: 'prod_005',
    slug: 'sunday-menace',
    name: 'The Sunday Menace Tee',
    description: 'Washed out, lived in. Feels like you\'ve owned it for years. The perfect tee for when you\'re doing absolutely nothing.',
    price: 1299,
    colorways: [
      { name: 'Washed Black', hex: '#1A1A1A', materialColor: '#1A1A1A' },
      { name: 'Bone', hex: '#E8E0D0', materialColor: '#E8E0D0' },
      { name: 'Faded Navy', hex: '#313C4D', materialColor: '#313C4D' },
      { name: 'Dusty Olive', hex: '#4A5043', materialColor: '#4A5043' }
    ],
    sizes: defaultSizes,
    images: ['/images/products/sunday-menace-1.jpg', '/images/products/sunday-menace-2.jpg'],
    category: 'tees',
    tags: ['washed', 'vintage', 'sunday'],
    isBestSeller: false,
    isNew: false,
    vibeName: 'sunday'
  },
  {
    id: 'prod_006',
    slug: 'public-menace',
    name: 'The Public Menace Tee',
    description: 'Not for the faint of heart. Disruptive graphics, acid washes, made to turn heads and cause a scene.',
    price: 1499,
    colorways: [
      { name: 'Acid Green', hex: '#C6FF00', materialColor: '#C6FF00' },
      { name: 'Black', hex: '#0A0A0A', materialColor: '#0A0A0A' },
      { name: 'Washed Black', hex: '#1A1A1A', materialColor: '#1A1A1A' },
      { name: 'Cement', hex: '#B5B5B5', materialColor: '#B5B5B5' }
    ],
    sizes: defaultSizes,
    images: ['/images/products/public-menace-1.jpg', '/images/products/public-menace-2.jpg'],
    category: 'tees',
    tags: ['loud', 'disruptive', 'graphic'],
    isBestSeller: true,
    isNew: true,
    vibeName: 'loud'
  }
];

export const getProductBySlug = (slug: string) => products.find(p => p.slug === slug);
