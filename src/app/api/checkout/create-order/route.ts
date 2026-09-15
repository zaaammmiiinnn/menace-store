import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { CreateOrderSchema } from '@/lib/validation/checkout';
import { getRazorpay } from '@/lib/razorpay/client';

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

    const { items, customer, shipping, clerkUserId } = validationResult.data;

    // 1. Calculate financial breakdown
    const subtotalInr = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const shippingInr = subtotalInr >= 1499 ? 0 : 99;
    const discountInr = 0;
    const totalInr = subtotalInr + shippingInr - discountInr;
    const totalPaise = Math.round(totalInr * 100);

    // 2. Generate unique order ID
    const orderId = `MNC-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;
    const nowTimestamp = Date.now();

    const db = getDb();

    // 3. Create pending order in D1
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
    } catch (dbErr) {
      console.error('[create-order] D1 insert error:', dbErr);
    }

    // 4. Initialize Razorpay order
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
