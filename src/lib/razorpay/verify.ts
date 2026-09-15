/**
 * Verifies Razorpay payment signature using Web Crypto API (crypto.subtle).
 * Standardized for Cloudflare Workers / Edge Runtime where Node.js crypto module is unavailable.
 */
export async function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
  secret,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret: string;
}): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${orderId}|${paymentId}`);
    const keyData = encoder.encode(secret);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, data);
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const generatedSignature = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    return generatedSignature.toLowerCase() === signature.toLowerCase();
  } catch (err) {
    console.error('[Razorpay verifyPaymentSignature] Verification failed:', err);
    return false;
  }
}

/**
 * Verifies Razorpay webhook signature using Web Crypto API.
 */
export async function verifyWebhookSignature({
  rawBody,
  signature,
  secret,
}: {
  rawBody: string;
  signature: string;
  secret: string;
}): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(rawBody);
    const keyData = encoder.encode(secret);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, data);
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const generatedSignature = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    return generatedSignature.toLowerCase() === signature.toLowerCase();
  } catch (err) {
    console.error('[Razorpay verifyWebhookSignature] Webhook verification failed:', err);
    return false;
  }
}
