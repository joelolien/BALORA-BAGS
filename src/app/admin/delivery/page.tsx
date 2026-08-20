'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { formatGHS } from '@/lib/utils';

export default function AdminDeliveryPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [form, setForm] = useState({ region: 'Greater Accra', city: '', fee: '', estimatedDays: '1-3 working days', isPickupAvailable: false });
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch('/api/admin/delivery-zones');
    setZones(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/delivery-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, fee: Number(form.fee) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Delivery zone saved');
      setForm({ region: 'Greater Accra', city: '', fee: '', estimatedDays: '1-3 working days', isPickupAvailable: false });
      load();
    } catch (err: any) {
      toast.error(err.message || 'Could not save zone');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-10">
      <div>
        <h1 className="text-3xl font-display mb-8">Delivery Zones</h1>
        <div className="bg-cream border border-ink/10 overflow-x-auto">
          <table className="w-full text-sm min-w-[550px]">
            <thead>
              <tr className="text-left text-ink/50 border-b border-ink/10">
                <th className="p-4 font-normal">Region</th>
                <th className="p-4 font-normal">City</th>
                <th className="p-4 font-normal">Fee</th>
                <th className="p-4 font-normal">Est. Time</th>
                <th className="p-4 font-normal">Pickup</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.id} className="border-b border-ink/5">
                  <td className="p-4">{z.region}</td>
                  <td className="p-4">{z.city}</td>
                  <td className="p-4">{formatGHS(z.fee)}</td>
                  <td className="p-4 text-ink/60">{z.estimatedDays}</td>
                  <td className="p-4">{z.isPickupAvailable ? 'Yes' : 'No'}</td>
                </tr>
              ))}
              {zones.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-ink/50">No delivery zones configured yet — a default fee of GHS 25 is used until you add one.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <p className="eyebrow mb-4">Add / Update Zone</p>
        <form onSubmit={create} className="space-y-3 bg-cream border border-ink/10 p-5">
          <input required placeholder="Region" className="input-field" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
          <input required placeholder="City" className="input-field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input required type="number" placeholder="Delivery fee (GHS)" className="input-field" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} />
          <input placeholder="Estimated time (e.g. 1-3 working days)" className="input-field" value={form.estimatedDays} onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isPickupAvailable} onChange={(e) => setForm({ ...form, isPickupAvailable: e.target.checked })} />
            Pickup available in this area
          </label>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save Zone'}</button>
        </form>
      </div>
    </div>
  );
}
