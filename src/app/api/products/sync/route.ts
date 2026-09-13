import { NextRequest, NextResponse } from 'next/server';
import { upsertDynamicProduct, deleteDynamicProduct, getDynamicProducts } from '@/data/products';
import { getLocalStore } from '@/lib/db';

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

    if (action === 'delete') {
      deleteDynamicProduct(product.id);
      const idx = dbProducts.findIndex((p: any) => p.id === product.id);
      if (idx !== -1) {
        dbProducts.splice(idx, 1);
      }
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
