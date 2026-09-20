import { getDb, getLocalStore, getD1Database } from '@/lib/db';
import { products, productVariants, productImages, drops } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { SEED_PRODUCTS, SIZES } from '@/lib/db/seed-data';

export interface FormattedProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  price?: number;
  priceInr: number;
  priceUsd: number;
  category: string;
  dropId: string | null;
  status: 'draft' | 'active' | 'archived';
  purchaseMode?: 'buy_now' | 'notify_only';
  backQuote: string;
  frontLogo: string;
  fabricGsm: number;
  fabricType: string;
  fit: string;
  sleeveType: string;
  color: string;
  images: string[];
  plainImages: string[];
  colorways?: { name: string; hex: string; materialColor: string }[];
  sizes?: { value: string; label: string; scale: number; inStock: boolean }[];
  tags?: string[];
  isBestSeller?: boolean;
  isNew?: boolean;
  vibeName?: string;
  variants: {
    id: string;
    size: string;
    color: string;
    sku: string;
    stock: number;
  }[];
}

// Helper to resolve product image lists and matching plain images
function resolveProductImages(
  pImages: { url: string; sortOrder: number }[] | undefined,
  slug: string,
  hasModel: boolean,
  hasSecondModel: boolean
): { imagesList: string[]; plainImages: string[] } {
  let imagesList: string[] = [];

  if (pImages && pImages.length > 0) {
    imagesList = pImages
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => img.url);

    // If only 2 images were saved in DB and they point to a product folder (e.g. front.jpg, back.jpg),
    // append detail-1 and detail-2 from that same product folder if available
    if (imagesList.length === 2 && imagesList[0].includes('/products/')) {
      const match = imagesList[0].match(/^(.*)\/front\.(jpe?g|png|webp)$/i);
      if (match) {
        const basePath = match[1];
        imagesList.push(`${basePath}/detail-1.jpg`, `${basePath}/detail-2.jpg`);
      }
    }
  } else {
    imagesList = [
      `/products/${slug}/front.jpg`,
      `/products/${slug}/back.jpg`,
      ...(hasModel ? [`/products/${slug}/model.jpg`] : []),
      ...(hasSecondModel ? [`/products/${slug}/model-2.jpg`] : []),
      `/products/${slug}/detail-1.jpg`,
      `/products/${slug}/detail-2.jpg`,
    ];
  }

  // Derive plain images based on imagesList
  const plainImages = imagesList.map((img) => {
    if (img.includes('-plain')) return img;
    if (/\/front\.(jpe?g|png|webp)$/i.test(img)) {
      return img.replace(/\/front\.(jpe?g|png|webp)$/i, '/front-plain.$1');
    }
    if (/\/back\.(jpe?g|png|webp)$/i.test(img)) {
      return img.replace(/\/back\.(jpe?g|png|webp)$/i, '/back-plain.$1');
    }
    return img;
  });

  return { imagesList, plainImages };
}

// Convert seed products into fallback formatted structure
function getFallbackProducts(): FormattedProduct[] {
  return SEED_PRODUCTS.map((p) => {
    const hasModel = [
      'the-henley-offwhite',
      'heavy-waffle-offwhite-full',
      'the-classic-waffle-offwhite',
      'the-classic-waffle-black',
      'the-henley-black',
      'heavy-waffle-black-full',
      'heavy-waffle-brown-full',
      'brown-boxy-fit-tshirt',
      'off-white-boxy-fit-tshirt',
    ].includes(p.slug);
    const hasSecondModel = p.slug === 'the-henley-offwhite';

    const { imagesList: images, plainImages } = resolveProductImages(
      undefined,
      p.slug,
      hasModel,
      hasSecondModel
    );

    const colorHex = p.color.toLowerCase().includes('white')
      ? '#F5F1E8'
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
      dropId: 'drop_001',
      status: 'active',
      purchaseMode: 'buy_now',
      backQuote: p.backQuote,
      frontLogo: p.frontLogo,
      fabricGsm: p.fabricGsm,
      fabricType: p.fabricType,
      fit: p.fit,
      sleeveType: p.sleeveType,
      color: p.color,
      images,
      plainImages,
      colorways: [{ name: p.color, hex: colorHex, materialColor: colorHex }],
      sizes: SIZES.map((size) => ({ value: size, label: size, scale: 1.0, inStock: true })),
      tags: ['drop001', 'waffle', 'heavyweight'],
      isBestSeller: false,
      isNew: true,
      vibeName: p.category.toLowerCase(),
      variants: SIZES.map((size) => ({
        id: `var_${p.id}_${size.toLowerCase()}`,
        size,
        color: p.color,
        sku: `MENANCE-${p.slug.toUpperCase().replace(/-/g, '-')}-${size}`,
        stock: 25,
      })),
    };
  });
}


// Helper to format raw product database rows with variants and images
function formatProductsList(rawProducts: any[], allVariants: any[], allImages: any[]): FormattedProduct[] {
  return rawProducts.map((p: any) => {
    const pId = p.id;
    const pVariants = allVariants.filter((v: any) => (v.product_id || v.productId) === pId);
    const pImages = allImages
      .filter((img: any) => (img.product_id || img.productId) === pId)
      .sort((a: any, b: any) => ((a.sort_order ?? a.sortOrder ?? 0) - (b.sort_order ?? b.sortOrder ?? 0)))
      .map((img: any) => ({
        url: (img.url?.startsWith('data:image/') || (img.url && img.url.length > 500)) && img.id
          ? `/api/images/${img.id}`
          : img.url,
        sortOrder: img.sort_order ?? img.sortOrder ?? 0,
      }));

    const color = pVariants[0]?.color || p.color || 'Black';
    const hasModel = [
      'the-henley-offwhite',
      'heavy-waffle-offwhite-full',
      'the-classic-waffle-offwhite',
      'the-classic-waffle-black',
      'the-henley-black',
      'heavy-waffle-black-full',
      'heavy-waffle-brown-full',
      'brown-boxy-fit-tshirt',
      'off-white-boxy-fit-tshirt',
    ].includes(p.slug);
    const hasSecondModel = p.slug === 'the-henley-offwhite';

    const { imagesList, plainImages } = resolveProductImages(
      pImages.length > 0 ? pImages : undefined,
      p.slug,
      hasModel,
      hasSecondModel
    );

    const colorHex = color.toLowerCase().includes('white')
      ? '#F5F1E8'
      : color.toLowerCase().includes('brown')
      ? '#5A3D28'
      : color.toLowerCase().includes('grey') || color.toLowerCase().includes('acid')
      ? '#4A4E51'
      : '#0A0A0A';

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description || '',
      price: p.price_inr ?? p.priceInr ?? 1499,
      priceInr: p.price_inr ?? p.priceInr ?? 1499,
      priceUsd: p.price_usd ?? p.priceUsd ?? 45,
      category: p.category || 'tees',
      dropId: p.drop_id ?? p.dropId ?? 'drop_001',
      status: p.status || 'active',
      purchaseMode: p.purchase_mode ?? p.purchaseMode ?? 'buy_now',
      backQuote: p.back_quote ?? p.backQuote ?? 'NOT FOR EVERYONE.',
      frontLogo: p.front_logo ?? p.frontLogo ?? 'MENANCE®',
      fabricGsm: p.fabric_gsm ?? p.fabricGsm ?? 240,
      fabricType: p.fabric_type ?? p.fabricType ?? 'Waffle Knit',
      fit: p.fit || 'Boxy Oversized',
      sleeveType: p.sleeve_type ?? p.sleeveType ?? 'Half Sleeve',
      color,
      images: imagesList,
      plainImages,
      colorways: [{ name: color, hex: colorHex, materialColor: colorHex }],
      sizes: SIZES.map((size) => ({ value: size, label: size, scale: 1.0, inStock: true })),
      tags: ['drop001', 'waffle', 'heavyweight'],
      isBestSeller: false,
      isNew: true,
      vibeName: (p.category || 'tees').toLowerCase(),
      variants: pVariants.length > 0
        ? pVariants.map((v: any) => ({
            id: v.id,
            size: v.size,
            color: v.color || color,
            sku: v.sku || `MENANCE-${p.slug.toUpperCase().replace(/-/g, '-')}-${v.size}`,
            stock: v.stock ?? 25,
          }))
        : SIZES.map((size) => ({
            id: `var_${p.id}_${size.toLowerCase()}`,
            size,
            color,
            sku: `MENANCE-${p.slug.toUpperCase().replace(/-/g, '-')}-${size}`,
            stock: 25,
          })),
    };
  });
}

function formatDynamicProduct(p: any): FormattedProduct {
  const images = Array.isArray(p.images) && p.images.length > 0 ? p.images : [`/products/${p.slug}/front.jpg`];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description || '',
    price: p.priceInr || p.price || 1499,
    priceInr: p.priceInr || p.price || 1499,
    priceUsd: p.priceUsd || 45,
    category: p.category || 'tees',
    dropId: p.dropId || 'drop_001',
    status: (p.status as any) || 'active',
    purchaseMode: p.purchaseMode || 'buy_now',
    backQuote: p.backQuote || 'NOT FOR EVERYONE.',
    frontLogo: p.frontLogo || 'MENANCE®',
    fabricGsm: p.fabricGsm || 240,
    fabricType: p.fabricType || 'Waffle Knit',
    fit: p.fit || 'Boxy Oversized',
    sleeveType: p.sleeveType || 'Half Sleeve',
    color: p.color || 'Black',
    images,
    plainImages: images,
    colorways: [{ name: p.color || 'Black', hex: '#0A0A0A', materialColor: '#0A0A0A' }],
    sizes: SIZES.map((size) => ({ value: size, label: size, scale: 1.0, inStock: true })),
    tags: p.tags || ['menance'],
    isBestSeller: false,
    isNew: true,
    vibeName: (p.category || 'tees').toLowerCase(),
    variants: SIZES.map((size) => ({
      id: `var_${p.id}_${size.toLowerCase()}`,
      size,
      color: p.color || 'Black',
      sku: `MENANCE-${p.slug.toUpperCase().replace(/-/g, '-')}-${size}`,
      stock: 25,
    })),
  };
}

// Module-level in-memory cache to prevent redundant D1 queries and Worker CPU exhaustion
let memoryProductsCache: { data: FormattedProduct[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function invalidateProductsCache() {
  memoryProductsCache = null;
}

export async function getProducts(): Promise<FormattedProduct[]> {
  // 1. Return from in-memory cache if fresh (< 60s)
  if (memoryProductsCache && Date.now() - memoryProductsCache.timestamp < CACHE_TTL_MS) {
    return memoryProductsCache.data;
  }

  // 2. Query direct Cloudflare D1 with parallel execution
  const d1 = getD1Database();
  if (d1) {
    try {
      const [prodsRes, variantsRes, imagesRes] = await Promise.all([
        d1.prepare("SELECT * FROM products WHERE status = 'active' ORDER BY created_at DESC").all(),
        d1.prepare("SELECT * FROM product_variants").all(),
        d1.prepare("SELECT * FROM product_images ORDER BY sort_order ASC").all(),
      ]);

      const rawProducts = prodsRes?.results || [];
      const allVariants = variantsRes?.results || [];
      const allImages = imagesRes?.results || [];

      if (rawProducts.length > 0) {
        const formatted = formatProductsList(rawProducts, allVariants, allImages);
        memoryProductsCache = { data: formatted, timestamp: Date.now() };
        return formatted;
      }
    } catch (err) {
      console.warn('[getProducts] D1 query failed, checking local store:', err);
    }
  }

  // 3. Check Local Database Store (LocalD1Fallback)
  try {
    const store = getLocalStore();
    const localProds = (store.getTable('products') || []).filter((p: any) => (p.status || 'active') === 'active');
    const localVariants = store.getTable('product_variants') || [];
    const localImages = store.getTable('product_images') || [];

    if (localProds.length > 0) {
      const formatted = formatProductsList(localProds, localVariants, localImages);
      memoryProductsCache = { data: formatted, timestamp: Date.now() };
      return formatted;
    }
  } catch (storeErr) {
    console.warn('[getProducts] LocalStore query failed:', storeErr);
  }

  // 4. Fallback to static seed data
  const fallback = getFallbackProducts();
  memoryProductsCache = { data: fallback, timestamp: Date.now() };
  return fallback;
}

export async function getProductBySlug(slug: string): Promise<FormattedProduct | null> {
  // Check memory cache first
  if (memoryProductsCache && Date.now() - memoryProductsCache.timestamp < CACHE_TTL_MS) {
    const cached = memoryProductsCache.data.find((p) => p.slug === slug);
    if (cached) return cached;
  }

  const d1 = getD1Database();
  if (d1) {
    try {
      const prodRes: any = await d1.prepare('SELECT * FROM products WHERE slug = ?').bind(slug).first();
      if (prodRes) {
        const [variantsRes, imagesRes] = await Promise.all([
          d1.prepare('SELECT * FROM product_variants WHERE product_id = ?').bind(prodRes.id).all(),
          d1.prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC').bind(prodRes.id).all(),
        ]);

        const pVariants = variantsRes?.results || [];
        const pImages = (imagesRes?.results || []).map((img: any) => ({
          url: (img.url?.startsWith('data:image/') || (img.url && img.url.length > 500)) && img.id
            ? `/api/images/${img.id}`
            : img.url,
          sortOrder: img.sort_order ?? img.sortOrder ?? 0,
        }));

        const formatted = formatProductsList([prodRes], pVariants, pImages);
        return formatted[0] || null;
      }
    } catch (err) {
      console.warn(`[getProductBySlug] D1 query failed for ${slug}:`, err);
    }
  }

  // Check all available products
  const all = await getProducts();
  const found = all.find((p) => p.slug === slug || p.id === slug);
  return found || null;
}


export async function getDrop001() {
  const d1 = getD1Database();
  if (d1) {
    try {
      const dropRes: any = await d1.prepare("SELECT * FROM drops WHERE id = 'drop_001'").first();
      if (dropRes) {
        return {
          id: dropRes.id,
          name: dropRes.name,
          launchAt: dropRes.launch_at || dropRes.launchAt,
          status: dropRes.status,
          description: dropRes.description,
        };
      }
    } catch (e) {
      console.warn('[getDrop001] D1 direct query error:', e);
    }
  }

  try {
    const db = getDb();
    const dropRows = await db.select().from(drops).where(eq(drops.id, 'drop_001'));
    if (dropRows.length > 0) return dropRows[0];
  } catch {}

  const store = getLocalStore();
  const local = store.getTable('drops').find((d: any) => d.id === 'drop_001');
  if (local) {
    return {
      id: local.id,
      name: local.name,
      launchAt: local.launch_at || local.launchAt,
      status: local.status,
      description: local.description,
    };
  }

  return {
    id: 'drop_001',
    name: 'DROP 001 — NOT FOR EVERYONE',
    launchAt: '2026-10-10T10:00:00+05:30',
    status: 'live' as const,
    description: 'First collection of 240 GSM heavyweight waffle knit oversized silhouettes.',
  };
}

export async function getDropById(id: string) {
  const d1 = getD1Database();
  if (d1) {
    try {
      const dropRes: any = await d1.prepare('SELECT * FROM drops WHERE id = ?').bind(id).first();
      if (dropRes) {
        return {
          id: dropRes.id,
          name: dropRes.name,
          launchAt: dropRes.launch_at || dropRes.launchAt,
          status: dropRes.status,
          description: dropRes.description,
        };
      }
    } catch (e) {
      console.warn(`[getDropById] D1 error for ${id}:`, e);
    }
  }

  return getDrop001();
}
