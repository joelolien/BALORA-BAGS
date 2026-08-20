'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatGHS } from '@/lib/utils';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/products${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    setProducts(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, [q]);

  async function remove(id: string) {
    if (!confirm('Delete this product? If it has order history it will be deactivated instead.')) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    const data = await res.json();
    toast.success(data.deleted ? 'Product deleted' : 'Product deactivated');
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-display">Products</h1>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <input
        className="input-field max-w-sm mb-6"
        placeholder="Search products..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {loading ? (
        <p className="text-ink/50">Loading...</p>
      ) : (
        <div className="bg-cream border border-ink/10 overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left text-ink/50 border-b border-ink/10">
                <th className="p-4 font-normal">Product</th>
                <th className="p-4 font-normal">SKU</th>
                <th className="p-4 font-normal">Category</th>
                <th className="p-4 font-normal">Price</th>
                <th className="p-4 font-normal">Stock</th>
                <th className="p-4 font-normal">Status</th>
                <th className="p-4 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-ink/5">
                  <td className="p-4 flex items-center gap-3">
                    <div className="relative w-10 h-12 bg-sand shrink-0">
                      {p.images[0] && <Image src={p.images[0].url} alt={p.name} fill className="object-cover" />}
                    </div>
                    {p.name}
                  </td>
                  <td className="p-4 text-ink/60">{p.sku}</td>
                  <td className="p-4 text-ink/60">{p.category.name}</td>
                  <td className="p-4">{formatGHS(p.salePrice ?? p.price)}</td>
                  <td className="p-4">
                    <span className={p.stock === 0 ? 'text-red-600' : p.stock <= p.lowStockThreshold ? 'text-clay-dark' : ''}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 ${p.isActive ? 'bg-forest/10 text-forest' : 'bg-ink/10 text-ink/50'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <Link href={`/admin/products/${p.id}`} aria-label="Edit"><Pencil size={15} /></Link>
                      <button onClick={() => remove(p.id)} aria-label="Delete"><Trash2 size={15} className="text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-ink/50">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
