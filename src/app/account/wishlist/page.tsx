'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { formatGHS } from '@/lib/utils';
import { useCart } from '@/components/cart/cart-context';
import { AccountNav } from '@/components/account/account-nav';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addItem } = useCart();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/account/login');
    if (status === 'authenticated') {
      fetch('/api/wishlist')
        .then((res) => res.json())
        .then(setItems)
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  async function remove(productId: string) {
    await fetch('/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
    setItems((prev) => prev.filter((i) => i.productId !== productId));
    toast.success('Removed from wishlist');
  }

  if (!session) return null;

  return (
    <div className="section-padding py-12 grid md:grid-cols-[220px_1fr] gap-12">
      <AccountNav />
      <div>
        <p className="eyebrow mb-2">Account</p>
        <h1 className="text-3xl mb-8">Your Wishlist</h1>

        {loading ? (
          <p className="text-ink/50">Loading...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-ink/50 mb-4">Your wishlist is empty.</p>
            <Link href="/shop" className="btn-primary">Browse Bags</Link>
          </div>
        ) : (
          <ul className="divide-y divide-ink/10">
            {items.map((item) => (
              <li key={item.id} className="py-4 flex items-center gap-4">
                <div className="relative w-16 h-20 bg-sand shrink-0 overflow-hidden">
                  {item.product.images[0] && (
                    <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <Link href={`/products/${item.product.slug}`} className="font-medium text-sm">{item.product.name}</Link>
                  <p className="text-sm text-ink/60">{formatGHS(item.product.salePrice ?? item.product.price)}</p>
                </div>
                <button
                  onClick={() =>
                    addItem({
                      productId: item.product.id,
                      name: item.product.name,
                      slug: item.product.slug,
                      image: item.product.images[0]?.url || '/placeholder-bag.svg',
                      price: Number(item.product.price),
                      salePrice: item.product.salePrice ? Number(item.product.salePrice) : null,
                      stock: item.product.stock,
                    })
                  }
                  className="btn-secondary text-xs px-3 py-2"
                >
                  Add to Bag
                </button>
                <button onClick={() => remove(item.product.id)} aria-label="Remove">
                  <Trash2 size={16} className="text-ink/40 hover:text-clay" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
