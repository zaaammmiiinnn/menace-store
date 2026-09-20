import { NextRequest, NextResponse } from 'next/server';
import { upsertDynamicProduct, deleteDynamicProduct, getDynamicProducts } from '@/data/products';
import { getLocalStore } from '@/lib/db';
import { invalidateProductsCache } from '@/lib/products/queries';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, product } = body;

    if (!product || !product.id) {
      return NextResponse.json(
        { success: false, error: 'Missing product or product ID' },
        { status: 400 }
      );
    }

    const store = getLocalStore();
    const dbProducts = store.getTable('products');
    const dbImages = store.getTable('product_images');
    const dbVariants = store.getTable('product_variants');

    if (action === 'delete') {
      deleteDynamicProduct(product.id);
      const idx = dbProducts.findIndex((p: any) => p.id === product.id);
      if (idx !== -1) {
        dbProducts.splice(idx, 1);
      }
      // Remove images
      const filteredImages = dbImages.filter((img: any) => img.product_id !== product.id);
      dbImages.length = 0;
      dbImages.push(...filteredImages);

      // Remove variants
      const filteredVariants = dbVariants.filter((v: any) => v.product_id !== product.id);
      dbVariants.length = 0;
      dbVariants.push(...filteredVariants);

      invalidateProductsCache();

      return NextResponse.json({
        success: true,
        message: `Product ${product.id} removed from storefront`,
      });
    }

    // Upsert product in dynamic memory registry
    const updated = upsertDynamicProduct({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: product.priceInr || product.price_inr || product.price,
      images: product.images && product.images.length > 0 ? product.images : undefined,
      category: product.category,
      status: product.status,
    });

    // Also upsert in local database table
    const existingIndex = dbProducts.findIndex((p: any) => p.id === product.id);
    const dbRecord = {
      id: product.id,
      slug: updated.slug,
      name: updated.name,
      description: updated.description,
      price_inr: updated.price,
      price_usd: Math.round(updated.price * 0.03),
      category: updated.category,
      drop_id: product.dropId || product.drop_id || 'drop_001',
      status: product.status || 'active',
      updated_at: Date.now(),
    };

    if (existingIndex >= 0) {
      dbProducts[existingIndex] = { ...dbProducts[existingIndex], ...dbRecord };
    } else {
      dbProducts.unshift({ ...dbRecord, created_at: Date.now() });
    }

    // Upsert images in local table
    if (Array.isArray(product.images) && product.images.length > 0) {
      const filteredImages = dbImages.filter((img: any) => img.product_id !== product.id);
      product.images.forEach((url: string, idx: number) => {
        filteredImages.push({
          id: `img_${product.id}_${idx}`,
          product_id: product.id,
          url,
          alt: `${product.name} Image ${idx + 1}`,
          sort_order: idx,
        });
      });
      dbImages.length = 0;
      dbImages.push(...filteredImages);
    }

    // Upsert variants if provided
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      const filteredVariants = dbVariants.filter((v: any) => v.product_id !== product.id);
      product.variants.forEach((v: any, idx: number) => {
        filteredVariants.push({
          id: v.id || `var_${product.id}_${idx}`,
          product_id: product.id,
          size: v.size,
          color: v.color || 'Black',
          sku: v.sku || `MNC-${updated.slug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'TEE'}-BLK-${v.size}`,
          stock: Number(v.stock) || 0,
          price_override: v.priceOverride ? Number(v.priceOverride) : null,
          image_url: v.imageUrl || null,
        });
      });
      dbVariants.length = 0;
      dbVariants.push(...filteredVariants);
    }

    invalidateProductsCache();

    return NextResponse.json({
      success: true,
      message: `Product "${updated.name}" updated on storefront successfully`,
      product: updated,
    });
  } catch (error: any) {
    console.error('[API /api/products/sync] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Product sync failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const current = getDynamicProducts();
  return NextResponse.json({
    success: true,
    count: current.length,
    products: current,
  });
}

