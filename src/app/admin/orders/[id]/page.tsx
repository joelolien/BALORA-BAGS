'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatGHS } from '@/lib/utils';
import { toast } from 'sonner';

const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_DELIVERY', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [delivery, setDelivery] = useState({ deliveryAddress: '', city: '', region: '', deliveryNotes: '' });

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/orders/${id}`);
    const data = await res.json();
    setOrder(data);
    setDelivery({
      deliveryAddress: data.deliveryAddress,
      city: data.city,
      region: data.region,
      deliveryNotes: data.deliveryNotes || '',
    });
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function updateStatus(status: string) {
    if (status === 'CANCELLED' && !confirm('Cancel this order? Stock will be restored.')) return;
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setOrder(data);
    setSaving(false);
    toast.success('Order status updated');
  }

  async function saveDelivery(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(delivery),
    });
    const data = await res.json();
    setOrder(data);
    setSaving(false);
    toast.success('Delivery information updated');
  }

  if (loading || !order) return <p className="text-ink/50">Loading...</p>;

  return (
    <div className="max-w-3xl">
      <Link href="/admin/orders" className="text-sm underline mb-6 inline-block">← Back to orders</Link>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-display">{order.orderNumber}</h1>
        <select
          value={order.status}
          onChange={(e) => updateStatus(e.target.value)}
          disabled={saving}
          className="input-field w-56"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        <div className="bg-cream border border-ink/10 p-5">
          <p className="eyebrow mb-3">Customer</p>
          <p className="text-sm">{order.customerName}</p>
          <p className="text-sm text-ink/60">{order.customerEmail}</p>
          <p className="text-sm text-ink/60">{order.customerPhone}</p>
          {order.user && <p className="text-xs text-ink/40 mt-1">Registered customer</p>}
        </div>
        <div className="bg-cream border border-ink/10 p-5">
          <p className="eyebrow mb-3">Payment</p>
          <p className="text-sm">Status: <span className={order.paymentStatus === 'PAID' ? 'text-forest' : 'text-clay-dark'}>{order.paymentStatus}</span></p>
          {order.payment && (
            <>
              <p className="text-sm text-ink/60">Reference: {order.payment.reference}</p>
              <p className="text-sm text-ink/60">Channel: {order.payment.channel || '—'}</p>
            </>
          )}
        </div>
      </div>

      <div className="bg-cream border border-ink/10 p-5 mb-10">
        <p className="eyebrow mb-4">Items</p>
        <ul className="divide-y divide-ink/10 mb-4">
          {order.items.map((item: any) => (
            <li key={item.id} className="flex justify-between py-3 text-sm">
              <span>{item.quantity} × {item.productName}{item.colour ? ` (${item.colour})` : ''}</span>
              <span>{formatGHS(Number(item.unitPrice) * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-1 text-sm max-w-xs ml-auto">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatGHS(order.subtotal)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>{formatGHS(order.deliveryFee)}</span></div>
          {Number(order.discountAmount) > 0 && <div className="flex justify-between"><span>Discount</span><span>-{formatGHS(order.discountAmount)}</span></div>}
          <div className="flex justify-between font-medium border-t border-ink/10 pt-1"><span>Total</span><span>{formatGHS(order.total)}</span></div>
        </div>
      </div>

      <div className="bg-cream border border-ink/10 p-5">
        <p className="eyebrow mb-4">Delivery Information</p>
        <form onSubmit={saveDelivery} className="space-y-3">
          <input className="input-field" value={delivery.deliveryAddress} onChange={(e) => setDelivery({ ...delivery, deliveryAddress: e.target.value })} />
          <div className="grid sm:grid-cols-2 gap-3">
            <input className="input-field" value={delivery.city} onChange={(e) => setDelivery({ ...delivery, city: e.target.value })} />
            <input className="input-field" value={delivery.region} onChange={(e) => setDelivery({ ...delivery, region: e.target.value })} />
          </div>
          <textarea className="input-field" value={delivery.deliveryNotes} onChange={(e) => setDelivery({ ...delivery, deliveryNotes: e.target.value })} />
          <button type="submit" disabled={saving} className="btn-secondary">Save Delivery Info</button>
        </form>
      </div>
    </div>
  );
}
