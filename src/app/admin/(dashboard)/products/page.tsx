import React from 'react';
import Link from 'next/link';
import { getProducts } from '@/lib/admin/queries';
import { ProductsTable } from '@/components/admin/ProductsTable';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F1E8]">Product Catalog</h1>
          <p className="text-[13px] text-[#8A8A8A] font-mono mt-0.5">
            Manage silhouettes, prices, variant matrices, and live drop statuses.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="flex items-center gap-1.5 h-9 px-3.5 bg-[#C6FF00] hover:bg-[#b0e600] text-[#0A0A0A] font-semibold rounded-md text-[12px] font-mono transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Product</span>
        </Link>
      </div>

      {/* Table */}
      <ProductsTable products={products} />
    </div>
  );
}
