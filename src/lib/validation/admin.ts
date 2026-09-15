import { z } from 'zod';

export const productVariantSchema = z.object({
  id: z.string().optional(),
  size: z.enum(['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'], {
    message: 'Select a valid Menance size (XS-4XL).',
  }),
  color: z.string().min(1, 'Colorway name is required.'),
  sku: z.string().min(3, 'SKU must be at least 3 characters.').regex(/^[A-Z0-9-]+$/, 'SKU must be uppercase alphanumeric and hyphens.'),
  stock: z.number().int().min(0, 'Stock cannot be negative.').default(0),
  priceOverride: z.number().positive().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required. Keep it punchy."),
  slug: z.string().min(2, "Slug is required.").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric and hyphens only."),
  description: z.string().min(10, "Give it a real description. At least 10 characters."),
  priceInr: z.number().positive("Price must be greater than 0."),
  priceUsd: z.number().positive("USD price must be greater than 0."),
  category: z.string().min(1, "Select or enter a category.").default("tees"),
  dropId: z.string().nullable().optional().default("drop_001"),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  images: z.array(z.string().min(1, "Image URL or path is required.")).min(1, "At least one image is required to publish."),
  variants: z.array(productVariantSchema).min(1, "Generate or add at least one variant."),
});

export const orderStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled'], {
    message: 'Select a valid order status.',
  }),
  trackingNumber: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const discountCodeSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters.").regex(/^[A-Z0-9_-]+$/, "Code must be uppercase alphanumeric."),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().positive("Discount value must be greater than 0."),
  minOrder: z.number().min(0, "Minimum order must be 0 or higher.").default(0),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  active: z.boolean().default(true),
}).refine((data) => {
  if (data.type === 'percentage' && data.value > 100) {
    return false;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%.",
  path: ["value"],
});

export const stockAdjustmentSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required."),
  change: z.number().int(),
  reason: z.string().min(2, "State a reason for stock adjustment (e.g. Restock, Damaged, Count correction)."),
});

export const storeSettingsSchema = z.object({
  storeName: z.string().min(2, "Store name is required."),
  tagline: z.string().min(2, "Brand tagline is required."),
  primaryCurrency: z.string().default("INR"),
  freeShippingThreshold: z.number().min(0),
  standardShippingRate: z.number().min(0),
  gstPercentage: z.number().min(0).max(100),
  ga4Id: z.string().optional(),
  metaPixelId: z.string().optional(),
  tiktokPixelId: z.string().optional(),
  razorpayKeyId: z.string().optional(),
});

export const staffMemberSchema = z.object({
  name: z.string().min(2, "Staff member name is required."),
  email: z.string().email("Valid email required."),
  role: z.enum(['staff', 'admin']),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type ProductVariantFormValues = z.infer<typeof productVariantSchema>;
export type OrderStatusFormValues = z.infer<typeof orderStatusSchema>;
export type DiscountCodeFormValues = z.infer<typeof discountCodeSchema>;
export type StoreSettingsFormValues = z.infer<typeof storeSettingsSchema>;
export type StaffMemberFormValues = z.infer<typeof staffMemberSchema>;
