import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getPayUConfig, verifyPayUResponseHash, type PayUCallbackPayload } from '@/lib/payu/client';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const payload: PayUCallbackPayload = {};

    if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      const formData = await req.formData();
      formData.forEach((val, key) => {
        payload[key] = typeof val === 'string' ? val : (val as File).name;
      });
    } else {
      try {
        const json = await req.json();
        Object.assign(payload, json);
      } catch {
        // Fallback to text urlencoded search params
        const rawBody = await req.text();
        const searchParams = new URLSearchParams(rawBody);
        searchParams.forEach((val, key) => {
          payload[key] = val;
        });
      }
    }

    console.log('[PayU Callback] Received response for txnid:', payload.txnid, 'status:', payload.status);

    const { salt } = getPayUConfig();
    const isSignatureValid = await verifyPayUResponseHash(payload, salt);

    const orderId = payload.txnid || payload.udf1 || '';
    const isSuccess = payload.status === 'success';

    const baseUrl =
      req.headers.get('origin') ||
      (req.headers.get('host')
        ? `${req.headers.get('x-forwarded-proto') || 'https'}://${req.headers.get('host')}`
        : 'http://localhost:3000');

    if (!isSignatureValid) {
      console.error('[PayU Callback] Signature mismatch / hash verification failed for order:', orderId);
      return NextResponse.redirect(
        new URL(
          `/checkout/failure?reason=${encodeURIComponent('Security hash mismatch. Payment cannot be verified.')}&order=${encodeURIComponent(orderId)}`,
          baseUrl
        ),
        303
      );
    }

    const db = getDb();

    if (isSuccess) {
      // Payment Successful
      try {
        if (orderId) {
          await db
            .update(orders)
            .set({
              status: 'paid',
              paidAt: Date.now(),
              razorpayPaymentId: payload.mihpayid || payload.payuMoneyId || null,
            })
            .where(eq(orders.id, orderId));
          console.log('[PayU Callback] Order successfully marked paid in D1:', orderId);
        }
      } catch (dbErr) {
        console.error('[PayU Callback] Error updating order status to paid:', dbErr);
      }

      return NextResponse.redirect(
        new URL(`/checkout/success?order=${encodeURIComponent(orderId)}`, baseUrl),
        303
      );
    } else {
      // Payment Failed / Cancelled
      const failureReason =
        payload.error_Message ||
        payload.errorMessage ||
        payload.error ||
        payload.unmappedstatus ||
        'Transaction declined or cancelled by customer.';

      try {
        if (orderId) {
          await db
            .update(orders)
            .set({
              status: 'failed',
            })
            .where(eq(orders.id, orderId));
          console.log('[PayU Callback] Order marked failed in D1:', orderId);
        }
      } catch (dbErr) {
        console.error('[PayU Callback] Error updating order status to failed:', dbErr);
      }

      return NextResponse.redirect(
        new URL(
          `/checkout/failure?reason=${encodeURIComponent(failureReason)}&order=${encodeURIComponent(orderId)}`,
          baseUrl
        ),
        303
      );
    }
  } catch (err: any) {
    console.error('[PayU Callback] Unhandled error in response handler:', err);
    const baseUrl =
      req.headers.get('origin') ||
      (req.headers.get('host')
        ? `${req.headers.get('x-forwarded-proto') || 'https'}://${req.headers.get('host')}`
        : 'http://localhost:3000');

    return NextResponse.redirect(
      new URL(
        `/checkout/failure?reason=${encodeURIComponent(err.message || 'Payment processing error')}`,
        baseUrl
      ),
      303
    );
  }
}

export async function GET(req: NextRequest) {
  // If user navigates via GET, redirect to checkout
  const baseUrl =
    req.headers.get('origin') ||
    (req.headers.get('host')
      ? `${req.headers.get('x-forwarded-proto') || 'https'}://${req.headers.get('host')}`
      : 'http://localhost:3000');
  return NextResponse.redirect(new URL('/checkout', baseUrl), 303);
}
