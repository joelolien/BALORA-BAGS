'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

interface Category {
  slug: string;
  name: string;
}

export function ShopFilters({
  categories,
  searchParams,
}: {
  categories: Category[];
  searchParams: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [minPrice, setMinPrice] = useState(searchParams.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.maxPrice || '');

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyPriceRange() {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');
    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <aside className="space-y-8">
      <div>
        <label className="eyebrow block mb-2">Sort by</label>
        <select
          className="input-field"
          defaultValue={searchParams.sort || 'newest'}
          onChange={(e) => updateParam('sort', e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      <div>
        <p className="eyebrow mb-3">Category</p>
        <ul className="space-y-2 text-sm">
          <li>
            <button
              onClick={() => updateParam('category', null)}
              className={!searchParams.category ? 'text-clay font-medium' : 'text-ink/70'}
            >
              All
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <button
                onClick={() => updateParam('category', c.slug)}
                className={searchParams.category === c.slug ? 'text-clay font-medium' : 'text-ink/70'}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="eyebrow mb-3">Price (GHS)</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="input-field text-xs px-2 py-2"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="input-field text-xs px-2 py-2"
          />
        </div>
        <button onClick={applyPriceRange} className="text-xs uppercase underline underline-offset-4 mt-2">
          Apply
        </button>
      </div>

      <div>
        <p className="eyebrow mb-3">Availability</p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={searchParams.availability === 'in-stock'}
            onChange={(e) => updateParam('availability', e.target.checked ? 'in-stock' : null)}
          />
          In stock only
        </label>
      </div>
    </aside>
  );
}
