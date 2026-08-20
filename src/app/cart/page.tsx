'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/components/cart/cart-context';
import { formatGHS } from '@/lib/utils';

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="section-padding py-24 text-center">
        <p className="text-ink/60 mb-6">Your bag is empty.</p>
        <Link href="/shop" className="btn-primary">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="section-padding py-12 grid lg:grid-cols-[1fr_360px] gap-14">
      <div>
        <p className="eyebrow mb-2">Your Bag</p>
        <h1 className="text-3xl md:text-4xl mb-8">{items.length} item{items.length === 1 ? '' : 's'}</h1>

        <ul className="divide-y divide-ink/10">
          {items.map((item) => (
            <li key={item.productId + (item.colour ?? '')} className="py-6 flex gap-5">
              <div className="relative w-24 h-28 bg-sand shrink-0 overflow-hidden">
                {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <Link href={`/products/${item.slug}`} className="font-medium">{item.name}</Link>
                  <button onClick={() => removeItem(item.productId, item.colour)} aria-label="Remove item">
                    <Trash2 size={16} className="text-ink/40 hover:text-clay" />
                  </button>
                </div>
                {item.colour && <p className="text-sm text-ink/50 mt-1">Colour: {item.colour}</p>}
                <p className="text-sm mt-1">{formatGHS(item.salePrice ?? item.price)}</p>
                <div className="flex items-center gap-3 mt-3 border border-ink/20 w-fit px-3 py-1.5">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.colour)} aria-label="Decrease">
                    <Minus size={14} />
                  </button>
                  <span className="w-5 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1, item.colour)}
                    disabled={item.quantity >= item.stock}
                    aria-label="Increase"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-paper p-6 h-fit">
        <p className="eyebrow mb-4">Order Summary</p>
        <div className="flex justify-between text-sm mb-2">
          <span>Subtotal</span>
          <span className="font-medium">{formatGHS(subtotal)}</span>
        </div>
        <p className="text-xs text-ink/50 mb-6">Shipping and discounts calculated at checkout.</p>
        <Link href="/checkout" className="btn-primary w-full">Proceed to Checkout</Link>
        <Link href="/shop" className="btn-secondary w-full mt-3">Continue Shopping</Link>
      </div>
    </div>
  );
}
