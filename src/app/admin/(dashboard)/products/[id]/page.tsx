import React from 'react';
import { requireAdmin } from '@/lib/admin/auth';
import { getProductById } from '@/lib/admin/queries';
import { ProductForm } from '@/components/admin/ProductForm';
import { notFound } from 'next/navigation';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F5F1E8]">Edit Silhouette</h1>
        <p className="text-[13px] text-[#8A8A8A] font-mono mt-0.5">
          Modify product copy, size inventory, price overrides, and photography.
        </p>
      </div>

      <ProductForm initialData={product} isEditing />
    </div>
  );
}
