import { z } from 'zod';

export const productVariantSchema = z.object({
  id: z.string().optional(),
  size: z.string().min(1, 'Select a valid size.'),
  color: z.string().default('Black'),
  sku: z.string().min(1, 'SKU is required.'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative.').default(0),
  priceOverride: z.coerce.number().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required."),
  slug: z.string().min(1, "Slug is required."),
  description: z.string().optional().default(""),
  priceInr: z.coerce.number().min(0, "Price must be 0 or higher.").default(1499),
  priceUsd: z.coerce.number().min(0, "USD price must be 0 or higher.").default(45),
  category: z.string().default("tees"),
  dropId: z.string().nullable().optional().default("drop_001"),
  status: z.enum(['draft', 'active', 'archived']).default('active'),
  purchaseMode: z.enum(['buy_now', 'notify_only']).default('buy_now').optional(),
  images: z.array(z.string()).optional().default([]),
  variants: z.array(z.any()).optional().default([]),
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
  freeShippingThreshold: z.coerce.number().min(0),
  standardShippingRate: z.coerce.number().min(0),
  gstPercentage: z.coerce.number().min(0).max(100),
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
