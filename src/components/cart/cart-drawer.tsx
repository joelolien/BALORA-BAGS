'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/components/cart/cart-context';
import { formatGHS } from '@/lib/utils';

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/40" onClick={() => setIsOpen(false)} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-cream flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-ink/10">
          <p className="font-display text-xl">Your Bag ({items.length})</p>
          <button onClick={() => setIsOpen(false)} aria-label="Close cart">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3">
              <p className="text-ink/60">Your bag is empty.</p>
              <Link href="/shop" onClick={() => setIsOpen(false)} className="btn-primary">
                Start Shopping
              </Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li key={item.productId + (item.colour ?? '')} className="flex gap-4">
                  <div className="relative w-20 h-24 bg-sand shrink-0 overflow-hidden">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">{item.name}</p>
                      <button onClick={() => removeItem(item.productId, item.colour)} aria-label="Remove item">
                        <Trash2 size={16} className="text-ink/40 hover:text-clay" />
                      </button>
                    </div>
                    {item.colour && <p className="text-xs text-ink/50 mt-1">Colour: {item.colour}</p>}
                    <p className="text-sm mt-1">{formatGHS(item.salePrice ?? item.price)}</p>
                    <div className="flex items-center gap-3 mt-2 border border-ink/20 w-fit px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.colour)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.colour)}
                        aria-label="Increase quantity"
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-ink/10 px-6 py-5 space-y-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-medium">{formatGHS(subtotal)}</span>
            </div>
            <p className="text-xs text-ink/50">Shipping and discounts calculated at checkout.</p>
            <Link href="/checkout" onClick={() => setIsOpen(false)} className="btn-primary w-full">
              Checkout
            </Link>
            <button onClick={() => setIsOpen(false)} className="btn-secondary w-full">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
