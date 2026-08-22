'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { formatGHS } from '@/lib/utils';
import { toast } from 'sonner';

const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_DELIVERY', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

function whatsappLink(phone: string, orderNumber: string) {
  const digits = phone.replace(/[^0-9]/g, '');
  const message = encodeURIComponent(
    `Hi! This is Balora Bags regarding your order ${orderNumber}. Your bag is ready — let's arrange delivery via Yango.`
  );
  return `https://wa.me/${digits}?text=${message}`;
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/orders/${id}`);
    const data = await res.json();
    setOrder(data);
    setDeliveryNotes(data.deliveryNotes || '');
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

  async function saveDeliveryNotes(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliveryNotes }),
    });
    const data = await res.json();
    setOrder(data);
    setSaving(false);
    toast.success('Delivery notes saved');
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
          <p className="text-sm text-ink/60 mb-3">{order.customerPhone}</p>
          <a
            href={whatsappLink(order.customerPhone, order.orderNumber)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs bg-[#25D366] text-white px-3 py-2 rounded-sm hover:opacity-90"
          >
            <MessageCircle size={14} /> Message on WhatsApp
          </a>
          {order.user && <p className="text-xs text-ink/40 mt-2">Registered customer</p>}
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
          {Number(order.discountAmount) > 0 && <div className="flex justify-between"><span>Discount</span><span>-{formatGHS(order.discountAmount)}</span></div>}
          <div className="flex justify-between font-medium border-t border-ink/10 pt-1"><span>Total</span><span>{formatGHS(order.total)}</span></div>
        </div>
      </div>

      <div className="bg-cream border border-ink/10 p-5">
        <p className="eyebrow mb-2">Delivery Notes</p>
        <p className="text-xs text-ink/50 mb-4">
          Delivery is arranged manually via Yango — use this space to jot down anything useful (rider ETA,
          landmark, special instructions) after messaging the customer on WhatsApp.
        </p>
        <form onSubmit={saveDeliveryNotes} className="space-y-3">
          <textarea
            className="input-field min-h-[100px]"
            placeholder="e.g. Confirmed via WhatsApp — dropping at East Legon, rider booked for 4pm"
            value={deliveryNotes}
            onChange={(e) => setDeliveryNotes(e.target.value)}
          />
          <button type="submit" disabled={saving} className="btn-secondary">Save Notes</button>
        </form>
      </div>
    </div>
  );
}
