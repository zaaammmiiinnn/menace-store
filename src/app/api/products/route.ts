import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/products/queries';

export const revalidate = 60;

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (e: any) {
    return NextResponse.json({
      success: false,
      error: e?.message || 'Failed to fetch products',
    }, { status: 500 });
  }
}

