'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Trash2, Pencil } from 'lucide-react';
import { uploadImageFile } from '@/lib/client-upload';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: '', description: '', imageUrl: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', imageUrl: '' });
  const [editUploading, setEditUploading] = useState(false);

  async function load() {
    const res = await fetch('/api/admin/categories');
    setCategories(await res.json());
  }
  useEffect(() => {
    load();
  }, []);

  async function handleNewImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageFile(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

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

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, description: cat.description || '', imageUrl: cat.imageUrl || '' });
  }

  async function handleEditImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditUploading(true);
    try {
      const url = await uploadImageFile(file);
      setEditForm((f) => ({ ...f, imageUrl: url }));
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setEditUploading(false);
    }
  }

  async function saveEdit(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Category updated');
      setEditingId(null);
      load();
    } catch (err: any) {
      toast.error(err.message || 'Could not update category');
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

  async function toggleActive(cat: Category) {
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
            <div key={c.id} className="p-4">
              {editingId === c.id ? (
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <div className="relative w-20 h-20 bg-sand shrink-0 overflow-hidden">
                      {editForm.imageUrl && <Image src={editForm.imageUrl} alt="" fill className="object-cover" />}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        className="input-field"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Category name"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImage}
                        disabled={editUploading}
                        className="text-xs"
                      />
                      {editUploading && <p className="text-xs text-ink/50">Uploading...</p>}
                    </div>
                  </div>
                  <textarea
                    className="input-field"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Description (optional)"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => saveEdit(c.id)} disabled={saving} className="btn-primary text-xs px-4 py-2">
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn-secondary text-xs px-4 py-2">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 bg-sand shrink-0 overflow-hidden">
                      {c.imageUrl && <Image src={c.imageUrl} alt={c.name} fill className="object-cover" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-ink/50">{c.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleActive(c)} className={`text-xs px-2 py-1 ${c.isActive ? 'bg-forest/10 text-forest' : 'bg-ink/10 text-ink/50'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button onClick={() => startEdit(c)} aria-label="Edit">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => remove(c.id)} aria-label="Delete">
                      <Trash2 size={15} className="text-red-500" />
                    </button>
                  </div>
                </div>
              )}
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
          <div>
            <label className="text-xs uppercase text-ink/50 block mb-2">Photo</label>
            {form.imageUrl && (
              <div className="relative w-full aspect-video bg-sand mb-2 overflow-hidden">
                <Image src={form.imageUrl} alt="" fill className="object-cover" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleNewImage} disabled={uploading} />
            {uploading && <p className="text-xs text-ink/50 mt-1">Uploading...</p>}
          </div>
          <button type="submit" disabled={saving || uploading} className="btn-primary w-full">
            {saving ? 'Saving...' : 'Add Category'}
          </button>
        </form>
      </div>
    </div>
  );
}
