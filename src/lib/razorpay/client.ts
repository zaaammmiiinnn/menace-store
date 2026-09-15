/**
 * Edge-compatible Razorpay client implementation.
 * Uses native Web fetch API with HTTP Basic Authentication.
 * Eliminates Node.js 'crypto' dependencies to prevent Cloudflare 1102 / Webpack bundle errors.
 */

export interface RazorpayOrderParams {
  amount: number; // in paise
  currency: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export class RazorpayClient {
  private keyId: string;
  private keySecret: string;

  constructor(options: { key_id: string; key_secret: string }) {
    this.keyId = options.key_id;
    this.keySecret = options.key_secret;
  }

  orders = {
    create: async (params: RazorpayOrderParams): Promise<RazorpayOrderResponse> => {
      // In sandbox fallback if dummy placeholder key is present and cannot reach Razorpay
      if (!this.keyId || this.keyId === 'rzp_test_placeholder') {
        console.warn('[Razorpay] Using local sandbox simulated order response');
        return {
          id: `order_sim_${Date.now()}`,
          entity: 'order',
          amount: params.amount,
          amount_paid: 0,
          amount_due: params.amount,
          currency: params.currency || 'INR',
          receipt: params.receipt || `rec_${Date.now()}`,
          status: 'created',
          attempts: 0,
          notes: params.notes || {},
          created_at: Math.floor(Date.now() / 1000),
        };
      }

      const credentials = `${this.keyId}:${this.keySecret}`;
      const authHeader =
        typeof btoa !== 'undefined'
          ? btoa(credentials)
          : Buffer.from(credentials).toString('base64');

      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          amount: params.amount,
          currency: params.currency || 'INR',
          receipt: params.receipt,
          notes: params.notes,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Razorpay API Error [${response.status}]: ${errorText}`);
      }

      return await response.json();
    },
  };
}

let _razorpay: RazorpayClient | null = null;

/**
 * Lazy initializer for Razorpay client instance.
 * Avoids Cloudflare Worker error 1102 during top-level module evaluation.
 */
export function getRazorpay(): RazorpayClient {
  if (!_razorpay) {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';

    _razorpay = new RazorpayClient({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return _razorpay;
}
