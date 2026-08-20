'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', description: '', imageUrl: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch('/api/admin/categories');
    setCategories(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Category created');
      setForm({ name: '', description: '', imageUrl: '' });
      load();
    } catch (err: any) {
      toast.error(err.message || 'Could not create category');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this category?')) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    const data = await res.json();
    toast.success(data.deleted ? 'Category deleted' : 'Category deactivated (in use by products)');
    load();
  }

  async function toggleActive(cat: any) {
    await fetch(`/api/admin/categories/${cat.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !cat.isActive }),
    });
    load();
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-10">
      <div>
        <h1 className="text-3xl font-display mb-8">Categories</h1>
        <div className="bg-cream border border-ink/10 divide-y divide-ink/10">
          {categories.map((c) => (
            <div key={c.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-xs text-ink/50">{c.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => toggleActive(c)} className={`text-xs px-2 py-1 ${c.isActive ? 'bg-forest/10 text-forest' : 'bg-ink/10 text-ink/50'}`}>
                  {c.isActive ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => remove(c.id)} aria-label="Delete"><Trash2 size={15} className="text-red-500" /></button>
              </div>
            </div>
          ))}
          {categories.length === 0 && <p className="p-6 text-ink/50 text-sm">No categories yet.</p>}
        </div>
      </div>

      <div>
        <p className="eyebrow mb-4">Add Category</p>
        <form onSubmit={create} className="space-y-3 bg-cream border border-ink/10 p-5">
          <input required placeholder="Name (e.g. Tote Bags)" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea placeholder="Description (optional)" className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input placeholder="Image URL (optional)" className="input-field" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Add Category'}</button>
        </form>
      </div>
    </div>
  );
}
