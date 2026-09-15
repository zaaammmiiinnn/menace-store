export interface ColorSwatch {
  name: string;
  hex: string;
  materialColor: string;
}

export interface SizeOption {
  value: 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL' | '4XL';
  label: string;
  scale: number;
  inStock: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  colorways: ColorSwatch[];
  sizes: SizeOption[];
  images: string[];
  category: string;
  tags: string[];
  isBestSeller: boolean;
  isNew: boolean;
  vibeName: string;
  vibe?: string;
  status?: 'draft' | 'active' | 'archived';
  backQuote?: string;
  frontLogo?: string;
  fabricGsm?: number;
  fabricType?: string;
  fit?: string;
  sleeveType?: string;
  priceInr?: number;
  priceUsd?: number;
}

export interface CartItem {
  id: string;
  product: Product;
  color: string;
  size: string;
  quantity: number;
  selectedColor?: ColorSwatch;
  selectedSize?: SizeOption;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number; // 1-5
  text: string;
  date: string;
  verified: boolean;
}

export interface DropConfig {
  name: string;
  date: string;
  isLive: boolean;
}

export interface CurrencyConfig {
  code: 'INR' | 'USD';
  symbol: string;
  locale?: string;
  rate?: number; // rate against INR
}

export interface NavLink {
  label: string;
  title?: string;
  href: string;
  children?: NavLink[];
}

export interface FooterLinkGroup {
  title: string;
  links: NavLink[];
}

export interface AnnouncementMessage {
  text: string;
  link?: string;
}

export interface SEOConfig {
  title: string;
  description: string;
  ogImage: string;
  siteUrl: string;
}

export interface UGCItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  alt: string;
  platform: 'instagram' | 'tiktok';
  handle: string;
}

export interface VibeCategory {
  slug: string;
  name: string;
  description: string;
  image: string;
  products: string[];
}

export interface LookbookHotspot {
  x: number; // percentage
  y: number; // percentage
  productId: string;
  productName: string;
  price: number;
}

export interface LookbookItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  tagline: string;
  hotspots: LookbookHotspot[];
}

export interface DropItem {
  id: string;
  number: string;
  name: string;
  tagline: string;
  date: string;
  status: 'upcoming' | 'live' | 'archived';
  itemCount: number;
  featuredProduct: string;
}
