import { NextRequest, NextResponse } from 'next/server';
import { getLocalStore } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer,
      shippingAddress,
      items,
      paymentMethod,
      paymentDetails,
      promoCode,
      discountAmount = 0,
      shippingFee = 0,
      subtotal = 0,
      total = 0,
      notes,
    } = body;

    // 1. Basic validation
    if (!customer?.email || !customer?.phone || !customer?.firstName) {
      return NextResponse.json(
        { success: false, error: 'Customer contact information is required' },
        { status: 400 }
      );
    }

    if (!shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.pincode) {
      return NextResponse.json(
        { success: false, error: 'Shipping delivery address is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart has no items to checkout' },
        { status: 400 }
      );
    }

    const orderId = `MNC-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = Date.now();
    const fullName = `${customer.firstName} ${customer.lastName || ''}`.trim();
    const fullAddress = `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}, India`;

    const store = getLocalStore();
    const customers = store.getTable('customers');
    const orders = store.getTable('orders');
    const orderItems = store.getTable('order_items');
    const variants = store.getTable('product_variants');
    const auditLog = store.getTable('audit_log');

    // 2. Customer Record
    let customerId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const existingCust = customers.find(
      (c: any) => c.email && c.email.toLowerCase() === customer.email.toLowerCase()
    );

    if (existingCust) {
      customerId = existingCust.id;
      existingCust.total_spent = (existingCust.total_spent || 0) + total;
      existingCust.name = fullName || existingCust.name;
    } else {
      customers.push({
        id: customerId,
        clerk_user_id: customer.clerkUserId || null,
        email: customer.email,
        name: fullName,
        created_at: now,
        total_spent: total,
      });
    }

    // 3. Status resolution
    let orderStatus: 'pending' | 'paid' | 'shipped' | 'delivered' = 'pending';
    if (paymentMethod === 'card' && paymentDetails?.razorpayPaymentId) {
      orderStatus = 'paid';
    } else if (paymentMethod === 'upi' && paymentDetails?.utr) {
      orderStatus = 'paid';
    }

    const orderRecord = {
      id: orderId,
      customer_id: customerId,
      status: orderStatus,
      total_inr: total,
      shipping_address: fullAddress,
      tracking_number: null,
      notes: notes || `Payment: ${paymentMethod?.toUpperCase()} | Promo: ${promoCode || 'NONE'} | Phone: ${customer.phone}`,
      created_at: now,
      fulfilled_at: null,
    };

    orders.unshift(orderRecord);

    // 4. Record Items and Decrement Inventory
    const savedItems: any[] = [];
    for (const item of items) {
      const lineItem = {
        id: `item_${orderId}_${savedItems.length + 1}`,
        order_id: orderId,
        variant_id: item.variantId || item.id || `var_${item.productId}_${item.size}`,
        product_name: item.product?.name || item.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price_at_purchase: item.product?.price || item.price,
      };

      orderItems.push(lineItem);
      savedItems.push(lineItem);

      // Decrement inventory stock
      const matchedVariant = variants.find(
        (v: any) =>
          (item.variantId && v.id === item.variantId) ||
          (v.product_id === item.productId && v.size === item.size && v.color?.toLowerCase() === item.color?.toLowerCase()) ||
          (v.size === item.size && v.color?.toLowerCase() === item.color?.toLowerCase())
      );

      if (matchedVariant) {
        matchedVariant.stock = Math.max(0, (matchedVariant.stock || 0) - item.quantity);
      }
    }

    // 5. Audit Log
    auditLog.unshift({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: customerId,
      user_email: customer.email,
      action: 'ORDER_PLACED',
      entity: 'orders',
      entity_id: orderId,
      details: `New order ${orderId} placed for ₹${total} via ${paymentMethod} (${items.length} items)`,
      created_at: now,
    });

    // 6. Live Sync with MENANCE Operations Console (Admin Portal)
    const syncPayload = {
      order: {
        id: orderId,
        customerId,
        status: orderStatus,
        totalInr: total,
        shippingAddress: fullAddress,
        paymentMethod,
        notes: orderRecord.notes,
        createdAt: now,
      },
      items: savedItems,
      customer: {
        id: customerId,
        name: fullName,
        email: customer.email,
        phone: customer.phone,
      },
    };

    // Non-blocking fire-and-forget sync to live admin deployment
    try {
      const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://menace-admin.vercel.app';
      fetch(`${adminUrl}/api/orders/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(syncPayload),
      }).catch((syncErr) => {
        console.warn('[Sync to Admin] Remote sync logged for deferred batch:', syncErr.message);
      });
    } catch (e) {
      // ignore non-critical network error on background sync
    }

    return NextResponse.json({
      success: true,
      orderId,
      status: orderStatus,
      total,
      currency: 'INR',
      customer: {
        name: fullName,
        email: customer.email,
      },
      message: 'Order placed and locked in successfully',
    });
  } catch (error: any) {
    console.error('[API /api/checkout] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Checkout processing failed' },
      { status: 500 }
    );
  }
}
