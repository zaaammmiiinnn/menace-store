import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyWebhookSignature } from '@/lib/razorpay/verify';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      console.warn('[webhook/razorpay] Missing signature header or RAZORPAY_WEBHOOK_SECRET');
      // Return 400 if secret is configured, or 200 in dev
      if (webhookSecret) {
        return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 });
      }
    } else {
      const isValid = await verifyWebhookSignature({
        rawBody,
        signature,
        secret: webhookSecret,
      });

      if (!isValid) {
        console.error('[webhook/razorpay] Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const refundEntity = payload.payload?.refund?.entity;

    const razorpayOrderId = paymentEntity?.order_id || refundEntity?.order_id;
    const razorpayPaymentId = paymentEntity?.id;

    if (!razorpayOrderId) {
      console.log(`[webhook/razorpay] Received event ${event} without order_id, skipping`);
      return NextResponse.json({ status: 'ignored', message: 'No associated order_id' });
    }

    const db = getDb();
    const now = Date.now();

    console.log(`[webhook/razorpay] Processing event: ${event} for order: ${razorpayOrderId}`);

    switch (event) {
      case 'payment.captured': {
        await db
          .update(orders)
          .set({
            status: 'paid',
            razorpayPaymentId: razorpayPaymentId || undefined,
            paidAt: now,
          })
          .where(eq(orders.razorpayOrderId, razorpayOrderId));
        break;
      }

      case 'payment.failed': {
        await db
          .update(orders)
          .set({
            status: 'failed',
            razorpayPaymentId: razorpayPaymentId || undefined,
          })
          .where(eq(orders.razorpayOrderId, razorpayOrderId));
        break;
      }

      case 'refund.created': {
        await db
          .update(orders)
          .set({
            status: 'refunded',
          })
          .where(eq(orders.razorpayOrderId, razorpayOrderId));
        break;
      }

      default:
        console.log(`[webhook/razorpay] Unhandled event type: ${event}`);
    }

    return NextResponse.json({ status: 'ok', event });
  } catch (err: any) {
    console.error('[webhook/razorpay] Webhook handler error:', err);
    return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
  }
}
