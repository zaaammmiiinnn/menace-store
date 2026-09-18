import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getDb, getD1Database, getLocalStore } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';
import { eq, or, desc, inArray } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get('email')?.trim().toLowerCase() || null;
    const queryClerkId = searchParams.get('clerkUserId')?.trim() || null;

    let userEmail: string | null = queryEmail;
    let clerkUserId: string | null = queryClerkId;

    // Attempt to resolve user from Clerk server session if not provided via query
    if (!userEmail && !clerkUserId) {
      try {
        const user = await Promise.race([
          currentUser(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200)),
        ]);
        if (user) {
          userEmail = user.emailAddresses?.[0]?.emailAddress?.toLowerCase() || null;
          clerkUserId = user.id || null;
        }
      } catch (err) {
        console.warn('[Account Orders API] Clerk currentUser error/timeout:', err);
      }
    }

    if (!userEmail && !clerkUserId) {
      return NextResponse.json(
        { success: true, orders: [], message: 'No authenticated user or email identifier provided' },
        { status: 200 }
      );
    }

    const d1 = getD1Database();
    let orderRecords: any[] = [];
    let itemsRecords: any[] = [];

    // 1. Fetch orders from native Cloudflare D1
    if (d1) {
      try {
        let query = 'SELECT * FROM orders WHERE ';
        const params: any[] = [];

        if (userEmail && clerkUserId) {
          query += 'LOWER(customer_email) = LOWER(?) OR clerk_user_id = ? ';
          params.push(userEmail, clerkUserId);
        } else if (userEmail) {
          query += 'LOWER(customer_email) = LOWER(?) ';
          params.push(userEmail);
        } else if (clerkUserId) {
          query += 'clerk_user_id = ? ';
          params.push(clerkUserId);
        }

        query += 'ORDER BY created_at DESC LIMIT 50';

        const stmt = d1.prepare(query);
        const boundStmt = params.length === 2 ? stmt.bind(params[0], params[1]) : stmt.bind(params[0]);
        const result = await boundStmt.all();
        orderRecords = result?.results || [];

        if (orderRecords.length > 0) {
          const orderIds = orderRecords.map((o) => o.id);
          const placeholders = orderIds.map(() => '?').join(',');
          const itemsStmt = d1.prepare(`SELECT * FROM order_items WHERE order_id IN (${placeholders})`);
          const itemsResult = await itemsStmt.bind(...orderIds).all();
          itemsRecords = itemsResult?.results || [];
        }
      } catch (d1Err) {
        console.error('[Account Orders API] D1 query error:', d1Err);
      }
    }

    // 2. Fallback to Drizzle / Local store if D1 returned no orders
    if (orderRecords.length === 0) {
      try {
        const db = getDb();
        const conditions = [];
        if (userEmail) conditions.push(eq(orders.customerEmail, userEmail));
        if (clerkUserId) conditions.push(eq(orders.clerkUserId, clerkUserId));

        if (conditions.length > 0) {
          orderRecords = await db
            .select()
            .from(orders)
            .where(conditions.length === 1 ? conditions[0] : or(...conditions))
            .orderBy(desc(orders.createdAt))
            .limit(50);

          if (orderRecords.length > 0) {
            const orderIds = orderRecords.map((o) => o.id);
            itemsRecords = await db
              .select()
              .from(orderItems)
              .where(inArray(orderItems.orderId, orderIds));
          }
        }
      } catch (dbErr) {
        console.warn('[Account Orders API] Drizzle fallback query error:', dbErr);
      }
    }

    // 3. Fallback to in-memory store
    if (orderRecords.length === 0) {
      const store = getLocalStore();
      const allOrders = store.getTable('orders');
      const allItems = store.getTable('order_items');

      orderRecords = allOrders.filter((o: any) => {
        const emailMatch = userEmail && (o.customer_email || o.customerEmail)?.toLowerCase() === userEmail.toLowerCase();
        const idMatch = clerkUserId && (o.clerk_user_id || o.clerkUserId) === clerkUserId;
        return emailMatch || idMatch;
      });

      const orderIds = new Set(orderRecords.map((o: any) => o.id));
      itemsRecords = allItems.filter((i: any) => orderIds.has(i.order_id || i.orderId));
    }

    // Format and group orders with their line items
    const formattedOrders = orderRecords.map((o: any) => {
      const orderId = o.id;
      const matchingItems = itemsRecords.filter(
        (i: any) => (i.order_id || i.orderId) === orderId
      );

      const rawShipping = o.shipping_address || o.shippingAddress;
      let shippingAddress = { line1: '', city: '', state: '', pincode: '', country: 'India' };
      try {
        if (typeof rawShipping === 'string') {
          shippingAddress = JSON.parse(rawShipping);
        } else if (rawShipping && typeof rawShipping === 'object') {
          shippingAddress = rawShipping;
        }
      } catch {}

      const formattedItems = matchingItems.map((item: any) => ({
        id: item.id,
        productId: item.product_id || item.productId || '',
        name: item.product_name || item.productName || 'MENANCE Silhouette',
        size: item.size || 'M',
        color: item.color || 'Black',
        quantity: Number(item.quantity) || 1,
        price: Number(item.price_inr ?? item.priceInr ?? item.price_at_purchase ?? 0),
        image: item.image_url || item.imageUrl || '/images/products/quiet-menance-1.jpg',
        sku: item.sku || `MNC-${item.size || 'M'}-${item.color || 'BLK'}`,
        slug: (item.product_name || item.productName || 'quiet-menance')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'quiet-menance',
      }));

      const createdAtMs = Number(o.created_at || o.createdAt || Date.now());
      const dateFormatted = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric',
      }).format(new Date(createdAtMs)).toUpperCase();

      const trackingNumber = o.tracking_number || o.trackingNumber || null;
      const statusRaw = (o.status || 'pending').toUpperCase();

      return {
        id: orderId,
        date: dateFormatted,
        createdAt: createdAtMs,
        status: statusRaw,
        deliveredOn: (o.fulfilled_at || o.fulfilledAt) ? new Intl.DateTimeFormat('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).format(new Date(Number(o.fulfilled_at || o.fulfilledAt))).toUpperCase() : null,
        trackingNumber: trackingNumber || (statusRaw === 'SHIPPED' ? 'TRK-MNC-EXPRESS' : 'PROCESSING'),
        courier: trackingNumber ? 'Bluedart Express' : 'Express Logistics',
        total: Number(o.total_inr ?? o.totalInr ?? 0),
        subtotal: Number(o.subtotal_inr ?? o.subtotalInr ?? 0),
        shipping: Number(o.shipping_inr ?? o.shippingInr ?? 0) === 0 ? 'FREE' : `₹${o.shipping_inr ?? o.shippingInr}`,
        shippingAddress,
        paymentMethod: o.razorpay_payment_id || o.razorpayPaymentId ? 'Online Payment (Verified)' : 'PayU Express',
        items: formattedItems,
      };
    });

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error: any) {
    console.error('[Account Orders API] Fatal error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
