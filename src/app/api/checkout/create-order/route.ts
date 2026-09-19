import { NextRequest, NextResponse } from 'next/server';
import { getDb, getD1Database } from '@/lib/db';
import { orders, orderItems, discountCodes } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { CreateOrderSchema } from '@/lib/validation/checkout';
import { getRazorpay } from '@/lib/razorpay/client';
import { getPayUConfig, generatePayURequestHash } from '@/lib/payu/client';
import { getStoreSettings } from '@/lib/admin/queries';

// In-memory rate limiting tracker (max 5 order creations per minute per IP)
const ipRequestMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = ipRequestMap.get(ip);

  if (!record || now > record.resetAt) {
    ipRequestMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  if (record.count >= 5) {
    return true;
  }

  record.count += 1;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-forwarded-for') ||
      'unknown-ip';

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Too many order requests. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validationResult = CreateOrderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { items, customer, shipping, paymentMethod = 'prepaid', clerkUserId, promoCode } = validationResult.data;

    // 1. Calculate financial breakdown
    const subtotalInr = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    let storeSettings = { shippingType: 'free', standardShippingRate: 0, freeShippingThreshold: 1499 };
    try {
      storeSettings = await getStoreSettings();
    } catch (sErr) {
      console.warn('[create-order] getStoreSettings fallback:', sErr);
    }

    const isFreeShipping = storeSettings.shippingType === 'free' || storeSettings.standardShippingRate === 0;
    const shippingInr = isFreeShipping ? 0 : (subtotalInr >= storeSettings.freeShippingThreshold ? 0 : storeSettings.standardShippingRate);
    let discountInr = 0;
    let appliedPromoId: string | null = null;

    const db = getDb();

    // Verify & apply promo code from Cloudflare D1
    if (promoCode) {
      try {
        const cleanCode = promoCode.trim().toUpperCase();
        const promoRows = await db
          .select()
          .from(discountCodes)
          .where(eq(discountCodes.code, cleanCode));

        if (promoRows && promoRows.length > 0) {
          const promo = promoRows[0];
          const isUsable =
            Boolean(promo.active) &&
            (!promo.expiresAt || promo.expiresAt > Date.now()) &&
            (!promo.maxUses || (promo.uses || 0) < promo.maxUses) &&
            (!promo.minOrder || subtotalInr >= promo.minOrder);

          if (isUsable) {
            appliedPromoId = promo.id;
            if (promo.type === 'percentage') {
              discountInr = Math.round((subtotalInr * promo.value) / 100);
            } else {
              discountInr = Math.min(subtotalInr, promo.value);
            }
          }
        }
      } catch (pErr) {
        console.warn('[create-order] Promo lookup error:', pErr);
      }
    }

    const totalInr = Math.max(0, subtotalInr + shippingInr - discountInr);
    const totalPaise = Math.round(totalInr * 100);

    // 2. Generate unique order ID
    const orderId = `MNC-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;
    const nowTimestamp = Date.now();

    // 3. Create pending order in D1
    const customItems = items.filter((i) => i.edition === 'custom' || i.customArtworkUrl);
    let orderNotes = `Payment: ${paymentMethod === 'cod' ? 'CASH ON DELIVERY (COD)' : 'ONLINE PREPAID'} | Promo: ${promoCode || 'NONE'} | Phone: ${customer.phone.trim()}`;
    if (customItems.length > 0) {
      orderNotes = `CUSTOM PRINT ORDER: ${customItems.map((c) => `${c.name} [Placement: ${c.customPlacement || 'front'}, Scale: ${c.customScale || 'medium'}]`).join(' | ')} | ${orderNotes}`;
    }

    let customerId = `cust_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    // A. Native Cloudflare D1 insertion
    const d1 = getD1Database();
    if (d1) {
      try {
        const cleanEmail = customer.email.trim().toLowerCase();
        const existingCust = await d1
          .prepare('SELECT id FROM customers WHERE email = ?')
          .bind(cleanEmail)
          .first();

        if (existingCust?.id) {
          customerId = existingCust.id as string;
        } else {
          await d1
            .prepare(
              'INSERT INTO customers (id, clerk_user_id, email, name, created_at, total_spent) VALUES (?, ?, ?, ?, ?, ?)'
            )
            .bind(
              customerId,
              clerkUserId || null,
              cleanEmail,
              customer.name.trim(),
              nowTimestamp,
              0
            )
            .run();
        }

        await d1
          .prepare(
            `INSERT INTO orders (
              id, customer_id, customer_name, customer_email, customer_phone,
              shipping_address, subtotal_inr, shipping_inr, discount_inr, total_inr,
              status, created_at, notes, clerk_user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            orderId,
            customerId,
            customer.name.trim(),
            cleanEmail,
            customer.phone.trim(),
            JSON.stringify(shipping),
            subtotalInr,
            shippingInr,
            discountInr,
            totalInr,
            'pending',
            nowTimestamp,
            orderNotes,
            clerkUserId || null
          )
          .run();

        for (const item of items) {
          const itemId = `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          const itemEdition = item.edition || (item.customArtworkUrl ? 'custom' : 'archive');
          await d1
            .prepare(
              `INSERT INTO order_items (
                id, order_id, product_id, variant_id, product_name,
                size, color, quantity, price_inr, price_at_purchase, image_url,
                custom_artwork_url, custom_placement, custom_scale, custom_quote_text, edition
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            )
            .bind(
              itemId,
              orderId,
              item.productId,
              item.variantId || null,
              item.name,
              item.size,
              item.color,
              item.quantity,
              item.price,
              item.price,
              item.imageUrl || null,
              item.customArtworkUrl || null,
              item.customPlacement || null,
              item.customScale || null,
              item.customQuoteText || null,
              itemEdition
            )
            .run();
        }
      } catch (d1Err) {
        console.error('[create-order] Native D1 insert error:', d1Err);
      }
    }

    // B. Drizzle fallback insertion
    try {
      await db.insert(orders).values({
        id: orderId,
        customerId,
        razorpayOrderId: null,
        razorpayPaymentId: null,
        clerkUserId: clerkUserId || null,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingAddress: JSON.stringify(shipping),
        subtotalInr,
        shippingInr,
        discountInr,
        totalInr,
        status: 'pending',
        createdAt: nowTimestamp,
        paidAt: null,
        notes: orderNotes,
      }).catch(() => {});

      // Insert associated line items
      for (const item of items) {
        const itemId = `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const itemEdition = item.edition || (item.customArtworkUrl ? 'custom' : 'archive');
        await db.insert(orderItems).values({
          id: itemId,
          orderId,
          productId: item.productId,
          variantId: item.variantId || null,
          productName: item.name,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          priceInr: item.price,
          priceAtPurchase: item.price,
          imageUrl: item.imageUrl || null,
          customArtworkUrl: item.customArtworkUrl || null,
          customPlacement: item.customPlacement || null,
          customScale: item.customScale || null,
          customQuoteText: item.customQuoteText || null,
          edition: itemEdition,
        }).catch(() => {});
      }

      // Increment promo code usage if applied
      if (appliedPromoId) {
        try {
          await db
            .update(discountCodes)
            .set({ uses: sql`${discountCodes.uses} + 1` })
            .where(eq(discountCodes.id, appliedPromoId));
        } catch (incErr) {
          console.warn('[create-order] Failed to increment promo usage:', incErr);
        }
      }

      // Sync to in-memory local fallback store
      try {
        const { getLocalStore } = await import('@/lib/db');
        const store = getLocalStore();
        const ordersTable = store.getTable('orders');
        const itemsTable = store.getTable('order_items');
        const existingIdx = ordersTable.findIndex((o: any) => o.id === orderId);
        const orderRecord = {
          id: orderId,
          customer_id: customerId,
          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone,
          shipping_address: JSON.stringify(shipping),
          subtotal_inr: subtotalInr,
          shipping_inr: shippingInr,
          discount_inr: discountInr,
          total_inr: totalInr,
          status: 'pending',
          created_at: nowTimestamp,
          notes: orderNotes,
          clerk_user_id: clerkUserId || null,
        };
        if (existingIdx >= 0) {
          ordersTable[existingIdx] = { ...ordersTable[existingIdx], ...orderRecord };
        } else {
          ordersTable.unshift(orderRecord);
        }

        for (const item of items) {
          const itemId = `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          const itemEdition = item.edition || (item.customArtworkUrl ? 'custom' : 'archive');
          itemsTable.push({
            id: itemId,
            order_id: orderId,
            product_id: item.productId,
            variant_id: item.variantId || null,
            product_name: item.name,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price_inr: item.price,
            price_at_purchase: item.price,
            image_url: item.imageUrl || null,
            custom_artwork_url: item.customArtworkUrl || null,
            custom_placement: item.customPlacement || null,
            custom_scale: item.customScale || null,
            custom_quote_text: item.customQuoteText || null,
            edition: itemEdition,
          });
        }
      } catch (localErr) {
        console.warn('[create-order] Local fallback sync note:', localErr);
      }
    } catch (dbErr) {
      console.error('[create-order] D1 insert error:', dbErr);
    }

    // 4. Sync order to Admin Panel in background
    try {
      const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://menace-admin.vercel.app';
      fetch(`${adminUrl}/api/orders/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: {
            id: orderId,
            customerId,
            status: 'pending',
            totalInr,
            shippingAddress: typeof shipping === 'string' ? shipping : JSON.stringify(shipping),
            paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online (PayU)',
            notes: orderNotes,
            createdAt: nowTimestamp,
          },
          items: items.map((i) => ({
            ...i,
            priceInr: i.price,
            price_at_purchase: i.price,
            customArtworkUrl: i.customArtworkUrl || null,
            custom_artwork_url: i.customArtworkUrl || null,
            customPlacement: i.customPlacement || null,
            custom_placement: i.customPlacement || null,
            customScale: i.customScale || null,
            custom_scale: i.customScale || null,
            customQuoteText: i.customQuoteText || null,
            custom_quote_text: i.customQuoteText || null,
            edition: i.edition || (i.customArtworkUrl ? 'custom' : 'archive'),
          })),
          customer: {
            id: customerId,
            name: customer.name.trim(),
            email: customer.email.trim().toLowerCase(),
            phone: customer.phone.trim(),
          },
        }),
      }).catch((syncErr) => {
        console.warn('[create-order] Admin sync logged note:', syncErr?.message);
      });
    } catch (e) {
      // ignore background sync error
    }

    if (paymentMethod === 'cod') {
      return NextResponse.json({
        success: true,
        orderId,
        gateway: 'cod',
        paymentMethod: 'cod',
        amount: totalPaise,
        totalInr,
        currency: 'INR',
      });
    }

    // 5. Initialize PayU payment request (for online prepaid orders)
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const origin = req.headers.get('origin');
    const baseUrl =
      (origin && !origin.includes('payu.in') && !origin.includes('payu.com'))
        ? origin
        : (host && !host.includes('payu.in') && !host.includes('payu.com')
            ? `${proto}://${host}`
            : process.env.NEXT_PUBLIC_APP_URL || 'https://wearmenance.in');

    const surl = `${baseUrl}/api/checkout/payu/response`;
    const furl = `${baseUrl}/api/checkout/payu/response`;
    // Clean productinfo without spaces or special characters (standard PayU best practice)
    const cleanOrderId = orderId.replace(/[^a-zA-Z0-9_-]/g, '');
    const productinfo = `MENANCE_${cleanOrderId}`;
    const cleanFirstName =
      (customer.name.trim().split(' ')[0] || 'Customer').replace(/[^a-zA-Z]/g, '') || 'Customer';
    const cleanPhone = customer.phone.replace(/\D/g, '').slice(-10) || '9999999999';
    const cleanEmail = customer.email.trim().toLowerCase();
    const formattedAmount = totalInr.toFixed(2);

    let payuData: { action: string; params: Record<string, string> } | null = null;
    const payUConfig = getPayUConfig();
    if (payUConfig.key && payUConfig.salt) {
      try {
        const payuHash = await generatePayURequestHash(
          {
            txnid: orderId,
            amount: formattedAmount,
            productinfo,
            firstname: cleanFirstName,
            email: cleanEmail,
            phone: cleanPhone,
            surl,
            furl,
            udf1: '',
            udf2: '',
            udf3: '',
            udf4: '',
            udf5: '',
          },
          payUConfig.salt,
          payUConfig.key
        );

        payuData = {
          action: payUConfig.paymentUrl,
          params: {
            key: payUConfig.key,
            txnid: orderId,
            amount: formattedAmount,
            productinfo,
            firstname: cleanFirstName,
            email: cleanEmail,
            phone: cleanPhone,
            surl,
            furl,
            hash: payuHash,
          },
        };
      } catch (payuErr) {
        console.error('[create-order] PayU hash generation error:', payuErr);
      }
    }

    // 5. Initialize Razorpay order (fallback / backward compatibility)
    let razorpayOrderId = `order_${Date.now()}_sim`;
    try {
      const razorpay = getRazorpay();
      const rzpOrder = await razorpay.orders.create({
        amount: totalPaise,
        currency: 'INR',
        receipt: orderId,
        notes: {
          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone,
          promo_code: promoCode || 'NONE',
          discount_inr: discountInr.toString(),
        },
      });

      if (rzpOrder?.id) {
        razorpayOrderId = rzpOrder.id;

        // Update D1 order with razorpayOrderId
        try {
          await db
            .update(orders)
            .set({ razorpayOrderId })
            .where(eq(orders.id, orderId));
        } catch (updateErr) {
          console.warn('[create-order] Failed to update razorpayOrderId:', updateErr);
        }
      }
    } catch (rzpErr) {
      console.warn(
        '[create-order] Razorpay API call failed or in sandbox placeholder mode:',
        rzpErr
      );
    }

    return NextResponse.json({
      orderId,
      gateway: payuData ? 'payu' : 'razorpay',
      payu: payuData,
      razorpayOrderId,
      amount: totalPaise,
      currency: 'INR',
    });

  } catch (err: any) {
    console.error('[create-order] Unhandled error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error creating order' },
      { status: 500 }
    );
  }
}
