export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: {
    name: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
  }[];
  subtotalInr: number;
  shippingInr: number;
  totalInr: number;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };
  trackingNumber?: string;
}

/**
 * Template 1: Order confirmation — "Your MENANCE order is confirmed."
 */
export function getOrderConfirmationTemplate(data: OrderEmailData) {
  const itemsList = data.items
    .map(
      (item) =>
        `• ${item.name} (${item.color}, Size ${item.size}) x ${item.quantity} - ₹${(
          item.price * item.quantity
        ).toLocaleString('en-IN')}`
    )
    .join('\n');

  return {
    subject: `MENANCE // Order Confirmed [${data.orderId}]`,
    text: `
MENANCE® — NOT FOR EVERYONE.
----------------------------------------
ORDER CONFIRMED: #${data.orderId}
CUSTOMER: ${data.customerName}

YOUR SILHOUETTES:
${itemsList}

SUBTOTAL: ₹${data.subtotalInr.toLocaleString('en-IN')}
SHIPPING: ${data.shippingInr === 0 ? 'FREE EXPRESS' : `₹${data.shippingInr}`}
TOTAL CHARGED: ₹${data.totalInr.toLocaleString('en-IN')}

DISPATCH ADDRESS:
${data.customerName}
${data.shippingAddress.line1} ${data.shippingAddress.line2 || ''}
${data.shippingAddress.city}, ${data.shippingAddress.state} - ${data.shippingAddress.pincode}
${data.shippingAddress.country || 'India'}

TIMELINE:
Every order is inspected and dispatched in discrete brutalist packaging within 24 hours.
You will receive live tracking as soon as it departs our warehouse.

MIND YOUR BUSINESS. WEAR THIS.
menance.wear
`,
    html: `
<div style="background-color: #0A0A0A; color: #F5F1E8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; max-width: 600px; margin: 0 auto; border: 1px solid #262626;">
  <div style="border-bottom: 2px solid #C6FF00; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="color: #F5F1E8; margin: 0; font-size: 28px; letter-spacing: 2px;">MENANCE®</h1>
    <p style="color: #C6FF00; font-family: monospace; font-size: 11px; margin: 5px 0 0 0; text-transform: uppercase;">NOT FOR EVERYONE.</p>
  </div>

  <h2 style="font-size: 20px; text-transform: uppercase; margin-bottom: 10px;">YOUR ORDER IS CONFIRMED.</h2>
  <p style="color: #8A8A8A; font-size: 13px; line-height: 1.6; margin-bottom: 25px;">
    Order <strong>#${data.orderId}</strong> is locked in. We have initiated prep at our fulfillment center.
  </p>

  <div style="background-color: #141414; border: 1px solid #262626; padding: 20px; margin-bottom: 25px;">
    <h3 style="font-size: 11px; font-family: monospace; color: #8A8A8A; text-transform: uppercase; margin-top: 0;">ORDER SUMMARY</h3>
    <ul style="list-style: none; padding: 0; margin: 0 0 15px 0;">
      ${data.items
        .map(
          (item) => `
        <li style="border-bottom: 1px solid #202020; padding: 8px 0; font-size: 13px; display: flex; justify-content: space-between;">
          <span>${item.name} (${item.color} / ${item.size}) x${item.quantity}</span>
          <span style="font-family: monospace; font-weight: bold;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
        </li>`
        )
        .join('')}
    </ul>
    <div style="font-family: monospace; font-size: 13px; border-top: 1px solid #333; padding-top: 10px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #8A8A8A;">
        <span>Subtotal</span><span>₹${data.subtotalInr.toLocaleString('en-IN')}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #8A8A8A;">
        <span>Shipping</span><span>${data.shippingInr === 0 ? 'FREE EXPRESS' : `₹${data.shippingInr}`}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 16px; color: #C6FF00; font-weight: bold; padding-top: 6px; border-top: 1px dashed #333;">
        <span>Total Paid</span><span>₹${data.totalInr.toLocaleString('en-IN')}</span>
      </div>
    </div>
  </div>

  <div style="border-top: 1px solid #262626; padding-top: 20px; font-size: 11px; font-family: monospace; color: #8A8A8A;">
    <p>Dispatched to: ${data.shippingAddress.line1}, ${data.shippingAddress.city}, ${data.shippingAddress.state} - ${data.shippingAddress.pincode}</p>
    <p style="color: #666; margin-top: 20px;">Questions? DM us @menance.wear or reply directly.</p>
  </div>
</div>
`,
  };
}

/**
 * Template 2: Shipping notification — "Your order just left the building."
 */
export function getShippingNotificationTemplate(data: OrderEmailData, trackingNumber: string) {
  return {
    subject: `MENANCE // Dispatched [${data.orderId}]`,
    text: `
MENANCE® — NOT FOR EVERYONE.
----------------------------------------
YOUR ORDER HAS LEFT THE BUILDING: #${data.orderId}
TRACKING AIRWAY BILL: ${trackingNumber}

Silhouettes are en route to:
${data.shippingAddress.line1}
${data.shippingAddress.city}, ${data.shippingAddress.state} - ${data.shippingAddress.pincode}

Estimated transit: 2-4 business days.
Prepare to wear.
`,
    html: `
<div style="background-color: #0A0A0A; color: #F5F1E8; font-family: sans-serif; padding: 40px 20px; max-width: 600px; margin: 0 auto; border: 1px solid #262626;">
  <h1 style="color: #F5F1E8; margin: 0; font-size: 24px;">MENANCE®</h1>
  <p style="color: #C6FF00; font-family: monospace; font-size: 12px; margin-top: 4px;">YOUR ORDER JUST LEFT THE BUILDING.</p>
  <p style="color: #8A8A8A; font-size: 14px; margin-top: 20px;">
    Airway Bill Tracking: <strong style="color: #C6FF00; font-family: monospace;">${trackingNumber}</strong>
  </p>
</div>
`,
  };
}

/**
 * Stub function to send order confirmation / shipping notifications.
 * Currently logs to console; can be wired to Resend/Klaviyo without breaking logic.
 */
export async function sendOrderEmail({
  to,
  type,
  data,
  trackingNumber,
}: {
  to: string;
  type: 'confirmation' | 'shipping';
  data: OrderEmailData;
  trackingNumber?: string;
}): Promise<boolean> {
  try {
    const template =
      type === 'confirmation'
        ? getOrderConfirmationTemplate(data)
        : getShippingNotificationTemplate(data, trackingNumber || 'TRK-MNC-EXPRESS');

    console.log(`[EMAIL DISPATCH STUB] Sending ${type.toUpperCase()} to: ${to}`);
    console.log(`[EMAIL DISPATCH STUB] Subject: ${template.subject}`);
    console.log(`[EMAIL DISPATCH STUB] Order Total: ₹${data.totalInr}`);

    // When ready to wire Resend:
    // await resend.emails.send({ from: 'orders@menance.wear', to, subject: template.subject, html: template.html });

    return true;
  } catch (err) {
    console.error('[EMAIL DISPATCH STUB] Failed to dispatch email stub:', err);
    return false;
  }
}
