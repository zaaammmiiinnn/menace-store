import React from 'react';
import { requireAdmin } from '@/lib/admin/auth';
import { ProductForm } from '@/components/admin/ProductForm';

export default async function NewProductPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F5F1E8]">Add New Silhouette</h1>
        <p className="text-[13px] text-[#8A8A8A] font-mono mt-0.5">
          Draft a new heavyweight garment, generate size matrices, and publish to Drop 001.
        </p>
      </div>

      <ProductForm />
    </div>
  );
}
