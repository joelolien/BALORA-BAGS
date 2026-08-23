'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';
import { formatGHS } from '@/lib/utils';
import { toast } from 'sonner';

const STAGES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_DELIVERY', 'SHIPPED', 'DELIVERED'];
const STAGE_LABELS: Record<string, string> = {
  PENDING: 'Order Placed',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Being Made',
  READY_FOR_DELIVERY: 'Ready for Delivery',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
};

function TrackOrderContent() {
  const params = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get('order') || '');
  const [contact, setContact] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function lookup(e?: React.FormEvent) {
    e?.preventDefault();
    if (!orderNumber.trim() || !contact.trim()) {
      toast.error('Enter your order number and the email or phone used at checkout');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, contact }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        setOrder(null);
        return;
      }
      setOrder(data.order);
    } finally {
      setLoading(false);
    }
  }

  const isCancelled = order?.status === 'CANCELLED';
  const currentIndex = order ? STAGES.indexOf(order.status) : -1;

  return (
    <div className="section-padding py-16 max-w-2xl mx-auto">
      <p className="eyebrow mb-2">Order Tracking</p>
      <h1 className="text-3xl md:text-4xl mb-8">Track your order</h1>

      <form onSubmit={lookup} className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 mb-12">
        <input className="input-field" placeholder="Order number (e.g. BLR-2608-123456)" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
        <input className="input-field" placeholder="Email or phone" value={contact} onChange={(e) => setContact(e.target.value)} />
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Searching...' : 'Track'}</button>
      </form>

      {searched && !order && !loading && (
        <p className="text-center text-ink/50">No order found with those details.</p>
      )}

      {order && (
        <div>
          <div className="flex justify-between items-baseline mb-8">
            <div>
              <p className="text-sm text-ink/50">Order</p>
              <p className="text-xl font-medium">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-ink/50">Placed on</p>
              <p>{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {isCancelled ? (
            <p className="bg-red-50 text-red-700 px-4 py-3 mb-8 text-sm">This order was cancelled.</p>
          ) : (
            <div className="mb-10">
              <div className="flex justify-between">
                {STAGES.map((stage, i) => (
                  <div key={stage} className="flex-1 flex flex-col items-center relative">
                    {i > 0 && (
                      <div
                        className={`absolute h-[2px] top-4 right-1/2 w-full -z-10 ${i <= currentIndex ? 'bg-forest' : 'bg-ink/15'}`}
                      />
                    )}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                        i <= currentIndex ? 'bg-forest text-cream' : 'bg-sand text-ink/40'
                      }`}
                    >
                      {i < currentIndex ? <Check size={14} /> : i + 1}
                    </div>
                    <p className="text-[11px] text-center mt-2 max-w-[70px] text-ink/60">{STAGE_LABELS[stage]}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-6 mb-8 text-sm">
            <div>
              <p className="eyebrow mb-2">Delivery</p>
              {order.deliveryAddress ? (
                <>
                  <p>{order.deliveryAddress}</p>
                  <p>{order.city}, {order.region}</p>
                </>
              ) : (
                <p className="text-ink/60">We'll message you on WhatsApp to arrange delivery.</p>
              )}
            </div>
            <div>
              <p className="eyebrow mb-2">Payment</p>
              <p>Status: {order.paymentStatus}</p>
              <p>Total: {formatGHS(order.total)}</p>
            </div>
          </div>

          <div>
            <p className="eyebrow mb-3">Items</p>
            <ul className="divide-y divide-ink/10">
              {order.items.map((item: any) => (
                <li key={item.id} className="flex justify-between py-3 text-sm">
                  <span>{item.quantity} × {item.productName}{item.colour ? ` (${item.colour})` : ''}</span>
                  <span>{formatGHS(Number(item.unitPrice) * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={null}>
      <TrackOrderContent />
    </Suspense>
  );
}
