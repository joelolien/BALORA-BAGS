'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface Testimonial {
  id: string;
  customerName: string;
  location: string | null;
  quote: string;
  isActive: boolean;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [form, setForm] = useState({ customerName: '', location: '', quote: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch('/api/admin/testimonials');
    setTestimonials(await res.json());
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Testimonial added — it will now show on your homepage');
      setForm({ customerName: '', location: '', quote: '' });
      load();
    } catch (err: any) {
      toast.error(err.message || 'Could not add testimonial');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(t: Testimonial) {
    await fetch(`/api/admin/testimonials/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !t.isActive }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this testimonial?')) return;
    await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-10">
      <div>
        <h1 className="text-3xl font-display mb-2">Testimonials</h1>
        <p className="text-sm text-ink/60 mb-8">
          These appear in the &ldquo;What our customers say&rdquo; section on your homepage. Only
          testimonials marked Active will show. The section stays hidden entirely if you have none.
        </p>
        <div className="bg-cream border border-ink/10 divide-y divide-ink/10">
          {testimonials.map((t) => (
            <div key={t.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm italic text-ink/80 mb-1">&ldquo;{t.quote}&rdquo;</p>
                  <p className="text-xs text-ink/50">
                    {t.customerName}
                    {t.location ? `, ${t.location}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => toggleActive(t)}
                    className={`text-xs px-2 py-1 ${t.isActive ? 'bg-forest/10 text-forest' : 'bg-ink/10 text-ink/50'}`}
                  >
                    {t.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button onClick={() => remove(t.id)} aria-label="Delete">
                    <Trash2 size={15} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {testimonials.length === 0 && <p className="p-6 text-ink/50 text-sm">No testimonials yet.</p>}
        </div>
      </div>

      <div>
        <p className="eyebrow mb-4">Add Testimonial</p>
        <form onSubmit={create} className="space-y-3 bg-cream border border-ink/10 p-5">
          <input
            required
            placeholder="Customer name"
            className="input-field"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          />
          <input
            placeholder="Location (optional, e.g. Accra)"
            className="input-field"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <textarea
            required
            placeholder="What did they say?"
            className="input-field min-h-[100px]"
            value={form.quote}
            onChange={(e) => setForm({ ...form, quote: e.target.value })}
          />
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving...' : 'Add Testimonial'}
          </button>
        </form>
      </div>
    </div>
  );
}
