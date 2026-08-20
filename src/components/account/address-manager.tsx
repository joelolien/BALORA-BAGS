'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  region: string;
  isDefault: boolean;
}

export function AddressManager({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: 'Home', fullName: '', phone: '', addressLine: '', city: '', region: '', isDefault: false });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAddresses((prev) => [data, ...prev]);
      setShowForm(false);
      setForm({ label: 'Home', fullName: '', phone: '', addressLine: '', city: '', region: '', isDefault: false });
      toast.success('Address saved');
    } catch (err: any) {
      toast.error(err.message || 'Could not save address');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    await fetch('/api/account/addresses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div>
      <ul className="space-y-4 mb-6">
        {addresses.map((a) => (
          <li key={a.id} className="border border-ink/10 p-4 flex justify-between">
            <div className="text-sm">
              <p className="font-medium">{a.label} {a.isDefault && <span className="text-xs text-clay">(Default)</span>}</p>
              <p>{a.fullName} · {a.phone}</p>
              <p className="text-ink/60">{a.addressLine}, {a.city}, {a.region}</p>
            </div>
            <button onClick={() => remove(a.id)} aria-label="Delete address">
              <Trash2 size={16} className="text-ink/40 hover:text-clay" />
            </button>
          </li>
        ))}
        {addresses.length === 0 && <p className="text-ink/50">No saved addresses yet.</p>}
      </ul>

      {showForm ? (
        <form onSubmit={submit} className="space-y-3 border border-ink/10 p-5">
          <div className="grid sm:grid-cols-2 gap-3">
            <input className="input-field" placeholder="Label (e.g. Home, Office)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            <input className="input-field" placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          </div>
          <input className="input-field" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <input className="input-field" placeholder="Address" value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} required />
          <div className="grid sm:grid-cols-2 gap-3">
            <input className="input-field" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            <input className="input-field" placeholder="Region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} required />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
            Set as default address
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Address'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowForm(true)} className="btn-secondary">Add New Address</button>
      )}
    </div>
  );
}
