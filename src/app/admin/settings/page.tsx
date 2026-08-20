'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings').then((r) => r.json()).then(setForm);
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setForm(data);
      toast.success('Settings saved');
    } catch {
      toast.error('Could not save settings');
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <p className="text-ink/50">Loading...</p>;

  const fields: [string, string][] = [
    ['businessName', 'Business Name'],
    ['logoUrl', 'Logo URL'],
    ['email', 'Business Email'],
    ['phone', 'Phone Number'],
    ['whatsappNumber', 'WhatsApp Number (with country code, no +)'],
    ['instagramHandle', 'Instagram Handle'],
    ['tiktokHandle', 'TikTok Handle'],
    ['currency', 'Currency Code'],
    ['businessHours', 'Business Hours'],
  ];

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-display mb-8">Store Settings</h1>
      <form onSubmit={save} className="space-y-4">
        {fields.map(([key, label]) => (
          <div key={key}>
            <label className="text-xs uppercase text-ink/50 block mb-1">{label}</label>
            <input className="input-field" value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
          </div>
        ))}
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Settings'}</button>
      </form>
    </div>
  );
}
