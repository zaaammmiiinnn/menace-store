import { NextRequest, NextResponse } from 'next/server';
import { getDynamicProducts } from '@/data/products';

export async function GET() {
  const current = getDynamicProducts();
  return NextResponse.json({
    success: true,
    count: current.length,
    products: current,
  });
}
