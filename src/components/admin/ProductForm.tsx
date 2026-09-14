'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, ProductFormValues } from '@/lib/validation/admin';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { VariantEditor, VariantItem } from '@/components/admin/VariantEditor';
import { createProductAction, updateProductAction } from '@/lib/admin/actions';
import { toast } from 'sonner';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import Link from 'next/link';

interface ProductFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultVariants: VariantItem[] = initialData?.variants?.map((v: any) => ({
    id: v.id,
    size: v.size,
    color: v.color,
    sku: v.sku,
    stock: v.stock,
    priceOverride: v.price_override || null,
  })) || [
    { size: 'S', color: 'Black', sku: 'MNC-NEW-BLK-S', stock: 25 },
    { size: 'M', color: 'Black', sku: 'MNC-NEW-BLK-M', stock: 50 },
    { size: 'L', color: 'Black', sku: 'MNC-NEW-BLK-L', stock: 40 },
    { size: 'XL', color: 'Black', sku: 'MNC-NEW-BLK-XL', stock: 20 },
  ];

  const defaultImages: string[] = initialData?.images?.map((i: any) => i.url) || [
    '/images/products/quiet-menace-1.jpg',
  ];

  const [images, setImages] = useState<string[]>(defaultImages);
  const [variants, setVariants] = useState<VariantItem[]>(defaultVariants);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      priceInr: initialData?.price_inr || 1499,
      priceUsd: initialData?.price_usd || 45,
      category: initialData?.category || 'tees',
      dropId: initialData?.drop_id || 'drop_001',
      status: initialData?.status || 'active',
      images: defaultImages,
      variants: defaultVariants,
    },
  });

  const watchedName = watch('name');
  const watchedPrice = watch('priceInr');

  // Auto-generate slug from name on new products
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    if (!isEditing) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue('slug', generatedSlug);
    }
  };

  const onSubmit = async (values: ProductFormValues) => {
    if (images.length === 0) {
      toast.error('At least one product image is required.');
      return;
    }
    if (variants.length === 0) {
      toast.error('Add at least one size variant.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        images,
        variants,
      };

      if (isEditing) {
        await updateProductAction(initialData.id, payload);
        toast.success('Product updated successfully.');
        router.push('/admin/products');
        router.refresh();
      } else {
        const res = await createProductAction(payload);
        toast.success('Product published successfully!');
        router.push('/admin/products');
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || 'Error saving product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-[12px] font-mono text-[#8A8A8A] hover:text-[#F5F1E8] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products</span>
        </Link>

        <div className="flex items-center gap-2">
          {isEditing && (
            <Link
              href={`/shop/${initialData?.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 h-9 px-3 bg-[#171717] hover:bg-[#222] text-[#8A8A8A] hover:text-[#F5F1E8] border border-[#2B2B2B] rounded-md text-[12px] font-mono transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </Link>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 h-9 px-4 bg-[#C6FF00] hover:bg-[#b0e600] text-[#0A0A0A] font-semibold rounded-md text-[12px] font-mono transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update Product' : 'Publish Product'}</span>
          </button>
        </div>
      </div>

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Essential Form Fields (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Attributes Card */}
          <div className="p-5 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F] space-y-4">
            <h2 className="text-[13px] font-mono uppercase tracking-wider text-[#8A8A8A] border-b border-[#1A1A1A] pb-2">
              Silhouette Details
            </h2>

            {/* Product Title */}
            <div>
              <label className="block text-[12px] font-mono text-[#8A8A8A] mb-1">Product Title</label>
              <input
                type="text"
                {...register('name')}
                onChange={handleNameChange}
                placeholder="The Waffle Knit Oversized Tee"
                className="w-full bg-[#141414] border border-[#292929] rounded px-3 py-2 text-[13px] text-[#F5F1E8] focus:outline-none focus:border-[#C6FF00]/50"
              />
              {errors.name && <p className="text-red-400 text-[11px] font-mono mt-1">{errors.name.message}</p>}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-[12px] font-mono text-[#8A8A8A] mb-1">URL Slug</label>
              <div className="flex items-center">
                <span className="bg-[#181818] border border-r-0 border-[#292929] rounded-l px-3 py-2 text-[12px] text-[#666] font-mono">
                  /shop/
                </span>
                <input
                  type="text"
                  {...register('slug')}
                  placeholder="quiet-menace"
                  className="flex-1 bg-[#141414] border border-[#292929] rounded-r px-3 py-2 text-[13px] text-[#C6FF00] font-mono focus:outline-none focus:border-[#C6FF00]/50"
                />
              </div>
              {errors.slug && <p className="text-red-400 text-[11px] font-mono mt-1">{errors.slug.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-[12px] font-mono text-[#8A8A8A] mb-1">Editorial Description</label>
              <textarea
                rows={4}
                {...register('description')}
                placeholder="Deadpan product description matching Menace tone..."
                className="w-full bg-[#141414] border border-[#292929] rounded px-3 py-2 text-[13px] text-[#F5F1E8] focus:outline-none focus:border-[#C6FF00]/50 leading-relaxed"
              />
              {errors.description && <p className="text-red-400 text-[11px] font-mono mt-1">{errors.description.message}</p>}
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-[12px] font-mono text-[#8A8A8A] mb-1">Price (INR ₹)</label>
                <input
                  type="number"
                  {...register('priceInr', { valueAsNumber: true })}
                  placeholder="1499"
                  className="w-full bg-[#141414] border border-[#292929] rounded px-3 py-2 text-[13px] text-[#F5F1E8] font-mono tabular-nums focus:outline-none focus:border-[#C6FF00]/50"
                />
                {errors.priceInr && <p className="text-red-400 text-[11px] font-mono mt-1">{errors.priceInr.message}</p>}
              </div>

              <div>
                <label className="block text-[12px] font-mono text-[#8A8A8A] mb-1">Price (USD $)</label>
                <input
                  type="number"
                  {...register('priceUsd', { valueAsNumber: true })}
                  placeholder="45"
                  className="w-full bg-[#141414] border border-[#292929] rounded px-3 py-2 text-[13px] text-[#F5F1E8] font-mono tabular-nums focus:outline-none focus:border-[#C6FF00]/50"
                />
                {errors.priceUsd && <p className="text-red-400 text-[11px] font-mono mt-1">{errors.priceUsd.message}</p>}
              </div>
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-[12px] font-mono text-[#8A8A8A] mb-1">Category</label>
                <select
                  {...register('category')}
                  className="w-full bg-[#141414] border border-[#292929] rounded px-3 py-2 text-[13px] text-[#F5F1E8] font-mono focus:outline-none focus:border-[#C6FF00]/50"
                >
                  <option value="tees">Tees</option>
                  <option value="hoodies">Hoodies</option>
                  <option value="caps">Caps & Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-mono text-[#8A8A8A] mb-1">Publish Status</label>
                <select
                  {...register('status')}
                  className="w-full bg-[#141414] border border-[#292929] rounded px-3 py-2 text-[13px] text-[#F5F1E8] font-mono focus:outline-none focus:border-[#C6FF00]/50"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Variants Matrix Card */}
          <div className="p-5 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F] space-y-3">
            <h2 className="text-[13px] font-mono uppercase tracking-wider text-[#8A8A8A] border-b border-[#1A1A1A] pb-2">
              Variant Matrix (Size × Color)
            </h2>
            <VariantEditor
              variants={variants}
              onChange={(updated) => {
                setVariants(updated);
                setValue('variants', updated as any);
              }}
              productSlug={watch('slug')}
              basePrice={watchedPrice}
            />
          </div>
        </div>

        {/* Right Column: Imagery & Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Imagery Card */}
          <div className="p-5 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F] space-y-3">
            <h2 className="text-[13px] font-mono uppercase tracking-wider text-[#8A8A8A] border-b border-[#1A1A1A] pb-2">
              Imagery (R2 Upload)
            </h2>
            <ImageUploader
              images={images}
              onChange={(updated) => {
                setImages(updated);
                setValue('images', updated as any);
              }}
            />
            {errors.images && <p className="text-red-400 text-[11px] font-mono mt-1">{errors.images.message}</p>}
          </div>

          {/* Live Storefront Preview Tile */}
          <div className="p-5 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F] space-y-3">
            <h2 className="text-[13px] font-mono uppercase tracking-wider text-[#8A8A8A] border-b border-[#1A1A1A] pb-2">
              Storefront Preview Card
            </h2>

            <div className="rounded-lg bg-[#141414] border border-[#222] p-3 text-center">
              <div className="aspect-square bg-[#0A0A0A] rounded border border-[#222] mb-3 relative overflow-hidden flex items-center justify-center">
                {images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={images[0]} alt="Preview" className="object-cover w-full h-full" />
                ) : (
                  <span className="text-[#555] font-mono text-[11px]">No image uploaded</span>
                )}
                <span className="absolute top-2 left-2 bg-[#0A0A0A]/90 text-[#C6FF00] font-mono text-[9px] px-1.5 py-0.5 rounded border border-[#C6FF00]/30">
                  DROP 001
                </span>
              </div>

              <div className="text-[14px] font-bold text-[#F5F1E8] truncate">
                {watchedName || 'Product Title'}
              </div>
              <div className="text-[12px] font-mono text-[#C6FF00] font-semibold mt-1">
                ₹{watchedPrice?.toLocaleString() || '1,499'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
