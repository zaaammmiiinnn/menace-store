/**
 * Edge and Cloudflare Worker compatible PayU India client.
 * Uses Web Crypto API (crypto.subtle) for SHA-512 calculation.
 */

export interface PayUConfig {
  key: string;
  salt: string;
  merchantId?: string;
  clientId?: string;
  clientSecret?: string;
  mode: 'live' | 'test';
  paymentUrl: string;
}

export interface PayUPaymentRequestParams {
  txnid: string;
  amount: number | string; // in INR e.g. 1499.00
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}

export interface PayUPreparedPayment {
  action: string;
  params: Record<string, string>;
  hash: string;
}

export interface PayUCallbackPayload {
  txnid?: string;
  amount?: string;
  productinfo?: string;
  firstname?: string;
  email?: string;
  status?: string;
  hash?: string;
  key?: string;
  mihpayid?: string;
  payuMoneyId?: string;
  error?: string;
  error_Message?: string;
  errorMessage?: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  additionalCharges?: string;
  [key: string]: any;
}

/**
 * Computes SHA-512 hash using Web Crypto API with fallback to Node.js crypto.
 */
export async function sha512(text: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Node.js fallback
  try {
    const nodeCrypto = await import('node:crypto');
    return nodeCrypto.createHash('sha512').update(text).digest('hex');
  } catch {
    throw new Error('No crypto implementation available for SHA-512 calculation');
  }
}

/**
 * Returns active PayU configuration from environment variables.
 */
export function getPayUConfig(): PayUConfig {
  const key = process.env.PAYU_MERCHANT_KEY || process.env.NEXT_PUBLIC_PAYU_KEY || '5AZJMt';
  const salt = process.env.PAYU_MERCHANT_SALT || 'KxxhoHenOXoABAUCv1f973CV8zyDvEMC';
  const merchantId = process.env.PAYU_MERCHANT_ID || '13779004';
  const clientId = process.env.PAYU_CLIENT_ID || 'fba7ab236b106dc64bbb3e79af571e91c70c810c82092884fb9b932470270a56';
  const clientSecret = process.env.PAYU_CLIENT_SECRET || '96c95faae059ad654cb59b0c12efa4865d18809e570e9fdffe018b049707337b';
  const mode = (process.env.PAYU_MODE === 'test' ? 'test' : 'live') as 'live' | 'test';

  const paymentUrl =
    mode === 'live'
      ? 'https://secure.payu.in/_payment'
      : 'https://test.payu.in/_payment';

  return {
    key,
    salt,
    merchantId,
    clientId,
    clientSecret,
    mode,
    paymentUrl,
  };
}

/**
 * Calculates PayU payment request hash.
 * Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 */
export async function generatePayURequestHash(
  params: PayUPaymentRequestParams,
  salt: string,
  key: string
): Promise<string> {
  const formattedAmount =
    typeof params.amount === 'number'
      ? params.amount.toFixed(2)
      : parseFloat(params.amount).toFixed(2);

  const hashString = [
    key,
    params.txnid,
    formattedAmount,
    params.productinfo,
    params.firstname,
    params.email,
    params.udf1 || '',
    params.udf2 || '',
    params.udf3 || '',
    params.udf4 || '',
    params.udf5 || '',
    '', // udf6
    '', // udf7
    '', // udf8
    '', // udf9
    '', // udf10
    salt,
  ].join('|');

  return (await sha512(hashString)).toLowerCase();
}

/**
 * Verifies PayU response hash received in callback (surl / furl).
 * Formula with additionalCharges:
 *   sha512(additionalCharges|SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 * Formula without additionalCharges:
 *   sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export async function verifyPayUResponseHash(
  payload: PayUCallbackPayload,
  salt: string
): Promise<boolean> {
  if (!payload.hash) return false;

  const key = payload.key || '';
  const txnid = payload.txnid || '';
  const amount = payload.amount || '';
  const productinfo = payload.productinfo || '';
  const firstname = payload.firstname || '';
  const email = payload.email || '';
  const status = payload.status || '';

  const udf1 = payload.udf1 || '';
  const udf2 = payload.udf2 || '';
  const udf3 = payload.udf3 || '';
  const udf4 = payload.udf4 || '';
  const udf5 = payload.udf5 || '';

  let hashString = '';

  if (payload.additionalCharges && String(payload.additionalCharges).trim() !== '') {
    hashString = [
      payload.additionalCharges,
      salt,
      status,
      '', // udf10
      '', // udf9
      '', // udf8
      '', // udf7
      '', // udf6
      udf5,
      udf4,
      udf3,
      udf2,
      udf1,
      email,
      firstname,
      productinfo,
      amount,
      txnid,
      key,
    ].join('|');
  } else {
    hashString = [
      salt,
      status,
      '', // udf10
      '', // udf9
      '', // udf8
      '', // udf7
      '', // udf6
      udf5,
      udf4,
      udf3,
      udf2,
      udf1,
      email,
      firstname,
      productinfo,
      amount,
      txnid,
      key,
    ].join('|');
  }

  const calculatedHash = (await sha512(hashString)).toLowerCase();
  return calculatedHash === payload.hash.toLowerCase();
}
