import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { orders, orderItems, discountCodes } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { CreateOrderSchema } from '@/lib/validation/checkout';
import { getRazorpay } from '@/lib/razorpay/client';
import { getPayUConfig, generatePayURequestHash } from '@/lib/payu/client';

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

    const { items, customer, shipping, clerkUserId, promoCode } = validationResult.data;

    // 1. Calculate financial breakdown
    const subtotalInr = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const shippingInr = subtotalInr >= 1499 ? 0 : 99;
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
    const orderNotes = customItems.length > 0
      ? `CUSTOM PRINT ORDER: ${customItems.map((c) => `${c.name} [Placement: ${c.customPlacement || 'front'}, Scale: ${c.customScale || 'medium'}]`).join(' | ')}`
      : null;

    try {
      await db.insert(orders).values({
        id: orderId,
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
      });


      // Insert associated line items
      for (const item of items) {
        const itemId = `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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
          imageUrl: item.imageUrl || null,
        });
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
    } catch (dbErr) {
      console.error('[create-order] D1 insert error:', dbErr);
    }

    // 4. Initialize PayU payment request
    const payUConfig = getPayUConfig();
    const baseUrl =
      req.headers.get('origin') ||
      (req.headers.get('host')
        ? `${req.headers.get('x-forwarded-proto') || 'https'}://${req.headers.get('host')}`
        : 'http://localhost:3000');

    const surl = `${baseUrl}/api/checkout/payu/response`;
    const furl = `${baseUrl}/api/checkout/payu/response`;
    const productinfo = `MENANCE Order ${orderId}`;
    const cleanFirstName =
      (customer.name.trim().split(' ')[0] || 'Customer').replace(/[^a-zA-Z]/g, '') || 'Customer';
    const cleanPhone = customer.phone.replace(/\D/g, '').slice(-10) || '9999999999';

    let payuData: { action: string; params: Record<string, string> } | null = null;
    if (payUConfig.key && payUConfig.salt) {
      try {
        const payuHash = await generatePayURequestHash(
          {
            txnid: orderId,
            amount: totalInr,
            productinfo,
            firstname: cleanFirstName,
            email: customer.email.trim(),
            phone: cleanPhone,
            surl,
            furl,
            udf1: orderId,
            udf2: customer.name.trim(),
            udf3: items.length.toString(),
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
            amount: totalInr.toFixed(2),
            productinfo,
            firstname: cleanFirstName,
            email: customer.email.trim(),
            phone: cleanPhone,
            surl,
            furl,
            hash: payuHash,
            udf1: orderId,
            udf2: customer.name.trim(),
            udf3: items.length.toString(),
            udf4: '',
            udf5: '',
            service_provider: 'payu_paisa',
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
