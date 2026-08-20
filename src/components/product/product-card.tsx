'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { useCart } from '@/components/cart/cart-context';
import { formatGHS } from '@/lib/utils';

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  image: string;
  imageAlt?: string;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const { addItem } = useCart();
  const outOfStock = product.stock <= 0;

  return (
    <div className="group">
      <div className="relative aspect-[4/5] bg-sand overflow-hidden">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={product.image}
            alt={product.imageAlt || product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {(product.isNewArrival || product.isBestSeller || product.salePrice) && (
          <span className="absolute top-3 left-3 bg-cream/90 text-ink text-[11px] tracking-wide uppercase px-2.5 py-1">
            {product.salePrice ? 'Sale' : product.isBestSeller ? 'Best Seller' : 'New'}
          </span>
        )}

        <button
          aria-label="Add to wishlist"
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-cream/90 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart size={15} />
        </button>

        {!outOfStock ? (
          <button
            onClick={() =>
              addItem({
                productId: product.id,
                name: product.name,
                slug: product.slug,
                image: product.image,
                price: product.price,
                salePrice: product.salePrice,
                stock: product.stock,
              })
            }
            className="absolute bottom-0 left-0 right-0 bg-forest text-cream text-xs tracking-wide uppercase py-3 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Add to Bag
          </button>
        ) : (
          <span className="absolute bottom-0 left-0 right-0 bg-ink/70 text-cream text-xs tracking-wide uppercase py-3 text-center">
            Out of Stock
          </span>
        )}
      </div>

      <Link href={`/products/${product.slug}`} className="block mt-3">
        <p className="text-sm font-medium">{product.name}</p>
        <div className="flex items-center gap-2 mt-1">
          {product.salePrice ? (
            <>
              <span className="text-sm text-clay-dark">{formatGHS(product.salePrice)}</span>
              <span className="text-xs text-ink/40 line-through">{formatGHS(product.price)}</span>
            </>
          ) : (
            <span className="text-sm text-ink/70">{formatGHS(product.price)}</span>
          )}
        </div>
      </Link>
    </div>
  );
}
