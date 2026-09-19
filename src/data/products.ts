import type { Product, SizeOption } from '@/types';
import { SEED_PRODUCTS, SIZES } from '@/lib/db/seed-data';

const defaultSizes: SizeOption[] = SIZES.map((size) => ({
  value: size as any,
  label: size,
  scale: 1.0,
  inStock: false,
}));

let dynamicProductsList: Product[] = SEED_PRODUCTS.map((p) => {
  const colorHex = p.color.toLowerCase().includes('white')
    ? '#F5F1E8'
    : p.color.toLowerCase().includes('pink')
    ? '#F06292'
    : p.color.toLowerCase().includes('brown')
    ? '#5A3D28'
    : p.color.toLowerCase().includes('grey') || p.color.toLowerCase().includes('acid')
    ? '#4A4E51'
    : '#0A0A0A';

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: p.priceInr,
    priceInr: p.priceInr,
    priceUsd: p.priceUsd,
    category: p.category,
    status: 'active',
    colorways: [
      {
        name: p.color,
        hex: colorHex,
        materialColor: colorHex,
      },
    ],
    sizes: defaultSizes,
    images: [
      `/products/${p.slug}/front.jpg`,
      `/products/${p.slug}/back.jpg`,
      `/products/${p.slug}/detail-1.jpg`,
      `/products/${p.slug}/detail-2.jpg`,
    ],
    tags: ['drop001', 'waffle', 'boxy', 'heavyweight'],
    isBestSeller: false,
    isNew: true,
    vibeName: p.category.toLowerCase(),
    vibe: p.category.toLowerCase(),
    backQuote: p.backQuote,
    frontLogo: p.frontLogo,
    fabricGsm: p.fabricGsm,
    fabricType: p.fabricType,
    fit: p.fit,
    sleeveType: p.sleeveType,
  };
});

export const products = dynamicProductsList;
export const baseProducts = products;

export function getProductBySlug(slug: string): Product | undefined {
  return dynamicProductsList.find((p) => p.slug === slug);
}

export function getAllProducts(): Product[] {
  return dynamicProductsList;
}

export function getDynamicProducts(): Product[] {
  return dynamicProductsList;
}

export function upsertDynamicProduct(partial: Partial<Product> & { id: string }): Product {
  const existingIdx = dynamicProductsList.findIndex((p) => p.id === partial.id);
  if (existingIdx >= 0) {
    dynamicProductsList[existingIdx] = {
      ...dynamicProductsList[existingIdx],
      ...partial,
      sizes: dynamicProductsList[existingIdx].sizes || defaultSizes,
      colorways: dynamicProductsList[existingIdx].colorways || [],
      images: partial.images || dynamicProductsList[existingIdx].images || [],
    };
    return dynamicProductsList[existingIdx];
  } else {
    const newProd: Product = {
      id: partial.id,
      slug: partial.slug || `product-${Date.now()}`,
      name: partial.name || 'Menance Product',
      description: partial.description || '',
      price: partial.price || 1499,
      priceInr: partial.priceInr || partial.price || 1499,
      priceUsd: partial.priceUsd || 45,
      category: partial.category || 'tees',
      status: (partial.status as any) || 'active',
      colorways: partial.colorways || [{ name: 'Black', hex: '#0A0A0A', materialColor: '#0A0A0A' }],
      sizes: partial.sizes || defaultSizes,
      images: partial.images || ['/products/placeholder.svg'],
      tags: partial.tags || ['menance'],
      isBestSeller: false,
      isNew: true,
      vibeName: 'quiet',
      backQuote: partial.backQuote || 'NOT FOR EVERYONE.',
      frontLogo: partial.frontLogo || 'MENANCE®',
      fabricGsm: partial.fabricGsm || 240,
      fabricType: partial.fabricType || 'Waffle Knit',
      fit: partial.fit || 'Boxy Oversized',
      sleeveType: partial.sleeveType || 'Half Sleeve',
    };
    dynamicProductsList.unshift(newProd);
    return newProd;
  }
}

export function deleteDynamicProduct(id: string): boolean {
  const idx = dynamicProductsList.findIndex((p) => p.id === id);
  if (idx !== -1) {
    dynamicProductsList.splice(idx, 1);
    return true;
  }
  return false;
}
