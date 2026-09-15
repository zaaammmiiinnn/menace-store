import { z } from 'zod';

export const IndianStates = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;

export const CustomerInfoSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Please provide a valid email address'),
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/[\s+-]/g, '').replace(/^91/, ''))
    .refine((val) => /^[6-9]\d{9}$/.test(val), {
      message: 'Enter a valid 10-digit Indian mobile number',
    }),
});

export const ShippingAddressSchema = z.object({
  line1: z.string().trim().min(5, 'Street address is required (min 5 characters)'),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  pincode: z
    .string()
    .trim()
    .refine((val) => /^\d{6}$/.test(val.replace(/\s/g, '')), {
      message: 'PIN code must be exactly 6 digits',
    }),
  country: z.string().trim().default('India'),
});

export const CheckoutItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().default(''),
  name: z.string().min(1, 'Product name is required'),
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  price: z.number().positive('Price must be greater than 0'),
  imageUrl: z.string().optional().default('/products/placeholder.svg'),
});

export const CreateOrderSchema = z.object({
  items: z.array(CheckoutItemSchema).min(1, 'Your cart is empty'),
  customer: CustomerInfoSchema,
  shipping: ShippingAddressSchema,
  clerkUserId: z.string().optional().nullable(),
});

export const VerifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, 'Razorpay Order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Razorpay Payment ID is required'),
  razorpay_signature: z.string().min(1, 'Razorpay Signature is required'),
});

export type CustomerInfo = z.infer<typeof CustomerInfoSchema>;
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;
export type CheckoutItem = z.infer<typeof CheckoutItemSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentSchema>;
