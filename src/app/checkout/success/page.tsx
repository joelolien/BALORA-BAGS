'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { formatGHS } from '@/lib/utils';

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const orderNumber = params.get('order');
  const method = params.get('method');
  const [state, setState] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!orderNumber) return;

    if (method === 'cash_on_delivery' || method === 'bank_transfer') {
      setState('pending');
      return;
    }

    fetch(`/api/payments/verify?order=${orderNumber}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setState('failed');
          return;
        }
        setOrder(data.order);
        setState(data.status === 'PAID' ? 'success' : data.status === 'FAILED' ? 'failed' : 'pending');
      })
      .catch(() => setState('failed'));
  }, [orderNumber, method]);

  const whatsappHref = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '233540784922'}?text=${encodeURIComponent(
    `Hi Balora Bags! I need help with my order ${orderNumber ?? ''}`
  )}`;

  return (
    <div className="section-padding py-24 max-w-xl mx-auto text-center">
      {state === 'loading' && (
        <>
          <Loader2 className="animate-spin mx-auto mb-6" size={40} />
          <p className="text-ink/60">Verifying your payment...</p>
        </>
      )}

      {state === 'success' && (
        <>
          <CheckCircle2 className="mx-auto mb-6 text-forest" size={52} />
          <h1 className="text-3xl mb-3">Payment received!</h1>
          <p className="text-ink/60 mb-1">Order <strong>{orderNumber}</strong> is confirmed.</p>
          {order && <p className="text-ink/60 mb-8">Total paid: {formatGHS(order.total)}</p>}
        </>
      )}

      {state === 'pending' && (
        <>
          <CheckCircle2 className="mx-auto mb-6 text-clay" size={52} />
          <h1 className="text-3xl mb-3">Order received!</h1>
          <p className="text-ink/60 mb-8">
            Order <strong>{orderNumber}</strong> has been placed.{' '}
            {method === 'bank_transfer' && "We'll send bank transfer details via WhatsApp shortly."}
            {method === 'cash_on_delivery' && "You'll pay in cash when your order is delivered."}
          </p>
        </>
      )}

      {state === 'failed' && (
        <>
          <XCircle className="mx-auto mb-6 text-red-500" size={52} />
          <h1 className="text-3xl mb-3">Payment not completed</h1>
          <p className="text-ink/60 mb-8">
            We couldn't confirm payment for order <strong>{orderNumber}</strong>. If you were charged, please
            contact us on WhatsApp and we'll sort it out right away.
          </p>
        </>
      )}

      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/shop" className="btn-secondary">Continue Shopping</Link>
        {orderNumber && <Link href={`/track-order?order=${orderNumber}`} className="btn-primary">Track Order</Link>}
      </div>

      <p className="text-sm text-ink/50 mt-10">
        Need help with your order?{' '}
        <a href={whatsappHref} target="_blank" rel="noreferrer" className="underline text-forest">
          Chat with us on WhatsApp
        </a>
      </p>
    </div>
  );
}
