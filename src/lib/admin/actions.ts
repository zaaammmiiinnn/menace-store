'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin, requireStaff, logAuditAction } from './auth';
import { getLocalStore } from '@/lib/db';
import { productSchema, discountCodeSchema, storeSettingsSchema } from '@/lib/validation/admin';

// --- PRODUCTS ---
export async function createProductAction(data: any) {
  await requireAdmin();
  const parsed = productSchema.parse(data);
  const store = getLocalStore();

  const id = `prod_${Date.now()}`;
  const now = Date.now();

  const newProduct = {
    id,
    slug: parsed.slug,
    name: parsed.name,
    description: parsed.description,
    price_inr: parsed.priceInr,
    price_usd: parsed.priceUsd,
    category: parsed.category,
    drop_id: parsed.dropId || 'drop_001',
    status: parsed.status,
    created_at: now,
    updated_at: now,
  };

  store.getTable('products').unshift(newProduct);

  // Add variants
  parsed.variants.forEach((v, index) => {
    store.getTable('product_variants').push({
      id: `var_${id}_${index}`,
      product_id: id,
      size: v.size,
      color: v.color,
      sku: v.sku,
      stock: v.stock,
      price_override: v.priceOverride || null,
      image_url: v.imageUrl || null,
    });
  });

  // Add images
  parsed.images.forEach((url, index) => {
    store.getTable('product_images').push({
      id: `img_${id}_${index}`,
      product_id: id,
      url,
      alt: `${parsed.name} Image ${index + 1}`,
      sort_order: index,
    });
  });

  await logAuditAction({
    action: 'CREATE_PRODUCT',
    entity: 'products',
    entityId: id,
    details: `Created product "${parsed.name}" (${parsed.slug}) with ${parsed.variants.length} variants.`,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/products');
  revalidatePath('/shop');

  return { success: true, id };
}

export async function updateProductAction(id: string, data: any) {
  await requireAdmin();
  const parsed = productSchema.parse(data);
  const store = getLocalStore();
  const products = store.getTable('products');
  const index = products.findIndex((p: any) => p.id === id);

  if (index === -1) {
    throw new Error('Product not found.');
  }

  products[index] = {
    ...products[index],
    slug: parsed.slug,
    name: parsed.name,
    description: parsed.description,
    price_inr: parsed.priceInr,
    price_usd: parsed.priceUsd,
    category: parsed.category,
    drop_id: parsed.dropId || 'drop_001',
    status: parsed.status,
    updated_at: Date.now(),
  };

  // Replace variants
  const variantsTable = store.getTable('product_variants');
  const filteredVariants = variantsTable.filter((v: any) => v.product_id !== id);
  parsed.variants.forEach((v, idx) => {
    filteredVariants.push({
      id: v.id || `var_${id}_${idx}`,
      product_id: id,
      size: v.size,
      color: v.color,
      sku: v.sku,
      stock: v.stock,
      price_override: v.priceOverride || null,
      image_url: v.imageUrl || null,
    });
  });
  store.getTable('product_variants').length = 0;
  store.getTable('product_variants').push(...filteredVariants);

  await logAuditAction({
    action: 'UPDATE_PRODUCT',
    entity: 'products',
    entityId: id,
    details: `Updated product "${parsed.name}".`,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}`);
  revalidatePath('/shop');

  return { success: true };
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  const store = getLocalStore();
  const products = store.getTable('products');
  const prod = products.find((p: any) => p.id === id);

  if (!prod) {
    throw new Error('Product not found.');
  }

  const filtered = products.filter((p: any) => p.id !== id);
  products.length = 0;
  products.push(...filtered);

  await logAuditAction({
    action: 'DELETE_PRODUCT',
    entity: 'products',
    entityId: id,
    details: `Deleted product "${prod.name}" (${prod.slug}).`,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/products');
  revalidatePath('/shop');

  return { success: true };
}

// --- INVENTORY ---
export async function updateStockAction(variantId: string, change: number, reason: string) {
  await requireAdmin();
  const store = getLocalStore();
  const variants = store.getTable('product_variants');
  const variant = variants.find((v: any) => v.id === variantId);

  if (!variant) {
    throw new Error('Variant not found.');
  }

  const newStock = Math.max(0, (variant.stock || 0) + change);
  variant.stock = newStock;

  // Log inventory adjustment
  store.getTable('inventory_log').unshift({
    id: `inv_${Date.now()}`,
    variant_id: variantId,
    change,
    reason: reason || 'Manual stock edit',
    created_at: Date.now(),
  });

  await logAuditAction({
    action: 'UPDATE_STOCK',
    entity: 'product_variants',
    entityId: variantId,
    details: `Adjusted stock by ${change > 0 ? '+' : ''}${change} (${reason}). New count: ${newStock}.`,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/inventory');
  revalidatePath('/admin/products');

  return { success: true, newStock };
}

// --- ORDERS ---
export async function updateOrderStatusAction(
  orderId: string,
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled',
  trackingNumber?: string | null,
  notes?: string | null
) {
  // Staff are allowed to update fulfillment tracking & status
  await requireStaff();
  const store = getLocalStore();
  const orders = store.getTable('orders');
  const order = orders.find((o: any) => o.id === orderId);

  if (!order) {
    throw new Error('Order not found.');
  }

  order.status = status;
  if (trackingNumber !== undefined) order.tracking_number = trackingNumber;
  if (notes !== undefined) order.notes = notes;
  if (status === 'shipped' || status === 'delivered') {
    order.fulfilled_at = Date.now();
  }

  await logAuditAction({
    action: 'UPDATE_ORDER_STATUS',
    entity: 'orders',
    entityId: orderId,
    details: `Set status to "${status}". Tracking: ${trackingNumber || 'N/A'}.`,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);

  return { success: true };
}

// --- DISCOUNTS ---
export async function createDiscountAction(data: any) {
  await requireAdmin();
  const parsed = discountCodeSchema.parse(data);
  const store = getLocalStore();

  const id = `disc_${Date.now()}`;
  store.getTable('discount_codes').unshift({
    id,
    code: parsed.code.toUpperCase(),
    type: parsed.type,
    value: parsed.value,
    min_order: parsed.minOrder,
    max_uses: parsed.maxUses || null,
    uses: 0,
    expires_at: parsed.expiresAt ? new Date(parsed.expiresAt).getTime() : null,
    active: parsed.active ? 1 : 0,
  });

  await logAuditAction({
    action: 'CREATE_DISCOUNT',
    entity: 'discount_codes',
    entityId: id,
    details: `Created code "${parsed.code}" (${parsed.type}: ${parsed.value}).`,
  });

  revalidatePath('/admin/discounts');
  return { success: true, id };
}

export async function toggleDiscountAction(id: string, active: boolean) {
  await requireAdmin();
  const store = getLocalStore();
  const discounts = store.getTable('discount_codes');
  const code = discounts.find((d: any) => d.id === id);

  if (!code) throw new Error('Discount code not found.');
  code.active = active ? 1 : 0;

  await logAuditAction({
    action: 'TOGGLE_DISCOUNT',
    entity: 'discount_codes',
    entityId: id,
    details: `${active ? 'Activated' : 'Deactivated'} discount code "${code.code}".`,
  });

  revalidatePath('/admin/discounts');
  return { success: true };
}

export async function deleteDiscountAction(id: string) {
  await requireAdmin();
  const store = getLocalStore();
  const discounts = store.getTable('discount_codes');
  const filtered = discounts.filter((d: any) => d.id !== id);
  discounts.length = 0;
  discounts.push(...filtered);

  await logAuditAction({
    action: 'DELETE_DISCOUNT',
    entity: 'discount_codes',
    entityId: id,
    details: `Deleted discount code.`,
  });

  revalidatePath('/admin/discounts');
  return { success: true };
}

// --- SETTINGS ---
export async function updateStoreSettingsAction(data: any) {
  await requireAdmin();
  const parsed = storeSettingsSchema.parse(data);
  const store = getLocalStore();
  const settings = store.getTable('settings');

  const upsertSetting = (key: string, value: string) => {
    const existing = settings.find((s: any) => s.key === key);
    if (existing) {
      existing.value = value;
      existing.updated_at = Date.now();
    } else {
      settings.push({ key, value, updated_at: Date.now() });
    }
  };

  upsertSetting('store_name', parsed.storeName);
  upsertSetting('tagline', parsed.tagline);
  upsertSetting('primary_currency', parsed.primaryCurrency);
  upsertSetting('free_shipping_threshold', String(parsed.freeShippingThreshold));
  upsertSetting('standard_shipping_rate', String(parsed.standardShippingRate));
  upsertSetting('gst_percentage', String(parsed.gstPercentage));

  await logAuditAction({
    action: 'UPDATE_SETTINGS',
    entity: 'settings',
    details: `Updated store configuration. Free shipping threshold: ₹${parsed.freeShippingThreshold}.`,
  });

  revalidatePath('/admin/settings');
  return { success: true };
}

export async function inviteStaffAction(data: { name: string; email: string; role: 'staff' | 'admin' }) {
  await requireAdmin();
  const store = getLocalStore();
  const settings = store.getTable('settings');
  const existing = settings.find((s: any) => s.key === 'staff_roles');
  const list = existing ? JSON.parse(existing.value || '[]') : [];

  list.push({
    name: data.name,
    email: data.email.toLowerCase(),
    role: data.role,
    invitedAt: Date.now(),
  });

  if (existing) {
    existing.value = JSON.stringify(list);
    existing.updated_at = Date.now();
  } else {
    settings.push({ key: 'staff_roles', value: JSON.stringify(list), updated_at: Date.now() });
  }

  await logAuditAction({
    action: 'INVITE_STAFF',
    entity: 'staff_roles',
    details: `Assigned role "${data.role}" to ${data.email}.`,
  });

  revalidatePath('/admin/settings');
  return { success: true };
}

export async function revokeStaffAction(email: string) {
  await requireAdmin();
  const store = getLocalStore();
  const settings = store.getTable('settings');
  const existing = settings.find((s: any) => s.key === 'staff_roles');
  if (existing) {
    const list = JSON.parse(existing.value || '[]');
    const updated = list.filter((m: any) => m.email.toLowerCase() !== email.toLowerCase());
    existing.value = JSON.stringify(updated);
    existing.updated_at = Date.now();
  }

  await logAuditAction({
    action: 'REVOKE_STAFF',
    entity: 'staff_roles',
    details: `Revoked staff access for ${email}.`,
  });

  revalidatePath('/admin/settings');
  return { success: true };
}

// --- R2 PRESIGNED UPLOAD URL GENERATOR ---
export async function getR2UploadUrlAction(filename: string, filetype: string) {
  await requireAdmin();
  // Generate upload target URL (Cloudflare R2 compatible)
  const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `products/${Date.now()}-${cleanName}`;
  const bucket = process.env.R2_BUCKET_NAME || 'menace-assets';
  const publicDomain = process.env.R2_PUBLIC_DOMAIN || 'https://assets.menace.store';

  return {
    uploadUrl: `/api/admin/upload-mock?key=${encodeURIComponent(key)}`,
    publicUrl: `${publicDomain}/${key}`,
    key,
  };
}
