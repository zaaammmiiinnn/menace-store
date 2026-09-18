import { NextRequest, NextResponse } from 'next/server';
import { getDb, getD1Database } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getPayUConfig, verifyPayUResponseHash, type PayUCallbackPayload } from '@/lib/payu/client';
import { sendOrderEmail } from '@/lib/email/templates';

function getStoreBaseUrl(req: NextRequest): string {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  if (host && !host.includes('payu.in') && !host.includes('payu.com')) {
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://wearmenance.in';
}

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

    const baseUrl = getStoreBaseUrl(req);

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

    const d1 = getD1Database();
    const db = getDb();

    if (isSuccess) {
      // Payment Successful
      try {
        if (orderId) {
          if (d1) {
            await d1
              .prepare(
                'UPDATE orders SET status = ?, paid_at = ?, razorpay_payment_id = ? WHERE id = ?'
              )
              .bind('paid', Date.now(), payload.mihpayid || payload.payuMoneyId || null, orderId)
              .run()
              .catch((e: any) => console.error('[PayU Callback] D1 direct paid update error:', e));
          }

          await db
            .update(orders)
            .set({
              status: 'paid',
              paidAt: Date.now(),
              razorpayPaymentId: payload.mihpayid || payload.payuMoneyId || null,
            })
            .where(eq(orders.id, orderId))
            .catch(() => {});

          console.log('[PayU Callback] Order successfully marked paid in D1:', orderId);

          // Automated order confirmation email dispatch
          try {
            let orderData: any = null;
            let itemsList: any[] = [];

            if (d1) {
              orderData = await d1
                .prepare('SELECT * FROM orders WHERE id = ?')
                .bind(orderId)
                .first();
              itemsList =
                (
                  await d1
                    .prepare('SELECT * FROM order_items WHERE order_id = ?')
                    .bind(orderId)
                    .all()
                )?.results || [];
            } else {
              const rows = await db.select().from(orders).where(eq(orders.id, orderId));
              orderData = rows[0];
              itemsList = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
            }

            if (orderData) {
              const customerEmail = orderData.customer_email || orderData.customerEmail;
              const customerName = orderData.customer_name || orderData.customerName || 'Customer';
              const rawShipping = orderData.shipping_address || orderData.shippingAddress;
              let shippingAddress = { line1: '', city: '', state: '', pincode: '', country: 'India' };
              try {
                if (typeof rawShipping === 'string') {
                  shippingAddress = JSON.parse(rawShipping);
                } else if (rawShipping && typeof rawShipping === 'object') {
                  shippingAddress = rawShipping;
                }
              } catch {}

              const formattedItems = itemsList.map((item: any) => ({
                name: item.product_name || item.productName || 'MENANCE Silhouette',
                size: item.size || 'M',
                color: item.color || 'Black',
                quantity: Number(item.quantity) || 1,
                price: Number(item.price_inr || item.priceInr || 0),
              }));

              const subtotalInr = Number(orderData.subtotal_inr ?? orderData.subtotalInr ?? 0);
              const shippingInr = Number(orderData.shipping_inr ?? orderData.shippingInr ?? 0);
              const totalInr = Number(orderData.total_inr ?? orderData.totalInr ?? 0);

              await sendOrderEmail({
                to: customerEmail,
                type: 'confirmation',
                data: {
                  orderId,
                  customerName,
                  customerEmail,
                  items: formattedItems,
                  subtotalInr,
                  shippingInr,
                  totalInr,
                  shippingAddress,
                },
              });
              console.log('[PayU Callback] Dispatched order confirmation email for order:', orderId);
            }
          } catch (emailErr) {
            console.error('[PayU Callback] Failed to dispatch order confirmation email:', emailErr);
          }
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
          if (d1) {
            await d1
              .prepare('UPDATE orders SET status = ? WHERE id = ?')
              .bind('failed', orderId)
              .run()
              .catch((e: any) => console.error('[PayU Callback] D1 direct failed update error:', e));
          }

          await db
            .update(orders)
            .set({
              status: 'failed',
            })
            .where(eq(orders.id, orderId))
            .catch(() => {});

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
    const baseUrl = getStoreBaseUrl(req);

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
  const baseUrl = getStoreBaseUrl(req);
  return NextResponse.redirect(new URL('/checkout', baseUrl), 303);
}
