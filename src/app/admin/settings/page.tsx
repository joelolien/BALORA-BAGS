'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { uploadImageFile } from '@/lib/client-upload';

export default function AdminSettingsPage() {
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  async function handleInstagramUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !form) return;
    setUploading(true);
    const current: string[] = form.instagramImages || [];
    const remainingSlots = Math.max(0, 6 - current.length);
    const toUpload = Array.from(files).slice(0, remainingSlots);

    for (const file of toUpload) {
      try {
        const url = await uploadImageFile(file);
        setForm((f: any) => ({ ...f, instagramImages: [...(f.instagramImages || []), url] }));
      } catch (err: any) {
        toast.error(err.message || 'Upload failed');
      }
    }
    setUploading(false);
  }

  function removeInstagramImage(url: string) {
    setForm((f: any) => ({ ...f, instagramImages: (f.instagramImages || []).filter((u: string) => u !== url) }));
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

  const instagramImages: string[] = form.instagramImages || [];

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

        <div className="pt-4 border-t border-ink/10">
          <label className="text-xs uppercase text-ink/50 block mb-2">
            Homepage Instagram Photos ({instagramImages.length}/6)
          </label>
          <p className="text-xs text-ink/50 mb-3">
            These show in the &quot;Follow along @{form.instagramHandle}&quot; grid on your homepage. Add up to 6 —
            when it's empty, that section is hidden from visitors automatically.
          </p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {instagramImages.map((url) => (
              <div key={url} className="relative aspect-square bg-sand overflow-hidden">
                <Image src={url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeInstagramImage(url)}
                  className="absolute top-1 right-1 bg-ink text-cream rounded-full p-1"
                  aria-label="Remove photo"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          {instagramImages.length < 6 && (
            <input type="file" accept="image/*" multiple onChange={handleInstagramUpload} disabled={uploading} />
          )}
          {uploading && <p className="text-xs text-ink/50 mt-1">Uploading...</p>}
        </div>

        <button type="submit" disabled={saving || uploading} className="btn-primary">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
