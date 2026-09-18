import { NextRequest, NextResponse } from 'next/server';
import { sendOrderEmail } from '@/lib/email/templates';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetEmail = (body.email || body.to || '').trim();

    if (!targetEmail || !targetEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Valid target email address is required in body ({ email: "..." })' },
        { status: 400 }
      );
    }

    const testOrderId = body.orderId || `test_${Date.now().toString().slice(-6)}`;
    const customerName = body.name || 'Zamin Askari';

    const sampleOrderData = {
      orderId: testOrderId,
      customerName,
      customerEmail: targetEmail,
      items: [
        {
          name: 'The Classic Waffle — Black',
          size: 'L',
          color: 'Black',
          quantity: 1,
          price: 1499,
        },
      ],
      subtotalInr: 1499,
      shippingInr: 0,
      totalInr: 1499,
      shippingAddress: {
        line1: 'B-12, Archway Tower, Bandra West',
        line2: 'Near Hill Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050',
        country: 'India',
      },
    };

    const result = await sendOrderEmail({
      to: targetEmail,
      type: 'confirmation',
      data: sampleOrderData,
    });

    return NextResponse.json({
      success: result.success,
      recipient: targetEmail,
      orderId: testOrderId,
      result,
      note: result.error
        ? `Result note: ${result.error}`
        : 'Order confirmation email successfully dispatched via Resend.',
    });
  } catch (err: any) {
    console.error('[test-email] Error in test email dispatch route:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
