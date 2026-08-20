'use client';

import { useEffect, useState } from 'react';
import { formatGHS } from '@/lib/utils';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/customers').then((r) => r.json()).then((d) => { setCustomers(d); setLoading(false); });
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-display mb-8">Customers</h1>
      {loading ? (
        <p className="text-ink/50">Loading...</p>
      ) : (
        <div className="bg-cream border border-ink/10 overflow-x-auto">
          <table className="w-full text-sm min-w-[650px]">
            <thead>
              <tr className="text-left text-ink/50 border-b border-ink/10">
                <th className="p-4 font-normal">Name</th>
                <th className="p-4 font-normal">Contact</th>
                <th className="p-4 font-normal">Joined</th>
                <th className="p-4 font-normal">Orders</th>
                <th className="p-4 font-normal text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-ink/5">
                  <td className="p-4">{c.name}</td>
                  <td className="p-4 text-ink/60">
                    <p>{c.email}</p>
                    {c.phone && <p className="text-xs">{c.phone}</p>}
                  </td>
                  <td className="p-4 text-ink/60">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">{c.orderCount}</td>
                  <td className="p-4 text-right">{formatGHS(c.totalSpent)}</td>
                </tr>
              ))}
              {customers.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-ink/50">No customers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
