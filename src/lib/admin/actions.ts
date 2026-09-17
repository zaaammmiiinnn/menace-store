'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin, requireStaff, logAuditAction } from './auth';
import { getLocalStore, getD1Database } from '@/lib/db';
import { productSchema, discountCodeSchema, storeSettingsSchema } from '@/lib/validation/admin';
import { upsertDynamicProduct, deleteDynamicProduct } from '@/data/products';

// --- PRODUCTS ---
export async function createProductAction(data: any) {
  try {
    await requireAdmin();
    const parsed = productSchema.parse(data);
    const id = `prod_${Date.now()}`;
    const now = Date.now();

    const d1 = getD1Database();
    if (d1) {
      try {
        await d1.prepare(
          `INSERT INTO products (id, slug, name, description, price_inr, price_usd, category, drop_id, status, purchase_mode, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          id,
          parsed.slug,
          parsed.name,
          parsed.description || '',
          parsed.priceInr,
          parsed.priceUsd,
          parsed.category || 'tees',
          parsed.dropId || 'drop_001',
          parsed.status || 'active',
          parsed.purchaseMode || 'buy_now',
          now,
          now
        ).run();

        const variantsToInsert: any[] = (parsed.variants && parsed.variants.length > 0)
          ? parsed.variants
          : [
              { size: 'S', color: 'Black', sku: `MNC-${parsed.slug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'TEE'}-BLK-S`, stock: 25 },
              { size: 'M', color: 'Black', sku: `MNC-${parsed.slug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'TEE'}-BLK-M`, stock: 50 },
              { size: 'L', color: 'Black', sku: `MNC-${parsed.slug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'TEE'}-BLK-L`, stock: 40 },
              { size: 'XL', color: 'Black', sku: `MNC-${parsed.slug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'TEE'}-BLK-XL`, stock: 20 },
            ];

        for (let index = 0; index < variantsToInsert.length; index++) {
          const v = variantsToInsert[index];
          await d1.prepare(
            `INSERT INTO product_variants (id, product_id, size, color, sku, stock, price_override, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            v.id || `var_${id}_${index}`,
            id,
            v.size,
            v.color || 'Black',
            v.sku || `MNC-${parsed.slug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'TEE'}-BLK-${v.size}`,
            Number(v.stock) || 0,
            v.priceOverride ? Number(v.priceOverride) : null,
            v.imageUrl || null
          ).run();
        }

        const imagesToInsert = (parsed.images && parsed.images.length > 0)
          ? parsed.images
          : ['/products/the-classic-waffle-black/front.jpg'];

        for (let index = 0; index < imagesToInsert.length; index++) {
          const url = imagesToInsert[index];
          await d1.prepare(
            `INSERT INTO product_images (id, product_id, url, alt, sort_order)
             VALUES (?, ?, ?, ?, ?)`
          ).bind(
            `img_${id}_${index}`,
            id,
            url,
            `${parsed.name} Image ${index + 1}`,
            index
          ).run();
        }
      } catch (d1Err) {
        console.error('[D1 createProductAction Error]:', d1Err);
      }
    }

    const store = getLocalStore();
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

    (parsed.variants || []).forEach((v, index) => {
      store.getTable('product_variants').push({
        id: v.id || `var_${id}_${index}`,
        product_id: id,
        size: v.size,
        color: v.color || 'Black',
        sku: v.sku || `MNC-${parsed.slug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'TEE'}-BLK-${v.size}`,
        stock: Number(v.stock) || 0,
        price_override: v.priceOverride ? Number(v.priceOverride) : null,
        image_url: v.imageUrl || null,
      });
    });

    (parsed.images || []).forEach((url, index) => {
      store.getTable('product_images').push({
        id: `img_${id}_${index}`,
        product_id: id,
        url,
        alt: `${parsed.name} Image ${index + 1}`,
        sort_order: index,
      });
    });

    upsertDynamicProduct({
      id,
      slug: parsed.slug,
      name: parsed.name,
      description: parsed.description,
      price: parsed.priceInr,
      images: parsed.images,
      category: parsed.category,
      status: parsed.status,
    });

    await logAuditAction({
      action: 'CREATE_PRODUCT',
      entity: 'products',
      entityId: id,
      details: `Created product "${parsed.name}" (${parsed.slug}).`,
    });

    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath('/admin/inventory');
    revalidatePath(`/admin/products/${id}`);
    revalidatePath('/shop');
    revalidatePath(`/shop/${parsed.slug}`);

    return { success: true, id, slug: parsed.slug };
  } catch (err: any) {
    console.error('[createProductAction Fatal Error]:', err);
    return { success: false, error: err?.message || 'Failed to create product.' };
  }
}

export async function updateProductAction(id: string, data: any) {
  try {
    await requireAdmin();
    const parsed = productSchema.parse(data);
    const now = Date.now();

    const d1 = getD1Database();
    let targetId = id;
    if (d1) {
      try {
        // Resolve target product ID in D1 if id was slug or prod_xxx
        const existing = (await d1.prepare('SELECT id FROM products WHERE id = ? OR slug = ?').bind(id, id).first()) as any;
        if (existing?.id) {
          targetId = existing.id;
        }

        await d1.prepare(
          `UPDATE products SET slug = ?, name = ?, description = ?, price_inr = ?, price_usd = ?, category = ?, drop_id = ?, status = ?, purchase_mode = ?, updated_at = ?
           WHERE id = ? OR slug = ?`
        ).bind(
          parsed.slug,
          parsed.name,
          parsed.description || '',
          parsed.priceInr,
          parsed.priceUsd,
          parsed.category || 'tees',
          parsed.dropId || 'drop_001',
          parsed.status || 'active',
          parsed.purchaseMode || 'buy_now',
          now,
          targetId,
          targetId
        ).run();

        const variantsToSave: any[] = (parsed.variants && parsed.variants.length > 0)
          ? parsed.variants
          : [
              { size: 'S', color: 'Black', sku: `MNC-${parsed.slug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'TEE'}-BLK-S`, stock: 25 },
              { size: 'M', color: 'Black', sku: `MNC-${parsed.slug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'TEE'}-BLK-M`, stock: 50 },
              { size: 'L', color: 'Black', sku: `MNC-${parsed.slug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'TEE'}-BLK-L`, stock: 40 },
              { size: 'XL', color: 'Black', sku: `MNC-${parsed.slug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'TEE'}-BLK-XL`, stock: 20 },
            ];

        await d1.prepare('DELETE FROM product_variants WHERE product_id = ?').bind(targetId).run();
        for (let idx = 0; idx < variantsToSave.length; idx++) {
          const v = variantsToSave[idx];
          await d1.prepare(
            `INSERT INTO product_variants (id, product_id, size, color, sku, stock, price_override, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            v.id || `var_${targetId}_${idx}_${Date.now()}`,
            targetId,
            v.size,
            v.color || 'Black',
            v.sku || `MNC-${parsed.slug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'TEE'}-BLK-${v.size}`,
            Number(v.stock) || 0,
            v.priceOverride ? Number(v.priceOverride) : null,
            v.imageUrl || null
          ).run();
        }

        const imagesToSave = (parsed.images && parsed.images.length > 0)
          ? parsed.images
          : ['/products/the-classic-waffle-black/front.jpg'];

        await d1.prepare('DELETE FROM product_images WHERE product_id = ?').bind(targetId).run();
        for (let idx = 0; idx < imagesToSave.length; idx++) {
          const url = imagesToSave[idx];
          await d1.prepare(
            `INSERT INTO product_images (id, product_id, url, alt, sort_order)
             VALUES (?, ?, ?, ?, ?)`
          ).bind(
            `img_${targetId}_${idx}_${Date.now()}`,
            targetId,
            url,
            `${parsed.name} Image ${idx + 1}`,
            idx
          ).run();
        }
      } catch (d1Err) {
        console.error('[D1 updateProductAction Error]:', d1Err);
      }
    }

    const store = getLocalStore();
    const products = store.getTable('products');
    const index = products.findIndex((p: any) => p.id === id || p.id === targetId || p.slug === id);

    if (index !== -1) {
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
        updated_at: now,
      };
    }

    const variantsTable = store.getTable('product_variants');
    const filteredVariants = variantsTable.filter((v: any) => v.product_id !== id && v.product_id !== targetId);
    (parsed.variants || []).forEach((v, idx) => {
      filteredVariants.push({
        id: v.id || `var_${targetId}_${idx}`,
        product_id: targetId,
        size: v.size,
        color: v.color || 'Black',
        sku: v.sku || `MNC-${parsed.slug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'TEE'}-BLK-${v.size}`,
        stock: Number(v.stock) || 0,
        price_override: v.priceOverride ? Number(v.priceOverride) : null,
        image_url: v.imageUrl || null,
      });
    });
    store.getTable('product_variants').length = 0;
    store.getTable('product_variants').push(...filteredVariants);

    upsertDynamicProduct({
      id: targetId,
      slug: parsed.slug,
      name: parsed.name,
      description: parsed.description,
      price: parsed.priceInr,
      images: parsed.images,
      category: parsed.category,
      status: parsed.status,
    });

    await logAuditAction({
      action: 'UPDATE_PRODUCT',
      entity: 'products',
      entityId: targetId,
      details: `Updated product "${parsed.name}".`,
    });

    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath('/admin/inventory');
    revalidatePath(`/admin/products/${targetId}`);
    revalidatePath(`/admin/products/${parsed.slug}`);
    revalidatePath('/shop');
    revalidatePath(`/shop/${parsed.slug}`);

    return { success: true };
  } catch (err: any) {
    console.error('[updateProductAction Fatal Error]:', err);
    return { success: false, error: err?.message || 'Failed to update product.' };
  }
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  const d1 = getD1Database();
  if (d1) {
    try {
      await d1.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
      await d1.prepare('DELETE FROM product_variants WHERE product_id = ?').bind(id).run();
      await d1.prepare('DELETE FROM product_images WHERE product_id = ?').bind(id).run();
    } catch (d1Err) {
      console.error('[D1 deleteProductAction Error]:', d1Err);
    }
  }

  const store = getLocalStore();
  const products = store.getTable('products');
  const filtered = products.filter((p: any) => p.id !== id);
  products.length = 0;
  products.push(...filtered);

  deleteDynamicProduct(id);

  await logAuditAction({
    action: 'DELETE_PRODUCT',
    entity: 'products',
    entityId: id,
    details: `Deleted product ID "${id}".`,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/products');
  revalidatePath('/shop');

  return { success: true };
}

// --- INVENTORY ---
export async function updateStockAction(variantId: string, change: number, reason: string) {
  await requireAdmin();
  const d1 = getD1Database();
  let newStock = 0;

  if (d1) {
    try {
      const variant = await d1.prepare('SELECT stock FROM product_variants WHERE id = ?').bind(variantId).first();
      if (variant) {
        newStock = Math.max(0, (variant.stock || 0) + change);
        await d1.prepare('UPDATE product_variants SET stock = ? WHERE id = ?').bind(newStock, variantId).run();
        try {
          await d1.prepare(
            'INSERT INTO inventory_log (id, variant_id, change, reason, created_at) VALUES (?, ?, ?, ?, ?)'
          ).bind(`inv_${Date.now()}`, variantId, change, reason || 'Manual stock edit', Date.now()).run();
        } catch {}
      }
    } catch (d1Err) {
      console.error('[D1 updateStockAction Error]:', d1Err);
    }
  }

  const store = getLocalStore();
  const variants = store.getTable('product_variants');
  const variant = variants.find((v: any) => v.id === variantId);

  if (variant) {
    newStock = Math.max(0, (variant.stock || 0) + change);
    variant.stock = newStock;

    store.getTable('inventory_log').unshift({
      id: `inv_${Date.now()}`,
      variant_id: variantId,
      change,
      reason: reason || 'Manual stock edit',
      created_at: Date.now(),
    });
  }

  await logAuditAction({
    action: 'UPDATE_STOCK',
    entity: 'product_variants',
    entityId: variantId,
    details: `Adjusted stock by ${change > 0 ? '+' : ''}${change} (${reason}). New count: ${newStock}.`,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/inventory');
  revalidatePath('/admin/products');
  revalidatePath('/shop');

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

  const fulfilledAt = (status === 'shipped' || status === 'delivered') ? Date.now() : null;

  // Persist directly to Cloudflare D1
  const d1 = getD1Database();
  if (d1) {
    try {
      if (trackingNumber !== undefined && notes !== undefined) {
        await d1.prepare(
          `UPDATE orders
           SET status = ?,
               tracking_number = ?,
               notes = ?,
               fulfilled_at = COALESCE(?, fulfilled_at)
           WHERE id = ?`
        ).bind(status, trackingNumber, notes, fulfilledAt, orderId).run();
      } else if (trackingNumber !== undefined) {
        await d1.prepare(
          `UPDATE orders
           SET status = ?,
               tracking_number = ?,
               fulfilled_at = COALESCE(?, fulfilled_at)
           WHERE id = ?`
        ).bind(status, trackingNumber, fulfilledAt, orderId).run();
      } else if (notes !== undefined) {
        await d1.prepare(
          `UPDATE orders
           SET status = ?,
               notes = ?,
               fulfilled_at = COALESCE(?, fulfilled_at)
           WHERE id = ?`
        ).bind(status, notes, fulfilledAt, orderId).run();
      } else {
        await d1.prepare(
          `UPDATE orders
           SET status = ?,
               fulfilled_at = COALESCE(?, fulfilled_at)
           WHERE id = ?`
        ).bind(status, fulfilledAt, orderId).run();
      }
    } catch (d1Err) {
      console.error('[D1 updateOrderStatusAction Error]:', d1Err);
    }
  }

  // Also update in-memory fallback store if present
  const store = getLocalStore();
  const orders = store.getTable('orders');
  const order = orders.find((o: any) => o.id === orderId);

  if (order) {
    order.status = status;
    if (trackingNumber !== undefined) order.tracking_number = trackingNumber;
    if (notes !== undefined) order.notes = notes;
    if (fulfilledAt) order.fulfilled_at = fulfilledAt;
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
  const id = `disc_${Date.now()}`;
  const code = parsed.code.toUpperCase().trim();
  const expiresAt = parsed.expiresAt ? new Date(parsed.expiresAt).getTime() : null;
  const activeInt = parsed.active ? 1 : 0;

  const d1 = getD1Database();
  if (d1) {
    try {
      await d1.prepare(
        `INSERT INTO discount_codes (id, code, type, value, min_order, max_uses, uses, expires_at, active)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`
      ).bind(
        id,
        code,
        parsed.type,
        parsed.value,
        parsed.minOrder,
        parsed.maxUses || null,
        expiresAt,
        activeInt
      ).run();
    } catch (d1Err) {
      console.error('[createDiscountAction] D1 insert failed:', d1Err);
    }
  }

  const store = getLocalStore();
  const existingIndex = store.getTable('discount_codes').findIndex((d: any) => d.id === id || d.code === code);
  if (existingIndex > -1) {
    store.getTable('discount_codes').splice(existingIndex, 1);
  }
  store.getTable('discount_codes').unshift({
    id,
    code,
    type: parsed.type,
    value: parsed.value,
    min_order: parsed.minOrder,
    max_uses: parsed.maxUses || null,
    uses: 0,
    expires_at: expiresAt,
    active: activeInt,
  });

  await logAuditAction({
    action: 'CREATE_DISCOUNT',
    entity: 'discount_codes',
    entityId: id,
    details: `Created code "${code}" (${parsed.type}: ${parsed.value}).`,
  });

  revalidatePath('/admin/discounts');
  return { success: true, id };
}

export async function toggleDiscountAction(id: string, active: boolean) {
  await requireAdmin();
  const activeInt = active ? 1 : 0;
  let codeName = id;

  const d1 = getD1Database();
  if (d1) {
    try {
      const existing = await d1.prepare('SELECT code FROM discount_codes WHERE id = ?').bind(id).first();
      if (existing?.code) codeName = existing.code;
      await d1.prepare('UPDATE discount_codes SET active = ? WHERE id = ?').bind(activeInt, id).run();
    } catch (d1Err) {
      console.error('[toggleDiscountAction] D1 update failed:', d1Err);
    }
  }

  const store = getLocalStore();
  const discounts = store.getTable('discount_codes');
  const code = discounts.find((d: any) => d.id === id);

  if (code) {
    code.active = activeInt;
    codeName = code.code;
  }

  await logAuditAction({
    action: 'TOGGLE_DISCOUNT',
    entity: 'discount_codes',
    entityId: id,
    details: `${active ? 'Activated' : 'Deactivated'} discount code "${codeName}".`,
  });

  revalidatePath('/admin/discounts');
  return { success: true };
}

export async function deleteDiscountAction(id: string) {
  await requireAdmin();
  let codeName = id;

  const d1 = getD1Database();
  if (d1) {
    try {
      const existing = await d1.prepare('SELECT code FROM discount_codes WHERE id = ?').bind(id).first();
      if (existing?.code) codeName = existing.code;
      await d1.prepare('DELETE FROM discount_codes WHERE id = ?').bind(id).run();
    } catch (d1Err) {
      console.error('[deleteDiscountAction] D1 delete failed:', d1Err);
    }
  }

  const store = getLocalStore();
  const discounts = store.getTable('discount_codes');
  const found = discounts.find((d: any) => d.id === id);
  if (found?.code) codeName = found.code;
  const filtered = discounts.filter((d: any) => d.id !== id);
  discounts.length = 0;
  discounts.push(...filtered);

  await logAuditAction({
    action: 'DELETE_DISCOUNT',
    entity: 'discount_codes',
    entityId: id,
    details: `Deleted discount code "${codeName}".`,
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
  const bucket = process.env.R2_BUCKET_NAME || 'menance-assets';
  const publicDomain = process.env.R2_PUBLIC_DOMAIN || 'https://assets.menance.store';

  return {
    uploadUrl: `/api/admin/upload-mock?key=${encodeURIComponent(key)}`,
    publicUrl: `${publicDomain}/${key}`,
    key,
  };
}

// --- DROPS ---
export async function toggleDropStatusAction(dropId: string, status: 'live' | 'upcoming' | 'archived') {
  await requireAdmin();

  const d1 = getD1Database();
  if (d1) {
    try {
      await d1.prepare('UPDATE drops SET status = ? WHERE id = ?').bind(status, dropId).run();
    } catch (e) {
      console.error('[toggleDropStatusAction D1 Error]:', e);
    }
  }

  const store = getLocalStore();
  const drops = store.getTable('drops');
  const drop = drops.find((d: any) => d.id === dropId);
  if (drop) {
    drop.status = status;
  }

  await logAuditAction({
    action: 'UPDATE_DROP_STATUS',
    entity: 'drops',
    entityId: dropId,
    details: `Updated drop "${dropId}" status to ${status.toUpperCase()} (${status === 'live' ? 'Buy Now Enabled' : 'Cart Locked'}).`,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/drops');
  revalidatePath('/admin/products');
  revalidatePath('/drops');
  revalidatePath('/shop');
  revalidatePath('/shop/[slug]', 'page');
  revalidatePath('/');

  return { success: true, status };
}

export async function toggleProductPurchaseModeAction(id: string, purchaseMode: 'buy_now' | 'notify_only') {
  await requireAdmin();

  const d1 = getD1Database();
  if (d1) {
    try {
      await d1.prepare('UPDATE products SET purchase_mode = ? WHERE id = ? OR slug = ?')
        .bind(purchaseMode, id, id)
        .run();
    } catch (e) {
      console.error('[toggleProductPurchaseModeAction D1 Error]:', e);
    }
  }

  const store = getLocalStore();
  const productsTable = store.getTable('products');
  const prod = productsTable.find((p: any) => p.id === id || p.slug === id);
  if (prod) {
    prod.purchase_mode = purchaseMode;
  }

  await logAuditAction({
    action: 'UPDATE_PRODUCT_PURCHASE_MODE',
    entity: 'products',
    entityId: id,
    details: `Updated product "${id}" purchase mode to ${purchaseMode.toUpperCase()} (${purchaseMode === 'buy_now' ? 'Buy Now Enabled' : 'Notify Only'}).`,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}`);
  revalidatePath('/shop');
  revalidatePath('/shop/[slug]', 'page');
  revalidatePath('/');

  return { success: true, purchaseMode };
}
