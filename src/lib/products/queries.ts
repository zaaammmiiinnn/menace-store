import { getDb, getLocalStore } from '@/lib/db';
import { products, productVariants, productImages, drops } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { SEED_PRODUCTS, SIZES } from '@/lib/db/seed-data';

export interface FormattedProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceInr: number;
  priceUsd: number;
  category: string;
  dropId: string | null;
  status: 'draft' | 'active' | 'archived';
  backQuote: string;
  frontLogo: string;
  fabricGsm: number;
  fabricType: string;
  fit: string;
  sleeveType: string;
  color: string;
  images: string[];
  variants: {
    id: string;
    size: string;
    color: string;
    sku: string;
    stock: number;
  }[];
}

// Convert seed products into fallback formatted structure
function getFallbackProducts(): FormattedProduct[] {
  return SEED_PRODUCTS.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    priceInr: p.priceInr,
    priceUsd: p.priceUsd,
    category: p.category,
    dropId: 'drop_001',
    status: 'draft',
    backQuote: p.backQuote,
    frontLogo: p.frontLogo,
    fabricGsm: p.fabricGsm,
    fabricType: p.fabricType,
    fit: p.fit,
    sleeveType: p.sleeveType,
    color: p.color,
    images: [
      `/products/${p.slug}/front.jpg`,
      `/products/${p.slug}/back.jpg`,
      `/products/${p.slug}/detail-1.jpg`,
      `/products/${p.slug}/detail-2.jpg`,
    ],
    variants: SIZES.map((size) => ({
      id: `var_${p.id}_${size.toLowerCase()}`,
      size,
      color: p.color,
      sku: `MENANCE-${p.slug.toUpperCase().replace(/-/g, '-')}-${size}`,
      stock: 0,
    })),
  }));
}

export async function getProducts(): Promise<FormattedProduct[]> {
  try {
    const db = getDb();
    const allProducts = await db.select().from(products);
    if (!allProducts || allProducts.length === 0) {
      return getFallbackProducts();
    }

    const allVariants = await db.select().from(productVariants);
    const allImages = await db.select().from(productImages);

    return allProducts.map((p) => {
      const pVariants = allVariants.filter((v) => v.productId === p.id);
      const pImages = allImages
        .filter((img) => img.productId === p.id)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      const color = pVariants[0]?.color || 'Black';
      const imagesList = pImages.length > 0 
        ? pImages.map((img) => img.url)
        : [
            `/products/${p.slug}/front.jpg`,
            `/products/${p.slug}/back.jpg`,
            `/products/${p.slug}/detail-1.jpg`,
            `/products/${p.slug}/detail-2.jpg`,
          ];

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        priceInr: p.priceInr,
        priceUsd: p.priceUsd,
        category: p.category,
        dropId: p.dropId,
        status: p.status,
        backQuote: p.backQuote || 'NOT FOR EVERYONE.',
        frontLogo: p.frontLogo || 'MENANCE®',
        fabricGsm: p.fabricGsm || 240,
        fabricType: p.fabricType || 'Waffle Knit',
        fit: p.fit || 'Boxy Oversized',
        sleeveType: p.sleeveType || 'Half Sleeve',
        color,
        images: imagesList,
        variants: pVariants.map((v) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          sku: v.sku,
          stock: v.stock,
        })),
      };
    });
  } catch (err) {
    console.warn('[getProducts] D1 query failed, using seed fallback:', err);
    return getFallbackProducts();
  }
}

export async function getProductBySlug(slug: string): Promise<FormattedProduct | null> {
  try {
    const db = getDb();
    const rows = await db.select().from(products).where(eq(products.slug, slug));
    if (rows && rows.length > 0) {
      const p = rows[0];
      const pVariants = await db.select().from(productVariants).where(eq(productVariants.productId, p.id));
      const pImages = await db.select().from(productImages).where(eq(productImages.productId, p.id));

      const color = pVariants[0]?.color || 'Black';
      const imagesList = pImages.length > 0 
        ? pImages.sort((a, b) => a.sortOrder - b.sortOrder).map((img) => img.url)
        : [
            `/products/${p.slug}/front.jpg`,
            `/products/${p.slug}/back.jpg`,
            `/products/${p.slug}/detail-1.jpg`,
            `/products/${p.slug}/detail-2.jpg`,
          ];

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        priceInr: p.priceInr,
        priceUsd: p.priceUsd,
        category: p.category,
        dropId: p.dropId,
        status: p.status,
        backQuote: p.backQuote || 'NOT FOR EVERYONE.',
        frontLogo: p.frontLogo || 'MENANCE®',
        fabricGsm: p.fabricGsm || 240,
        fabricType: p.fabricType || 'Waffle Knit',
        fit: p.fit || 'Boxy Oversized',
        sleeveType: p.sleeveType || 'Half Sleeve',
        color,
        images: imagesList,
        variants: pVariants.map((v) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          sku: v.sku,
          stock: v.stock,
        })),
      };
    }
  } catch (err) {
    console.warn(`[getProductBySlug] D1 query failed for ${slug}, checking fallback:`, err);
  }

  const fallback = getFallbackProducts().find((p) => p.slug === slug);
  return fallback || null;
}

export async function getDrop001() {
  try {
    const db = getDb();
    const dropRows = await db.select().from(drops).where(eq(drops.id, 'drop_001'));
    if (dropRows.length > 0) return dropRows[0];
  } catch {}

  return {
    id: 'drop_001',
    name: 'DROP 001 — NOT FOR EVERYONE',
    launchAt: '2026-10-10T10:00:00+05:30',
    status: 'upcoming' as const,
    description: 'First collection of 240 GSM heavyweight waffle knit oversized silhouettes.',
  };
}
