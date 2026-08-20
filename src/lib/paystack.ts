/**
 * Server-side Paystack integration.
 *
 * IMPORTANT: Payment status is only ever trusted after calling
 * `verifyPaystackTransaction`, which hits Paystack's server directly with
 * the secret key. We never trust a "success" flag sent from the browser.
 *
 * Paystack supports Ghana Mobile Money (MTN, Vodafone Cash, AirtelTigo) and
 * card payments out of the box when your Paystack account is set up for GHS.
 */

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error('PAYSTACK_SECRET_KEY is not set. Add it to your .env file.');
  }
  return key;
}

interface InitializeParams {
  email: string;
  amountInPesewas: number; // Paystack uses the smallest currency unit
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

export async function initializePaystackTransaction({
  email,
  amountInPesewas,
  reference,
  callbackUrl,
  metadata,
}: InitializeParams) {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: amountInPesewas,
      currency: 'GHS',
      reference,
      callback_url: callbackUrl,
      channels: ['mobile_money', 'card', 'bank_transfer'],
      metadata,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack initialize failed: ${res.status} ${body}`);
  }

  return res.json() as Promise<{
    status: boolean;
    message: string;
    data: { authorization_url: string; access_code: string; reference: string };
  }>;
}

export async function verifyPaystackTransaction(reference: string) {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${getSecretKey()}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack verify failed: ${res.status} ${body}`);
  }

  return res.json() as Promise<{
    status: boolean;
    message: string;
    data: {
      status: 'success' | 'failed' | 'abandoned';
      reference: string;
      amount: number;
      channel: string;
      currency: string;
      paid_at: string | null;
      metadata: Record<string, unknown>;
    };
  }>;
}

/**
 * Verifies the signature Paystack sends on the `x-paystack-signature` header
 * for webhook requests, using HMAC SHA512 of the raw body with the secret key.
 */
export function verifyPaystackWebhookSignature(rawBody: string, signatureHeader: string | null) {
  if (!signatureHeader) return false;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const crypto = require('crypto');
  const hash = crypto.createHmac('sha512', getSecretKey()).update(rawBody).digest('hex');
  return hash === signatureHeader;
}
