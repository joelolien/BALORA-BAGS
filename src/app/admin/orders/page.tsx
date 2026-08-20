'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatGHS } from '@/lib/utils';

const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_DELIVERY', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    setOrders(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status]);

  return (
    <div>
      <h1 className="text-3xl font-display mb-8">Orders</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input className="input-field max-w-sm" placeholder="Search order #, name, email, phone..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input-field max-w-[220px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-ink/50">Loading...</p>
      ) : (
        <div className="bg-cream border border-ink/10 overflow-x-auto">
          <table className="w-full text-sm min-w-[750px]">
            <thead>
              <tr className="text-left text-ink/50 border-b border-ink/10">
                <th className="p-4 font-normal">Order</th>
                <th className="p-4 font-normal">Customer</th>
                <th className="p-4 font-normal">Date</th>
                <th className="p-4 font-normal">Status</th>
                <th className="p-4 font-normal">Payment</th>
                <th className="p-4 font-normal text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-ink/5">
                  <td className="p-4"><Link href={`/admin/orders/${o.id}`} className="underline">{o.orderNumber}</Link></td>
                  <td className="p-4">
                    <p>{o.customerName}</p>
                    <p className="text-xs text-ink/50">{o.customerEmail}</p>
                  </td>
                  <td className="p-4 text-ink/60">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">{o.status.replace(/_/g, ' ')}</td>
                  <td className="p-4">
                    <span className={o.paymentStatus === 'PAID' ? 'text-forest' : o.paymentStatus === 'FAILED' ? 'text-red-600' : 'text-clay-dark'}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right">{formatGHS(o.total)}</td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-ink/50">No orders found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
