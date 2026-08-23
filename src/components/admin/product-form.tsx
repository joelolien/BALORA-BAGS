'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { uploadImageFile } from '@/lib/client-upload';

interface Category { id: string; name: string; }

export function ProductForm({ product }: { product?: any }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    materials: product?.materials || '',
    price: product?.price || '',
    salePrice: product?.salePrice || '',
    stock: product?.stock ?? 0,
    lowStockThreshold: product?.lowStockThreshold ?? 3,
    sku: product?.sku || '',
    categoryId: product?.categoryId || '',
    isFeatured: product?.isFeatured || false,
    isBestSeller: product?.isBestSeller || false,
    isNewArrival: product?.isNewArrival ?? true,
    isActive: product?.isActive ?? true,
    isCustomOrder: product?.isCustomOrder || false,
  });
  const [images, setImages] = useState<string[]>(product?.images?.map((i: any) => i.url) || []);
  const [colours, setColours] = useState<{ name: string; hex: string }[]>(product?.colours || []);
  const [variants, setVariants] = useState<{ name: string; value: string; stock: number }[]>(product?.variants || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/categories').then((r) => r.json()).then(setCategories);
  }, []);

  /**
   * Shrinks an image in the browser before uploading. Phone photos are
   * often 3–10MB, which can exceed hosting request-size limits — this
   * resizes to a sensible max width and re-compresses as JPEG first.
   */
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const url = await uploadImageFile(file);
        setImages((prev) => [...prev, url]);
      } catch {
        toast.error('Upload failed — check your Cloudinary configuration.');
      }
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.categoryId) {
      toast.error('Please select a category');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, images, colours, variants };
      const res = await fetch(product ? `/api/admin/products/${product.id}` : '/api/admin/products', {
        method: product ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(product ? 'Product updated' : 'Product created');
      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Could not save product');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-xs uppercase text-ink/50 block mb-1">Product Name</label>
          <input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="text-xs uppercase text-ink/50 block mb-1">Category</label>
          <select required className="input-field" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase text-ink/50 block mb-1">SKU (auto-generated if blank)</label>
          <input className="input-field" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
        </div>
      </div>

      <div>
        <label className="text-xs uppercase text-ink/50 block mb-1">Description</label>
        <textarea required className="input-field min-h-[100px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>

      <div>
        <label className="text-xs uppercase text-ink/50 block mb-1">Materials</label>
        <input className="input-field" value={form.materials} onChange={(e) => setForm({ ...form, materials: e.target.value })} />
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <div>
          <label className="text-xs uppercase text-ink/50 block mb-1">Price (GHS)</label>
          <input required type="number" step="0.01" className="input-field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </div>
        <div>
          <label className="text-xs uppercase text-ink/50 block mb-1">Sale Price</label>
          <input type="number" step="0.01" className="input-field" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
        </div>
        <div>
          <label className="text-xs uppercase text-ink/50 block mb-1">Stock</label>
          <input required type="number" className="input-field" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
        </div>
        <div>
          <label className="text-xs uppercase text-ink/50 block mb-1">Low Stock Alert</label>
          <input type="number" className="input-field" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })} />
        </div>
      </div>

      <div>
        <label className="text-xs uppercase text-ink/50 block mb-2">Images</label>
        <div className="flex flex-wrap gap-3 mb-3">
          {images.map((url, i) => (
            <div key={url} className="relative w-20 h-20 bg-sand">
              <Image src={url} alt="" fill className="object-cover" />
              <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-ink text-cream rounded-full p-0.5">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} />
        {uploading && <p className="text-xs text-ink/50 mt-1">Uploading...</p>}
      </div>

      <ColourEditor colours={colours} setColours={setColours} />
      <VariantEditor variants={variants} setVariants={setVariants} />

      <div className="grid sm:grid-cols-2 gap-3">
        {[
          ['isFeatured', 'Featured'],
          ['isBestSeller', 'Best Seller'],
          ['isNewArrival', 'New Arrival'],
          ['isActive', 'Active / Visible'],
          ['isCustomOrder', 'Made-to-order / Custom'],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={(form as any)[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}
      </div>

      <button type="submit" disabled={saving || uploading} className="btn-primary">
        {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  );
}

function ColourEditor({ colours, setColours }: { colours: any[]; setColours: (v: any[]) => void }) {
  const [name, setName] = useState('');
  const [hex, setHex] = useState('#3E4A37');
  return (
    <div>
      <label className="text-xs uppercase text-ink/50 block mb-2">Colours</label>
      <div className="flex flex-wrap gap-2 mb-3">
        {colours.map((c, i) => (
          <span key={i} className="flex items-center gap-2 border border-ink/15 px-2 py-1 text-xs">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} /> {c.name}
            <button type="button" onClick={() => setColours(colours.filter((_, idx) => idx !== i))}><X size={12} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input placeholder="Colour name" className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="w-12 h-11 border border-ink/20" />
        <button
          type="button"
          className="btn-secondary shrink-0 px-4"
          onClick={() => { if (name) { setColours([...colours, { name, hex }]); setName(''); } }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

function VariantEditor({ variants, setVariants }: { variants: any[]; setVariants: (v: any[]) => void }) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [stock, setStock] = useState(0);
  return (
    <div>
      <label className="text-xs uppercase text-ink/50 block mb-2">Variants (e.g. Size, Strap length)</label>
      <ul className="space-y-1 mb-3 text-sm">
        {variants.map((v, i) => (
          <li key={i} className="flex items-center justify-between border border-ink/10 px-3 py-2">
            <span>{v.name}: {v.value} ({v.stock} in stock)</span>
            <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}><X size={12} /></button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input placeholder="Name (e.g. Size)" className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Value (e.g. Small)" className="input-field" value={value} onChange={(e) => setValue(e.target.value)} />
        <input type="number" placeholder="Stock" className="input-field w-24" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
        <button
          type="button"
          className="btn-secondary shrink-0 px-4"
          onClick={() => { if (name && value) { setVariants([...variants, { name, value, stock }]); setName(''); setValue(''); setStock(0); } }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
