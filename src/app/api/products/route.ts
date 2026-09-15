import { NextRequest, NextResponse } from 'next/server';
import { getDynamicProducts, upsertDynamicProduct } from '@/data/products';
import { getD1Database } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const d1 = getD1Database();
  if (d1) {
    try {
      const d1Products = (await d1.prepare('SELECT * FROM products ORDER BY created_at DESC').all())?.results;
      if (d1Products && d1Products.length > 0) {
        for (const p of d1Products as any[]) {
          const imagesRes = (await d1.prepare('SELECT url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC').bind(p.id).all())?.results;
          const images = imagesRes?.map((img: any) => img.url);
          upsertDynamicProduct({
            id: p.id,
            slug: p.slug,
            name: p.name,
            description: p.description,
            price: p.price_inr,
            priceInr: p.price_inr,
            priceUsd: p.price_usd || 45,
            images: images && images.length > 0 ? images : ['/products/the-classic-waffle-black/front.jpg'],
            category: p.category,
            status: p.status,
            backQuote: p.back_quote || 'NOT FOR EVERYONE.',
            frontLogo: p.front_logo || 'MENANCE®',
            fabricGsm: p.fabric_gsm || 240,
            fabricType: p.fabric_type || 'Waffle Knit',
            fit: p.fit || 'Boxy Oversized',
            sleeveType: p.sleeve_type || 'Half Sleeve',
          });
        }
      }
    } catch (e) {
      console.error('[API /api/products GET Error]:', e);
    }
  }

  const current = getDynamicProducts();
  return NextResponse.json({
    success: true,
    count: current.length,
    products: current,
  });
}
