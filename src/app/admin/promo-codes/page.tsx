'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { formatGHS } from '@/lib/utils';

export default function AdminPromoCodesPage() {
  const [codes, setCodes] = useState<any[]>([]);
  const [form, setForm] = useState({
    code: '', discountType: 'PERCENTAGE', discountValue: '', minOrderValue: '', usageLimit: '', expiresAt: '',
  });
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch('/api/admin/promo-codes');
    setCodes(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          discountValue: Number(form.discountValue),
          minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Promo code created');
      setForm({ code: '', discountType: 'PERCENTAGE', discountValue: '', minOrderValue: '', usageLimit: '', expiresAt: '' });
      load();
    } catch (err: any) {
      toast.error(err.message || 'Could not create promo code');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(promo: any) {
    await fetch(`/api/admin/promo-codes/${promo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !promo.isActive }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this promo code?')) return;
    await fetch(`/api/admin/promo-codes/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-10">
      <div>
        <h1 className="text-3xl font-display mb-8">Promo Codes</h1>
        <div className="bg-cream border border-ink/10 overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-left text-ink/50 border-b border-ink/10">
                <th className="p-4 font-normal">Code</th>
                <th className="p-4 font-normal">Discount</th>
                <th className="p-4 font-normal">Used</th>
                <th className="p-4 font-normal">Expires</th>
                <th className="p-4 font-normal">Status</th>
                <th className="p-4 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} className="border-b border-ink/5">
                  <td className="p-4 font-medium">{c.code}</td>
                  <td className="p-4">{c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : formatGHS(c.discountValue)}</td>
                  <td className="p-4">{c.usageCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                  <td className="p-4 text-ink/60">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}</td>
                  <td className="p-4">
                    <button onClick={() => toggleActive(c)} className={`text-xs px-2 py-1 ${c.isActive ? 'bg-forest/10 text-forest' : 'bg-ink/10 text-ink/50'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4">
                    <button onClick={() => remove(c.id)} aria-label="Delete"><Trash2 size={15} className="text-red-500" /></button>
                  </td>
                </tr>
              ))}
              {codes.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-ink/50">No promo codes yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <p className="eyebrow mb-4">Create Promo Code</p>
        <form onSubmit={create} className="space-y-3 bg-cream border border-ink/10 p-5">
          <input required placeholder="CODE (e.g. WELCOME10)" className="input-field uppercase" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <select className="input-field" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
            <option value="PERCENTAGE">Percentage discount</option>
            <option value="FIXED">Fixed amount discount</option>
          </select>
          <input required type="number" placeholder="Discount value" className="input-field" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} />
          <input type="number" placeholder="Minimum order value (GHS)" className="input-field" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} />
          <input type="number" placeholder="Usage limit (optional)" className="input-field" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} />
          <div>
            <label className="text-xs uppercase text-ink/50 block mb-1">Expiry date (optional)</label>
            <input type="date" className="input-field" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Create Code'}</button>
        </form>
      </div>
    </div>
  );
}
